"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "../common/ToastNotification";
import { GUID_EMPTY, STRING_EMPTY } from "@/utils/constants";
import { LoaderCircle } from "lucide-react";
import { Product, ProductSchema } from "@/types/products/Product";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Select from "react-select";
import { Category } from "@/types/categorys/category";
import { ResultModel } from "@/types/common/ResultModel";
import { PaginationView } from "@/types/paginations/PaginationView";
import { v4 as uuidv4 } from "uuid";

interface ProductFormProps {
  initialData?: Product | null;
  mode: "create" | "edit";
}

interface UploadFormFilesResponse {
  FileId: string;
  FileUrl: string;
  OriginalFileName: string;
  PathFolder: string;
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<Product>(() => {
    const createDate = initialData?.CreateDate
      ? new Date(initialData.CreateDate)
      : new Date(); // รับรองว่า CreateDate มีค่าเสมอ
    return {
      Status: initialData?.Status?.toString() || STRING_EMPTY,
      ProductId: initialData?.ProductId || GUID_EMPTY,
      CreateDate: createDate,
      Name: initialData?.Name || STRING_EMPTY,
      CategoryId: initialData?.CategoryId || STRING_EMPTY,
      Description: initialData?.Description || STRING_EMPTY,
      VisibilityLevel: initialData?.VisibilityLevel?.toString() || STRING_EMPTY,
      ImageCoverUrl: initialData?.ImageCoverUrl || STRING_EMPTY,
      ImageCoverThumbnailUrl:
        initialData?.ImageCoverThumbnailUrl || STRING_EMPTY,
      UrlSlug: initialData?.UrlSlug || STRING_EMPTY,
      SellProductUploads: initialData?.SellProductUploads || [],
      SellProductCategories: initialData?.SellProductCategories || [],
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function fetchCategories(payload: { page: number; pageSize: number }) {
    try {
      setIsLoadingCategories(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Sell/GetCategoryList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${errorText}`);
      }

      const dataMap: ResultModel<PaginationView<Category[]>> =
        await response.json();
      if (!dataMap.Status || dataMap.errorCheck) {
        throw new Error(
          dataMap.errorMessage || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
        );
      }
      setCategories(dataMap.Result.Items);
    } catch (_) {
      showErrorToast({
        errorMessages: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }

  useEffect(() => {
    const payload = { page: 1, pageSize: 100 };
    fetchCategories(payload);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.Description,
    onUpdate: ({ editor }) => {
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

  useEffect(() => {
    if (initialData) {
      const createDate = initialData?.CreateDate
        ? new Date(initialData.CreateDate)
        : new Date(); // รับรองว่า CreateDate มีค่าเสมอ
      const newFormData = {
        Status: initialData.Status?.toString() || STRING_EMPTY,
        ProductId: initialData.ProductId || GUID_EMPTY,
        CreateDate: createDate,
        Name: initialData.Name || STRING_EMPTY,
        CategoryId: initialData.CategoryId || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
        VisibilityLevel:
          initialData.VisibilityLevel?.toString() || STRING_EMPTY,
        ImageCoverUrl: initialData.ImageCoverUrl || STRING_EMPTY,
        ImageCoverThumbnailUrl:
          initialData.ImageCoverThumbnailUrl || STRING_EMPTY,
        UrlSlug: initialData.UrlSlug || STRING_EMPTY,
        SellProductUploads: initialData.SellProductUploads || [],
        SellProductCategories: initialData.SellProductCategories || [],
      };
      setFormData(newFormData);
      editor?.commands.setContent(initialData.Description || STRING_EMPTY);
    }
  }, [initialData, editor]);

  useEffect(() => {
    const categoryOption = categoryOptions.find(
      (option) => option.value === formData.CategoryId
    );
    setSelectedCategory(categoryOption || null);
  }, [formData.CategoryId, categories]);

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

  const handleCategoryChange = (selectedOption: any) => {
    const updatedFormData = {
      ...formData,
      CategoryId: selectedOption ? selectedOption.value : STRING_EMPTY,
      SellProductCategories: selectedOption
        ? [
            {
              CategoryId: selectedOption.value,
              Name: selectedOption.label || "หมวดหมู่ไม่มีชื่อ", // กำหนดค่า default ถ้า label เป็น undefined
              CreateDate: new Date(), // เพิ่ม CreateDate เป็น Date object
            },
          ]
        : [],
    };
    setFormData(updatedFormData);
    setSelectedCategory(selectedOption);
    validateForm(updatedFormData);
  };

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxFiles = 8;
    const maxFileSize = 1 * 1024 * 1024; // 1MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const newUploads: any[] = [];
    const errors: string[] = [];

    const totalFiles = formData.SellProductUploads.length + files.length;
    if (totalFiles > maxFiles) {
      errors.push(`สามารถอัปโหลดได้สูงสุด ${maxFiles} รูปเท่านั้น`);
      setUploadErrors(errors);
      return;
    }

    setUploading(true);
    setUploadErrors([]);

    try {
      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          errors.push(
            `ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (JPEG, PNG, GIF เท่านั้น)`
          );
          continue;
        }

        if (file.size > maxFileSize) {
          errors.push(`ไฟล์ ${file.name} มีขนาดเกิน 1MB`);
          continue;
        }

        const uuid = uuidv4().toString().toLowerCase();
        const extension =
          file.type === "image/jpeg"
            ? ".jpg"
            : file.type === "image/png"
            ? ".png"
            : file.type === "image/gif"
            ? ".gif"
            : "";
        const fileName = `${uuid}${extension}`;

        const uploadFormData = new FormData();
        uploadFormData.append("FileData", file);
        uploadFormData.append("Categorie", "TempFile");
        uploadFormData.append("FileName", fileName);
        uploadFormData.append("FileSize", file.size.toString());
        uploadFormData.append("MimeType", extension);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Files/UploadFormFile`,
          {
            method: "POST",
            body: uploadFormData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          errors.push(`ไม่สามารถอัปโหลดไฟล์ ${file.name}: ${errorText}`);
          continue;
        }

        const result: UploadFormFilesResponse = await response.json();
        // ตรวจสอบว่า FileId มีค่าหรือไม่ ถ้าไม่มีให้ใช้ UUID
        const productUploadId = result.FileId || uuidv4();
        newUploads.push({
          ProductUploadId: productUploadId,
          Status: "1", // ต้องเป็น string เสมอ
          CreateDate: new Date(), // ใช้ Date object
          ProductId: formData.ProductId || uuidv4(),
          Url: result.FileUrl || "",
          OriginalFileName: result.OriginalFileName || file.name,
          FileName: fileName,
          ProductVariantId: STRING_EMPTY, // กำหนดเป็น string แทน null
          IsPrimary: "0", // กำหนดค่า default เป็น string (เช่น "0" สำหรับไม่ใช่ primary)
        });
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
        showErrorToast({
          errorMessages: errors.join(", "),
        });
      }

      if (newUploads.length > 0) {
        const updatedFormData = {
          ...formData,
          SellProductUploads: [...formData.SellProductUploads, ...newUploads],
        };
        setFormData(updatedFormData);
        validateForm(updatedFormData);
      }
    } catch (error) {
      showErrorToast({
        errorMessages: `เกิดข้อผิดพลาดในการอัปโหลด: ${error}`,
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReset = () => {
    if (mode === "edit" && initialData) {
      const createDate = initialData?.CreateDate
        ? new Date(initialData.CreateDate)
        : new Date(); // รับรองว่า CreateDate มีค่าเสมอ
      setFormData({
        Status: initialData.Status?.toString() || STRING_EMPTY,
        ProductId: initialData.ProductId || GUID_EMPTY,
        CreateDate: createDate,
        Name: initialData.Name || STRING_EMPTY,
        CategoryId: initialData.CategoryId || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
        VisibilityLevel:
          initialData.VisibilityLevel?.toString() || STRING_EMPTY,
        ImageCoverUrl: initialData.ImageCoverUrl || STRING_EMPTY,
        ImageCoverThumbnailUrl:
          initialData.ImageCoverThumbnailUrl || STRING_EMPTY,
        UrlSlug: initialData.UrlSlug || STRING_EMPTY,
        SellProductUploads: initialData.SellProductUploads || [],
        SellProductCategories: initialData.SellProductCategories || [],
      });
      editor?.commands.setContent(initialData.Description || STRING_EMPTY);
      const categoryOption = categoryOptions.find(
        (option) => option.value === initialData.CategoryId
      );
      setSelectedCategory(categoryOption || null);
    } else {
      setFormData({
        Status: STRING_EMPTY,
        ProductId: GUID_EMPTY,
        CreateDate: new Date(),
        Name: STRING_EMPTY,
        CategoryId: STRING_EMPTY,
        Description: STRING_EMPTY,
        VisibilityLevel: STRING_EMPTY,
        ImageCoverUrl: STRING_EMPTY,
        ImageCoverThumbnailUrl: STRING_EMPTY,
        UrlSlug: STRING_EMPTY,
        SellProductUploads: [],
        SellProductCategories: [],
      });
      editor?.commands.setContent(STRING_EMPTY);
      setSelectedCategory(null);
    }
    setErrors({});
    setUploadErrors([]);
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("formData", formData);
    const validation = validateForm(formData);

    console.log("validation", validation);
    if (!validation.success) {
      setIsSubmitting(false);
      return;
    }

    try {
      const path =
        mode === "create"
          ? "api/v1/Sell/CreateProducts"
          : "api/v1/Sell/UpdateProducts";
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

  const categoryOptions = categories.map((category) => ({
    value: category.CategoryId,
    label: category.Name || "ไม่มีชื่อ",
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fileUpload" className="block text-sm font-medium">
          อัปโหลดรูปสินค้า
        </label>
        <input
          id="fileUpload"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {uploading && (
          <div className="mt-2 flex items-center space-x-2">
            <LoaderCircle className="animate-spin" size={20} />
            <span>กำลังอัปโหลด...</span>
          </div>
        )}
        {uploadErrors.length > 0 && (
          <div className="mt-2">
            {uploadErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500">
          รองรับไฟล์ JPEG, PNG, GIF ขนาดไม่เกิน 1MB ต่อไฟล์ สูงสุด 8 รูป
        </p>
      </div>
      <div>
        <label htmlFor="Name" className="block text-sm font-medium">
          รูปสินค้า
        </label>
        {formData.SellProductUploads &&
        formData.SellProductUploads.length > 0 ? (
          formData.SellProductUploads.filter(
            (upload) => upload.Url && upload.ProductUploadId
          ) // กรองเฉพาะที่มี Url และ ProductUploadId
            .map((upload, index) => (
              <div
                key={upload.ProductUploadId || `upload-${index}`} // ใช้ index เป็น key สำรอง
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
                  ลบรูปภาพ
                </button>
              </div>
            ))
            .reduce((rows: any[], item, index) => {
              const rowIndex = Math.floor(index / 4);
              if (!rows[rowIndex]) rows[rowIndex] = [];
              rows[rowIndex].push(item);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex flex-wrap mb-6">
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
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {errors.Name && (
          <p className="mt-1 text-sm text-red-600">{errors.Name}</p>
        )}
      </div>
      <div>
        <label htmlFor="CategoryId" className="block text-sm font-medium">
          หมวดหมู่
        </label>
        {isMounted ? (
          <Select
            instanceId="category-select"
            id="CategoryId"
            name="CategoryId"
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
            isLoading={isLoadingCategories}
            placeholder="เลือกหมวดหมู่"
            className="mt-1 block w-full md:max-w-lg"
            classNamePrefix="react-select"
            isClearable
          />
        ) : (
          <div className="mt-1 block w-full md:max-w-lg h-10 rounded-md border border-gray-300 p-2 bg-gray-100">
            กำลังโหลดหมวดหมู่...
          </div>
        )}
        {errors.CategoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.CategoryId}</p>
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
