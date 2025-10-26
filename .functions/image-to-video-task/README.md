
# 图片转视频任务云函数

这是一个将多张图片合成为视频的云函数，运行在函数型云托管环境中。

## 功能特性

- 支持多张图片合成视频
- 可配置视频时长、帧率、分辨率
- 异步处理，支持回调通知
- 任务状态持久化存储
- 自动清理临时文件

## 使用方法

### 调用示例

```javascript
// 在小程序中调用
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    images: [
      'cloud://env-name/image1.jpg',
      'cloud://env-name/image2.jpg'
    ],
    options: {
      duration: 10,
      fps: 30,
      resolution: [1920, 1080]
    },
    callback: 'video-task-callback' // 可选的回调函数
  }
}).then(res => {
  console.log('任务创建成功:', res.result);
  // { taskId: 'xxx', status: 'pending' }
})

// 在云函数中调用
const app = require('@cloudbase/node-sdk').init();
const result = await app.callFunction({
  name: 'image-to-video-task',
  data: {
    images: ['cloud://xxx/image1.jpg'],
    options: { duration: 5 }
  }
});
```

### 查询任务状态

```javascript
// 查询任务状态
const task = await models['image-to-video-task'].findOne({
  where: { taskId: 'your-task-id' }
});
console.log(task);
```

### 环境变量配置

需要在云函数环境中配置以下变量（可选）：

- `AI_VIDEO_API_URL`: AI 视频合成服务 API 地址
- `AI_SECRET_ID`: AI 服务密钥 ID
- `AI_SECRET_KEY`: AI 服务密钥
- `AI_REGION`: AI 服务区域

## 数据模型

函数使用 `image-to-video-task` 数据模型存储任务信息，包含以下字段：

- `taskId`: 任务唯一标识
- `images`: 输入图片 fileID 列表
- `options`: 视频配置参数
- `status`: 任务状态
- `videoFileId`: 输出视频 fileID
- `error`: 错误信息
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
