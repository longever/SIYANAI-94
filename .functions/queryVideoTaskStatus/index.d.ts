
interface GenerationTask {
  _id: string;
  externalTaskId: string;
  modelType: string;
  status: string;
  outputUrl?: string;
  errorMsg?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CloudFunctionEvent {
  taskId: string;
}

interface CloudFunctionResponse {
  code: number;
  message?: string;
  data?: {
    taskId: string;
    externalTaskId: string;
    modelType: string;
    status: string;
    outputUrl?: string;
    errorMsg?: string;
    updatedAt: string;
  };
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
