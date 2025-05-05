"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Category, CategorySchema } from "@/types/categorys/category";
import { showErrorToast } from "../common/ToastNotification";
import { GUID_EMPTY, STRING_EMPTY } from "@/utils/constants";
import { LoaderCircle } from "lucide-react";

interface CategoryFormProps {
  initialData?: Category;
  mode: "create" | "edit";
}

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Category>({
    Status: initialData?.Status?.toString() || STRING_EMPTY,
    CategoryId: initialData?.CategoryId || GUID_EMPTY,
    CreateDate: initialData?.CreateDate
      ? new Date(initialData.CreateDate)
      : new Date(),
    Name: initialData?.Name || STRING_EMPTY,
    Description: initialData?.Description || STRING_EMPTY,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Category, string>>>(
    {}
  );

  // useEffect เพื่อ sync formData กับ initialData
  useEffect(() => {
    //console.log("useEffect triggered with initialData:", initialData);
    if (initialData) {
      setFormData({
        Status: initialData.Status?.toString() || STRING_EMPTY,
        CategoryId: initialData.CategoryId || GUID_EMPTY,
        CreateDate: initialData.CreateDate
          ? new Date(initialData.CreateDate)
          : new Date(),
        Name: initialData.Name || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
      });
      setErrors({}); // ล้าง errors เมื่อ initialData เปลี่ยน
    }
  }, [initialData]);

  // ฟังก์ชันตรวจสอบข้อมูลด้วย Zod
  const validateForm = (data: Category) => {
    const result = CategorySchema.safeParse(data);
    if (!result.success) {
      const errorMap = result.error.issues.reduce((acc, issue) => {
        const field = issue.path[0] as keyof Category;
        acc[field] = issue.message;
        return acc;
      }, {} as Partial<Record<keyof Category, string>>);
      setErrors(errorMap);
    } else {
      setErrors({});
    }
    return result;
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

  // ฟังก์ชันรีเซ็ตฟอร์ม
  const handleReset = () => {
    console.log("Reset button clicked, resetting formData");
    if (mode === "edit" && initialData) {
      // ในโหมดแก้ไข รีเซ็ตกลับไปเป็น initialData
      setFormData({
        Status: initialData.Status?.toString() || STRING_EMPTY,
        CategoryId: initialData.CategoryId || GUID_EMPTY,
        CreateDate: initialData.CreateDate
          ? new Date(initialData.CreateDate)
          : new Date(),
        Name: initialData.Name || STRING_EMPTY,
        Description: initialData.Description || STRING_EMPTY,
      });
    } else {
      // ในโหมดสร้าง รีเซ็ตเป็นค่า default
      setFormData({
        Status: STRING_EMPTY,
        CategoryId: GUID_EMPTY,
        CreateDate: new Date(),
        Name: STRING_EMPTY,
        Description: STRING_EMPTY,
      });
    }
    setErrors({}); // ล้าง errors
  };

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
          ? "api/v1/Sell/CreateCategory"
          : `api/v1/Sell/UpdateCategory`;
      const method = mode === "create" ? "POST" : "PUT";

      const dataToSend = {
        ...formData,
        Status: formData.Status ? Number(formData.Status) : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_THA_API_URL}/${path}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        router.push("/backoffice/category");
        router.refresh();
      } else {
        showErrorToast({ errorMessages: "ไม่สามารถส่งข้อมูลได้" });
      }
    } catch (error) {
      showErrorToast({ errorMessages: "เกิดข้อผิดพลาดในการส่งข้อมูล" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          สถานะ
        </label>
        <select
          id="status"
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
        <label htmlFor="name" className="block text-sm font-medium">
          ชื่อหมวดหมู่
        </label>
        <input
          id="name"
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
        <textarea
          id="description"
          name="Description"
          value={formData.Description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {errors.Description && (
          <p className="mt-1 text-sm text-red-600">{errors.Description}</p>
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
            "เพิ่มหมวดหมู่"
          ) : (
            "อัปเดตหมวดหมู่"
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
