
    # image-to-video-query-status 云函数

    用于轮询并同步第三方平台视频生成任务状态的云函数。

    ## 功能说明

    1. 根据本地 taskId 查询任务记录
    2. 调用对应平台 API 查询任务状态
    3. 根据状态进行相应处理：
       - 成功：下载视频并上传到云存储
       - 失败：记录错误信息
       - 处理中：更新时间戳
    4. 返回最新状态给前端

    ## 环境变量配置

    需要在云函数配置中设置以下环境变量：

    - `RUNWAY_API_KEY`: Runway 平台 API 密钥
    - `PIKA_API_KEY`: Pika 平台 API 密钥
    - `KLING_API_KEY`: Kling 平台 API 密钥

    ## 数据模型要求

    需要创建 `generation_tasks` 数据模型，包含以下字段：

    - `_id`: 主键
    - `platformTaskId`: 第三方平台任务ID
    - `modelType`: 平台类型（runway/pika/kling）
    - `status`: 任务状态
    - `videoUrl`: 云存储视频地址
    - `errorMessage`: 错误信息
    - `lastQueryTime`: 最后查询时间
    - `finishTime`: 完成时间

    ## 调用示例

    ```javascript
    // 小程序端调用
    wx.cloud.callFunction({
      name: 'image-to-video-query-status',
      data: {
        taskId: 'your_task_id_here'
      }
    }).then(res => {
      console.log('任务状态:', res.result);
      // 示例返回：
      // {
      //   status: 'completed',
      //   videoUrl: 'https://cloud-storage-url.com/video.mp4',
      //   lastQueryTime: '2024-01-15T10:30:00.000Z'
      // }
    }).catch(err => {
      console.error('查询失败:', err);
    });
    ```

    ## 状态说明

    - `processing`: 任务正在处理中
    - `completed`: 任务已完成，视频已上传到云存储
    - `failed`: 任务处理失败
  