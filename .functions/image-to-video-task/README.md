
# 图生视频任务云函数（更新版）

## 功能说明
该云函数使用 APIs 连接器 `aliyun_dashscope_jbn02va` 实现图生视频任务的完整后端流程：
1. 接收用户提交的图生视频任务（包含图片和音频）
2. 调用 `aliyun_dashscope_emo_detect_v1` API 进行图片检测
3. 将检测结果、图片和音频作为参数调用 `emo_v1` API 生成视频
4. 返回任务 ID 和检测信息

## 调用示例

### 小程序调用
```javascript
// 使用图片和音频的 URL
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageUrl: 'https://example.com/image.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    callbackUrl: 'https://example.com/callback',
    userContext: {
      userId: 'user123',
      scene: 'avatar'
    }
  }
}).then(res => {
  console.log('任务创建成功:', res.result);
  // 输出: { taskId: 'xxx-xxx-xxx', status: 'GENERATING', detectResult: {...} }
}).catch(err => {
  console.error('任务创建失败:', err);
});

// 使用云存储文件 ID
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageFileId: 'cloud://env-name/path/to/image.jpg',
    audioFileId: 'cloud://env-name/path/to/audio.mp3',
    callbackUrl: 'https://example.com/callback'
  }
}).then(res => {
  console.log('任务创建成功:', res.result);
}).catch(err => {
  console.error('任务创建失败:', err);
});
```

### 云函数调用
```javascript
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const result = await cloud.callFunction({
    name: 'image-to-video-task',
    data: {
      imageUrl: 'https://example.com/image.jpg',
      audioUrl: 'https://example.com/audio.mp3',
      userContext: {
        userId: 'user123'
      }
    }
  })
  
  return result.result
}
```

## 参数说明
- `imageUrl` (可选): 图片的 HTTP URL
- `imageFileId` (可选): 云存储中的图片文件 ID
- `audioUrl` (可选): 音频的 HTTP URL
- `audioFileId` (可选): 云存储中的音频文件 ID
- `callbackUrl` (可选): 任务完成后的回调地址
- `userContext` (可选): 用户自定义上下文信息

**注意：图片和音频参数必须至少提供一种（URL 或文件 ID）**

## 返回结果
```json
{
  "taskId": "task-123456789",
  "status": "GENERATING",
  "detectResult": {
    "faceCount": 1,
    "emotion": "happy",
    "confidence": 0.95
  }
}
```

## 错误处理
函数会返回详细的错误信息，包括：
- 参数校验错误
- 图片/音频获取失败
- 图片检测失败
- 视频生成失败
- 内部错误

## 状态说明
- `DETECTING`: 正在进行图片检测
- `DETECT_FAIL`: 图片检测失败
- `GENERATING`: 正在生成视频
- `SUCCESS`: 任务成功完成
- `FAIL`: 任务失败
  