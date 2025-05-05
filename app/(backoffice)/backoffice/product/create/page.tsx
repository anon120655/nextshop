import ProductForm from "@/components/backoffice/ProductForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Add New Product - Shop Backoffice",
  description: "Create a new product in the shop",
};

export default function CreateProductPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
        <Link
          href="/backoffice/product"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          กลับ
        </Link>
      </div>
      <ProductForm mode="create" initialData={undefined} />
    </div>
  );
}
