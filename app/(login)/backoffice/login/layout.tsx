import Link from "next/link";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="backoffice-layout">
      <main className="">{children}</main>
    </div>
  );
}
