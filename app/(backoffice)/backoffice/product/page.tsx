"use client";

import { useSearchParams, useRouter } from "next/navigation"; // เพิ่ม useRouter
import { useEffect, useState } from "react";
import ErrorHandler from "@/components/common/ErrorHandlerProps";
import Pagination from "@/components/pagination/Pagination";
import { ResultModel } from "@/types/common/ResultModel";
import { PaginationView } from "@/types/paginations/PaginationView";
import Link from "next/link";
import { Pager } from "@/types/paginations/Pager";
import { Product } from "@/types/products/Product";
import Image from "next/image";

async function fetchProducts(payload: {
  page: number;
  pageSize: number;
  searchtxt?: string;
}): Promise<ResultModel<PaginationView<Product[]>>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Sell/GetProductsList`,
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

    const data: ResultModel<PaginationView<Product[]>> = await response.json();
    return data;
  } catch (error) {
    return {
      Status: false,
      errorCheck: true,
      errorMessage: "Failed to fetch",
    };
  }
}

export default function ProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // เพิ่ม useRouter
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const searchtxt = searchParams.get("searchtxt") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [pager, setPager] = useState<Pager | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchtxt); // เพิ่ม state สำหรับ input

  useEffect(() => {
    async function load() {
      setLoading(true);
      const payload = { page, pageSize, searchtxt };
      const result = await fetchProducts(payload);

      if (result.Status && result.Result) {
        setProducts(result.Result.Items ?? []);
        setPager(result.Result.Pager);
        setErrorMessage(null);
      } else {
        setErrorMessage(result.errorMessage || "Unknown error");
        setProducts([]);
        setPager(null);
      }

      setLoading(false);
    }

    load();
  }, [page, pageSize, searchtxt]);

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("searchtxt", searchInput);
      params.set("page", "1"); // รีเซ็ตหน้าเมื่อค้นหาใหม่
    } else {
      params.delete("searchtxt");
    }
    router.push(`/backoffice/product?${params.toString()}`); // อัปเดต URL โดยไม่รีเฟรช
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายการสินค้า</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="ค้นหา..."
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button" // เปลี่ยนเป็น type="button"
              onClick={handleSearch} // เรียกฟังก์ชัน handleSearch
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </div>
          <Link
            href="/backoffice/product/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">รูปสินค้า</th>
              <th className="py-2 px-4 border-b text-left w-[600px]">ชื่อ</th>
              <th className="py-2 px-4 border-b text-left">วันที่สร้าง</th>
              <th className="py-2 px-4 border-b text-left">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={100}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td
                  colSpan={100}
                  className="py-4 px-4 text-center text-red-500"
                >
                  <ErrorHandler errorMessage={errorMessage} />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={100}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.ProductId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {item.ImageCoverThumbnailUrl && (
                      <Image
                        src={item.ImageCoverThumbnailUrl}
                        alt="Thumbnail"
                        width={50}
                        height={50}
                        style={{ width: "auto" }}
                        className="object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{item.Name}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(item.CreateDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link
                      href={`/backoffice/product/${item.ProductId}`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !errorMessage && products.length > 0 && (
        <div className="mt-4">
          <Pagination
            totalPages={pager?.TotalPages || 1}
            currentPage={pager?.CurrentPage || 1}
            totalItems={pager?.TotalItems || 0}
          />
        </div>
      )}
    </div>
  );
}
