import { NextResponse } from "next/server";
import { fetchPosts } from "@/lib/server/jsonplaceholder";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;
  const posts = await fetchPosts(Number.isFinite(limit) ? limit : 20);
  return NextResponse.json(posts);
}


