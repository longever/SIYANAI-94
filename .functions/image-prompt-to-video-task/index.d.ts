
    interface VideoTaskRequest {
      imageUrl: string;
      prompt: string;
      duration?: number;
      resolution?: string;
    }

    interface VideoTaskResponse {
      taskId: string;
      status: 'submitted';
      imageUrl: string;
      prompt: string;
    }

    interface ErrorResponse {
      error: string;
      details?: string;
    }

    interface CloudFunctionEvent extends VideoTaskRequest {
      action?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<VideoTaskResponse | ErrorResponse>;
  