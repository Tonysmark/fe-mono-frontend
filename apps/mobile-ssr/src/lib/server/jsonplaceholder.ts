import { createServerClient } from "@repo/request/server";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const API_ORIGIN = "https://jsonplaceholder.typicode.com";

const api = createServerClient(API_ORIGIN, {
  // 访问第三方公开 API，不需要透传 cookies/token
  withAuth: false,
  timeout: 8_000,
});

export async function fetchPosts(limit = 20): Promise<Post[]> {
  const res = await api.get<Post[]>("/posts", { init: { cache: "no-store" } });
  if (!res.ok) throw new Error(res.error.message);
  return res.data.slice(0, limit);
}

export async function fetchPostById(id: number): Promise<Post> {
  const res = await api.get<Post>(`/posts/${id}`, { init: { cache: "no-store" } });
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}


