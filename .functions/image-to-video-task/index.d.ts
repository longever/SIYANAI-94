
    interface ImageToVideoInput {
      imageUrl: string;
      model: string;
      prompt?: string;
      userId: string;
      callbackUrl?: string;
    }

    interface ImageToVideoOutput {
      taskId: string;
      status: 'created' | 'running' | 'success' | 'failed';
      message?: string;
      result?: any;
    }

    interface CloudFunctionEvent extends ImageToVideoInput {}

    export declare function main(event: CloudFunctionEvent, context: any): Promise<ImageToVideoOutput>;
  