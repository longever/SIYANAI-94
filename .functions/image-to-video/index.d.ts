
    interface GenerationTaskInput {
      imageUrl: string;
      prompt: string;
      model: string;
      duration: number;
      resolution: string;
      userId: string;
    }

    interface GenerationTaskOutput {
      success: boolean;
      taskId: string | null;
      message: string;
    }

    interface CloudFunctionEvent extends GenerationTaskInput {}

    export declare function main(event: CloudFunctionEvent, context: any): Promise<GenerationTaskOutput>;
  