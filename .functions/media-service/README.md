
# 媒体处理云函数

这是一个基于云开发的媒体处理服务，提供视频转码、音视频合并、视频拼接等功能。

## 功能特性

- **视频转码**：支持将视频转换为不同格式（mp4、mov、webm等）
- **音视频合并**：将音频文件合并到视频中
- **视频拼接**：将多个视频按顺序拼接成一个视频
- **媒体管理**：获取下载链接和删除媒体文件

## 环境变量配置

在部署云函数前，需要配置以下环境变量：

```bash
# S3 配置
S3_REGION=ap-beijing
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

## 使用示例

### 1. 视频转码

```javascript
const result = await wx.cloud.callFunction({
  name: 'media-service',
  data: {
    action: 'transcode',
    data: {
      videoUrl: 'https://example.com/input.mp4',
      targetFormat: 'webm'
    }
  }
});

if (result.code === 0) {
  console.log('转码成功:', result.data.url);
}
```

### 2. 音视频合并

```javascript
const result = await wx.cloud.callFunction({
  name: 'media-service',
  data: {
    action: 'merge-audio-video',
    data: {
      videoUrl: 'https://example.com/video.mp4',
      audioUrl: 'https://example.com/audio.mp3'
    }
  }
});

if (result.code === 0) {
  console.log('合并成功:', result.data.url);
}
```

### 3. 视频拼接

```javascript
const result = await wx.cloud.callFunction({
  name: 'media-service',
  data: {
    action: 'concat-videos',
    data: {
      videoUrls: [
        'https://example.com/video1.mp4',
        'https://example.com/video2.mp4',
        'https://example.com/video3.mp4'
      ]
    }
  }
});

if (result.code === 0) {
  console.log('拼接成功:', result.data.url);
}
```

### 4. 获取下载链接

```javascript
const result = await wx.cloud.callFunction({
  name: 'media-service',
  data: {
    action: 'get-media',
    data: {
      id: 'media-id-from-database'
    }
  }
});

if (result.code === 0) {
  console.log('下载链接:', result.data.downloadUrl);
}
```

### 5. 删除媒体文件

```javascript
const result = await wx.cloud.callFunction({
  name: 'media-service',
  data: {
    action: 'delete-media',
    data: {
      id: 'media-id-from-database'
    }
  }
});

if (result.code === 0) {
  console.log('删除成功');
}
```

## 注意事项

1. 确保云函数环境中已安装 FFmpeg
2. 大文件处理可能需要较长的执行时间，建议设置合适的超时时间
3. 临时文件存储在 `/tmp` 目录，处理完成后会自动清理
4. 生成的下载链接有效期为1小时，可通过修改代码调整
