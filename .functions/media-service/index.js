
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 初始化云开发
const app = cloudbase.init();
const models = app.models;

// 腾讯云 COS 配置（替换 AWS S3）
const COS = require('cos-nodejs-sdk-v5');
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID || process.env.TENCENTCLOUD_SECRETID,
  SecretKey: process.env.COS_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY,
});

const bucketName = process.env.COS_BUCKET || 'media-bucket-1250000000';
const region = process.env.COS_REGION || 'ap-shanghai';

// 工具函数
async function downloadFile(url, filePath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });
  
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function uploadFile(filePath, key) {
  const fileContent = await fs.readFile(filePath);
  
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucketName,
      Region: region,
      Key: key,
      Body: fileContent,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(key);
      }
    });
  });
}

async function generateSignedUrl(key, expiresIn = 3600) {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl({
      Bucket: bucketName,
      Region: region,
      Key: key,
      Sign: true,
      Expires: expiresIn,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Url);
      }
    });
  });
}

async function deleteFile(key) {
  return new Promise((resolve, reject) => {
    cos.deleteObject({
      Bucket: bucketName,
      Region: region,
      Key: key,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function getTempPath(filename) {
  return path.join('/tmp', filename);
}

async function cleanupTempFiles(...files) {
  for (const file of files) {
    if (await fs.pathExists(file)) {
      await fs.remove(file);
    }
  }
}

// 转码功能
async function transcodeVideo(videoUrl, targetFormat) {
  const inputPath = getTempPath(`input_${uuidv4()}`);
  const outputPath = getTempPath(`output_${uuidv4()}.${targetFormat}`);
  
  try {
    await downloadFile(videoUrl, inputPath);
    
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .format(targetFormat)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions('-movflags +faststart')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
    
    const key = `transcoded/${uuidv4()}.${targetFormat}`;
    await uploadFile(outputPath, key);
    
    const url = await generateSignedUrl(key);
    
    // 保存记录
    await models.asset_library.create({
      data: {
        originalUrl: videoUrl,
        processedUrl: url,
        format: targetFormat,
        type: 'transcode',
        status: 'completed',
        s3Key: key,
      },
    });
    
    return url;
  } finally {
    await cleanupTempFiles(inputPath, outputPath);
  }
}

// 合并音视频
async function mergeAudioVideo(videoUrl, audioUrl) {
  const videoPath = getTempPath(`video_${uuidv4()}`);
  const audioPath = getTempPath(`audio_${uuidv4()}`);
  const outputPath = getTempPath(`merged_${uuidv4()}.mp4`);
  
  try {
    await Promise.all([
      downloadFile(videoUrl, videoPath),
      downloadFile(audioUrl, audioPath),
    ]);
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions('-c:v copy')
        .outputOptions('-c:a aac')
        .outputOptions('-strict experimental')
        .outputOptions('-map 0:v:0')
        .outputOptions('-map 1:a:0')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
    
    const key = `merged/${uuidv4()}.mp4`;
    await uploadFile(outputPath, key);
    
    const url = await generateSignedUrl(key);
    
    // 保存记录
    await models.asset_library.create({
      data: {
        originalUrl: videoUrl,
        audioUrl: audioUrl,
        processedUrl: url,
        type: 'merge',
        status: 'completed',
        s3Key: key,
      },
    });
    
    return url;
  } finally {
    await cleanupTempFiles(videoPath, audioPath, outputPath);
  }
}

// 拼接视频
async function concatVideos(videoUrls) {
  const inputPaths = [];
  const listPath = getTempPath(`list_${uuidv4()}.txt`);
  const outputPath = getTempPath(`concat_${uuidv4()}.mp4`);
  
  try {
    // 下载所有视频
    for (let i = 0; i < videoUrls.length; i++) {
      const path = getTempPath(`video_${i}_${uuidv4()}`);
      await downloadFile(videoUrls[i], path);
      inputPaths.push(path);
    }
    
    // 创建列表文件
    const listContent = inputPaths.map(p => `file '${p}'`).join('\n');
    await fs.writeFile(listPath, listContent);
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listPath)
        .inputOptions('-f concat')
        .inputOptions('-safe 0')
        .outputOptions('-c copy')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
    
    const key = `concatenated/${uuidv4()}.mp4`;
    await uploadFile(outputPath, key);
    
    const url = await generateSignedUrl(key);
    
    // 保存记录
    await models.asset_library.create({
      data: {
        originalUrls: videoUrls,
        processedUrl: url,
        type: 'concat',
        status: 'completed',
        s3Key: key,
      },
    });
    
    return url;
  } finally {
    await cleanupTempFiles(...inputPaths, listPath, outputPath);
  }
}

// 获取下载URL
async function getDownloadUrl(id) {
  const record = await models.asset_library.get({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
  });
  
  if (!record.data || !record.data.records || record.data.records.length === 0) {
    throw new Error('记录不存在');
  }
  
  const item = record.data.records[0];
  const url = await generateSignedUrl(item.s3Key);
  
  return url;
}

// 删除媒体
async function deleteMedia(id) {
  const record = await models.asset_library.get({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
  });
  
  if (!record.data || !record.data.records || record.data.records.length === 0) {
    throw new Error('记录不存在');
  }
  
  const item = record.data.records[0];
  
  // 删除COS文件
  await deleteFile(item.s3Key);
  
  // 删除数据库记录
  await models.asset_library.delete({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
  });
}

// 主函数
exports.main = async (event, context) => {
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'transcode':
        if (!data.videoUrl || !data.targetFormat) {
          return { code: 1, message: '参数错误：videoUrl和targetFormat不能为空' };
        }
        const transcodeUrl = await transcodeVideo(data.videoUrl, data.targetFormat);
        return { code: 0, data: { url: transcodeUrl } };
        
      case 'merge-audio-video':
        if (!data.videoUrl || !data.audioUrl) {
          return { code: 1, message: '参数错误：videoUrl和audioUrl不能为空' };
        }
        const mergeUrl = await mergeAudioVideo(data.videoUrl, data.audioUrl);
        return { code: 0, data: { url: mergeUrl } };
        
      case 'concat-videos':
        if (!Array.isArray(data.videoUrls) || data.videoUrls.length < 2) {
          return { code: 1, message: '参数错误：videoUrls必须是包含至少2个URL的数组' };
        }
        const concatUrl = await concatVideos(data.videoUrls);
        return { code: 0, data: { url: concatUrl } };
        
      case 'get-media':
        if (!data.id) {
          return { code: 1, message: '参数错误：id不能为空' };
        }
        const downloadUrl = await getDownloadUrl(data.id);
        return { code: 0, data: { downloadUrl } };
        
      case 'delete-media':
        if (!data.id) {
          return { code: 1, message: '参数错误：id不能为空' };
        }
        await deleteMedia(data.id);
        return { code: 0, message: '删除成功' };
        
      default:
        return { code: 1, message: '无效的操作' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { code: 1, message: error.message || '处理失败' };
  }
};
  