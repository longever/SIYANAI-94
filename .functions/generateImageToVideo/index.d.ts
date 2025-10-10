
    interface ImageToVideoParams {
      images: string[];
      fps?: number;
      width?: number;
      height?: number;
      durationPerFrame?: number;
    }

    interface SuccessResult {
      success: true;
      fileID: string;
      downloadUrl: string;
    }

    interface ErrorResult {
      success: false;
      error: string;
    }

    type CloudFunctionResult = SuccessResult | ErrorResult;

    interface CloudFunctionEvent extends ImageToVideoParams {}

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  