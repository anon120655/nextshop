import CategoryForm from "@/components/backoffice/CategoryForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Add New Category - Shop Backoffice",
  description: "Create a new Category in the shop",
};

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">เพิ่มหมวดหมู่</h1>
        <Link
          href="/backoffice/category"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          กลับ
        </Link>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
