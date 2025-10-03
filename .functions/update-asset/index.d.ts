
    interface AssetData {
      fileName: string;
      fileSize: number;
      mimeType: string;
      uploader: string;
      cloudPath: string;
      uploadTime: Date;
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      fileName: string;
      fileSize: number;
      mimeType: string;
      uploader: string;
      cloudPath: string;
      extra?: Record<string, any>;
    }

    interface CloudFunctionResult {
      code: number;
      message: string;
      data?: {
        _id: string;
        [key: string]: any;
      };
      error?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  