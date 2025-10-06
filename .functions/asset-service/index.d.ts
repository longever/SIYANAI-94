
    interface Asset {
      _id?: string;
      name: string;
      type: string;
      value: number;
      description?: string;
      status?: 'active' | 'inactive' | 'maintenance';
      location?: string;
      owner?: string;
      createdAt?: string;
      updatedAt?: string;
      isDeleted?: boolean;
      deletedAt?: string;
      [key: string]: any;
    }

    interface PaginationParams {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      keyword?: string;
    }

    interface AssetListResponse {
      list: Asset[];
      total: number;
      page: number;
      limit: number;
    }

    type AssetAction = 
      | 'createAsset'
      | 'listAssets'
      | 'getAsset'
      | 'updateAsset'
      | 'deleteAsset';

    interface CreateAssetData {
      name: string;
      type: string;
      value: number;
      description?: string;
      status?: string;
      location?: string;
      owner?: string;
    }

    interface UpdateAssetData {
      name?: string;
      type?: string;
      value?: number;
      description?: string;
      status?: string;
      location?: string;
      owner?: string;
    }

    interface CloudFunctionEvent {
      action: AssetAction;
      data: 
        | CreateAssetData
        | PaginationParams
        | { assetId: string }
        | { assetId: string; updateData: UpdateAssetData };
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<{
      code: number;
      data?: any;
      message?: string;
      error?: string;
    }>;
  