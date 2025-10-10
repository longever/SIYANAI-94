
    interface VideoTaskParams {
      prompt?: string;
      image_url?: string;
      resolution?: string;
      duration?: number;
      parameters?: Record<string, any>;
      [key: string]: any;
    }

    interface CloudFunctionEvent extends VideoTaskParams {
      video_model: string;
    }

    interface ApiResponse {
      task_id?: string;
      task_status?: string;
      submit_time?: string;
      output?: {
        task_id: string;
        task_status: string;
        submit_time: string;
      };
      message?: string;
    }

    interface SuccessResponse {
      code: 200;
      data: {
        task_id: string;
        status: string;
        created_at: string;
        local_task_id: string;
      };
    }

    interface ErrorResponse {
      code: 400 | 500;
      message: string;
    }

    type CloudFunctionResult = SuccessResponse | ErrorResponse;

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  