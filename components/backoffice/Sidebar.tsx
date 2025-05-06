"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { deleteCookie, getCookie } from "@/utils/cookies";

interface User {
  userId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
}

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const token = getCookie("token");
      if (token) {
        setToken(token);
      }
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to parse user data:", err);
    }
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Logout",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      // Clear cookie
      deleteCookie("token");
      // Clear localStorage
      localStorage.removeItem("user");

      // Redirect to login page
      router.push("/backoffice/login");
    }
  };

  return (
    <aside className="bg-gray-900 text-white w-64 p-4 flex flex-col h-screen">
      <div>
        <h2 className="text-xl font-bold mb-4">
          <Link href="/backoffice">Backoffice</Link>
        </h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/backoffice/dashboard"
                className="block p-2 hover:bg-gray-700"
              >
                แดชบอร์ด
              </Link>
            </li>
            <li>
              <Link
                href="/backoffice/category"
                className="block p-2 hover:bg-gray-700"
              >
                หมวดหมู่สินค้า
              </Link>
            </li>
            <li>
              <Link
                href="/backoffice/product"
                className="block p-2 hover:bg-gray-700"
              >
                รายการสินค้า
              </Link>
            </li>
            <li>
              <Link
                href="/backoffice/orders"
                className="block p-2 hover:bg-gray-700"
              >
                คำสั่งซื้อ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mt-20">
        {user && <p className="text-sm mb-4">Welcome, {user.fullName}</p>}
        {token && (
          <button
            onClick={handleLogout}
            className="w-full p-2 bg-amber-700 text-white rounded-md hover:bg-amber-600"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
