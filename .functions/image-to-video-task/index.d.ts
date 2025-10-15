
interface ImageToVideoInput {
  taskId: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  duration?: number;
}

interface CloudFunctionResponse {
  success: boolean;
  requestId?: string;
  detectResult?: any;
  errorMessage?: string;
}

interface CloudFunctionEvent extends ImageToVideoInput {}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
  