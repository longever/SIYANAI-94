
    interface EmotionDetectionRequest {
      imageUrl?: string;
      imageBase64?: string;
      [key: string]: any;
    }

    interface EmotionDetectionResponse {
      taskId: string;
      status: 'success' | 'error';
      data?: any;
      message?: string;
      timestamp?: string;
      duration?: number;
    }

    interface CloudFunctionEvent {
      imageUrl?: string;
      imageBase64?: string;
      [key: string]: any;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<{
      statusCode: number;
      headers: { [key: string]: string };
      body: string;
    }>;
  