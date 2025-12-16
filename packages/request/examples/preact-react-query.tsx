/**
 * Preact + @tanstack/react-query 使用示例
 *
 * 前提：你需要在构建工具里把 react/react-dom alias 到 preact/compat
 * 例如 Vite:
 * resolve: { alias: { react: "preact/compat", "react-dom": "preact/compat" } }
 */

import { createBrowserClient, useRequest } from "@repo/request/client";

const client = createBrowserClient("/api");

export function ItemsList() {
  const { data, isLoading } = useRequest(["items"], () => client.get<Array<{ id: string; title: string }>>("/items"));

  if (isLoading) return <div>Loading...</div>;
  if (!data?.ok) return <pre>{JSON.stringify(data, null, 2)}</pre>;

  return (
    <ul>
      {data.data.map((i) => (
        <li key={i.id}>{i.title}</li>
      ))}
    </ul>
  );
}


