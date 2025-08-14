"use client";
import { useState, useRef, useEffect } from "react";
import PersonaSelector from "./components/PersonaSelector";
import PromptDisplay from "./components/PromptDisplay";
import CustomPersonaInput from "./components/CustomPersonaInput";
import ChatArea from "./components/ChatArea";
import MessageInput from "./components/MessageInput";

function useScrollHelpers() {
  const chatDivRef = useRef<HTMLDivElement>(null!);
  const [atBottom, setAtBottom] = useState(true);
  const [atTop, setAtTop] = useState(true);


  useEffect(() => {
    const chatDiv = chatDivRef.current;
    if (!chatDiv) return;
    const handleScroll = () => {
      const isAtBottom = chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < 10;
      setAtBottom(isAtBottom);
      setAtTop(chatDiv.scrollTop < 10);
    };
    chatDiv.addEventListener('scroll', handleScroll);

    handleScroll();
    return () => chatDiv.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollUp = () => {
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop -= 200;
    }
  };
  const scrollDown = () => {
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop += 200;
    }
  };
  return { chatDivRef, atBottom, atTop, scrollUp, scrollDown, setAtBottom };
}


type ChatMessage =
  | { role: "user"; text: string }
  | { role: "compare"; hitesh?: string; piyush?: string;[key: string]: string | undefined };

const defaultCustomImage = "/file.svg";



export default function Home() {
  const [persona, setPersonaState] = useState<'both' | 'hitesh' | 'piyush' | 'custom'>('both');
  const [customName, setCustomName] = useState("");
  const [customReady, setCustomReady] = useState(false);
  const [creatingPersona, setCreatingPersona] = useState(false);
  const [customImage, setCustomImage] = useState<string>(defaultCustomImage);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const setPersona = (p: 'both' | 'hitesh' | 'piyush' | 'custom') => {
    setPersonaState(p);
    setChat([]);
  };
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [thinking, setThinking] = useState(false);
  const [dotCount, setDotCount] = useState(1);


  useEffect(() => {
    if (!thinking) return;
    let dir = 1;
    const interval = setInterval(() => {
      setDotCount((prev) => {
        if (prev === 3) dir = -1;
        if (prev === 1) dir = 1;
        return prev + dir;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [thinking]);
  const chatEndRef = useRef<HTMLDivElement>(null!);
  const firstAIResponseRef = useRef<HTMLDivElement>(null!);

  const { chatDivRef, atBottom, atTop, scrollUp, scrollDown, setAtBottom } = useScrollHelpers();

  useEffect(() => {

    if (firstAIResponseRef.current) {
      firstAIResponseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    setAtBottom(true);
  }, [chat, setAtBottom]);


  useEffect(() => {
    const handleBeforeUnload = () => {

      const url = "/api/clear-history";
      const data = JSON.stringify({ persona: "all" });
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {

        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  async function createCustomPersona() {
    if (!customName.trim()) return;
    setCreatingPersona(true);
    setCustomReady(false);
    setCustomImage(defaultCustomImage);

    await fetch("/api/create-persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: customName }),
    });

    let imageUrl = defaultCustomImage;
    try {
      const imgRes = await fetch("/api/fetch-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customName }),
      });
      const imgData = await imgRes.json();
      if (imgData.image) {

        const headRes = await fetch(imgData.image, { method: "HEAD" });
        const size = headRes.headers.get("content-length");
        if (!size || parseInt(size) < 500000) {
          imageUrl = imgData.image;
        }
      }
    } catch { }
    setCustomImage(imageUrl);
    setTimeout(() => {
      setCreatingPersona(false);
      setCustomReady(true);
    }, 2000);
  }

  async function sendMessage() {
    if (!message.trim()) return;
    if (persona === "custom" && !customReady) return;
    setThinking(true);

    const dots = '.'.repeat(dotCount);
    if (persona === "custom") {
      setChat([
        ...chat,
        { role: "user", text: message },
        { role: "compare", hitesh: "", piyush: "", [customName]: `${customName} is thinking${dots}` },
      ]);
    } else {
      setChat([
        ...chat,
        { role: "user", text: message },
        { role: "compare", hitesh: persona === "hitesh" || persona === "piyush" ? `Hitesh is thinking${dots}` : "", piyush: persona === "hitesh" || persona === "piyush" ? `Piyush is thinking${dots}` : "" },
      ]);
    }
    try {
      const promptRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, persona: persona === "custom" ? customName.toLowerCase().replace(/\s+/g, "-") : persona, customName, debugPrompt: true }),
      });
      let data = null;
      try {
        data = await promptRes.json();
      } catch {
        setThinking(false);
        setChat([
          ...chat,
          { role: "user", text: message },
          { role: "compare", hitesh: "Sorry, there was a problem with the response.", piyush: "Sorry, there was a problem with the response." },
        ]);
        setMessage("");
        setLastPrompt("");
        return;
      }
      if (data?.rateLimit) {
        setThinking(false);
        setChat([
          ...chat,
          { role: "user", text: message },
          { role: "compare", hitesh: data.error, piyush: data.error },
        ]);
        setMessage("");
        return;
      }
      if (data.prompt) setLastPrompt(data.prompt);
      if (!promptRes.ok || (!data.hitesh && !data.piyush && !data.custom)) {
        setThinking(false);
        setChat([
          ...chat,
          { role: "user", text: message },
          { role: "compare", hitesh: data?.error || "Sorry, something went wrong.", piyush: data?.error || "Sorry, something went wrong." },
        ]);
        setMessage("");
        return;
      }
      if (persona === "custom") {
        setChat([
          ...chat,
          { role: "user", text: message },
          { role: "compare", hitesh: "", piyush: "", [customName]: data.custom },
        ]);
      } else {
        setChat([
          ...chat,
          { role: "user", text: message },
          { role: "compare", hitesh: data.hitesh, piyush: data.piyush },
        ]);
      }
      setDotCount(1);
      setMessage("");
      setThinking(false);
      setDotCount(1);
    } catch {
      setThinking(false);
      setDotCount(1);
      setChat([
        ...chat,
        { role: "user", text: message },
        { role: "compare", hitesh: "Network error.", piyush: "Network error." },
      ]);
      setMessage("");
      setLastPrompt("");
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center font-sans bg-gradient-to-br from-[#a1c4fd] via-[#c2e9fb] to-[#fbc2eb] dark:from-gray-900 dark:to-gray-800 transition-all">
      <h1
        className="text-6xl md:text-7xl font-black mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400 animate-gradient-x drop-shadow-[0_4px_32px_rgba(99,102,241,0.25)] tracking-tight select-none relative"
        style={{
          WebkitTextStroke: '2px #fff',
          textShadow: '0 2px 24px #a5b4fc, 0 1px 0 #fff',
        }}
      >
        <span className="inline-block animate-gradient-x bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent">Persona <span className="font-extrabold">LLM</span> <span className="font-black">Chat</span></span>
      </h1>
      <PersonaSelector
        persona={persona}
        setPersona={setPersona}
        customImage={customImage}
        defaultCustomImage={defaultCustomImage}
        setCustomName={setCustomName}
      />

      <PromptDisplay lastPrompt={lastPrompt} />
      <ChatArea
        persona={persona}
        customName={customName}
        customReady={customReady}
        creatingPersona={creatingPersona}
        chat={chat}
        chatDivRef={chatDivRef}
        chatEndRef={chatEndRef}
        firstAIResponseRef={firstAIResponseRef}
        atTop={atTop}
        atBottom={atBottom}
        scrollUp={scrollUp}
        scrollDown={scrollDown}
        customImage={customImage}
        defaultCustomImage={defaultCustomImage}
      />

      {persona === "custom" && !customReady && (
        <CustomPersonaInput
          customName={customName}
          setCustomName={setCustomName}
          creatingPersona={creatingPersona}
          createCustomPersona={createCustomPersona}
          customReady={customReady}
        />
      )}
      <MessageInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        thinking={thinking}
        persona={persona}
        customReady={customReady}
        creatingPersona={creatingPersona}
      />
    </div>
  );
}

