
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const fs = require('fs').promises;
    const path = require('path');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const { v4: uuidv4 } = require('uuid');

    const execAsync = promisify(exec);

    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    const db = app.database();
    const storage = app.storage();

    async function downloadImage(fileID, destPath) {
      try {
        const file = storage.file(fileID);
        const [buffer] = await file.download();
        await fs.writeFile(destPath, buffer);
        return true;
      } catch (error) {
        console.error(`下载图片失败: ${fileID}`, error);
        throw new Error(`图片下载失败: ${fileID}`);
      }
    }

    async function uploadVideo(localPath, cloudPath) {
      try {
        const file = storage.file(cloudPath);
        const buffer = await fs.readFile(localPath);
        await file.save(buffer, {
          metadata: {
            contentType: 'video/mp4'
          }
        });
        
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7天有效期
        });
        
        return {
          fileID: cloudPath,
          downloadUrl: url
        };
      } catch (error) {
        console.error('上传视频失败', error);
        throw new Error('上传失败');
      }
    }

    async function createVideoFromImages(images, fps, width, height, durationPerFrame) {
      const tempDir = path.join('/tmp', `generateImageToVideo_${uuidv4()}`);
      const outputPath = path.join('/tmp', 'output.mp4');
      
      try {
        // 创建临时目录
        await fs.mkdir(tempDir, { recursive: true });
        
        // 下载所有图片
        console.log('开始下载图片...');
        for (let i = 0; i < images.length; i++) {
          const imagePath = path.join(tempDir, `${String(i + 1).padStart(4, '0')}.jpg`);
          await downloadImage(images[i], imagePath);
        }
        
        // 使用 ffmpeg 创建视频
        console.log('开始合成视频...');
        const ffmpegCommand = `ffmpeg -framerate ${fps} -i ${tempDir}/%04d.jpg -c:v libx264 -r ${fps} -s ${width}x${height} -pix_fmt yuv420p -t ${images.length * durationPerFrame} ${outputPath}`;
        
        try {
          await execAsync(ffmpegCommand);
        } catch (error) {
          console.error('FFmpeg 执行失败', error);
          throw new Error('视频合成失败');
        }
        
        // 检查输出文件是否存在
        try {
          await fs.access(outputPath);
        } catch (error) {
          throw new Error('视频文件未生成');
        }
        
        return outputPath;
        
      } catch (error) {
        // 清理临时文件
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
          await fs.unlink(outputPath).catch(() => {});
        } catch (cleanupError) {
          console.error('清理临时文件失败', cleanupError);
        }
        throw error;
      }
    }

    exports.main = async (event, context) => {
      try {
        const { images, fps = 10, width = 720, height = 1280, durationPerFrame = 0.5 } = event;
        
        // 参数验证
        if (!images || !Array.isArray(images) || images.length === 0) {
          return {
            success: false,
            error: 'images 参数不能为空数组'
          };
        }
        
        if (fps <= 0 || width <= 0 || height <= 0 || durationPerFrame <= 0) {
          return {
            success: false,
            error: 'fps、width、height、durationPerFrame 必须为正数'
          };
        }
        
        console.log(`开始处理 ${images.length} 张图片，参数: fps=${fps}, width=${width}, height=${height}, durationPerFrame=${durationPerFrame}`);
        
        // 创建视频
        const videoPath = await createVideoFromImages(images, fps, width, height, durationPerFrame);
        
        // 上传视频到云存储
        const cloudPath = `videos/${uuidv4()}.mp4`;
        const uploadResult = await uploadVideo(videoPath, cloudPath);
        
        // 可选：记录到数据模型
        try {
          await db.collection('video_tasks').add({
            fileID: uploadResult.fileID,
            downloadUrl: uploadResult.downloadUrl,
            images: images,
            params: {
              fps,
              width,
              height,
              durationPerFrame
            },
            createdAt: new Date(),
            status: 'completed'
          });
        } catch (dbError) {
          console.error('记录任务到数据库失败', dbError);
        }
        
        // 清理临时文件
        try {
          await fs.unlink(videoPath);
        } catch (cleanupError) {
          console.error('清理视频文件失败', cleanupError);
        }
        
        return {
          success: true,
          fileID: uploadResult.fileID,
          downloadUrl: uploadResult.downloadUrl
        };
        
      } catch (error) {
        console.error('云函数执行失败', error);
        
        // 可选：记录失败任务
        try {
          await db.collection('video_tasks').add({
            images: event.images || [],
            params: {
              fps: event.fps || 10,
              width: event.width || 720,
              height: event.height || 1280,
              durationPerFrame: event.durationPerFrame || 0.5
            },
            createdAt: new Date(),
            status: 'failed',
            error: error.message
          });
        } catch (dbError) {
          console.error('记录失败任务到数据库失败', dbError);
        }
        
        return {
          success: false,
          error: error.message
        };
      }
    };
  