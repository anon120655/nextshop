// export interface Product {
//   Status?: number | undefined;
//   ProductId: string;
//   CreateDate: Date;
//   Name?: string;
//   Description?: string;
//   ImageCoverUrl?: string;
//   ImageCoverThumbnailUrl?: string;
//   VisibilityLevel?: number | undefined;
//   UrlSlug?: string;
// }

import { z } from "zod";
import { ProductUploadSchema } from "./ProductUpload";

export const CategorySchema = z.object({
  CategoryId: z.string().uuid("CategoryId ต้องเป็น UUID"),
  CreateDate: z.date(),
  Name: z.string().nonempty("กรุณาระบุชื่อหมวดหมู่"),
  Description: z.string().nonempty("กรุณาระบุรายละเอียด").optional(),
});

export const ProductSchema = z.object({
  Status: z
    .string({
      required_error: "กรุณาระบุสถานะ",
    })
    .nonempty("กรุณาระบุสถานะ"), // ต้องไม่เป็นค่าว่าง
  ProductId: z.string().uuid("CategoryId ต้องเป็น UUID"),
  CreateDate: z.date(),
  Name: z.string().nonempty("กรุณาระบุชื่อสินค้า"),
  CategoryId: z.string().nonempty("กรุณาระบุชื่อหมวดหมู่"),
  Description: z.string().nonempty("กรุณาระบุรายละเอียด").optional(),
  ImageCoverUrl: z.string().optional(),
  ImageCoverThumbnailUrl: z.string().optional(),
  VisibilityLevel: z.string().nonempty("กรุณาระบุระดับการมองเห็น").optional(),
  UrlSlug: z.string().optional(),
  SellProductUploads: z.array(ProductUploadSchema).optional(),
  SellProductCategories: z.array(CategorySchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
