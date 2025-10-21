
interface Settings {
  ratio: string;
  style: number;
}

interface CloudFunctionEvent {
  imageUrl: string;
  audioUrl: string;
  prompt?: string;
  settings: Settings;
  userId: string;
}

interface CloudFunctionResult {
  success: boolean;
  requestId?: string;
  detectResult?: any;
  errorMessage?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  