
    interface QueryStatusInput {
      taskId: string;
    }

    interface QueryStatusOutput {
      status: 'processing' | 'completed' | 'failed';
      videoUrl?: string;
      errorMessage?: string;
      lastQueryTime: string;
    }

    interface CloudFunctionEvent {
      taskId: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<QueryStatusOutput>;
  