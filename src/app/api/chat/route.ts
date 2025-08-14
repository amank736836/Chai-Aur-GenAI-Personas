import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { getLLMResponse } from "@/lib/llm";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, persona = "hitesh", customName } = body;
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  let personaKey =
    persona === "custom" && customName
      ? customName.toLowerCase().replace(/\s+/g, "-")
      : persona;
  // Remove leading @ from personaKey if present
  if (personaKey.startsWith("@")) {
    personaKey = personaKey.slice(1);
  }

  const dataDir = path.join(process.cwd(), "data");
  const historyPath = path.join(dataDir, `${personaKey}-history.json`);
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    } catch {
      history = [];
    }
  }
  history.push({ role: "user", content: message });

  try {
    if (persona === "hitesh" || persona === "piyush") {
      const prevHistory = history.slice(0, -1);
      const promptHitesh = buildPrompt(
        "hitesh",
        message,
        undefined,
        prevHistory
      );
      const promptPiyush = buildPrompt(
        "piyush",
        message,
        undefined,
        prevHistory
      );
      const [replyHitesh, replyPiyush] = await Promise.all([
        getLLMResponse(promptHitesh),
        getLLMResponse(promptPiyush),
      ]);

      const newHistory = [
        ...prevHistory,
        { role: "user", content: message },
        { role: "assistant", content: replyHitesh },
      ];
      fs.writeFileSync(
        path.join(dataDir, `hitesh-history.json`),
        JSON.stringify(newHistory, null, 2),
        "utf-8"
      );
      fs.writeFileSync(
        path.join(dataDir, `piyush-history.json`),
        JSON.stringify(newHistory, null, 2),
        "utf-8"
      );
      return NextResponse.json({
        hitesh: replyHitesh,
        piyush: replyPiyush,
        history: newHistory,
      });
    } else {
      const prevHistory = history.slice(0, -1);
      const promptCustom = buildPrompt(
        personaKey,
        message,
        customName,
        prevHistory
      );
      const replyCustom = await getLLMResponse(promptCustom);
      const newHistory = [
        ...prevHistory,
        { role: "user", content: message },
        { role: "assistant", content: replyCustom },
      ];
      fs.writeFileSync(
        historyPath,
        JSON.stringify(newHistory, null, 2),
        "utf-8"
      );
      return NextResponse.json({
        custom: replyCustom,
        history: newHistory,
      });
    }
  } catch (err: unknown) {
    console.error("API /api/chat error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("rate limit") ||
      msg.includes("quota") ||
      msg.includes("TPD") ||
      msg.includes("overloaded")
    ) {
      return NextResponse.json(
        {
          error:
            "All LLM providers are currently rate-limited or overloaded. Please try again in a few minutes.",
          rateLimit: true,
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: msg || "Unknown error" },
      { status: 500 }
    );
  }
}
