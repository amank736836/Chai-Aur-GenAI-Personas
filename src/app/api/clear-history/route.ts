import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { persona } = await req.json();
  // No-op: history is now managed on the frontend via cookies
  return NextResponse.json({ cleared: [] });
}
