
interface ImageCheckResult {
  success: boolean;
  message?: string;
  data?: {
    safe?: boolean;
    confidence?: number;
    [key: string]: any;
  };
}

interface InitProcessData {
  modelType?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageCheckResult?: ImageCheckResult;
  [key: string]: any;
}

interface CloudFunctionResult {
  success: boolean;
  message: string;
  data?: InitProcessData | any;
}

interface CloudFunctionEvent {
  action: string;
  modelType?: string;
  imageUrl?: string;
  imageBase64?: string;
  [key: string]: any;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
