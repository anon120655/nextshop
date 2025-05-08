"use client";

import { AuthResponse } from "@/types/auth/AuthResponse";
import { LoginForm, LoginFormSchema } from "@/types/auth/LoginForm";
import { STRING_EMPTY } from "@/utils/constants";
import { setCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import { useActionState, useState, useEffect } from "react";

// Server Action สำหรับจัดการการล็อกอิน
async function loginAction(
  prevState: {
    error: string | null;
    errors?: Partial<Record<keyof LoginForm, string>>;
    success: boolean;
  },
  formData: FormData
): Promise<{
  error: string | null;
  errors?: Partial<Record<keyof LoginForm, string>>;
  success: boolean;
}> {
  const data: LoginForm = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  // ตรวจสอบข้อมูลด้วย Zod
  const validation = LoginFormSchema.safeParse(data);
  if (!validation.success) {
    const errorMap = validation.error.issues.reduce((acc, issue) => {
      const field = issue.path[0] as keyof LoginForm;
      acc[field] = issue.message;
      return acc;
    }, {} as Partial<Record<keyof LoginForm, string>>);
    return { error: null, errors: errorMap, success: false };
  }

  try {
    const payload = {
      Username: data.username,
      Password: data.password,
      IPAddress: "",
      LoginBy: 4,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/Authorize/Authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AuthResponse = await response.json();

    if (result.Status && result.Result) {
      // เก็บ token ใน cookie
      setCookie("token", result.Result.Token, 168);
      // เก็บ user data ใน localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: result.Result.UserId,
          fullName: result.Result.FullName,
          firstName: result.Result.FirstName,
          lastName: result.Result.LastName,
          roleId: result.Result.RoleId,
          roleName: result.Result.RoleName,
        })
      );
      return { error: null, success: true };
    } else {
      return {
        error: result.errorMessage || "Authentication failed",
        success: false,
      };
    }
  } catch (err) {
    return { error: `An error occurred during login ${err}`, success: false };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    username: STRING_EMPTY,
    password: STRING_EMPTY,
  });

  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof LoginForm, string>>
  >({});

  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
    errors: {},
    success: false,
  });

  // ใช้ useEffect เพื่อจัดการ navigation หลังจาก render เสร็จแล้ว
  useEffect(() => {
    if (state.success) {
      router.push("/backoffice");
    }
  }, [state.success, router]);

  // ฟังก์ชันจัดการการเปลี่ยนแปลง input และเคลียร์ข้อผิดพลาด
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // เคลียร์ข้อผิดพลาดของฟิลด์ที่กำลังแก้ไขทั้งใน clientErrors และ state.errors
    setClientErrors((prev) => ({ ...prev, [name]: undefined }));
    if (state.errors?.[name as keyof LoginForm]) {
      state.errors = { ...state.errors, [name]: undefined };
    }
  };

  // รวมข้อผิดพลาดจาก state.errors และ clientErrors
  const errors = { ...clientErrors, ...state.errors };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Backoffice Login
        </h2>

        {state.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full p-2 rounded-md text-white ${
              isPending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
