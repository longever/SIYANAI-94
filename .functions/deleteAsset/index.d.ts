
interface DeleteAssetInput {
  assetId: string;
}

interface DeleteAssetSuccessOutput {
  success: true;
  message: string;
  deletedFile: string;
  deletedRecord: {
    _id: string;
    [key: string]: any;
  };
}

interface DeleteAssetErrorOutput {
  success: false;
  error: string;
}

type DeleteAssetOutput = DeleteAssetSuccessOutput | DeleteAssetErrorOutput;

interface CloudFunctionEvent {
  assetId: string;
}

export declare function main(
  event: CloudFunctionEvent,
  context: any
): Promise<DeleteAssetOutput>;
