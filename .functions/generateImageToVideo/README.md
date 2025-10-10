
    # 图生视频云函数使用说明

    ## 功能概述
    该云函数接收用户上传的图片、音频、视频素材，调用AI视频生成模型创建视频任务。

    ## 调用方式

    ### 小程序端调用示例
    ```javascript
    // 上传图片生成视频
    wx.cloud.callFunction({
      name: 'generateImageToVideo',
      data: {
        // 文件通过formData上传
        prompt: '创建一个梦幻风格的动画视频',
        duration: 10,
        resolution: '1920x1080',
        style: 'fantasy',
        fps: 30
      },
      files: {
        image: tempFilePath, // 图片文件路径
        audio: audioFilePath // 可选：音频文件路径
      },
      success: res => {
        console.log('任务创建成功:', res.result);
        // res.result: { taskId, status, message }
      },
      fail: err => {
        console.error('任务创建失败:', err);
      }
    });
    ```

    ### Web端调用示例
    ```javascript
    // 使用FormData上传
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('audio', audioFile); // 可选
    formData.append('prompt', '创建一个科幻风格的视频');
    formData.append('duration', '8');
    formData.append('resolution', '1920x1080');

    wx.cloud.callFunction({
      name: 'generateImageToVideo',
      data: formData,
      success: res => {
        console.log('任务创建成功:', res.result);
      }
    });
    ```

    ## 参数说明

    ### 必需参数
    - **image**: 图片文件 (支持 jpeg, png, webp)
    - **prompt**: 视频生成提示词 (string)

    ### 可选参数
    - **audio**: 音频文件 (支持 mp3, wav, m4a)
    - **video**: 视频文件 (支持 mp4, mov, avi)
    - **duration**: 视频时长，默认5秒，范围1-60秒
    - **resolution**: 分辨率，默认"1280x720"，支持"1920x1080"
    - **style**: 视频风格描述
    - **fps**: 帧率，默认24，范围12-60

    ## 返回结果

    ### 成功响应
    ```json
    {
      "taskId": "uuid-string",
      "status": "pending",
      "message": "任务已创建，正在处理中"
    }
    ```

    ### 错误响应
    ```json
    {
      "error": "参数验证失败",
      "details": ["必需参数：image文件缺失", "prompt不能为空"],
      "statusCode": 400
    }
    ```

    ## 环境变量配置
    需要在云函数配置中设置以下环境变量：
    - `VIDEO_API_BASE_URL`: 视频生成API的基础URL
    - `VIDEO_API_KEY`: API访问密钥

    ## 数据模型
    任务信息会保存到 `generation_tasks` 数据模型中，包含：
    - 任务ID和状态
    - 上传的文件链接
    - 生成参数
    - API响应信息
    - 创建和更新时间
  