import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">mobile-ssr</h1>
      <p className="mt-2 text-sm text-zinc-600">
        这是一个 Next.js（App Router）示例：包含 Feed 列表页与详情页，并在服务端通过内部 API
        拉取数据渲染。
      </p>
      <Link
        className="mt-6 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        href="/feed"
      >
        进入 Feed →
      </Link>
    </main>
  );
}
