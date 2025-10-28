
    # description-to-video 云函数

    根据文本提示词调用通义万相API生成视频的云函数。

    ## 功能特性

    - 支持两种视频生成模型：
      - `wan2.5-t2v-preview`：带音频预览版（默认）
      - `wan2.2-t2v-plus`：不带音频版
    - 任务状态持久化到数据模型
    - 支持回调通知
    - 参数校验和安全过滤
    - 完整的错误处理机制

    ## 环境变量配置

    在云函数控制台配置以下环境变量：

    | 变量名 | 说明 | 示例 |
    |--------|------|------|
    | `WANXIANG_API_KEY` | 通义万相API密钥 | 从阿里云控制台获取 |
    | `WANXIANG_API_ENDPOINT` | API端点（可选） | https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/video-synthesis |

    ## 数据模型

    需要提前创建 `video_tasks` 数据模型，包含以下字段：

    - `_id`: 主键ID
    - `prompt`: 文本提示词
    - `model`: 使用的模型
    - `status`: 任务状态（pending/submitted/failed/completed）
    - `createdAt`: 创建时间
    - `updatedAt`: 更新时间
    - `wanTaskId`: 万相返回的任务ID
    - `callbackUrl`: 回调地址
    - `errorMsg`: 错误信息

    ## 调用示例

    ### 小程序调用

    ```javascript
    // 基础调用
    wx.cloud.callFunction({
      name: 'description-to-video',
      data: {
        prompt: '一只可爱的猫咪在草地上玩耍，阳光明媚'
      }
    }).then(res => {
      console.log('任务提交成功:', res.result);
      // 输出: { taskId: "xxx", status: "submitted", ... }
    }).catch(err => {
      console.error('调用失败:', err);
    });

    // 指定模型和回调
    wx.cloud.callFunction({
      name: 'description-to-video',
      data: {
        prompt: '未来科技城市，飞行汽车，霓虹灯光',
        model: 'wan2.2-t2v-plus',
        callbackUrl: 'https://your-domain.com/callback'
      }
    });
    ```

    ### 云函数调用

    ```javascript
    const cloud = require('wx-server-sdk');
    cloud.init();

    exports.main = async (event, context) => {
      const result = await cloud.callFunction({
        name: 'description-to-video',
        data: {
          prompt: '山水画卷，日出东方，云雾缭绕',
          model: 'wan2.5-t2v-preview'
        }
      });
      
      return result.result;
    };
    ```

    ## 错误处理

    函数会返回统一的错误格式：

    ```json
    {
      "error": "错误描述",
      "details": {
        "message": "详细错误信息",
        "errors": ["参数错误1", "参数错误2"]
      }
    }
    ```

    ## 注意事项

    1. 确保已配置通义万相API密钥
    2. prompt长度限制500字符
    3. 仅支持中英文、数字和常用标点符号
    4. API调用超时时间10秒
    5. 任务状态需要通过万相API或回调机制查询
  