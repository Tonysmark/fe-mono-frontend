import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mobile-ssr",
  description: "Next.js MPA 示例：Feed 列表页 + 详情页（SSR + 内部 API）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-white text-zinc-900">{children}</body>
    </html>
  );
}
