import { getLLMResponse } from "@/lib/llm";
import { buildPrompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";

function getHistoryFromCookies(
  req: NextRequest,
  persona: string,
  customName?: string
) {
  const cookieHeader = req.headers.get("cookie") || "";
  let cookieName = "";
  if (persona === "custom" && customName) {
    cookieName = `chatHistory-${customName.toLowerCase().replace(/\s+/g, "-")}`;
  } else if (
    persona === "hitesh" ||
    persona === "piyush" ||
    persona === "both"
  ) {
    cookieName = `chatHistory-${persona}`;
  }
  const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  if (match && match[1]) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {}
  }
  return [];
}

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

  if (personaKey.startsWith("@")) {
    personaKey = personaKey.slice(1);
  }

  let history = getHistoryFromCookies(req, persona, customName);
  if (!Array.isArray(history)) history = [];
  history.push({ role: "user", content: message });

  try {
    if (persona === "hitesh" || persona === "piyush" || persona === "both") {
      const prevHistory = history.slice(0, -1);
      let replyHitesh = null;
      let replyPiyush = null;
      let newHistory: { role: string; content: string }[] = [];
      if (persona === "both") {
        const promptHitesh = buildPrompt("hitesh", message, "", prevHistory);
        const promptPiyush = buildPrompt("piyush", message, "", prevHistory);
        [replyHitesh, replyPiyush] = await Promise.all([
          getLLMResponse(promptHitesh),
          getLLMResponse(promptPiyush),
        ]);
        newHistory = [
          ...prevHistory,
          { role: "user", content: message },
          { role: "assistant", content: replyHitesh },
        ];
      } else if (persona === "hitesh") {
        const promptHitesh = buildPrompt("hitesh", message, "", prevHistory);
        replyHitesh = await getLLMResponse(promptHitesh);
        newHistory = [
          ...prevHistory,
          { role: "user", content: message },
          { role: "assistant", content: replyHitesh },
        ];
      } else if (persona === "piyush") {
        const promptPiyush = buildPrompt("piyush", message, "", prevHistory);
        replyPiyush = await getLLMResponse(promptPiyush);
        newHistory = [
          ...prevHistory,
          { role: "user", content: message },
          { role: "assistant", content: replyPiyush },
        ];
      }
      const res = NextResponse.json({
        hitesh: replyHitesh,
        piyush: replyPiyush,
        history: newHistory,
      });
      let cookieName = `chatHistory-${persona}`;
      if (persona === "both") cookieName = "chatHistory-both";
      res.headers.set(
        "Set-Cookie",
        `${cookieName}=${encodeURIComponent(
          JSON.stringify(newHistory)
        )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      );
      return res;
    } else {
      const prevHistory = history.slice(0, -1);
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies: Record<string, string> = {};
      cookieHeader.split(";").forEach((pair) => {
        const idx = pair.indexOf("=");
        if (idx > -1) {
          const key = pair.slice(0, idx).trim();
          const val = pair.slice(idx + 1).trim();
          cookies[key] = val;
        }
      });
      let workingLinks: { key: string; url: string }[] | undefined = undefined;
      if (personaKey.startsWith("@")) {
        const username = personaKey.replace(/^@/, "");
        const platforms: { key: string; url: string }[] = [
          { key: "instagram", url: `https://www.instagram.com/${username}/` },
          { key: "twitter", url: `https://twitter.com/${username}` },
          { key: "x", url: `https://x.com/${username}` },
          { key: "github", url: `https://github.com/${username}` },
          { key: "facebook", url: `https://facebook.com/${username}` },
          { key: "hashnode", url: `https://hashnode.com/@${username}` },
          { key: "medium", url: `https://medium.com/@${username}` },
          { key: "peerlist", url: `https://peerlist.io/${username}` },
          { key: "reddit", url: `https://www.reddit.com/user/${username}` },
          { key: "youtube", url: `https://www.youtube.com/@${username}` },
        ];
        const checkedLinks: { key: string; url: string }[] = [];
        await Promise.all(
          platforms.map(async (p) => {
            try {
              const resp = await fetch(p.url, { method: "HEAD" });
              if (resp.ok) checkedLinks.push(p);
            } catch {}
          })
        );
        workingLinks = checkedLinks.length > 0 ? checkedLinks : undefined;
      }
      const promptCustom = buildPrompt(
        personaKey,
        message,
        customName,
        prevHistory,
        cookies,
        workingLinks as { key: string; url: string }[] | undefined
      );
      const replyCustom = await getLLMResponse(promptCustom);
      const newHistory = [
        ...prevHistory,
        { role: "user", content: message },
        { role: "assistant", content: replyCustom },
      ];
      const res = NextResponse.json({
        custom: replyCustom,
        history: newHistory,
      });
      if (customName) {
        const cookieName = `chatHistory-${customName
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        res.headers.set(
          "Set-Cookie",
          `${cookieName}=${encodeURIComponent(
            JSON.stringify(newHistory)
          )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        );
      }
      return res;
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
