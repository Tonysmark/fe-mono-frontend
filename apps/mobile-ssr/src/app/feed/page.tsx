import Link from "next/link";
import type { Post } from "@/lib/server/jsonplaceholder";
import { getRequestOrigin } from "@/lib/server/internalApi";
import { createServerClient } from "@repo/request/server";

async function getPosts(): Promise<Post[]> {
  const origin = await getRequestOrigin();
  const api = createServerClient(origin, { timeout: 8_000, withAuth: true });
  const res = await api.get<Post[]>("/api/posts?limit=20", { init: { cache: "no-store" } });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}

export default async function FeedPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="mt-1 text-sm text-zinc-600">
          该页面在服务端渲染时通过内部 API（/api/posts）拉取数据
        </p>
      </header>

      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="rounded-lg border border-zinc-200 p-4">
            <Link
              href={`/feed/${p.id}`}
              className="font-medium text-zinc-950 hover:underline"
            >
              {p.title}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{p.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}


