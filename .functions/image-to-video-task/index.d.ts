
interface EmotionDetectResult {
  emotion: string;
  confidence: number;
  [key: string]: any;
}

interface CloudFunctionEvent {
  taskId: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  duration?: number;
}

interface CloudFunctionResult {
  success: boolean;
  requestId?: string;
  detectResult?: EmotionDetectResult;
  errorMessage?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  