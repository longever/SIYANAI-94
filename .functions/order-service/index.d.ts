
interface OrderRequest {
  type: 'package' | 'single';
  planId: string;
  userId: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

interface OrderResponse {
  orderId: string;
  paymentUrl: string;
}

interface OrderQueryResponse {
  order: any;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

interface CancelSubscriptionRequest {
  subscriptionId: string;
  orderId: string;
}

interface CancelSubscriptionResponse {
  success: boolean;
}

interface CloudFunctionEvent {
  path: string;
  httpMethod: string;
  body?: any;
  headers?: Record<string, string>;
}

interface CloudFunctionContext {
  requestId: string;
  memory_limit_in_mb: number;
  time_limit_in_ms: number;
}

export declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}>;
