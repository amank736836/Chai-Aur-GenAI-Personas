export function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

export function getCookie(name: string): string | null {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = btoa(String.fromCharCode(...hashArray));
  return hashString;
}

import type { ChatMessage } from "../page";

export async function saveChatToCookieWithData(chat: ChatMessage[]) {
  const json = JSON.stringify(chat);
  setCookie("chatHistory", `${btoa(json)}`);
}

export function loadChatFromCookie(): ChatMessage[] | null {
  const val = getCookie("chatHistory");
  if (!val) return null;
  const [hash, encoded] = val.split("|");
  if (!encoded) return null;
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
