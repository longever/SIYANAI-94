
    interface TaskStatusResponse {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      downloadUrl?: string;
      errorMessage?: string;
    }

    interface CloudFunctionInput {
      taskId: string;
    }

    interface CloudFunctionSuccessResponse {
      code: 0;
      message: string;
      data?: {
        status: string;
        videoUrl?: string;
        finishedAt?: string;
      };
    }

    interface CloudFunctionErrorResponse {
      code: number;
      message: string;
    }

    type CloudFunctionResponse = CloudFunctionSuccessResponse | CloudFunctionErrorResponse;

    export declare function main(event: CloudFunctionInput, context: any): Promise<CloudFunctionResponse>;
  