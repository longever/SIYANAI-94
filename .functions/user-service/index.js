
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

    // JWT中间件
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
        const order = await models.orders.create({
          data: {
            userId: user.data._id,
            planId: planId,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        });

        // 创建Lago订阅
        const subscriptionResponse = await lagoClient.post('/subscriptions', {
          subscription: {
            external_customer_id: user.data._id,
            plan_code: plan.data.records[0].code
          }
        });

        const subscriptionId = subscriptionResponse.data.subscription.lago_id;

        // 更新订单状态
        await models.orders.update({
          data: { 
            status: 'active',
            subscriptionId: subscriptionId
          },
          filter: { where: { _id: { $eq: order.data._id } } }
        });

        return {
          userId: user.data._id,
          subscriptionId: subscriptionId
        };
      } catch (lagoError) {
        // 如果Lago同步失败，标记用户状态为失败
        await models.users.update({
          data: { status: 'failed' },
          filter: { where: { _id: { $eq: user.data._id } } }
        });
        throw new Error('外部计费系统同步失败，请稍后重试');
      }
    };

    // 用户登录
    const login = async (email, password) => {
      const user = await models.users.list({
        filter: { where: { email: { $eq: email }, status: { $eq: 'active' } } }
      });

      if (user.data.total === 0) {
        throw new Error('用户不存在或已被禁用');
      }

      const userData = user.data.records[0];
      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        throw new Error('密码错误');
      }

      const token = jwt.sign(
        { userId: userData._id, email: userData.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = userData;
      
      return {
        token,
        user: userInfo
      };
    };

    // 获取用户信息
    const getMe = async (userId) => {
      const user = await models.users.get({
        filter: { where: { _id: { $eq: userId } } }
      });

      if (!user.data.records || user.data.records.length === 0) {
        throw new Error('用户不存在');
      }

      const userData = user.data.records[0];
      const { password: _, ...userInfo } = userData;

      // 获取当前订阅
      const subscription = await models.orders.list({
        filter: { 
          where: { 
            userId: { $eq: userId },
            status: { $eq: 'active' }
          } 
        },
        sort: { createdAt: -1 },
        limit: 1
      });

      let subscriptionInfo = null;
      if (subscription.data.total > 0) {
        const order = subscription.data.records[0];
        const plan = await models.plans.get({
          filter: { where: { _id: { $eq: order.planId } } }
        });
        
        if (plan.data.records && plan.data.records.length > 0) {
          subscriptionInfo = {
            ...order,
            plan: plan.data.records[0]
          };
        }
      }

      return {
        user: userInfo,
        subscription: subscriptionInfo
      };
    };

    // 更新用户信息
    const updateMe = async (userId, updateData) => {
      // 移除不允许更新的字段
      const { email, password, ...safeUpdate } = updateData;

      const user = await models.users.get({
        filter: { where: { _id: { $eq: userId } } }
      });

      if (!user.data.records || user.data.records.length === 0) {
        throw new Error('用户不存在');
      }

      const userData = user.data.records[0];

      // 更新用户信息
      await models.users.update({
        data: { ...safeUpdate, updatedAt: new Date().toISOString() },
        filter: { where: { _id: { $eq: userId } } }
      });

      // 如果更新了email或name，同步到Lago
      if (updateData.email || updateData.name) {
        try {
          await lagoClient.put(`/customers/${userData.customerId}`, {
            customer: {
              email: updateData.email || userData.email,
              name: updateData.name || userData.name || userData.email.split('@')[0]
            }
          });
        } catch (error) {
          console.error('同步到Lago失败:', error);
        }
      }

      // 返回更新后的用户信息
      const updatedUser = await models.users.get({
        filter: { where: { _id: { $eq: userId } } }
      });

      const { password: _, ...userInfo } = updatedUser.data.records[0];
      return userInfo;
    };

    // 创建或更新订阅
    const subscribe = async (userId, planId, quantity = 1) => {
      // 检查套餐是否存在
      const plan = await models.plans.get({
        filter: { where: { _id: { $eq: planId } } }
      });

      if (!plan.data.records || plan.data.records.length === 0) {
        throw new Error('无效的套餐ID');
      }

      const user = await models.users.get({
        filter: { where: { _id: { $eq: userId } } }
      });

      if (!user.data.records || user.data.records.length === 0) {
        throw new Error('用户不存在');
      }

      const userData = user.data.records[0];

      // 创建订单
      const order = await models.orders.create({
        data: {
          userId,
          planId,
          quantity,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      });

      try {
        // 检查是否已有订阅
        const existingSubscriptions = await models.orders.list({
          filter: { 
            where: { 
              userId: { $eq: userId },
              status: { $eq: 'active' }
            } 
          }
        });

        let subscriptionId;
        
        if (existingSubscriptions.data.total > 0) {
          // 更新现有订阅
          const existingSubscription = existingSubscriptions.data.records[0];
          const response = await lagoClient.put(`/subscriptions/${existingSubscription.subscriptionId}`, {
            subscription: {
              plan_code: plan.data.records[0].code
            }
          });
          subscriptionId = response.data.subscription.lago_id;
        } else {
          // 创建新订阅
          const response = await lagoClient.post('/subscriptions', {
            subscription: {
              external_customer_id: userId,
              plan_code: plan.data.records[0].code
            }
          });
          subscriptionId = response.data.subscription.lago_id;
        }

        // 更新订单状态
        await models.orders.update({
          data: { 
            status: 'active',
            subscriptionId 
          },
          filter: { where: { _id: { $eq: order.data._id } } }
        });

        return {
          orderId: order.data._id,
          subscriptionId
        };
      } catch (error) {
        // 如果失败，标记订单状态为失败
        await models.orders.update({
          data: { status: 'failed' },
          filter: { where: { _id: { $eq: order.data._id } } }
        });
        throw new Error('订阅创建失败，请稍后重试');
      }
    };

    // 获取用户订阅列表
    const getSubscriptions = async (userId) => {
      const orders = await models.orders.list({
        filter: { where: { userId: { $eq: userId } } },
        sort: { createdAt: -1 }
      });

      const subscriptions = [];
      
      for (const order of orders.data.records) {
        const plan = await models.plans.get({
          filter: { where: { _id: { $eq: order.planId } } }
        });
        
        subscriptions.push({
          ...order,
          plan: plan.data.records[0] || null
        });
      }

      return subscriptions;
    };

    // 主函数
    exports.main = async (event, context) => {
      const { action, data, headers } = event;
      
      try {
        let userId = null;
        
        // 需要认证的接口
        const authRequired = ['getMe', 'updateMe', 'subscribe', 'getSubscriptions'];
        if (authRequired.includes(action)) {
          const token = headers?.Authorization || headers?.authorization;
          const decoded = await authenticateToken(token);
          userId = decoded.userId;
        }

        switch (action) {
          case 'register':
            const { email, password, planId } = data;
            const registerResult = await register(email, password, planId);
            return success(registerResult);

          case 'login':
            const { email: loginEmail, password: loginPassword } = data;
            const loginResult = await login(loginEmail, loginPassword);
            return success(loginResult);

          case 'getMe':
            const meResult = await getMe(userId);
            return success(meResult);

          case 'updateMe':
            const updateResult = await updateMe(userId, data);
            return success(updateResult);

          case 'subscribe':
            const { planId: subPlanId, quantity = 1 } = data;
            const subscribeResult = await subscribe(userId, subPlanId, quantity);
            return success(subscribeResult);

          case 'getSubscriptions':
            const subscriptions = await getSubscriptions(userId);
            return success({ subscriptions });

          default:
            return fail('无效的接口');
        }
      } catch (error) {
        console.error('Error:', error);
        return fail(error.message || '服务器内部错误');
      }
    };
  