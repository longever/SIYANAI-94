
    # 图生视频任务云函数

    ## 功能说明
    该云函数实现了图生视频任务的完整后端流程：
    1. 接收用户提交的图生视频任务
    2. 将任务信息保存到数据模型
    3. 调用对应平台的API（目前支持通义万相）
    4. 更新任务状态和结果

    ## 环境变量配置
    需要在云函数配置中设置以下环境变量：
    - `TONGYI_API_KEY`: 通义万相API的访问密钥

    ## 数据模型要求
    需要在云开发控制台创建名为 `generation_tasks` 的数据模型，包含以下字段：
    - taskId: 字符串，任务唯一标识
    - imageUrl: 字符串，原始图片地址
    - model: 字符串，使用的模型标识
    - prompt: 字符串，文本描述
    - userId: 字符串，用户标识
    - callbackUrl: 字符串，回调地址
    - status: 字符串，任务状态
    - createdAt: 日期时间，创建时间
    - updatedAt: 日期时间，更新时间
    - result: 对象，API返回结果

    ## 调用示例

    ### 小程序调用
    ```javascript
    wx.cloud.callFunction({
      name: 'image-to-video-task',
      data: {
        imageUrl: 'https://example.com/image.jpg',
        model: 'tongyi-wanxiang',
        prompt: '生成一个展示自然风光的视频',
        userId: 'user123',
        callbackUrl: 'https://example.com/callback'
      }
    }).then(res => {
      console.log('任务创建成功:', res.result);
      // 输出: { taskId: 'xxx-xxx-xxx', status: 'running' }
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
          model: 'tongyi-wanxiang',
          userId: 'user123'
        }
      })
      
      return result.result
    }
    ```

    ## 错误处理
    函数会返回详细的错误信息，包括：
    - 参数校验错误
    - API调用失败
    - 数据库操作失败

    ## 日志说明
    函数在关键节点会打印结构化日志，便于排查问题：
    - 收到请求
    - 创建任务记录
    - API调用请求和响应
    - 任务状态更新
    - 错误信息
  