
# 图生视频任务云函数（云存储临时 URL 版）

## 功能说明
该云函数已更新为支持云存储文件 ID 自动转换为临时 URL，使用 APIs 连接器 `aliyun_dashscope_jbn02va` 实现图生视频任务的完整后端流程。

## 主要更新
- ✅ 支持云存储文件 ID 自动转换为临时 URL
- ✅ 支持 HTTP URL 和云存储文件 ID 混合使用
- ✅ 优化错误处理和日志输出
- ✅ 返回临时 URL 信息便于调试

## 调用示例

### 使用云存储文件 ID（推荐）
```javascript
// 小程序端上传文件后获取 fileID
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageFileId: 'cloud://env-name-123456/path/to/image.jpg',
    audioFileId: 'cloud://env-name-123456/path/to/audio.mp3',
    callbackUrl: 'https://your-callback-url.com/webhook',
    userContext: {
      userId: 'user123',
      scene: 'avatar',
      timestamp: Date.now()
    }
  }
}).then(res => {
  console.log('任务创建成功:', res.result);
  // 输出示例:
  // {
  //   taskId: 'task-123456789',
  //   status: 'GENERATING',
  //   detectResult: { faceCount: 1, emotion: 'happy', confidence: 0.95 },
  //   tempUrls: {
  //     image: 'https://tmp-url-for-image.jpg',
  //     audio: 'https://tmp-url-for-audio.mp3'
  //   }
  // }
}).catch(err => {
  console.error('任务创建失败:', err);
});
```

### 使用 HTTP URL
```javascript
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageUrl: 'https://example.com/image.jpg',
    audioUrl: 'https://example.com/audio.mp3'
  }
});
```

### 混合使用
```javascript
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageFileId: 'cloud://env-name-123456/image.jpg',  // 云存储文件
    audioUrl: 'https://cdn.example.com/audio.mp3'       // HTTP URL
  }
});
```

### 云函数间调用
```javascript
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const result = await cloud.callFunction({
    name: 'image-to-video-task',
    data: {
      imageFileId: event.imageFileId,
      audioFileId: event.audioFileId,
      userContext: {
        source: 'cloud-function',
        requestId: context.request_id
      }
    }
  })
  
  return result.result
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `imageUrl` | string | 否 | 图片的 HTTP URL |
| `imageFileId` | string | 否 | 云存储中的图片文件 ID |
| `audioUrl` | string | 否 | 音频的 HTTP URL |
| `audioFileId` | string | 否 | 云存储中的音频文件 ID |
| `callbackUrl` | string | 否 | 任务完成后的回调地址 |
| `userContext` | object | 否 | 用户自定义上下文信息 |

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
  },
  "tempUrls": {
    "image": "https://tmp-url-for-image.jpg",
    "audio": "https://tmp-url-for-audio.mp3"
  }
}
```

## 错误处理
函数会返回详细的错误信息：
- `FAIL` - 参数校验失败或内部错误
- `DETECT_FAIL` - 图片检测阶段失败
- 详细的错误消息便于调试

## 使用场景
1. **小程序端**：用户上传图片和音频后，直接使用返回的 `fileID`
2. **Web 端**：先上传到云存储，获取 `fileID` 后调用
3. **云函数间调用**：其他云函数可以复用此功能

## 注意事项
- 临时 URL 有效期为 2 小时，足够完成图生视频任务
- 云存储文件需要设置正确的权限（建议设置为可读）
- 大文件建议先上传到云存储再使用
  