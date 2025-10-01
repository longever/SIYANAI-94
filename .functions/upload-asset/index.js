
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { filePath, fileName, fileType, metadata = {} } = event
  
  try {
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `assets/${Date.now()}_${fileName}`,
      fileContent: fs.readFileSync(filePath)
    })
    
    // 保存到数据库
    const db = cloud.database()
    const result = await db.collection('asset_library').add({
      data: {
        fileId: uploadResult.fileID,
        fileName,
        fileType,
        fileSize: metadata.size || 0,
        uploadTime: new Date(),
        metadata,
        status: 'active'
      }
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        fileId: uploadResult.fileID,
        url: uploadResult.fileID
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
