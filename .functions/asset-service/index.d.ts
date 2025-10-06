
    interface Asset {
      _id?: string;
      name: string;
      type: 'image' | 'video' | 'audio' | 'document';
      tags: string[];
      url: string;
      size: number;
      owner: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface UploadResponse {
      id: string;
      name: string;
      type: string;
      tags: string[];
      url: string;
      size: number;
      owner: string;
      createdAt: Date;
    }

    interface ListResponse {
      list: Asset[];
      total: number;
    }

    interface DownloadResponse {
      url: string;
      expiresIn: number;
    }

    interface DeleteResponse {
      id: string;
    }

    interface UpdateResponse {
      id: string;
      name?: string;
      tags?: string[];
      updatedAt: Date;
    }

    interface ApiResponse<T = any> {
      code: number;
      data: T;
      message?: string;
    }

    interface CloudFunctionEvent {
      httpMethod: string;
      path: string;
      headers: Record<string, string>;
      body: string;
      isBase64Encoded: boolean;
      queryString?: Record<string, string>;
      userInfo?: {
        openId: string;
      };
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<ApiResponse>;
  