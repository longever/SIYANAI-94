
    interface UploadAssetInput {
      fileBase64?: string;
      fileBuffer?: Buffer | ArrayBuffer | Uint8Array;
      fileName?: string;
      contentType?: string;
      cloudPathPrefix?: string;
    }

    interface UploadAssetSuccess {
      fileID: string;
      fileURL: string;
      size: number;
      contentType: string;
    }

    interface UploadAssetError {
      error: string;
    }

    type UploadAssetResult = UploadAssetSuccess | UploadAssetError;

    interface CloudFunctionEvent {
      fileBase64?: string;
      fileBuffer?: Buffer | ArrayBuffer | Uint8Array;
      fileName?: string;
      contentType?: string;
      cloudPathPrefix?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<UploadAssetResult>;
  