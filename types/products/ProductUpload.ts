// export interface ProductUpload {
//   ProductUploadId: string;
//   Status?: string;
//   CreateDate: Date;
//   ProductId: string;
//   SequenceNo: number;
//   Url?: string;
//   OriginalFileName?: string;
//   FileName?: string;
//   ProductVariantId?: string;
//   IsPrimary?: string;
// }

import { z } from "zod";

export const ProductUploadSchema = z.object({
  ProductUploadId: z.string().uuid("ProductUploadId ต้องเป็น UUID"),
  Status: z.string().optional(),
  CreateDate: z.date(),
  ProductId: z.string().uuid("ProductId ต้องเป็น UUID"),
  SequenceNo: z.number().min(0, "SequenceNo ต้องมากกว่าหรือเท่ากับ 0"),
  Url: z.string().optional(),
  OriginalFileName: z.string().optional(),
  FileName: z.string().optional(),
  ProductVariantId: z
    .string()
    .uuid("ProductVariantId ต้องเป็น UUID")
    .optional(),
  IsPrimary: z.string().optional(),
});
