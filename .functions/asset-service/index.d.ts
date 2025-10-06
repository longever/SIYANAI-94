
    interface AssetRecord {
      _id?: string;
      fileID: string;
      originalName: string;
      size: number;
      mimetype: string;
      tags: string[];
      description: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface UploadResponse {
      code: number;
      data: {
        id: string;
        fileId: string;
        url: string;
        tags: string[];
        description: string;
        createdAt: Date;
      };
    }

    interface ListResponse {
      code: number;
      data: {
        list: AssetRecord[];
        total: number;
        page: number;
        pageSize: number;
      };
    }

    interface DeleteResponse {
      code: number;
      message: string;
    }

    interface UpdateResponse {
      code: number;
      data: {
        id: string;
        tags: string[];
        description: string;
        updatedAt: Date;
      };
    }

    interface DownloadResponse {
      code: number;
      data: {
        url: string;
        expires: Date;
      };
    }

    interface ErrorResponse {
      code: number;
      message: string;
    }

    interface CloudFunctionEvent {
      action?: 'upload' | 'list' | 'delete' | 'update' | 'download';
      id?: string;
      data?: any;
      path?: string;
      httpMethod?: string;
      queryStringParameters?: any;
      body?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<UploadResponse | ListResponse | DeleteResponse | UpdateResponse | DownloadResponse | ErrorResponse>;
  