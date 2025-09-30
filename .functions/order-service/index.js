
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const models = app.models;

// 创建 axios 实例
const lagoApi = axios.create({
  baseURL: process.env.LAGO_API_BASE_URL || 'https://api.getlago.com/api/v1',
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${process.env.LAGO_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// 错误处理函数
const handleError = (error, res) => {
  console.error('Error:', error);
  
  if (error.response) {
    res.status(error.response.status).json({ error: error.response.data?.message || error.message });
  } else if (error.request) {
    res.status(500).json({ error: '网络错误，请稍后重试' });
  } else {
    res.status(500).json({ error: error.message || '服务器内部错误' });
  }
};

// 验证支付回调签名
const verifyWebhookSignature = (body, signature, secret) => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  return signature === `sha256=${expectedSignature}`;
};

// 创建订单
const createOrder = async (req, res) => {
  try {
    const { type, planId, userId, quantity = 1, metadata = {} } = req.body;
    
    // 参数验证
    if (!type || !['package', 'single'].includes(type)) {
      return res.status(400).json({ error: 'type 必须是 package 或 single' });
    }
    if (!planId) {
      return res.status(400).json({ error: 'planId 不能为空' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId 不能为空' });
    }

    // 查询套餐/方案
    const plan = await models.plans.get({
      filter: {
        where: {
          _id: { $eq: planId }
        }
      }
    });

    if (!plan.data.records || plan.data.records.length === 0) {
      return res.status(404).json({ error: '套餐/方案不存在' });
    }

    const planData = plan.data.records[0];
    
    // 创建订单
    const orderId = uuidv4();
    const amount = planData.price * quantity;
    
    const order = await models.orders.create({
      data: {
        _id: orderId,
        type,
        planId,
        userId,
        quantity,
        amount,
        status: 'pending',
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 调用 Lago 创建发票
    const invoiceResponse = await lagoApi.post('/invoices', {
      invoice: {
        external_customer_id: userId,
        currency: 'CNY',
        fees: [{
          item: {
            type: 'subscription',
            code: planData.code || planId,
            name: planData.name || '订单费用'
          },
          units: quantity,
          unit_amount_cents: Math.round(planData.price * 100),
          amount_cents: Math.round(amount * 100)
        }],
        payment_url: process.env.PAYMENT_RETURN_URL || 'https://your-domain.com/payment/success',
        metadata: {
          orderId,
          type
        }
      }
    });

    const { lago_id: invoiceId, payment_url: paymentUrl } = invoiceResponse.data.invoice;

    // 更新订单的 invoiceId 和 paymentUrl
    await models.orders.update({
      data: {
        invoiceId,
        paymentUrl,
        updatedAt: new Date()
      },
      filter: {
        where: {
          _id: { $eq: orderId }
        }
      }
    });

    res.json({
      orderId,
      paymentUrl
    });
  } catch (error) {
    handleError(error, res);
  }
};

// 查询订单
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: '订单ID不能为空' });
    }

    const order = await models.orders.get({
      filter: {
        where: {
          _id: { $eq: id }
        }
      }
    });

    if (!order.data.records || order.data.records.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }

    const orderData = order.data.records[0];
    
    // 敏感字段脱敏
    const sanitizedOrder = {
      ...orderData,
      userId: orderData.userId ? orderData.userId.substring(0, 8) + '***' : null
    };

    res.json({
      order: sanitizedOrder,
      paymentStatus: orderData.status
    });
  } catch (error) {
    handleError(error, res);
  }
};

// 支付回调处理
const handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('未配置支付回调密钥');
      return res.status(500).send('服务器配置错误');
    }

    // 验证签名
    const body = JSON.stringify(req.body);
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return res.status(400).send('签名验证失败');
    }

    const { orderId, status, transactionId } = req.body;
    
    if (!orderId) {
      return res.status(400).send('缺少订单ID');
    }

    // 更新订单状态
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'paid' && transactionId) {
      updateData.transactionId = transactionId;
      updateData.paidAt = new Date();
    }

    await models.orders.update({
      data: updateData,
      filter: {
        where: {
          _id: { $eq: orderId }
        }
      }
    });

    // 同步到 Lago
    const order = await models.orders.get({
      filter: {
        where: {
          _id: { $eq: orderId }
        }
      }
    });

    if (order.data.records && order.data.records[0]?.invoiceId) {
      await lagoApi.patch(`/invoices/${order.data.records[0].invoiceId}`, {
        invoice: {
          status: status === 'paid' ? 'succeeded' : 'failed'
        }
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('支付回调处理错误:', error);
    res.status(500).send('处理失败');
  }
};

// 取消订阅
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId, orderId } = req.body;
    
    if (!subscriptionId || !orderId) {
      return res.status(400).json({ error: 'subscriptionId 和 orderId 不能为空' });
    }

    // 调用 Lago 取消订阅
    await lagoApi.delete(`/subscriptions/${subscriptionId}`);

    // 更新订单状态
    await models.orders.update({
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      filter: {
        where: {
          _id: { $eq: orderId }
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
};

// 路由分发
exports.main = async (event, context) => {
  const { path, httpMethod, body, headers } = event;
  
  // 处理 OPTIONS 预检请求
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature'
      },
      body: ''
    };
  }

  // 解析请求体
  let parsedBody = {};
  if (body) {
    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      console.error('解析请求体失败:', e);
    }
  }

  // 创建模拟的 req/res 对象
  const req = {
    path,
    method: httpMethod,
    body: parsedBody,
    headers,
    params: {}
  };

  // 解析路径参数
  const pathParts = path.split('/');
  if (pathParts.length >= 3 && pathParts[1] === 'orders') {
    req.params.id = pathParts[2];
  }

  // 创建响应对象
  let response = {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'Not Found' })
  };

  try {
    // 路由匹配
    if (path === '/orders' && httpMethod === 'POST') {
      await createOrder(req, {
        json: (data) => {
          response.statusCode = 200;
          response.body = JSON.stringify(data);
        },
        status: (code) => {
          response.statusCode = code;
          return {
            json: (data) => {
              response.body = JSON.stringify(data);
            }
          };
        }
      });
    } else if (path.startsWith('/orders/') && httpMethod === 'GET') {
      await getOrder(req, {
        json: (data) => {
          response.statusCode = 200;
          response.body = JSON.stringify(data);
        },
        status: (code) => {
          response.statusCode = code;
          return {
            json: (data) => {
              response.body = JSON.stringify(data);
            }
          };
        }
      });
    } else if (path === '/webhook/payment' && httpMethod === 'POST') {
      await handlePaymentWebhook(req, {
        status: (code) => {
          response.statusCode = code;
          return {
            send: (data) => {
              response.body = data;
            }
          };
        }
      });
    } else if (path === '/subscriptions/cancel' && httpMethod === 'POST') {
      await cancelSubscription(req, {
        json: (data) => {
          response.statusCode = 200;
          response.body = JSON.stringify(data);
        },
        status: (code) => {
          response.statusCode = code;
          return {
            json: (data) => {
              response.body = JSON.stringify(data);
            }
          };
        }
      });
    }
  } catch (error) {
    console.error('路由处理错误:', error);
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};
