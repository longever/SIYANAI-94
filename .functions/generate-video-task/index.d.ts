
    interface InputParams {
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      userId: string;
      modelType: string;
      inputParams: InputParams;
    }

    interface CloudFunctionResult {
      success: boolean;
      taskId?: string;
      error?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  