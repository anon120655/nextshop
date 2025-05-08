"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "../common/ToastNotification";
import { GUID_EMPTY, STRING_EMPTY } from "@/utils/constants";
import { LoaderCircle } from "lucide-react";
import { Product, ProductSchema } from "@/types/products/Product";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";

interface ProductFormProps {
  initialData?: Product | null;
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Product>({
    Status: initialData?.Status?.toString() || STRING_EMPTY,
    ProductId: initialData?.ProductId || GUID_EMPTY,
    CreateDate: initialData?.CreateDate
      ? new Date(initialData.CreateDate)
      : new Date(),
    Name: initialData?.Name || STRING_EMPTY,
    Description: initialData?.Description || STRING_EMPTY,
    VisibilityLevel: initialData?.VisibilityLevel?.toString() || STRING_EMPTY,
    ImageCoverUrl: initialData?.ImageCoverUrl || STRING_EMPTY,
    ImageCoverThumbnailUrl: initialData?.ImageCoverThumbnailUrl || STRING_EMPTY,
    UrlSlug: initialData?.UrlSlug || STRING_EMPTY,
    SellProductUploads: initialData?.SellProductUploads || [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );

  // ตั้งค่า Tiptap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.Description,
    onUpdate: ({ editor }) => {
      // อัปเดต Description ใน formData เมื่อเนื้อหาใน editor เปลี่ยน
      setFormData((prev) => ({
        ...prev,
        Description: editor.getHTML(),
      }));
      validateForm({
        ...formData,
        Description: editor.getHTML(),
      });
    },
  });

  // Sync initialData กับ formData เมื่อ initialData เปลี่ยน
  useEffect(() => {
    if (initialData) {
      setFormData({
        Status: initialData.Status?.toString() || STRING_EMPTY,
        ProductId: initialData.ProductId || GUID_EMPTY,
        CreateDate: initialData.CreateDate
          ? new Date(initialData.CreateDate)
          : new Date(),
        Name: initialData.Name || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
        VisibilityLevel:
          initialData.VisibilityLevel?.toString() || STRING_EMPTY,
        ImageCoverUrl: initialData.ImageCoverUrl || STRING_EMPTY,
        ImageCoverThumbnailUrl:
          initialData.ImageCoverThumbnailUrl || STRING_EMPTY,
        UrlSlug: initialData.UrlSlug || STRING_EMPTY,
        SellProductUploads: initialData.SellProductUploads || [],
      });
      setErrors({});
      // อัปเดตเนื้อหาใน Tiptap Editor
      editor?.commands.setContent(initialData.Description || STRING_EMPTY);
    }
    console.log("formData", formData);
  }, [initialData, editor]);

  // ฟังก์ชันตรวจสอบข้อมูลด้วย Zod
  const validateForm = (data: Product) => {
    const result = ProductSchema.safeParse(data);
    if (!result.success) {
      const errorMap = result.error.issues.reduce((acc, issue) => {
        const field = issue.path[0] as keyof Product;
        acc[field] = issue.message;
        return acc;
      }, {} as Partial<Record<keyof Product, string>>);
      setErrors(errorMap);
    } else {
      setErrors({});
    }
    return result;
  };

  // จัดการการเปลี่ยนแปลงใน input
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
    validateForm(updatedFormData);
  };

  // ฟังก์ชันรีเซ็ตฟอร์ม
  const handleReset = () => {
    if (mode === "edit" && initialData) {
      setFormData({
        Status: initialData.Status?.toString() || STRING_EMPTY,
        ProductId: initialData.ProductId || GUID_EMPTY,
        CreateDate: initialData.CreateDate
          ? new Date(initialData.CreateDate)
          : new Date(),
        Name: initialData.Name || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
        VisibilityLevel:
          initialData.VisibilityLevel?.toString() || STRING_EMPTY,
        ImageCoverUrl: initialData.ImageCoverUrl || STRING_EMPTY,
        ImageCoverThumbnailUrl:
          initialData.ImageCoverThumbnailUrl || STRING_EMPTY,
        UrlSlug: initialData.UrlSlug || STRING_EMPTY,
        SellProductUploads: initialData.SellProductUploads || [],
      });
      editor?.commands.setContent(initialData.Description || STRING_EMPTY);
    } else {
      setFormData({
        Status: STRING_EMPTY,
        ProductId: GUID_EMPTY,
        CreateDate: new Date(),
        Name: STRING_EMPTY,
        Description: STRING_EMPTY,
        VisibilityLevel: STRING_EMPTY,
        ImageCoverUrl: STRING_EMPTY,
        ImageCoverThumbnailUrl: STRING_EMPTY,
        UrlSlug: STRING_EMPTY,
        SellProductUploads: [],
      });
      editor?.commands.setContent(STRING_EMPTY);
    }
    setErrors({});
  };

  // ฟังก์ชันลบรูปภาพตาม ProductUploadId
  const removeImage = (productUploadId: string) => {
    const updatedUploads =
      formData.SellProductUploads?.filter(
        (upload) => upload.ProductUploadId !== productUploadId
      ) || [];
    const updatedFormData = {
      ...formData,
      SellProductUploads: updatedUploads,
    };
    setFormData(updatedFormData);
    validateForm(updatedFormData);
  };

  // จัดการการ submit ฟอร์ม
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm(formData);
    if (!validation.success) {
      setIsSubmitting(false);
      return;
    }

    try {
      const path =
        mode === "create"
          ? "api/v1/Sell/CreateProducts"
          : `api/v1/Sell/UpdateProducts`;
      const method = mode === "create" ? "POST" : "PUT";

      const payload = {
        ...formData,
        Status: formData.Status ? Number(formData.Status) : null,
        VisibilityLevel: formData.VisibilityLevel
          ? Number(formData.VisibilityLevel)
          : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_THA_API_URL}/${path}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        router.push("/backoffice/product");
        router.refresh();
      } else {
        showErrorToast({ errorMessages: "ไม่สามารถส่งข้อมูลได้" });
      }
    } catch (error) {
      showErrorToast({
        errorMessages: "เกิดข้อผิดพลาดในการส่งข้อมูล: " + error,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="Name" className="block text-sm font-medium">
          รูปสินค้า
        </label>
        {formData.SellProductUploads &&
        formData.SellProductUploads.length > 0 ? (
          formData.SellProductUploads?.map((upload) =>
            upload.Url ? (
              <div
                key={upload.ProductUploadId}
                className="mt-2 inline-block mr-6"
              >
                <img
                  src={upload.Url}
                  alt={upload.OriginalFileName || "Product Image"}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(upload.ProductUploadId)}
                  className="mt-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                >
                  RemoveImage
                </button>
              </div>
            ) : null
          )
            .reduce((rows, item, index) => {
              const rowIndex = Math.floor(index / 4);
              if (!rows[rowIndex]) rows[rowIndex] = [];
              rows[rowIndex].push(item);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap mb-6">
                {row}
              </div>
            ))
        ) : (
          <p className="text-sm text-gray-500">ไม่มีรูปภาพ</p>
        )}
      </div>
      <div>
        <label htmlFor="Name" className="block text-sm font-medium">
          ชื่อสินค้า
        </label>
        <input
          id="Name"
          name="Name"
          type="text"
          value={formData.Name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 h-12 p-2"
        />
        {errors.Name && (
          <p className="mt-1 text-sm text-red-600">{errors.Name}</p>
        )}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          รายละเอียด
        </label>
        <div className="flex gap-2 mb-1 mt-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            className={`px-3 py-1 rounded border ${
              editor?.isActive("bold")
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
            className={`px-3 py-1 rounded border ${
              editor?.isActive("italic")
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            Italic
          </button>
        </div>
        <div className="rounded-lg p-4 min-h-[200px] border border-gray-300">
          <EditorContent editor={editor} />
        </div>
        {errors.Description && (
          <p className="mt-1 text-sm text-red-600">{errors.Description}</p>
        )}
      </div>
      <div>
        <label htmlFor="Status" className="block text-sm font-medium">
          สถานะ
        </label>
        <select
          id="Status"
          name="Status"
          value={formData.Status}
          onChange={handleChange}
          className="mt-1 block w-full md:max-w-lg px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">เลือก</option>
          <option value="1">Enable</option>
          <option value="0">Disable</option>
        </select>
        {errors.Status && (
          <p className="mt-1 text-sm text-red-600">{errors.Status}</p>
        )}
      </div>
      <div>
        <label htmlFor="VisibilityLevel" className="block text-sm font-medium">
          ระดับการมองเห็น
        </label>
        <select
          id="VisibilityLevel"
          name="VisibilityLevel"
          value={formData.VisibilityLevel}
          onChange={handleChange}
          className="mt-1 block w-full md:max-w-lg px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">เลือก</option>
          <option value="1">ทั้งหมด</option>
          <option value="2">เจ้าหน้าที่</option>
          <option value="3">บุคคลทั่วไป</option>
        </select>
        {errors.VisibilityLevel && (
          <p className="mt-1 text-sm text-red-600">{errors.VisibilityLevel}</p>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <LoaderCircle className="animate-spin" size={15} />
              <span>กำลังส่ง...</span>
            </span>
          ) : mode === "create" ? (
            "เพิ่มสินค้า"
          ) : (
            "แก้ไขสินค้า"
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          รีเซ็ต
        </button>
      </div>
    </form>
  );
}
