
interface QueryVideoTaskStatusInput {
  taskId: string;
}

interface PlatformResponse {
  status: string;
  video_url?: string;
  output?: {
    url?: string;
  };
  error?: string;
  [key: string]: any;
}

interface QueryVideoTaskStatusOutput {
  success: boolean;
  data?: {
    status: string;
    outputUrl: string | null;
    platformData?: PlatformResponse;
  };
  error?: string;
  details?: string;
}

interface CloudFunctionEvent {
  taskId: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<QueryVideoTaskStatusOutput>;
