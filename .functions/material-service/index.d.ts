
interface Material {
  id: string;
  url: string;
  type: string;
  tags: string[];
  userId: string;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sourceUrl?: string;
}

interface UploadResponse {
  id: string;
  url: string;
}

interface ListResponse {
  list: Array<{
    id: string;
    url: string;
    type: string;
    tags: string[];
    createdAt: string;
  }>;
  total: number;
}

interface DownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

interface DeleteResponse {
  success: boolean;
}

interface ErrorResponse {
  error: string;
  statusCode?: number;
}

interface CloudFunctionEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string;
  queryStringParameters: Record<string, string>;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<UploadResponse | ListResponse | DownloadResponse | DeleteResponse | ErrorResponse>;
  