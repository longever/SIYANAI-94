
# Material Service 云函数

这是一个用于素材管理的云函数，提供以下功能：

## 功能特性

1. **素材库管理**
   - 上传素材文件
   - 分页查询用户素材
   - 删除素材并清理云存储

2. **外部素材获取**
   - 接收外部URL，下载并转存到云存储

3. **下载服务**
   - 生成带签名的临时下载URL

## API 接口

### 1. 上传素材
```
POST /materials
Content-Type: multipart/form-data

参数：
- file: 文件内容
- type: 素材类型
- tags: 标签数组（可选）

返回：
{
  "id": "string",
  "url": "string"
}
```

### 2. 查询素材列表
```
GET /materials?userId=xxx&page=1&pageSize=20&type=image&tags=["tag1","tag2"]

返回：
{
  "list": [
    {
      "id": "string",
      "url": "string",
      "type": "string",
      "tags": ["string"],
      "createdAt": "string"
    }
  ],
  "total": 100
}
```

### 3. 删除素材
```
DELETE /materials/{id}

返回：
{
  "success": true
}
```

### 4. 获取外部素材
```
POST /fetch-external
Content-Type: application/json

参数：
{
  "url": "https://example.com/image.jpg",
  "type": "image",
  "tags": ["tag1", "tag2"]
}

返回：
{
  "id": "string",
  "url": "string"
}
```

### 5. 生成下载URL
```
GET /materials/{id}/download

返回：
{
  "downloadUrl": "https://...",
  "expiresIn": 900
}
```

## 使用示例

### 小程序端调用示例

```javascript
// 上传素材
wx.cloud.callFunction({
  name: 'material-service',
  data: {
    httpMethod: 'POST',
    path: '/materials',
    headers: {
      'x-user-id': 'user123'
    },
    body: JSON.stringify({
      type: 'image',
      tags: ['avatar', 'profile']
    })
  }
})

// 查询素材
wx.cloud.callFunction({
  name: 'material-service',
  data: {
    httpMethod: 'GET',
    path: '/materials',
    queryStringParameters: {
      userId: 'user123',
      page: '1',
      pageSize: '20',
      type: 'image'
    }
  }
})

// 获取下载链接
wx.cloud.callFunction({
  name: 'material-service',
  data: {
    httpMethod: 'GET',
    path: '/materials/123456/download',
    headers: {
      'x-user-id': 'user123'
    }
  }
})
```

### 云函数端调用示例

```javascript
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  const result = await cloud.callFunction({
    name: 'material-service',
    data: {
      httpMethod: 'POST',
      path: '/fetch-external',
      body: JSON.stringify({
        url: 'https://example.com/image.jpg',
        type: 'image',
        tags: ['banner']
      }),
      headers: {
        'x-user-id': wxContext.OPENID
      }
    }
  })
  
  return result.result
}
```
  