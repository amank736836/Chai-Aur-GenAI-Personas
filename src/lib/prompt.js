import fs from "fs";
import path from "path";

const lastUsed = {};
function pickRandomNoRepeat(arr, n, persona, key) {
  if (!arr || arr.length === 0) return [];
  let last = (lastUsed[persona] && lastUsed[persona][key]) || [];
  let pool = arr.filter((x) => !last.includes(x));
  if (pool.length < n) {
    pool = arr.slice();
    if (last.length > 0) {
      pool = pool.filter((x) => x !== last[0]);
      if (pool.length === 0) pool = arr.slice();
    }
  }
  const out = [];
  const used = [];
  while (out.length < n && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    used.push(pool[idx]);
    pool.splice(idx, 1);
  }
  lastUsed[persona] = lastUsed[persona] || {};
  lastUsed[persona][key] = out.length > 0 ? [out[0]] : [];
  return out;
}

/**
 * @param {string} persona
 * @param {string} userMessage
 * @param {string} displayName
 * @param {Array} history
 * @param {Object | undefined} cookies
 * @param {Array<{key: string, url: string}> | undefined} workingLinks
 */
export function buildPrompt(
  persona,
  userMessage,
  displayName,
  history = [],
  cookies = undefined,
  workingLinks = undefined
) {
  function getCookiePersonaTone(persona) {
    if (!persona) return null;
    const cookieName = `personaData-${persona
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    if (cookies && cookies[cookieName]) {
      try {
        const data =
          typeof cookies[cookieName] === "string"
            ? JSON.parse(decodeURIComponent(cookies[cookieName]))
            : cookies[cookieName];
        if (data && data.tone) return data;
      } catch {}
    }
    return null;
  }
  // Helper: If persona is @username and user asks for a link, add explicit instruction
  function getLinkInstructions(persona, userMessage, workingLinks) {
    // For built-in personas, always include all links from tone JSON if present
    if (["hitesh", "piyush", "both"].includes(persona)) {
      // Try to load links from toneData if available
      if (toneData && toneData.links && Array.isArray(toneData.links)) {
        let instructions = "";
        for (const p of toneData.links) {
          instructions += `\nIf the user asks for your ${p.key} link, always reply with: ${p.url} (just the direct link, no extra text).`;
        }
        return instructions;
      }
      return "";
    }
    // For custom personas, use only workingLinks if provided
    if (!persona) return "";
    const username = persona.replace(/^@/, "");
    const lowerMsg = userMessage.toLowerCase();
    const platforms = workingLinks || [
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
    let instructions = "";
    for (const p of platforms) {
      if (
        (lowerMsg.includes(p.key) && lowerMsg.match(/link|url/)) ||
        lowerMsg.match(new RegExp(`${p.key}.*(link|url)`)) ||
        lowerMsg.match(new RegExp(`(link|url).*${p.key}`))
      ) {
        instructions += `\nIf the user asks for your ${p.key} link, always reply with: ${p.url} (just the direct link, no extra text).`;
      }
    }
    return instructions;
  }
  let toneData;
  let personaDisplay = displayName;
  let personaShort = displayName;
  if (persona === "both") {
    const hiteshPath = path.join(process.cwd(), "data", `hitesh-tone.json`);
    const piyushPath = path.join(process.cwd(), "data", `piyush-tone.json`);
    const hiteshData = JSON.parse(fs.readFileSync(hiteshPath, "utf-8"));
    const piyushData = JSON.parse(fs.readFileSync(piyushPath, "utf-8"));
    toneData = {
      styleNotes: [
        ...(hiteshData.styleNotes || []),
        ...(piyushData.styleNotes || []),
      ],
      introPhrases: [
        ...(hiteshData.introPhrases || []),
        ...(piyushData.introPhrases || []),
      ],
      signatureLines: [
        ...(hiteshData.signatureLines || []),
        ...(piyushData.signatureLines || []),
      ],
      signatureQuotes: [
        ...(hiteshData.signatureQuotes || []),
        ...(piyushData.signatureQuotes || []),
      ],
    };
    personaDisplay = "HiPi";
    personaShort = "HiPi";
  } else if (
    persona !== "hitesh" &&
    persona !== "piyush" &&
    persona !== "both"
  ) {
    let cookieTone = getCookiePersonaTone(persona);
    if (cookieTone && cookieTone.tone) {
      toneData = cookieTone.tone;
      personaDisplay = cookieTone.name || displayName || persona;
      personaShort = cookieTone.name || displayName || persona;
    } else {
      toneData = {
        styleNotes: [],
        introPhrases: [],
        signatureLines: [],
        signatureQuotes: [],
      };
      personaDisplay = displayName || persona;
      personaShort = displayName || persona;
    }
  } else {
    const toneDataPath = path.join(
      process.cwd(),
      "data",
      `${persona}-tone.json`
    );
    toneData = JSON.parse(fs.readFileSync(toneDataPath, "utf-8"));
    personaDisplay =
      displayName ||
      (persona === "hitesh"
        ? "Hitesh Choudhary"
        : persona === "piyush"
        ? "Piyush Garg"
        : persona);
    personaShort =
      displayName ||
      (persona === "hitesh"
        ? "Hitesh"
        : persona === "piyush"
        ? "Piyush"
        : persona);
  }

  let signatureLines =
    toneData.signatureLines || toneData.signatureQuotes || [];
  if (signatureLines && signatureLines.length > 1) {
    signatureLines = pickRandomNoRepeat(
      signatureLines,
      1,
      persona,
      "signature"
    );
  }

  let historyText = "";
  if (Array.isArray(history) && history.length > 0) {
    historyText = history
      .map((msg) => {
        if (msg.role === "user") return `User: ${msg.content}`;
        if (msg.role === "assistant") return `${personaShort}: ${msg.content}`;
        return "";
      })
      .join("\n");
  }

  let promptBody = `You are acting as ${personaDisplay}.
Tone guidelines:
${toneData.styleNotes.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Common phrases to use (for accent, not for greetings):
${(Array.isArray(toneData.introPhrases) ? toneData.introPhrases : []).join(
  ", "
)}
${signatureLines.length ? `\nSignature: ${signatureLines.join(", ")}` : ""}

${historyText}
`;

  promptBody += getLinkInstructions(persona, userMessage, workingLinks);

  promptBody += `User: ${userMessage}\nReply as if you are ${personaShort}, keeping the tone authentic, but do NOT start with greetings or generic openers. Answer the user's question directly, using your unique style and accent only to add flavor to the answer.`;
  return promptBody;
}
