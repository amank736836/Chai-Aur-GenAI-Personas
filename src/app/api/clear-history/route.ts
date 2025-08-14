import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { persona } = await req.json();
  const dataDir = path.join(process.cwd(), "data");
  const cleared: string[] = []; // Use const for cleared
  if (persona && persona !== "all") {
    const file = path.join(dataDir, `${persona}-history.json`);
    if (fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2), "utf-8");
      cleared.push(persona);
    }
  } else {
    const files = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith("-history.json"));
    for (const f of files) {
      fs.writeFileSync(
        path.join(dataDir, f),
        JSON.stringify([], null, 2),
        "utf-8"
      );
      cleared.push(f.replace("-history.json", ""));
    }
  }
  return NextResponse.json({ cleared });
}
