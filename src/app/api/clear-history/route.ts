import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { persona } = await req.json();
  return NextResponse.json({ cleared: [] });
}
