import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { persona } = await req.json();
  return NextResponse.json({ cleared: [] });
}
