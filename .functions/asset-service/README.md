
    # Asset Service 云函数

    这是一个用于资产管理的云函数，提供资产的创建、查询、更新和删除功能。

    ## 功能特性

    - 创建资产记录
    - 查询资产列表（支持分页、过滤、搜索）
    - 获取单个资产详情
    - 更新资产信息
    - 软删除资产

    ## 使用方法

    ### 1. 创建资产

    ```javascript
    const result = await wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        action: 'createAsset',
        data: {
          name: '服务器A',
          type: 'hardware',
          value: 5000,
          description: '生产环境服务器',
          status: 'active',
          location: '机房A',
          owner: '张三'
        }
      }
    });
    ```

    ### 2. 查询资产列表

    ```javascript
    const result = await wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        action: 'listAssets',
        data: {
          page: 1,
          limit: 10,
          type: 'hardware',
          keyword: '服务器'
        }
      }
    });
    ```

    ### 3. 获取资产详情

    ```javascript
    const result = await wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        action: 'getAsset',
        data: {
          assetId: 'asset-id-here'
        }
      }
    });
    ```

    ### 4. 更新资产

    ```javascript
    const result = await wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        action: 'updateAsset',
        data: {
          assetId: 'asset-id-here',
          updateData: {
            value: 6000,
            status: 'maintenance'
          }
        }
      }
    });
    ```

    ### 5. 删除资产

    ```javascript
    const result = await wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        action: 'deleteAsset',
        data: {
          assetId: 'asset-id-here'
        }
      }
    });
    ```

    ## 部署步骤

    1. 在云开发控制台创建云函数
    2. 上传代码包
    3. 安装依赖（@cloudbase/node-sdk）
    4. 配置环境变量（如需要）
    5. 部署并测试

    ## 数据模型

    需要在云开发控制台创建名为 `asset` 的数据模型，包含以下字段：

    - name: 资产名称（文本）
    - type: 资产类型（文本）
    - value: 资产价值（数字）
    - description: 描述（文本）
    - status: 状态（枚举：active/inactive/maintenance）
    - location: 位置（文本）
    - owner: 负责人（文本）
    - createdAt: 创建时间（日期时间）
    - updatedAt: 更新时间（日期时间）
    - isDeleted: 是否删除（布尔值）
    - deletedAt: 删除时间（日期时间）
  