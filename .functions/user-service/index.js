
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// 初始化云开发
const app = cloudbase.init();
const models = app.models;

// 配置常量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
const LAGO_API_KEY = process.env.LAGO_API_KEY || 'lago_api_kynep0e';
const LAGO_BASE_URL = 'https://api.getlago.com/api/v1';

// 创建axios实例
const lagoClient = axios.create({
  baseURL: LAGO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${LAGO_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// 工具函数
const success = (data) => ({ success: true, data });
const fail = (message, code = 400) => ({ success: false, error: message, code });

// JWT验证
const authenticateToken = async (token) => {
  if (!token) throw new Error('未提供认证令牌');
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('无效的认证令牌');
  }
};

// 验证邮箱格式
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 验证密码强度
const validatePassword = (password) => {
  return password.length >= 6;
};

// 注册用户
const register = async (email, password, planId) => {
  // 验证输入
  if (!validateEmail(email)) throw new Error('无效的邮箱格式');
  if (!validatePassword(password)) throw new Error('密码至少需要6个字符');
  
  // 检查用户是否已存在
  const existingUser = await models.users.list({
    filter: { where: { email: { $eq: email } } }
  });
  
  if (existingUser.data.total > 0) {
    throw new Error('该邮箱已被注册');
  }

  // 检查套餐是否存在
  const plan = await models.plans.get({
    filter: { where: { _id: { $eq: planId } } }
  });
  
  if (!plan.data.records || plan.data.records.length === 0) {
    throw new Error('无效的套餐ID');
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await models.users.create({
    data: {
      email,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  });

  try {
    // 同步到Lago
    const customerResponse = await lagoClient.post('/customers', {
      customer: {
        external_id: user.data._id,
        email: email,
        name: email.split('@')[0]
      }
    });

    const customerId = customerResponse.data.customer.lago_id;

    // 更新用户的外部customer_id
    await models.users.update({
      data: { customerId },
      filter: { where: { _id: { $eq: user.data._id } } }
    });

    // 创建初始订阅
    const subscriptionResponse = await lagoClient.post('/subscriptions', {
      subscription: {
        external_customer_id: user.data._id,
        plan_code: planId,
        name: plan.data.records[0].name
      }
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.data._id, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.data._id,
        email: user.email,
        customerId,
        subscriptionId: subscriptionResponse.data.subscription.lago_id
      },
      token
    };
  } catch (lagoError) {
    console.error('Lago同步失败:', lagoError);
    // 如果Lago同步失败，删除已创建的用户
    await models.users.delete({
      filter: { where: { _id: { $eq: user.data._id } } }
    });
    throw new Error('用户注册失败，请稍后重试');
  }
};

// 用户登录
const login = async (email, password) => {
  if (!validateEmail(email)) throw new Error('无效的邮箱格式');
  if (!password) throw new Error('密码不能为空');

  // 查询用户
  const userResult = await models.users.list({
    filter: { where: { email: { $eq: email } } }
  });

  if (!userResult.data.records || userResult.data.records.length === 0) {
    throw new Error('用户不存在或密码错误');
  }

  const user = userResult.data.records[0];

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('用户不存在或密码错误');
  }

  // 检查用户状态
  if (user.status !== 'active') {
    throw new Error('账户已被禁用');
  }

  // 生成JWT令牌
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user._id,
      email: user.email,
      customerId: user.customerId
    },
    token
  };
};

// 获取用户信息
const getUserInfo = async (userId) => {
  const user = await models.users.get({
    filter: { where: { _id: { $eq: userId } } }
  });

  if (!user.data.records || user.data.records.length === 0) {
    throw new Error('用户不存在');
  }

  const userData = user.data.records[0];

  // 获取用户订阅信息
  let subscription = null;
  if (userData.customerId) {
    try {
      const subscriptionResponse = await lagoClient.get(`/customers/${userData.customerId}/current_usage`);
      subscription = subscriptionResponse.data;
    } catch (error) {
      console.error('获取订阅信息失败:', error);
    }
  }

  return {
    id: userData._id,
    email: userData.email,
    customerId: userData.customerId,
    status: userData.status,
    createdAt: userData.createdAt,
    subscription
  };
};

// 更新用户信息
const updateUser = async (userId, updateData) => {
  const allowedFields = ['name', 'avatar', 'phone'];
  const filteredData = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  if (Object.keys(filteredData).length === 0) {
    throw new Error('没有可更新的字段');
  }

  filteredData.updatedAt = new Date().toISOString();

  await models.users.update({
    data: filteredData,
    filter: { where: { _id: { $eq: userId } } }
  });

  return { success: true };
};

// 修改密码
const changePassword = async (userId, oldPassword, newPassword) => {
  if (!validatePassword(newPassword)) {
    throw new Error('新密码至少需要6个字符');
  }

  const user = await models.users.get({
    filter: { where: { _id: { $eq: userId } } }
  });

  if (!user.data.records || user.data.records.length === 0) {
    throw new Error('用户不存在');
  }

  const userData = user.data.records[0];

  // 验证旧密码
  const isOldPasswordValid = await bcrypt.compare(oldPassword, userData.password);
  if (!isOldPasswordValid) {
    throw new Error('旧密码错误');
  }

  // 加密新密码
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await models.users.update({
    data: { password: hashedNewPassword, updatedAt: new Date().toISOString() },
    filter: { where: { _id: { $eq: userId } } }
  });

  return { success: true };
};

// 重置密码
const resetPassword = async (email, newPassword) => {
  if (!validateEmail(email)) throw new Error('无效的邮箱格式');
  if (!validatePassword(newPassword)) throw new Error('新密码至少需要6个字符');

  const userResult = await models.users.list({
    filter: { where: { email: { $eq: email } } }
  });

  if (!userResult.data.records || userResult.data.records.length === 0) {
    throw new Error('用户不存在');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await models.users.update({
    data: { password: hashedNewPassword, updatedAt: new Date().toISOString() },
    filter: { where: { email: { $eq: email } } }
  });

  return { success: true };
};

// 获取用户订单历史
const getUserOrders = async (userId) => {
  const orders = await models.orders.list({
    filter: { where: { userId: { $eq: userId } } },
    orderBy: [{ field: 'createdAt', direction: 'desc' }]
  });

  return orders.data.records.map(order => ({
    id: order._id,
    type: order.type,
    planId: order.planId,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
    paidAt: order.paidAt
  }));
};

// 主函数
exports.main = async (event, context) => {
  const { action, data, token } = event;
  
  try {
    switch (action) {
      case 'register':
        if (!data.email || !data.password || !data.planId) {
          return fail('缺少必要参数：email, password, planId');
        }
        return success(await register(data.email, data.password, data.planId));
        
      case 'login':
        if (!data.email || !data.password) {
          return fail('缺少必要参数：email, password');
        }
        return success(await login(data.email, data.password));
        
      case 'getUserInfo':
        if (!token) return fail('未提供认证令牌');
        const decoded = await authenticateToken(token);
        return success(await getUserInfo(decoded.userId));
        
      case 'updateUser':
        if (!token || !data.updateData) return fail('缺少必要参数');
        const decodedUpdate = await authenticateToken(token);
        return success(await updateUser(decodedUpdate.userId, data.updateData));
        
      case 'changePassword':
        if (!token || !data.oldPassword || !data.newPassword) {
          return fail('缺少必要参数');
        }
        const decodedChange = await authenticateToken(token);
        return success(await changePassword(decodedChange.userId, data.oldPassword, data.newPassword));
        
      case 'resetPassword':
        if (!data.email || !data.newPassword) {
          return fail('缺少必要参数：email, newPassword');
        }
        return success(await resetPassword(data.email, data.newPassword));
        
      case 'getUserOrders':
        if (!token) return fail('未提供认证令牌');
        const decodedOrders = await authenticateToken(token);
        return success(await getUserOrders(decodedOrders.userId));
        
      default:
        return fail('无效的操作');
    }
  } catch (error) {
    console.error('用户服务错误:', error);
    return fail(error.message || '处理失败', 500);
  }
};
