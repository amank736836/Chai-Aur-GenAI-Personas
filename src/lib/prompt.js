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

export function buildPrompt(persona, userMessage, displayName, history = []) {
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

  promptBody += `User: ${userMessage}\nReply as if you are ${personaShort}, keeping the tone authentic, but do NOT start with greetings or generic openers. Answer the user's question directly, using your unique style and accent only to add flavor to the answer.`;
  return promptBody;
}
