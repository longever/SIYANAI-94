
    interface UploadAssetResult {
      code: number;
      message: string;
      data?: {
        _id: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        uploadTime: string;
        description?: string;
        originalName?: string;
        [key: string]: any;
      };
      error?: string;
    }

    interface CloudFunctionEvent {
      headers?: {
        [key: string]: string;
      };
      body?: string;
      isBase64Encoded?: boolean;
      [key: string]: any;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<UploadAssetResult>;
  