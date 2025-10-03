
    interface CloudFunctionEvent {
      assetId: string;
    }

    interface CloudFunctionResult {
      code: number;
      message: string;
      data: {
        downloadUrl: string;
        expiresIn: number;
      } | null;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  