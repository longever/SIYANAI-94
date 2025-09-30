
interface VideoTask {
  id: string;
  prompt: string;
  materialId: string;
  avatarId: string;
  duration: number;
  resolution: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaskRequest {
  prompt: string;
  materialId: string;
  avatarId: string;
  duration: number;
  resolution: string;
}

interface CreateTaskResponse {
  taskId: string;
}

interface GetTaskResponse {
  id: string;
  status: string;
  resultUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GenerateVideoRequest {
  taskId: string;
}

interface GenerateVideoResponse {
  success: boolean;
  message?: string;
}

interface WebhookRequest {
  taskId: string;
  status: string;
  resultUrl?: string;
}

interface WebhookResponse {
  success: boolean;
}

interface CloudFunctionEvent {
  httpMethod: string;
  path: string;
  pathParameters?: {
    id?: string;
  };
  body?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}>;
