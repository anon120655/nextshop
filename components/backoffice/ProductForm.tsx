"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "../common/ToastNotification";
import { GUID_EMPTY, STRING_EMPTY } from "@/utils/constants";
import { LoaderCircle } from "lucide-react";
import { Product } from "@/types/products/Product";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ProductFormProps {
  initialData?: Product | null;
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  // const [errorMessage, setErrorMessage] = useState<string | null>(null); // เพิ่ม state

  //console.log("initialData", initialData);
  const initialState: Product = {
    Status: initialData?.Status,
    ProductId: initialData?.ProductId || GUID_EMPTY,
    CreateDate: initialData?.CreateDate ? initialData.CreateDate : new Date(),
    Name: initialData?.Name || STRING_EMPTY,
    Description: initialData?.Description || STRING_EMPTY,
    VisibilityLevel: initialData?.VisibilityLevel,
  };

  //console.log("initialState", initialState);
  const submitAction = async (state: Product, formData: FormData) => {
    //setErrorMessage(null); // รีเซ็ต errorMessage ก่อนเริ่ม submit

    const payload = {
      Status: Number(formData.get("Status")),
      ProductId: state.ProductId,
      CreateDate: new Date(formData.get("CreateDate") as string),
      Name: formData.get("Name") as string,
      Description: formData.get("Description") as string,
      VisibilityLevel: Number(formData.get("VisibilityLevel")),
    };

    //console.log(JSON.stringify(payload));

    try {
      const path =
        mode === "create"
          ? "api/v1/Sell/CreateProducts"
          : `api/v1/Sell/UpdateProducts`;
      const method = mode === "create" ? "POST" : "PUT";

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
        return { ...payload }; // คืนข้อมูลใหม่หลัง success
      } else {
        //const errorText = await response.text();
        showErrorToast({ errorMessages: "Failed to submit." });
        return state; // ไม่เปลี่ยน state ถ้า error
      }
    } catch (error) {
      showErrorToast({ errorMessages: "Error to submit." + error });
      return state;
    }
  };

  //await new Promise((resolve) => setTimeout(resolve, 200));
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialState.Description,
  });

  //state = ข้อมูลปัจจุบัน (ตาม initialState)
  //formAction = ฟังก์ชันที่จะใช้ตอน submit <form>
  //isPending = true/false บอกว่า submit อยู่ไหม
  const [state, formAction, isPending] = useActionState(
    submitAction,
    initialState
  );

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            ชื่อสินค้า
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
            defaultValue={state.Name}
            className="mt-1 block w-full rounded-md border border-gray-300 h-12 p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            รายละเอียด
          </label>
          {/* Toolbar */}
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

          {/* Editor */}
          <div className="rounded-lg p-4 min-h-[200px] border border-gray-300">
            <EditorContent editor={editor} />
          </div>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            สถานะ
          </label>
          <select
            id="Status"
            name="Status"
            defaultValue={state.Status}
            className="mt-1 block w-full md:max-w-lg px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>เลือก</option>
            <option value="1">Enable</option>
            <option value="0">Disable</option>
          </select>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            ระดับการมองเห็น
          </label>
          <select
            id="Status"
            name="Status"
            defaultValue={state.VisibilityLevel}
            className="mt-1 block w-full md:max-w-lg px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>เลือก</option>
            <option value="1">ทั้งหมด</option>
            <option value="2">เจ้าหน้าที่</option>
            <option value="3">บุคคลทั่วไป</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? (
            <span className="flex items-center space-x-2">
              <LoaderCircle className="animate-spin" size={15} />
              <span>Submitting...</span>
            </span>
          ) : mode === "create" ? (
            "เพิ่มสินค้า"
          ) : (
            "แก้ไขสินค้า"
          )}
        </button>
      </form>
    </>
  );
}
