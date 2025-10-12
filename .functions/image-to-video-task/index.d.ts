
    interface DetectResult {
      code: number;
      message: string;
      data?: {
        [key: string]: any;
      };
    }

    interface VideoTaskResult {
      taskId: string;
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      imageUrl?: string;
      imageFileId?: string;
      callbackUrl?: string;
      userContext?: any;
    }

    interface CloudFunctionResponse {
      taskId?: string;
      status: 'DETECTING' | 'DETECT_FAIL' | 'GENERATING' | 'SUCCESS' | 'FAIL';
      detectResult?: any;
      error?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
  