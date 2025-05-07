// components/pagination/Pagination.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function Pagination({
  totalPages,
  currentPage,
  totalItems,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // สร้าง query string สำหรับหน้าใหม่
  const createQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      return params.toString();
    },
    [searchParams]
  );

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    //router.push(`?${createQueryString(page)}`);

    window.history.pushState(null, "", `?${createQueryString(page)}`); // อัปเดต URL โดยไม่นำทาง
  };

  // สร้าง array ของหมายเลขหน้า
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // เพิ่มหน้าแรก
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }

    // เพิ่มหน้าที่อยู่ในช่วง
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // เพิ่มหน้าสุดท้าย
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="mt-6 flex justify-between items-center">
      {/* ข้อมูลหน้าและจำนวนรายการ (ซ้าย) */}
      <div className="text-sm text-gray-700">
        <p>Total Items: {totalItems}</p>
        <p>
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* ปุ่ม pagination (ขวา) */}
      <div className="flex items-center gap-2">
        {/* ปุ่ม Previous */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>

        {/* หมายเลขหน้า */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && handlePageChange(page)}
            disabled={page === "..." || page === currentPage}
            className={`px-3 py-1 rounded-md border border-gray-300 ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } ${page === "..." ? "cursor-default" : ""}`}
          >
            {page}
          </button>
        ))}

        {/* ปุ่ม Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
