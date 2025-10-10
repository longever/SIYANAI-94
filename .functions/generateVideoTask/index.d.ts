
interface InputParams {
  imageUrl?: string;
  prompt?: string;
  [key: string]: any;
}

interface CloudFunctionEvent {
  userId: string;
  modelType: string;
  inputParams: InputParams;
}

interface CloudFunctionResult {
  success: boolean;
  taskId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
