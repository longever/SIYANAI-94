
# 图生视频任务云函数（callConnector 版）

## 更新说明
本次更新将 APIs 连接器的调用方式从 `app.connector()` 改为 `app.callConnector()`，这是云开发推荐的标准调用方式。

## 主要变更
- ✅ 使用 `app.callConnector()` 替代 `app.connector()`
- ✅ 保持原有功能不变
- ✅ 优化错误处理逻辑
- ✅ 支持云存储文件 ID 自动转换为临时 URL

## 调用方式变更对比

### 旧方式（已废弃）
```javascript
// 旧方式 - 使用 connector()
const connector = app.connector('aliyun_dashscope_emo_detect_v1');
const result = await connector.invoke('aliyun_dashscope_emo_detect_v1', {
  image: imageTempUrl
});
```

### 新方式（推荐）
```javascript
// 新方式 - 使用 callConnector()
const result = await app.callConnector({
  name: 'aliyun_dashscope_emo_detect_v1',
  method: 'POST',
  data: {
    image: imageTempUrl
  }
});
```

## 调用示例

### 小程序端调用
```javascript
// 上传图片和音频到云存储
wx.cloud.uploadFile({
  cloudPath: 'images/avatar.jpg',
  filePath: tempImagePath,
  success: res => {
    const imageFileId = res.fileID;
    
    wx.cloud.uploadFile({
      cloudPath: 'audios/voice.mp3',
      filePath: tempAudioPath,
      success: res => {
        const audioFileId = res.fileID;
        
        // 调用云函数
        wx.cloud.callFunction({
          name: 'image-to-video-task',
          data: {
            imageFileId: imageFileId,
            audioFileId: audioFileId,
            callbackUrl: 'https://your-callback-url.com/webhook',
            userContext: {
              userId: 'user123',
              scene: 'avatar',
              timestamp: Date.now()
            }
          }
        }).then(res => {
          console.log('任务创建成功:', res.result);
          // 获取任务ID用于后续查询
          const taskId = res.result.taskId;
        }).catch(err => {
          console.error('任务创建失败:', err);
        });
      }
    });
  }
});
```

### 云函数间调用
```javascript
const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });

  try {
    const result = await app.callFunction({
      name: 'image-to-video-task',
      data: {
        imageFileId: 'cloud://env-name-123456/image.jpg',
        audioFileId: 'cloud://env-name-123456/audio.mp3',
        userContext: {
          source: 'cloud-function',
          requestId: context.request_id
        }
      }
    });
    
    return result.result;
  } catch (error) {
    console.error('调用失败:', error);
    throw error;
  }
};
```

### 使用 HTTP URL 调用
```javascript
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    imageUrl: 'https://example.com/image.jpg',
    audioUrl: 'https://example.com/audio.mp3',
    callbackUrl: 'https://your-callback-url.com/webhook'
  }
});
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

## 错误码说明
- `FAIL` - 参数校验失败或内部错误
- `DETECT_FAIL` - 图片检测阶段失败
- 详细的错误消息便于调试

## 部署说明
1. 确保云开发环境已开通 APIs 连接器
2. 检查连接器名称是否正确（`aliyun_dashscope_emo_detect_v1` 和 `emo_v1`）
3. 部署后可在云开发控制台测试调用
  