
    interface CloudFunctionEvent {
      taskId: string;
    }

    interface TaskResult {
      taskId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      outputUrl?: string;
      createdAt?: string;
      updatedAt?: string;
      [key: string]: any;
    }

    interface CloudFunctionResponse {
      code: number;
      message: string;
      data: TaskResult | null;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
  