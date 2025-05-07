"use client";

import ErrorHandler from "@/components/common/ErrorHandlerProps";
import Pagination from "@/components/pagination/Pagination";
import { Booking } from "@/types/Bookings/Booking";
import { BookinginfoMain } from "@/types/Bookings/BookinginfoMain";
import { ResultModel } from "@/types/common/ResultModel";
import { Pager } from "@/types/paginations/Pager";
import { PaginationView } from "@/types/paginations/PaginationView";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

async function fetchData(payload: {
  Status?: number;
  page: number;
  pageSize: number;
  searchtxt?: string;
}): Promise<ResultModel<PaginationView<Booking[]>>> {
  try {
    const queryParams = new URLSearchParams({
      page: payload.page.toString(),
      pageSize: payload.pageSize.toString(),
      ...(payload.searchtxt && { searchtxt: payload.searchtxt }),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_THA_API_URL
      }/api/v1/Space/GetPagingBooking?${queryParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch: ${errorText}`);
    }

    const data: ResultModel<PaginationView<Booking[]>> = await response.json();
    return data;
  } catch (error) {
    return {
      Status: false,
      errorCheck: true,
      errorMessage: "Failed to fetch",
    };
  }
}

const BookingPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter(); // เพิ่ม useRouter
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const searchtxt = searchParams.get("searchtxt") || "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pager, setPager] = useState<Pager | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchtxt); // เพิ่ม state สำหรับ input

  const load = async () => {
    setLoading(true);
    const payload = { Status: undefined, page, pageSize, searchtxt };
    const result = await fetchData(payload);

    if (result.Status && result.Result) {
      setBookings(result.Result.Items ?? []);
      setPager(result.Result.Pager);
      setErrorMessage(null);
    } else {
      setBookings([]);
      setPager(null);
      setErrorMessage(result.errorMessage || "Unknown error");
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
    router.replace(`/backoffice/booking?${params.toString()}`, {
      scroll: false,
    }); // อัปเดต URL โดยไม่รีเฟรช
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ข้อมูลการจอง</h1>
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">รหัสจอง</th>
              <th className="py-2 px-4 border-b text-left">วันที่ทำการจอง</th>
              <th className="py-2 px-4 border-b text-left">ห้องประชุม</th>
              <th className="py-2 px-4 border-b text-left">วันที่เริ่มต้น</th>
              <th className="py-2 px-4 border-b text-left">วันที่สิ้นสุด</th>
              <th className="py-2 px-4 border-b text-left">ชื่อการประชุม</th>
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
            ) : bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={100}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              bookings.map((item) => (
                <tr key={item.BooikingId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.BooikingNo}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(item.CreateDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">{item.RoomName}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(item.MeetingDateStart).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(item.MeetingDateEnd).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">{item.MeetingName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !errorMessage && bookings.length > 0 && (
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
};
export default BookingPage;
