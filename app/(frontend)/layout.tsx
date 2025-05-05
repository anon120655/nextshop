import Link from "next/link";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="frontend-layout">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Shop
          </Link>
          <ul className="flex space-x-4">
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/cart">Cart</Link>
            </li>
            <li>
              <Link href="/profile">Profile</Link>
            </li>
            <li>
              <Link href="/backoffice">Backoffice</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container mx-auto py-8">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
