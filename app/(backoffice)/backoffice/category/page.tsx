"use client";

import { useSearchParams, useRouter } from "next/navigation"; // เพิ่ม useRouter
import { useEffect, useState } from "react";
import ErrorHandler from "@/components/common/ErrorHandlerProps";
import Pagination from "@/components/pagination/Pagination";
import { Category } from "@/types/categorys/category";
import { ResultModel } from "@/types/common/ResultModel";
import { PaginationView } from "@/types/paginations/PaginationView";
import Link from "next/link";
import { Pager } from "@/types/paginations/Pager";
import Swal from "sweetalert2";

async function fetchCategorys(payload: {
  Status?: number | undefined;
  page: number;
  pageSize: number;
  searchtxt?: string;
}): Promise<ResultModel<PaginationView<Category[]>>> {
  try {
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

    const data: ResultModel<PaginationView<Category[]>> = await response.json();
    return data;
  } catch (error) {
    return {
      Status: false,
      errorCheck: true,
      errorMessage: "Failed to fetch",
    };
  }
}

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // เพิ่ม useRouter
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const searchtxt = searchParams.get("searchtxt") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [pager, setPager] = useState<Pager | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchtxt); // เพิ่ม state สำหรับ input

  const load = async () => {
    setLoading(true);
    const payload = { Status: undefined, page, pageSize, searchtxt };
    const result = await fetchCategorys(payload);

    if (result.Status && result.Result) {
      setCategories(result.Result.Items ?? []);
      setPager(result.Result.Pager);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.errorMessage || "Unknown error");
      setCategories([]);
      setPager(null);
    }

    setLoading(false);
  };

  useEffect(() => {
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
    router.push(`/backoffice/category?${params.toString()}`); // อัปเดต URL โดยไม่รีเฟรช
  };

  const handleDelete = async (categoryId: string, name: string) => {
    const result = await Swal.fire({
      title: `คุณต้องการลบหมวดหมู่ \n <span class='text-blue-400'>${name}</span> \nใช่หรือไม่?`,
      text: "การลบนี้ไม่สามารถย้อนคืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Sell/RemoveCategory/${categoryId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          throw new Error("ลบไม่สำเร็จ");
        }

        Swal.fire("ลบแล้ว!", "หมวดหมู่ถูกลบเรียบร้อย", "success");

        // Reload page (หรือ refetch ข้อมูลใหม่)
        await load();
      } catch (err) {
        Swal.fire("ผิดพลาด!", "ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายการหมวดหมู่</h1>
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
            href="/backoffice/category/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            เพิ่มหมวดหมู่ใหม่
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ชื่อ</th>
              <th className="py-2 px-4 border-b text-left">คำอธิบาย</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={100}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              categories.map((item) => (
                <tr key={item.CategoryId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.Name}</td>
                  <td className="py-2 px-4 border-b">
                    {item.Description || "-"}
                  </td>
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
                      href={`/backoffice/category/${item.CategoryId}`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => handleDelete(item.CategoryId, item.Name)}
                      className="text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !errorMessage && categories.length > 0 && (
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
