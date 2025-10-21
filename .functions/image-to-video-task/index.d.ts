
interface CloudFunctionEvent {
  [key: string]: any;
}

interface CloudFunctionContext {
  [key: string]: any;
}

interface CloudFunctionResult {
  success: boolean;
  taskId: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export declare function main(event: CloudFunctionEvent, context: CloudFunctionContext): Promise<CloudFunctionResult>;
