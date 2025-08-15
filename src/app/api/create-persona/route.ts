import { getLLMResponse } from "@/lib/llm";
import { NextRequest, NextResponse } from "next/server";

async function fetchPublicProfile(username: string) {
  const platforms = [
    { name: "Instagram", url: `https://www.instagram.com/${username}/` },
    { name: "YouTube", url: `https://www.youtube.com/@${username}` },
    { name: "Twitter", url: `https://twitter.com/${username}` },
    { name: "X", url: `https://x.com/${username}` },
    { name: "GitHub", url: `https://github.com/${username}` },
    { name: "Facebook", url: `https://facebook.com/${username}` },
    { name: "Hashnode", url: `https://hashnode.com/@${username}` },
    { name: "Medium", url: `https://medium.com/@${username}` },
    { name: "Peerlist", url: `https://peerlist.io/${username}` },
    { name: "Reddit", url: `https://www.reddit.com/user/${username}` },
  ];
  let info = "";
  for (const platform of platforms) {
    try {
      const res = await fetch(platform.url, { method: "GET" });
      if (res.ok) {
        const text = await res.text();
        const descMatch = text.match(
          /<meta name="description" content="([^"]+)"/i
        );
        if (descMatch && descMatch[1]) {
          info += `\n${platform.name} bio: ${descMatch[1]}`;
        } else {
          info += `\n${platform.name} profile found.`;
        }
      }
    } catch {}
  }
  return info;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, ...rest } = body;
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const cookieName = `personaData-${name.toLowerCase().replace(/\s+/g, "-")}`;
  let existingTone = "";
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  if (match && match[1]) {
    try {
      const personaDataFromCookie = JSON.parse(decodeURIComponent(match[1]));
      if (personaDataFromCookie.tone) {
        existingTone = personaDataFromCookie.tone;
      }
    } catch {}
  }
  let tone = existingTone;
  if (!tone) {
    let publicInfo = "";
    let username = name;
    if (name.startsWith("@")) {
      username = name.slice(1);
      publicInfo = await fetchPublicProfile(username);
    }
    try {
      const prompt = `Analyze the public persona, communication style, and online presence of "${name}".${
        publicInfo ? "\nPublic info:" + publicInfo : ""
      }\nWrite a detailed, in-depth description of their tone, personality, and unique conversational traits, suitable for use as a prompt for an AI chatbot. Be specific and insightful.`;
      tone = await getLLMResponse(prompt);
    } catch (e) {
      tone = "";
    }
  }
  const personaData = { name, tone, ...rest };
  const res = NextResponse.json({ success: true, tone });
  res.headers.set(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(
      JSON.stringify(personaData)
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
  return res;
}
