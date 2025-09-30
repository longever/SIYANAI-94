
interface TranscodeRequest {
  videoUrl: string;
  targetFormat: string;
}

interface MergeRequest {
  videoUrl: string;
  audioUrl: string;
}

interface ConcatRequest {
  videoUrls: string[];
}

interface MediaIdRequest {
  id: string;
}

type EventAction = 
  | 'transcode'
  | 'merge-audio-video'
  | 'concat-videos'
  | 'get-media'
  | 'delete-media';

interface CloudFunctionEvent {
  action: EventAction;
  data: 
    | TranscodeRequest
    | MergeRequest
    | ConcatRequest
    | MediaIdRequest;
}

interface SuccessResponse<T = any> {
  code: 0;
  data: T;
}

interface ErrorResponse {
  code: 1;
  message: string;
}

type CloudFunctionResponse = SuccessResponse | ErrorResponse;

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;
