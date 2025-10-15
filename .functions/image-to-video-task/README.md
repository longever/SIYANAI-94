
# 图生视频任务云函数（资源连接器版）

## 更新说明
本次更新将 APIs 调用方式改为使用资源连接器 `aliyun_dashscope_jbn02va` 中的 `aliyun_dashscope_emo_detect_v1` 和 `emo_v1` 方法。

## 主要变更
- ✅ 使用 `app.connector('aliyun_dashscope_jbn02va')` 获取资源连接器
- ✅ 调用 `aliyun_dashscope_emo_detect_v1` 方法进行图片情感检测
- ✅ 调用 `emo_v1` 方法进行视频生成
- ✅ 保持原有功能不变
- ✅ 优化错误处理逻辑

## 调用示例

### 小程序端调用
```javascript
// 上传图片到云存储
wx.cloud.uploadFile({
  cloudPath: 'images/input.jpg',
  filePath: tempImagePath,
  success: res => {
    const imageFileId = res.fileID;
    
    // 获取临时URL
    wx.cloud.getTempFileURL({
      fileList: [imageFileId],
      success: res => {
        const imageUrl = res.fileList[0].tempFileURL;
        
        // 调用云函数
        wx.cloud.callFunction({
          name: 'image-to-video-task',
          data: {
            taskId: 'task-' + Date.now(),
            imageUrl: imageUrl,
            prompt: 'a person smiling and talking',
            style: 'realistic',
            duration: 5
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
        taskId: 'task-' + Date.now(),
        imageUrl: 'https://example.com/image.jpg',
        prompt: 'a person dancing',
        style: 'cartoon',
        duration: 3
      }
    });
    
    return result.result;
  } catch (error) {
    console.error('调用失败:', error);
    throw error;
  }
};
```

### 使用 HTTP URL 直接调用
```javascript
wx.cloud.callFunction({
  name: 'image-to-video-task',
  data: {
    taskId: 'task-' + Date.now(),
    imageUrl: 'https://example.com/image.jpg',
    prompt: 'a person singing',
    duration: 4
  }
});
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `taskId` | string | 是 | 任务唯一标识 |
| `imageUrl` | string | 是 | 图片的 HTTP URL |
| `prompt` | string | 是 | 视频生成提示词 |
| `style` | string | 否 | 视频风格，如 realistic/cartoon 等 |
| `duration` | number | 否 | 视频时长（秒） |

## 返回结果
```json
{
  "success": true,
  "requestId": "task-123456789",
  "detectResult": {
    "faceCount": 1,
    "emotion": "happy",
    "confidence": 0.95
  }
}
```

## 错误码说明
- `FAIL` - 参数校验失败或内部错误
- `DETECT_FAIL` - 图片检测阶段失败
- `GENERATE_FAIL` - 视频生成阶段失败
- 详细的错误消息便于调试

## 部署说明
1. 确保云开发环境已开通资源连接器 `aliyun_dashscope_jbn02va`
2. 检查连接器中是否包含 `aliyun_dashscope_emo_detect_v1` 和 `emo_v1` 方法
3. 部署后可在云开发控制台测试调用
  