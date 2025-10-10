
    # generateImageToVideo 云函数

    将多张图片合成为视频的云函数。

    ## 使用说明

    ### 前提条件
    1. 云开发环境已开通
    2. 已安装 FFmpeg（云函数运行环境已内置）
    3. 已创建 `video_tasks` 数据集合（可选）

    ### 调用示例

    ```javascript
    // 小程序端调用
    wx.cloud.callFunction({
      name: 'generateImageToVideo',
      data: {
        images: [
          'cloud://env-name/image1.jpg',
          'cloud://env-name/image2.jpg',
          'cloud://env-name/image3.jpg'
        ],
        fps: 10,
        width: 720,
        height: 1280,
        durationPerFrame: 0.5
      }
    }).then(res => {
      if (res.result.success) {
        console.log('视频生成成功:', res.result.downloadUrl);
      } else {
        console.error('视频生成失败:', res.result.error);
      }
    });

    // 云函数间调用
    const cloud = require('wx-server-sdk');
    cloud.init();
    
    const result = await cloud.callFunction({
      name: 'generateImageToVideo',
      data: {
        images: ['cloud://env-name/image1.jpg'],
        fps: 15,
        width: 1080,
        height: 1920
      }
    });
    ```

    ### 参数说明

    | 参数名 | 类型 | 必填 | 默认值 | 说明 |
    |--------|------|------|--------|------|
    | images | string[] | 是 | - | 图片在云存储中的 fileID 列表 |
    | fps | number | 否 | 10 | 输出视频的帧率 |
    | width | number | 否 | 720 | 输出视频宽度 |
    | height | number | 否 | 1280 | 输出视频高度 |
    | durationPerFrame | number | 否 | 0.5 | 每帧持续时间（秒） |

    ### 返回结果

    成功时：
    ```json
    {
      "success": true,
      "fileID": "cloud://env-name/videos/xxx.mp4",
      "downloadUrl": "https://xxx.com/xxx.mp4"
    }
    ```

    失败时：
    ```json
    {
      "success": false,
      "error": "错误信息"
    }
    ```

    ### 注意事项
    1. 函数执行时间可能较长，建议设置超时时间为 300 秒以上
    2. 临时文件存储在 /tmp 目录，函数执行完毕后会自动清理
    3. 建议图片尺寸与输出视频尺寸一致，避免拉伸变形
    4. 单次处理图片数量建议不超过 100 张
  