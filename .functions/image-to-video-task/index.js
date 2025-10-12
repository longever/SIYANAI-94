
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    // 获取APIs资源连接器实例
    const aliyunDashscope = app.connector('aliyun_dashscope_jbn02va');

    // 工具函数：获取图片URL
    async function getImageUrl(imageUrl, imageFileId) {
      if (imageUrl) {
        return imageUrl;
      }
      
      if (imageFileId) {
        const res = await app.getTempFileURL({
          fileList: [imageFileId]
        });
        
        if (!res.fileList || res.fileList.length === 0 || !res.fileList[0].tempFileURL) {
          throw new Error('无法获取图片临时链接');
        }
        
        return res.fileList[0].tempFileURL;
      }
      
      throw new Error('必须提供imageUrl或imageFileId');
    }

    // 工具函数：带重试的请求包装
    async function requestWithRetry(requestFunc, maxRetries = 1) {
      let lastError;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await Promise.race([
            requestFunc(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('请求超时')), 10000)
            )
          ]);
          
          return result;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            console.log(`请求失败，进行重试 ${attempt + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError;
    }

    // 图片检测阶段
    async function detectImage(imageUrl) {
      console.log('开始图片检测...');
      
      const detectResult = await requestWithRetry(async () => {
        const result = await aliyunDashscope.invoke('aliyun_dashscope_emo_detect_v1', {
          image: imageUrl
        });
        
        if (result.code !== 0) {
          throw new Error(`检测失败: ${result.message || '未知错误'}`);
        }
        
        return result.data;
      });
      
      console.log('图片检测完成:', detectResult);
      return detectResult;
    }

    // 视频生成阶段
    async function generateVideo(imageUrl, detectResult, callbackUrl, userContext) {
      console.log('开始视频生成...');
      
      const videoResult = await requestWithRetry(async () => {
        const params = {
          image: imageUrl,
          callbackUrl,
          userContext
        };
        
        // 可选：透传检测结果
        if (detectResult) {
          params.detectResult = detectResult;
        }
        
        const result = await aliyunDashscope.invoke('emo_v1', params);
        
        if (result.code !== 0) {
          throw new Error(`视频生成失败: ${result.message || '未知错误'}`);
        }
        
        return result.data;
      });
      
      console.log('视频任务创建完成:', videoResult);
      return videoResult;
    }

    exports.main = async (event, context) => {
      try {
        console.log('收到请求:', JSON.stringify(event, null, 2));
        
        // 解析输入参数
        const { imageUrl, imageFileId, callbackUrl, userContext } = event;
        
        // 参数校验
        if (!imageUrl && !imageFileId) {
          return {
            status: 'FAIL',
            error: '必须提供imageUrl或imageFileId'
          };
        }
        
        // 获取图片URL
        const actualImageUrl = await getImageUrl(imageUrl, imageFileId);
        console.log('使用图片URL:', actualImageUrl);
        
        // 第一步：图片检测
        let detectResult;
        try {
          detectResult = await detectImage(actualImageUrl);
        } catch (error) {
          console.error('图片检测失败:', error);
          return {
            status: 'DETECT_FAIL',
            error: error.message
          };
        }
        
        // 第二步：视频生成
        let videoResult;
        try {
          videoResult = await generateVideo(actualImageUrl, detectResult, callbackUrl, userContext);
        } catch (error) {
          console.error('视频生成失败:', error);
          return {
            status: 'FAIL',
            error: error.message
          };
        }
        
        // 成功返回
        const response = {
          taskId: videoResult.taskId,
          status: 'GENERATING',
          detectResult: detectResult
        };
        
        console.log('返回结果:', response);
        return response;
        
      } catch (error) {
        console.error('函数执行错误:', error);
        return {
          status: 'FAIL',
          error: error.message || '内部错误'
        };
      }
    };
  