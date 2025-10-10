
    interface VideoTaskStatus {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      videoUrl?: string;
      error?: string;
    }

    interface GenerationTask {
      _id: string;
      externalTaskId: string;
      status: string;
      progress: number;
      resultUrl?: string;
      videoUrl?: string;
      errorMessage?: string;
      createdAt: string;
      updatedAt: string;
    }

    interface ProcessResult {
      success: boolean;
      data?: GenerationTask;
      error?: {
        code: string;
        message: string;
      };
    }

    interface BatchProcessResult {
      success: boolean;
      processedCount: number;
      results: Array<{
        taskId: string;
        success: boolean;
        data?: GenerationTask;
        error?: {
          code: string;
          message: string;
        };
      }>;
    }

    interface CloudFunctionEvent {
      taskId?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<ProcessResult | BatchProcessResult>;
  