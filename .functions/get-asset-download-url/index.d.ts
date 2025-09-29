
    interface CloudFunctionEvent {
      assetId: string;
    }

    interface SuccessResponse {
      downloadUrl: string;
      expiresIn: number;
    }

    interface ErrorResponse {
      error: string;
    }

    type CloudFunctionResult = SuccessResponse | ErrorResponse;

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  