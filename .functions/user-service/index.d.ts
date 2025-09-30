
    interface User {
      _id: string;
      email: string;
      password?: string;
      name?: string;
      phone?: string;
      customerId?: string;
      status: 'active' | 'inactive' | 'failed';
      createdAt: string;
      updatedAt?: string;
    }

    interface Plan {
      _id: string;
      name: string;
      code: string;
      price: number;
      features: string[];
      status: 'active' | 'inactive';
    }

    interface Order {
      _id: string;
      userId: string;
      planId: string;
      subscriptionId?: string;
      quantity: number;
      status: 'pending' | 'active' | 'failed' | 'cancelled';
      createdAt: string;
      updatedAt?: string;
    }

    interface RegisterRequest {
      email: string;
      password: string;
      planId: string;
    }

    interface LoginRequest {
      email: string;
      password: string;
    }

    interface SubscribeRequest {
      planId: string;
      quantity?: number;
    }

    interface UpdateUserRequest {
      name?: string;
      phone?: string;
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      action: 'register' | 'login' | 'getMe' | 'updateMe' | 'subscribe' | 'getSubscriptions';
      data: RegisterRequest | LoginRequest | SubscribeRequest | UpdateUserRequest;
      headers?: {
        Authorization?: string;
        authorization?: string;
      };
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<{
      success: boolean;
      data?: any;
      error?: string;
      code?: number;
    }>;
  