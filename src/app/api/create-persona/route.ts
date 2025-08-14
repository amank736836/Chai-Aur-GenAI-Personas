import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getLLMResponse } from "@/lib/llm";

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  let handle = null;
  let personaName = name;
  const handleMatch = name.match(/@([\w.\-_]+)/);
  if (handleMatch) {
    handle = handleMatch[1];
    personaName = handle;
  }
  let publicProfiles: Record<string, any> = {};
  if (handle) {
    const platforms = [
      { key: "instagram", url: `https://instagram.com/${handle}` },
      { key: "twitter", url: `https://twitter.com/${handle}` },
      { key: "x", url: `https://x.com/${handle}` },
      { key: "facebook", url: `https://facebook.com/${handle}` },
      { key: "linkedin", url: `https://linkedin.com/in/${handle}` },
      { key: "medium", url: `https://medium.com/@${handle}` },
      { key: "hashnode", url: `https://${handle}.hashnode.dev` },
      { key: "peerlist", url: `https://peerlist.io/${handle}` },
      { key: "portfolio", url: `https://${handle}.me` },
      { key: "snapchat", url: `https://snapchat.com/add/${handle}` },
    ];
    publicProfiles = Object.fromEntries(platforms.map((p) => [p.key, p.url]));
    try {
      const githubRes = await fetch(`https://api.github.com/users/${handle}`);
      if (githubRes.ok) {
        const data = await githubRes.json();
        publicProfiles.github = {
          name: data.name,
          bio: data.bio,
          avatar_url: data.avatar_url,
          url: data.html_url,
        };
      }
      const twitterRes = await fetch(
        `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${handle}`
      );
      if (twitterRes.ok) {
        const data = await twitterRes.json();
        if (Array.isArray(data) && data[0]) {
          publicProfiles.twitter = {
            name: data[0].name,
            screen_name: data[0].screen_name,
            followers_count: data[0].followers_count,
            profile_image_url: data[0].profile_image_url,
            url: `https://twitter.com/${handle}`,
          };
        }
      }
      const instaRes = await fetch(
        `https://www.instagram.com/${handle}/?__a=1&__d=dis`
      );
      if (instaRes.ok) {
        const data = await instaRes.json();
        if (data.graphql && data.graphql.user) {
          const user = data.graphql.user;
          publicProfiles.instagram = {
            full_name: user.full_name,
            biography: user.biography,
            profile_pic_url: user.profile_pic_url,
            followers: user.edge_followed_by.count,
            url: `https://instagram.com/${handle}`,
          };
        }
      }
      publicProfiles.linkedin = {
        url: `https://linkedin.com/in/${handle}`,
      };
      publicProfiles.medium = {
        url: `https://medium.com/@${handle}`,
      };
    } catch {}
  }
  const personaKey = personaName.toLowerCase().replace(/\s+/g, "-");
  let introTemplates: string[] = [];
  try {
    const prompt = `You are an expert in analyzing public personalities. Generate a list of 10 unique, catchy, and authentic intro phrases or taglines that ${personaName} (the famous public figure, if known) might use to start a conversation, greet an audience, or introduce themselves. Each phrase should reflect their real-life style, language, and persona. Output as a JSON array of strings, Hindi/English/Hinglish as appropriate, no explanations.\nIf you have public profile data, use it to make the persona more realistic. Public profiles: ${JSON.stringify(
      publicProfiles
    )}`;
    const llmResponse = await getLLMResponse(prompt);
    const match = llmResponse.match(/\[[\s\S]*\]/);
    if (match) {
      introTemplates = JSON.parse(match[0]);
    } else {
      introTemplates = llmResponse
        .split(/\n|\r/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(introTemplates) || introTemplates.length < 3) {
      introTemplates = [
        `Hey, I'm ${personaName}!`,
        `Namaste, ${personaName} here!`,
        `Bhaiyo aur behno, ${personaName} bol raha hoon!`,
        `Listen up, it's ${personaName} speaking!`,
        `Aap sabko swagat hai, main hoon ${personaName}`,
      ];
    }
  } catch (e) {
    introTemplates = [
      `Hey, I'm ${personaName}!`,
      `Namaste, ${personaName} here!`,
      `Bhaiyo aur behno, ${personaName} bol raha hoon!`,
      `Listen up, it's ${personaName} speaking!`,
      `Aap sabko swagat hai, main hoon ${personaName}`,
    ];
  }
  const styleTemplates = [
    `Personalized style for ${name}`,
    "Conversational and informative",
    "Mix of English and Hinglish",
    "Direct and to the point",
    "Uses analogies and humor",
    "Prefers storytelling",
    "Motivational and energetic",
    "Casual, friendly, and relatable",
    "Loves to break down complex topics simply",
  ];
  function pickRandom<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    while (out.length < n && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }
  const toneData = {
    introPhrases: pickRandom(introTemplates, 7),
    styleNotes: pickRandom(styleTemplates, 3),
  };
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  fs.writeFileSync(
    path.join(dataDir, `${personaKey}-tone.json`),
    JSON.stringify(toneData, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(dataDir, `${personaKey}-history.json`),
    JSON.stringify([], null, 2),
    "utf-8"
  );
  return NextResponse.json({ success: true });
}
