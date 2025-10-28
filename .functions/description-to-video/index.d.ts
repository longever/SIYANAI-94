
    interface VideoTaskInput {
      prompt: string;
      model?: 'wan2.5-t2v-preview' | 'wan2.2-t2v-plus';
      callbackUrl?: string;
    }

    interface VideoTaskSuccessResult {
      taskId: string;
      status: 'submitted';
      model: string;
      prompt: string;
      localTaskId: string;
    }

    interface VideoTaskErrorResult {
      error: string;
      details: {
        message?: string;
        errors?: string[];
        localTaskId?: string;
      };
    }

    type VideoTaskResult = VideoTaskSuccessResult | VideoTaskErrorResult;

    interface CloudFunctionEvent extends VideoTaskInput {
      action?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<VideoTaskResult>;
  