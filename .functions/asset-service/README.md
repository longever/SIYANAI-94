
    # 素材管理云函数 (asset-service)

    提供完整的素材管理 RESTful API，支持文件上传、下载、列表查询、删除和更新功能。

    ## 功能特性

    - **文件上传**: 支持 multipart/form-data 格式上传
    - **文件管理**: 完整的 CRUD 操作
    - **权限控制**: 基于用户身份的权限校验
    - **云存储集成**: 自动上传到云存储并管理文件
    - **分页查询**: 支持分页和多种筛选条件

    ## API 接口

    ### 1. 上传素材
    ```
    POST /upload
    Content-Type: multipart/form-data
    
    Body:
    - file: 二进制文件 (必填)
    - type: 素材类型 (image/video/audio/document) (必填)
    - tags: 逗号分隔的标签 (可选)
    - name: 文件名称 (可选)
    
    Response:
    {
      code: 0,
      data: {
        id: "素材ID",
        name: "文件名",
        type: "image",
        tags: ["tag1", "tag2"],
        url: "云存储URL",
        size: 1024,
        owner: "用户openId",
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    }
    ```

    ### 2. 获取素材列表
    ```
    GET /list?page=1&size=20&type=image&tags=tag1,tag2&keyword=搜索词
    
    Response:
    {
      code: 0,
      data: {
        list: [...],
        total: 100
      }
    }
    ```

    ### 3. 获取下载链接
    ```
    GET /download?id=素材ID
    
    Response:
    {
      code: 0,
      data: {
        url: "带签名的下载URL",
        expiresIn: 900
      }
    }
    ```

    ### 4. 删除素材
    ```
    DELETE /delete?id=素材ID
    
    Response:
    {
      code: 0,
      data: { id: "素材ID" }
    }
    ```

    ### 5. 更新素材
    ```
    PUT /update
    Content-Type: application/json
    
    Body:
    {
      "id": "素材ID",
      "name": "新名称",
      "tags": ["新标签1", "新标签2"]
    }
    
    Response:
    {
      code: 0,
      data: {
        id: "素材ID",
        name: "新名称",
        tags: ["新标签1", "新标签2"],
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    }
    ```

    ## 使用示例

    ### 小程序端调用示例

    ```javascript
    // 上传文件
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        wx.uploadFile({
          url: 'https://your-domain/asset-service',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            type: 'image',
            tags: '风景,旅游',
            name: '美丽风景.jpg'
          },
          success(res) {
            const data = JSON.parse(res.data);
            console.log('上传成功:', data);
          }
        });
      }
    });

    // 获取列表
    wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        httpMethod: 'GET',
        path: '/list',
        queryString: {
          page: 1,
          size: 10,
          type: 'image'
        }
      },
      success(res) {
        console.log('素材列表:', res.result.data);
      }
    });

    // 下载文件
    wx.cloud.callFunction({
      name: 'asset-service',
      data: {
        httpMethod: 'GET',
        path: '/download',
        queryString: {
          id: '素材ID'
        }
      },
      success(res) {
        const downloadUrl = res.result.data.url;
        // 使用下载链接
      }
    });
    ```

    ### 云函数端调用示例

    ```javascript
    const cloudbase = require('@cloudbase/node-sdk');
    const app = cloudbase.init();
    
    // 获取素材列表
    const result = await app.callFunction({
      name: 'asset-service',
      data: {
        httpMethod: 'GET',
        path: '/list',
        queryString: {
          page: 1,
          size: 20,
          keyword: '风景'
        }
      }
    });
    
    console.log(result.result.data);
    ```

    ## 错误码说明

    - 0: 成功
    - 400: 参数错误
    - 403: 权限不足
    - 404: 资源不存在
    - 500: 服务器内部错误

    ## 部署说明

    1. 安装依赖: `npm install`
    2. 创建数据模型: 在云开发控制台创建名为 `asset` 的数据模型，字段包括：
       - name: 字符串
       - type: 字符串
       - tags: 字符串数组
       - url: 字符串
       - size: 数字
       - owner: 字符串
       - createdAt: 日期
       - updatedAt: 日期
    3. 部署云函数
  