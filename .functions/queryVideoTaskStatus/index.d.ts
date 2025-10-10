
    interface CloudFunctionEvent {
      task_id: string;
    }

    interface CloudFunctionResult {
      task_id: string;
      status: string;
      progress: number;
      video_url?: string;
      error?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  