
    interface ModelParams {
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      userId: string;
      inputType: 'text' | 'audio' | 'video';
      imageUrl: string;
      text?: string;
      audioUrl?: string;
      videoUrl?: string;
      modelParams: ModelParams;
    }

    interface CloudFunctionResult {
      taskId?: string;
      error?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  