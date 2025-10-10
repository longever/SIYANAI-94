
    # 任务状态查询与视频处理云函数

    ## 功能描述
    该云函数用于查询第三方平台的任务状态，当任务完成时自动下载视频文件并上传到云存储。

    ## 使用说明

    ### 1. 环境变量配置
    在云函数配置中添加以下环境变量：
    - `THIRD_PARTY_API_URL`: 第三方平台API地址
    - `THIRD_PARTY_API_KEY`: 第三方平台API密钥

    ### 2. 数据模型要求
    需要创建名为 `generation_tasks` 的数据模型，包含以下字段：
    - `taskId`: string (必填) - 第三方平台任务ID
    - `status`: string - 任务状态
    - `videoUrl`: string - 视频文件URL
    - `finishedAt`: string - 完成时间
    - `updatedAt`: string - 更新时间

    ### 3. 调用示例

    #### 小程序调用
    ```javascript
    wx.cloud.callFunction({
      name: 'check-task-status',
      data: {
        taskId: 'your-task-id-123'
      }
    }).then(res => {
      console.log(res.result);
      // 成功返回示例：
      // {
      //   code: 0,
      //   message: "任务已完成，视频处理成功",
      //   data: {
      //     status: "completed",
      //     videoUrl: "https://your-cloud-storage-url.com/videos/your-task-id-123.mp4",
      //     finishedAt: "2024-01-15T10:30:00.000Z"
      //   }
      // }
    }).catch(err => {
      console.error(err);
    });
    ```

    #### 云函数调用
    ```javascript
    const cloud = require('wx-server-sdk');
    cloud.init();

    exports.main = async (event, context) => {
      const result = await cloud.callFunction({
        name: 'check-task-status',
        data: {
          taskId: 'your-task-id-123'
        }
      });
      
      return result.result;
    };
    ```

    ### 4. 错误码说明
    - `0`: 成功
    - `400`: 参数错误
    - `500`: 服务器内部错误

    ### 5. 注意事项
    - 确保云函数有足够的内存和超时时间配置
    - 大文件下载可能需要调整云函数的超时时间
    - 建议设置合理的并发限制，避免对第三方平台造成过大压力
  