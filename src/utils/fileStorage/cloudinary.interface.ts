export interface IResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface ICloudinaryResponse extends IResponse {
  imageURL?: string;
}

export interface ICloudinary {
  uploadImage: (imageToUpload: string) => Promise<ICloudinaryResponse>;
}
