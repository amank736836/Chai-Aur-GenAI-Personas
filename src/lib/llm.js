import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function getLLMResponse(prompt) {
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    });
    return text;
  } catch (err) {
    if (isRateLimitError(err)) {
      try {
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
        });
        return text;
      } catch (err2) {
        throw new Error("All LLM providers failed: " + (err2?.message || err2));
      }
    } else {
      throw err;
    }
  }
}

function isRateLimitError(err) {
  if (!err) return false;
  const msg = err.message || "";
  return (
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("429") ||
    msg.includes("TPD")
  );
}
