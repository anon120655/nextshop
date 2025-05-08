// export interface Category {
//  Status?: string;
//  CategoryId: string;
//  CreateDate: Date;
//  Name?: string;
//  Description?: string;
// }

// types/categorys/category.ts
import { z } from "zod";

export const CategorySchema = z.object({
  Status: z
    .string({
      required_error: "กรุณาระบุสถานะ",
    })
    .nonempty("กรุณาระบุสถานะ"), // ต้องไม่เป็นค่าว่าง
  CategoryId: z.string().uuid("CategoryId ต้องเป็น UUID"),
  CreateDate: z.date(),
  Name: z.string().nonempty("กรุณาระบุชื่อหมวดหมู่"),
  Description: z.string().nonempty("กรุณาระบุรายละเอียด").optional(),
});

export type Category = z.infer<typeof CategorySchema>;
