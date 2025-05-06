"use client";

import { AuthResponse } from "@/types/auth/AuthResponse";
import { LoginForm } from "@/types/auth/LoginForm";
import { setCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        Username: formData.username,
        Password: formData.password,
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
          //credentials: "include", // Include cookies in request
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      if (data.Status && data.Result) {
        //*** เก็บ token ใน cookie เพื่อเรียกใช้ได้ใน middleware
        //*** เก็บ user data ใน localStorage เพื่อเก็บได้เยอะและ Client Component เข้าถึงง่าย

        setCookie("token", data.Result.Token, 168); //168 ชั่วโมง = 7 วัน
        // Store user data in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.Result.UserId,
            fullName: data.Result.FullName,
            firstName: data.Result.FirstName,
            lastName: data.Result.LastName,
            roleId: data.Result.RoleId,
            roleName: data.Result.RoleName,
          })
        );

        // Redirect to dashboard or home page
        router.push("/backoffice");
      } else {
        setError(data.errorMessage || "Authentication failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Backoffice Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-md text-white ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
