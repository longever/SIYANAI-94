
    interface CreateTaskParams {
      imageUrl: string;
      modelType: string;
      prompt: string;
      duration?: number;
      resolution?: string;
      fps?: number;
      userId: string;
      projectId: string;
    }

    interface TaskResult {
      success: boolean;
      taskId: string;
      message: string;
    }

    interface CloudFunctionEvent extends CreateTaskParams {}

    export declare function main(event: CloudFunctionEvent, context: any): Promise<TaskResult>;
  