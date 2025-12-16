import { createBrowserClient, useRequest } from "@repo/request/client";

const client = createBrowserClient("/api", { timeout: 10_000 });

export function UserCard(props: { id: string }) {
  const { data, isLoading, error } = useRequest(["user", props.id], () =>
    client.get<{ id: string; name: string }>(`/user/${props.id}`)
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  if (!data?.ok) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <div>
      <div>User: {data.data.name}</div>
    </div>
  );
}


