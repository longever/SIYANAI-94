
const cloud = require('wx-server-sdk');
const https = require('https');
const url = require('url');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 使用内置 https 模块替代 node-fetch
function fetch(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      if (typeof options.body === 'object') {
        requestOptions.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(json),
            text: () => Promise.resolve(data)
          });
        } catch {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.reject(new Error('Invalid JSON')),
            text: () => Promise.resolve(data)
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  
  try {
    const { taskId, imageUrl, audioUrl, settings } = event;
    
    console.log('开始处理图片转视频任务:', taskId);
    
    // 更新任务状态为处理中
    await db.collection('generation_tasks').doc(taskId).update({
      data: {
        status: 'processing',
        progress: 10,
        updatedAt: new Date()
      }
    });

    // 调用外部AI服务进行视频生成
    const response = await fetch('https://api.example.com/v1/image-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: {
        image_url: imageUrl,
        audio_url: audioUrl,
        settings: settings || {}
      }
    });

    if (!response.ok) {
      throw new Error(`AI服务调用失败: ${response.status}`);
    }

    const result = await response.json();
    
    // 模拟处理进度
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await db.collection('generation_tasks').doc(taskId).update({
      data: {
        status: 'completed',
        progress: 100,
        resultUrl: result.video_url,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      taskId,
      videoUrl: result.video_url
    };

  } catch (error) {
    console.error('处理任务失败:', error);
    
    // 更新任务状态为失败
    if (event.taskId) {
      await db.collection('generation_tasks').doc(event.taskId).update({
        data: {
          status: 'failed',
          error: error.message,
          updatedAt: new Date()
        }
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
};
  