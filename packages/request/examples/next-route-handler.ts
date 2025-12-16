import { NextResponse } from "next/server";
import { createServerClient } from "@repo/request/server";

// Next.js Route Handler 示例（app router）
// GET /api/proxy-user
export async function GET() {
  const api = createServerClient("https://api.example.com", {
    withAuth: true,
    timeout: 8_000,
  });

  const res = await api.get<{ id: string; name: string }>("/user");

  if (!res.ok) {
    return NextResponse.json(res, { status: res.status || 500 });
  }

  return NextResponse.json(res, { status: 200 });
}


