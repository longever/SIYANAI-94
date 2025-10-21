
'use strict';

const { v4: uuidv4 } = require('uuid');
const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});

exports.main = async (event, context) => {
  // 在函数最开始的位置生成 taskId
  const taskId = uuidv4();
  
  try {
    // 原有业务逻辑保持不变，可以继续使用 taskId
    console.log(`Task started with ID: ${taskId}`);
    
    // 这里放置原有的业务逻辑代码
    // 可以使用 taskId 进行日志记录、数据库操作等
    
    // 示例：返回包含 taskId 的结果
    return {
      success: true,
      taskId,
      message: '任务处理完成',
      // 其他原有返回数据...
    };
    
  } catch (error) {
    // 错误处理，包含 taskId 方便定位
    console.error(`Task ${taskId} failed:`, error);
    
    return {
      success: false,
      taskId,
      error: error.message,
      // 其他错误信息...
    };
  }
};
