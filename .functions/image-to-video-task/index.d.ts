
interface ImageToVideoOptions {
  duration?: number;
  fps?: number;
  resolution?: [number, number];
}

interface ImageToVideoInput {
  images: string[];
  options?: ImageToVideoOptions;
  callback?: string;
}

interface ImageToVideoOutput {
  taskId: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  videoFileId?: string;
  error?: string;
}

interface CloudFunctionEvent {
  images: string[];
  options?: ImageToVideoOptions;
  callback?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<ImageToVideoOutput>;
