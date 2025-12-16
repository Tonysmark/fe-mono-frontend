import { NextResponse } from "next/server";
import { fetchPostById } from "@/lib/server/jsonplaceholder";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const num = Number.parseInt(id, 10);
  if (!Number.isFinite(num)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }
  const post = await fetchPostById(num);
  console.log(`json 👉`,post)
  return NextResponse.json(post);
}


