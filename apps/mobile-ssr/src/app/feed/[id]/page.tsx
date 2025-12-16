import Link from "next/link";
import type { Post } from "@/lib/server/jsonplaceholder";
import { getRequestOrigin } from "@/lib/server/internalApi";
import { createServerClient } from "@repo/request/server";

async function getPost(id: string): Promise<Post> {
  const origin = await getRequestOrigin();
  const api = createServerClient(origin, { timeout: 8_000, withAuth: true });
  const res = await api.get<Post>(`/api/posts/${id}`, { init: { cache: "no-store" } });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export default async function FeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <Link href="/feed" className="text-sm text-zinc-600 hover:underline">
          ← 返回列表
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{post.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          该页面在服务端渲染时通过内部 API（/api/posts/{id}）拉取数据
        </p>
      </header>

      <article className="rounded-lg border border-zinc-200 p-4 text-zinc-800">
        <p className="whitespace-pre-wrap leading-7">{post.body}</p>
      </article>
    </main>
  );
}


