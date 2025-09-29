
'use strict';

exports.main = async (event, context) => {
  try {
    // 1. 获取云开发实例（平台内置能力）
    const tcb = await getCloudInstance();
    const db = tcb.database();
    
    // 2. 参数校验
    const { videoName, totalDuration, nodes } = event;
    
    if (!videoName || typeof videoName !== 'string') {
      return {
        success: false,
        error: 'videoName 不能为空且必须是字符串',
        code: 400
      };
    }
    
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return {
        success: false,
        error: 'nodes 必须是包含至少一个节点的数组',
        code: 400
      };
    }
    
    if (!totalDuration || totalDuration <= 0) {
      return {
        success: false,
        error: 'totalDuration 必须是正数',
        code: 400
      };
    }
    
    // 3. 验证节点配置
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.content || !node.type) {
        return {
          success: false,
          error: `节点 ${i + 1} 缺少必要配置 (content 或 type)`,
          code: 400
        };
      }
      
      // 设置默认值
      node.duration = node.duration || 5;
      node.title = node.title || `节点 ${i + 1}`;
    }
    
    console.log('开始生成视频:', { videoName, totalDuration, nodeCount: nodes.length });
    
    // 4. 模拟AI视频生成过程
    const videoSegments = [];
    const startTime = Date.now();
    
    // 模拟处理每个节点
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      console.log(`处理节点 ${i + 1}/${nodes.length}: ${node.title}`);
      
      // 模拟AI处理时间（基于节点复杂度）
      const processingTime = Math.min(node.duration * 500, 3000); // 最多3秒
      await sleep(processingTime);
      
      // 生成模拟的视频片段信息
      const segment = {
        id: `segment-${Date.now()}-${i}`,
        nodeId: node.id || `node-${i}`,
        title: node.title,
        duration: node.duration,
        content: node.content,
        type: node.type,
        url: `cloud://${tcb.cloud.env}/videos/${videoName}/segment-${i}.mp4`,
        status: 'completed',
        createdAt: new Date()
      };
      
      videoSegments.push(segment);
    }
    
    // 5. 生成最终视频信息
    const processingDuration = Date.now() - startTime;
    const finalVideo = {
      id: `video-${Date.now()}`,
      name: videoName,
      duration: totalDuration,
      segments: videoSegments,
      status: 'completed',
      url: `cloud://${tcb.cloud.env}/videos/${videoName}/final.mp4`,
      createdAt: new Date(),
      processingDuration: processingDuration,
      nodeCount: nodes.length
    };
    
    // 6. 保存到数据库
    try {
      await db.collection('video_projects').add({
        data: {
          ...finalVideo,
          nodes: nodes,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
      
      console.log('视频项目已保存到数据库:', finalVideo.id);
    } catch (dbError) {
      console.error('保存到数据库失败:', dbError);
      // 即使数据库保存失败，也返回生成的视频信息
    }
    
    // 7. 返回成功结果
    return {
      success: true,
      projectId: finalVideo.id,
      videoUrl: finalVideo.url,
      segments: videoSegments,
      processingDuration: processingDuration,
      message: '视频生成成功',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('视频生成失败:', error);
    
    // 错误处理
    let errorMessage = '视频生成失败';
    let errorCode = 500;
    
    if (error.message && error.message.includes('timeout')) {
      errorMessage = '视频生成超时';
      errorCode = 408;
    } else if (error.message && error.message.includes('network')) {
      errorMessage = '网络连接失败';
      errorCode = 503;
    }
    
    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      details: error.message || '未知错误'
    };
  }
};

// 获取云开发实例的辅助函数（平台内置）
async function getCloudInstance() {
  const cloud = require('wx-server-sdk');
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  return cloud;
}

// 辅助函数：延迟执行
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
