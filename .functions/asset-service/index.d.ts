
    interface Asset {
      _id: string;
      fileName: string;
      fileID: string;
      fileUrl: string;
      tags: string[];
      createdAt: string;
    }

    interface UploadResponse {
      id: string;
      fileName: string;
      fileUrl: string;
      tags: string[];
      createdAt: string;
    }

    interface ListResponse {
      list: Asset[];
      total: number;
    }

    interface DeleteResponse {
      success: boolean;
    }

    interface UpdateTagsResponse {
      id: string;
      tags: string[];
    }

    interface DownloadResponse {
      downloadUrl: string;
      expires: number;
    }

    interface CloudFunctionEvent {
      path: string;
      httpMethod: string;
      headers: Record<string, string>;
      body: string;
      isBase64Encoded: boolean;
      queryString?: Record<string, string>;
      pathParameters?: Record<string, string>;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<{
      statusCode: number;
      headers: Record<string, string>;
      body: string;
    }>;
  