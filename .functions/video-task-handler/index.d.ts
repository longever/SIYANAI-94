
    interface CloudFunctionEvent {
      taskId: string;
    }

    interface CloudFunctionResult {
      success: boolean;
      message: string;
      taskStatus?: string;
      fileId?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  