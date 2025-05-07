import { Suspense } from "react";
import { ResultModel } from "@/types/common/ResultModel";
import ErrorHandler from "@/components/common/ErrorHandlerProps";
import Link from "next/link";
import LoadingComponent from "@/components/common/LoadingComponent";
import { Product } from "@/types/products/Product";
import ProductForm from "@/components/backoffice/ProductForm";

async function fetchProduct(id: string) {
  //await new Promise((resolve) => setTimeout(resolve, 100));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Sell/GetProductsByID?id=${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch category data");
  }

  const dataMap: ResultModel<Product> = await response.json();
  if (!dataMap.Status || dataMap.errorCheck) {
    throw new Error(dataMap.errorMessage || "Unknown error");
  }

  return dataMap.Result;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingComponent />}>
      <ProductContent id={id} />
    </Suspense>
  );
}

async function ProductContent({ id }: { id: string }) {
  let initialData: Product | undefined;
  let errorMessage: string | null = null;

  try {
    initialData = await fetchProduct(id);
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  // ตรวจสอบ error จาก API
  if (errorMessage) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
          <Link
            href="/backoffice/product"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            กลับ
          </Link>
        </div>
        <p className="text-red-500">
          <ErrorHandler errorMessage={errorMessage} />
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
        <Link
          href="/backoffice/product"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          กลับ
        </Link>
      </div>
      <ProductForm mode="edit" initialData={initialData} />
    </div>
  );
}
