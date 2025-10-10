
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const { v4: uuidv4 } = require('uuid');

    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV,
    });

    // 视频生成模型API配置
    const VIDEO_API_CONFIG = {
      baseUrl: process.env.VIDEO_API_BASE_URL || 'https://api.example.com',
      apiKey: process.env.VIDEO_API_KEY,
      timeout: 30000
    };

    // 文件类型白名单
    const ALLOWED_FILE_TYPES = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      audio: ['audio/mp3', 'audio/wav', 'audio/m4a'],
      video: ['video/mp4', 'video/mov', 'video/avi']
    };

    // 文件大小限制 (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    exports.main = async (event, context) => {
      try {
        const { file, body } = parseMultipartData(event);
        
        // 1. 参数验证
        const validationResult = validateParams(file, body);
        if (!validationResult.valid) {
          return {
            error: validationResult.error,
            details: validationResult.details,
            statusCode: 400
          };
        }

        // 2. 上传文件到云存储
        const fileUrls = await uploadFilesToCloudStorage(file);
        
        // 3. 创建任务记录
        const taskId = uuidv4();
        const taskData = {
          taskId,
          status: 'pending',
          prompt: body.prompt,
          duration: body.duration || 5,
          resolution: body.resolution || '1280x720',
          style: body.style || '',
          fps: body.fps || 24,
          files: fileUrls,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const models = app.models;
        await models.generation_tasks.create({
          data: taskData
        });

        // 4. 调用视频生成API
        const apiResult = await callVideoGenerationAPI(taskData);
        
        // 5. 更新任务状态
        await models.generation_tasks.update({
          data: {
            status: apiResult.success ? 'processing' : 'failed',
            apiResponse: apiResult,
            updatedAt: new Date()
          },
          filter: {
            where: {
              taskId: { $eq: taskId }
            }
          }
        });

        if (!apiResult.success) {
          return {
            error: '视频生成API调用失败',
            details: apiResult.error,
            statusCode: 500
          };
        }

        return {
          taskId,
          status: 'pending',
          message: '任务已创建，正在处理中'
        };

      } catch (error) {
        console.error('Error in generateImageToVideo:', error);
        return {
          error: '服务器内部错误',
          details: error.message,
          statusCode: 500
        };
      }
    };

    // 解析multipart/form-data数据
    function parseMultipartData(event) {
      if (!event.body || !event.headers || !event.headers['content-type']) {
        throw new Error('无效的请求格式');
      }

      const contentType = event.headers['content-type'];
      if (!contentType.includes('multipart/form-data')) {
        throw new Error('Content-Type必须是multipart/form-data');
      }

      // 这里简化处理，实际应该使用multipart解析库
      // 在SCF环境中，文件会通过event.files传递
      const files = event.files || {};
      const body = event.body || {};

      return {
        file: {
          image: files.image,
          audio: files.audio,
          video: files.video
        },
        body: {
          prompt: body.prompt,
          duration: parseInt(body.duration) || 5,
          resolution: body.resolution || '1280x720',
          style: body.style || '',
          fps: parseInt(body.fps) || 24
        }
      };
    }

    // 参数验证
    function validateParams(file, body) {
      const errors = [];

      // 验证必需参数
      if (!file.image) {
        errors.push('必需参数：image文件缺失');
      }
      if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
        errors.push('必需参数：prompt不能为空');
      }

      // 验证文件类型和大小
      if (file.image && !ALLOWED_FILE_TYPES.image.includes(file.image.mimetype)) {
        errors.push(`图片格式不支持，支持格式：${ALLOWED_FILE_TYPES.image.join(', ')}`);
      }
      if (file.audio && !ALLOWED_FILE_TYPES.audio.includes(file.audio.mimetype)) {
        errors.push(`音频格式不支持，支持格式：${ALLOWED_FILE_TYPES.audio.join(', ')}`);
      }
      if (file.video && !ALLOWED_FILE_TYPES.video.includes(file.video.mimetype)) {
        errors.push(`视频格式不支持，支持格式：${ALLOWED_FILE_TYPES.video.join(', ')}`);
      }

      // 验证文件大小
      Object.values(file).forEach(f => {
        if (f && f.size > MAX_FILE_SIZE) {
          errors.push(`文件 ${f.originalname} 超过50MB限制`);
        }
      });

      // 验证参数范围
      if (body.duration && (body.duration < 1 || body.duration > 60)) {
        errors.push('duration必须在1-60秒之间');
      }
      if (body.fps && (body.fps < 12 || body.fps > 60)) {
        errors.push('fps必须在12-60之间');
      }

      return {
        valid: errors.length === 0,
        error: errors.length > 0 ? '参数验证失败' : null,
        details: errors
      };
    }

    // 上传文件到云存储
    async function uploadFilesToCloudStorage(files) {
      const fileUrls = {};
      const storage = app.storage();

      for (const [type, file] of Object.entries(files)) {
        if (!file) continue;

        const fileName = `generation/${Date.now()}_${file.originalname}`;
        const result = await storage.upload({
          cloudPath: fileName,
          fileContent: file.buffer
        });

        fileUrls[type] = result.fileID;
      }

      return fileUrls;
    }

    // 调用视频生成API
    async function callVideoGenerationAPI(taskData) {
      try {
        const payload = {
          image_url: taskData.files.image,
          audio_url: taskData.files.audio,
          video_url: taskData.files.video,
          prompt: taskData.prompt,
          duration: taskData.duration,
          resolution: taskData.resolution,
          style: taskData.style,
          fps: taskData.fps
        };

        const response = await fetch(`${VIDEO_API_CONFIG.baseUrl}/generate-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VIDEO_API_CONFIG.apiKey}`
          },
          body: JSON.stringify(payload),
          timeout: VIDEO_API_CONFIG.timeout
        });

        if (!response.ok) {
          throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        return {
          success: true,
          jobId: result.job_id || result.task_id,
          estimatedTime: result.estimated_time || 300
        };

      } catch (error) {
        console.error('Video API Error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  