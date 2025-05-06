import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache สำหรับเก็บผลลัพธ์ token
const tokenCache = new Map<string, { isExpired: boolean; expiresAt: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip these pages from token check
  const excludedPaths = ["/backoffice/login", "/backoffice/guest"];

  // If the path is in excludedPaths, proceed without checking token
  if (excludedPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check token in cookies
  const token = request.cookies.get("token")?.value;

  // ถ้าไม่มี token หรือ token เป็นค่าว่าง, redirect ไปหน้า login
  if (!token || token.trim() === "") {
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }

  // ตรวจสอบ cache ก่อนเรียก API ถ้ามีผลลัพธ์ใน cache และยังไม่หมดอายุ จะใช้ผลลัพธ์นั้นแทน
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.isExpired) {
      console.log("Cached token expired");
      return NextResponse.redirect(new URL("/backoffice/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    // เรียก API
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_THA_API_URL
      }/api/v1/Authorize/IsExpireToken?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      return NextResponse.redirect(new URL("/backoffice/login", request.url));
    }

    const data = await response.json();

    if (data.Status === true && typeof data.Result === "boolean") {
      //เก็บผลลัพธ์ของการตรวจสอบ token (เช่น หมดอายุหรือไม่) ใน cache เพื่อหลีกเลี่ยงการเรียก API ซ้ำสำหรับ token เดียวกัน
      //กำหนด TTL (Time To Live) สำหรับ cache เพื่อให้สอดคล้องกับอายุของ token หรือระยะเวลาที่เหมาะสม
      tokenCache.set(token, {
        isExpired: data.Result,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 นาที
      });

      if (data.Result === true) {
        console.log("Token expired");
        return NextResponse.redirect(new URL("/backoffice/login", request.url));
      }
      return NextResponse.next();
    } else {
      console.error("Invalid API response format:", data);
      return NextResponse.redirect(new URL("/backoffice/login", request.url));
    }
  } catch (error) {
    console.error("Error checking token:", error);
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
