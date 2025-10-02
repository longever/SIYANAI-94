
    interface UploadParams {
      file: Buffer | string;
      fileName: string;
      contentType?: string;
      folder?: string;
    }

    interface UploadResult {
      success: boolean;
      fileId: string;
      url: string;
      fileName: string;
      cloudPath: string;
      error?: string;
    }

    interface DownloadParams {
      fileKey: string;
      returnBuffer?: boolean;
    }

    interface DownloadResult {
      success: boolean;
      buffer?: Buffer;
      contentType?: string;
      url?: string;
      redirect?: boolean;
      error?: string;
    }

    interface DeleteParams {
      fileKey: string | string[];
    }

    interface DeleteResult {
      success: boolean;
      deletedCount: number;
      failedCount: number;
      details: Array<{
        fileID: string;
        code: string;
        message?: string;
      }>;
      error?: string;
    }

    interface GetTempUrlParams {
      fileKey: string | string[];
      expiresIn?: number;
    }

    interface GetTempUrlResult {
      success: boolean;
      urls: Array<{
        fileId: string;
        url: string;
      }>;
      error?: string;
    }

    type MediaAction = 'upload' | 'download' | 'delete' | 'getTempUrl';

    interface CloudFunctionEvent {
      action: MediaAction;
      [key: string]: any;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<
      UploadResult | DownloadResult | DeleteResult | GetTempUrlResult
    >;
  