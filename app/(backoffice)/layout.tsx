import Link from "next/link";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="backoffice-layout flex min-h-screen">
      <aside className="bg-gray-900 text-white w-64 p-4">
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
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
