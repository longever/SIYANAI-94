
    interface FileUpload {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }

    interface TaskFiles {
      image?: string;
      audio?: string;
      video?: string;
    }

    interface GenerationTask {
      taskId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      prompt: string;
      duration: number;
      resolution: string;
      style?: string;
      fps: number;
      files: TaskFiles;
      createdAt: Date;
      updatedAt: Date;
      apiResponse?: any;
    }

    interface CloudFunctionEvent {
      body?: any;
      files?: {
        image?: FileUpload;
        audio?: FileUpload;
        video?: FileUpload;
      };
      headers?: {
        [key: string]: string;
      };
    }

    interface CloudFunctionResponse {
      taskId?: string;
      status?: string;
      message?: string;
      error?: string;
      details?: any;
      statusCode?: number;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
  