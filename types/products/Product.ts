export interface Product {
  Status?: number | undefined;
  ProductId: string;
  CreateDate: Date;
  Name?: string;
  Description?: string;
  ImageCoverUrl?: string;
  ImageCoverThumbnailUrl?: string;
  VisibilityLevel?: number | undefined;
  UrlSlug?: string;
}
