"use client";
type PersonaTone = Record<string, unknown>;
import React, { useState } from "react";
function renderTextWithLinks(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (urlRegex.test(part)) {
            return <span key={i} className="inline-flex items-center gap-1"><CopyableLink url={part} /><VisitButton url={part} /></span>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
}

function VisitButton({ url }: { url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-2 py-1 rounded border border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
            title="Visit link"
        >
            Visit
        </a>
    );
}

function CopyableLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <span className="inline-flex items-center gap-1">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all hover:text-blue-800"
            >
                {url}
            </a>
            <button
                className={`ml-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 hover:bg-blue-100 focus:bg-blue-200 transition-colors flex items-center group ${copied ? 'border-green-400 bg-green-100' : ''}`}
                onClick={handleCopy}
                title="Copy link"
                type="button"
            >
                {copied ? (
                    <span className="text-green-600 text-xs font-semibold">Copied!</span>
                ) : (
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                )}
            </button>
        </span>
    );
}

type ChatMessage =
    | { role: "user"; text: string }
    | ({ role: "compare"; hitesh?: string; piyush?: string } & { [key: string]: string | undefined });

export type ChatAreaPersona = 'both' | 'hitesh' | 'piyush' | 'custom';
type ChatAreaProps = {
    persona: ChatAreaPersona;
    customName: string;
    customReady: boolean;
    creatingPersona: boolean;
    chat: ChatMessage[];
    chatDivRef: React.RefObject<HTMLDivElement>;
    chatEndRef: React.RefObject<HTMLDivElement>;
    firstAIResponseRef: React.RefObject<HTMLDivElement>;
    atTop: boolean;
    atBottom: boolean;
    scrollUp: () => void;
    scrollDown: () => void;
    customImage: string;
    defaultCustomImage: string;
    personaTone?: PersonaTone;
};

const personaImages: Record<string, string> = {
    hitesh: "https://yt3.ggpht.com/a/AGF-l7-GpYFwHDMQVXkOcO3Ra8bIoZhhiU3oluiJBw=s900-c-k-c0xffffffff-no-rj-mo",
    piyush: "https://www.piyushgarg.dev/_next/image?url=%2Fimages%2Favatar.png&w=256&q=75",
};

export default function ChatArea({
    persona,
    customName,
    customReady,
    creatingPersona,
    chat,
    chatDivRef,
    chatEndRef,
    firstAIResponseRef,
    atTop,
    atBottom,
    scrollUp,
    scrollDown,
    customImage,
    defaultCustomImage,
}: ChatAreaProps) {
    return (
        <div className="relative mb-6 min-h-[320px] w-full max-w-6xl border-0 rounded-3xl p-8 bg-white/80 dark:bg-zinc-900/80 shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[60vh] glassmorphic hide-scrollbar" style={{ color: '#18181b' }} ref={chatDivRef}>

            <div className="fixed right-6 bottom-32 flex flex-col gap-3 z-30">
                {!atTop && (
                    <button
                        onClick={scrollUp}
                        className="bg-white/80 hover:bg-white/100 text-gray-700 rounded-full shadow-lg p-2 transition-all border border-gray-200"
                        title="Scroll Up"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                )}
                <button
                    onClick={() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className={`bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full shadow-lg p-2 transition-all border border-blue-400 ${!atBottom ? 'animate-bounce' : ''}`}
                    title="Go to Latest Response"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {!atBottom && (
                    <button
                        onClick={scrollDown}
                        className="bg-white/80 hover:bg-white/100 text-gray-700 rounded-full shadow-lg p-2 transition-all border border-gray-200"
                        title="Scroll Down"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            {persona === "custom" && !customReady ? (
                <div className="text-center text-gray-500">
                    {creatingPersona ? (
                        <span className="text-lg font-semibold animate-pulse">Creating persona for <b className="text-green-700">{customName}</b>... Please wait.</span>
                    ) : null}
                </div>
            ) : chat.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-300 text-center text-lg font-semibold">Start the conversation!</div>
            ) : (
                chat.map((c, i) => {
                    if (c.role === "user") {
                        return (
                            <div key={i} className="flex items-start gap-2 mb-2">
                                <p className="text-blue-900 dark:text-blue-200 bg-white/90 dark:bg-blue-900/70 rounded-2xl px-5 py-3 shadow-md max-w-2xl font-medium backdrop-blur-md text-base leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                    <span className="font-bold">👤 You:</span> {c.text}
                                </p>
                            </div>
                        );
                    } else if (c.role === "compare") {

                        const isLast = i === chat.length - 1;
                        return (
                            <div key={i} className="flex flex-col md:flex-row gap-6 mb-6">
                                {persona === "both" ? (
                                    <>
                                        <div className="flex-1 bg-gradient-to-br from-blue-300/80 via-cyan-100/80 to-blue-100/90 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-cyan-900/80 rounded-2xl p-4 flex items-start gap-3 border-2 border-blue-400 shadow-2xl backdrop-blur-xl ring-1 ring-blue-300/40">
                                            <img src={personaImages.hitesh} alt="Hitesh Choudhary" className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover bg-white shadow" />
                                            <div>
                                                <b className="text-blue-900 dark:text-blue-200 text-lg">Hitesh:</b>
                                                <span className="text-green-800 dark:text-green-300 ml-2 font-semibold text-base leading-relaxed break-words selection:bg-blue-200 selection:text-blue-900">{c.hitesh && renderTextWithLinks(c.hitesh)}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gradient-to-br from-purple-300/80 via-pink-100/80 to-purple-100/90 dark:from-purple-900/80 dark:via-purple-800/70 dark:to-pink-900/80 rounded-2xl p-4 flex items-start gap-3 border-2 border-purple-400 shadow-2xl backdrop-blur-xl ring-1 ring-purple-300/40">
                                            <img src={personaImages.piyush} alt="Piyush Garg" className="w-10 h-10 rounded-full border-2 border-purple-400 object-cover bg-white shadow" />
                                            <div>
                                                <b className="text-purple-900 dark:text-purple-200 text-lg">Piyush:</b>
                                                <span className="text-green-800 dark:text-green-300 ml-2 font-semibold text-base leading-relaxed break-words selection:bg-purple-200 selection:text-purple-900">{c.piyush && renderTextWithLinks(c.piyush)}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : <>
                                    {persona === "hitesh" && (
                                        <div ref={isLast ? firstAIResponseRef : undefined} className="flex-1 bg-gradient-to-br from-blue-300/80 via-cyan-100/80 to-blue-100/90 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-cyan-900/80 rounded-2xl p-4 flex items-start gap-3 border-2 border-blue-400 shadow-2xl backdrop-blur-xl ring-1 ring-blue-300/40">
                                            <img src={personaImages.hitesh} alt="Hitesh Choudhary" className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover bg-white shadow" />
                                            <div>
                                                <b className="text-blue-900 dark:text-blue-200 text-lg">Hitesh:</b>
                                                <span className="text-green-800 dark:text-green-300 ml-2 font-semibold text-base leading-relaxed break-words selection:bg-blue-200 selection:text-blue-900">{c.hitesh && renderTextWithLinks(c.hitesh)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {persona === "piyush" && (
                                        <div className="flex-1 bg-gradient-to-br from-purple-300/80 via-pink-100/80 to-purple-100/90 dark:from-purple-900/80 dark:via-purple-800/70 dark:to-pink-900/80 rounded-2xl p-4 flex items-start gap-3 border-2 border-purple-400 shadow-2xl backdrop-blur-xl ring-1 ring-purple-300/40">
                                            <img src={personaImages.piyush} alt="Piyush Garg" className="w-10 h-10 rounded-full border-2 border-purple-400 object-cover bg-white shadow" />
                                            <div>
                                                <b className="text-purple-900 dark:text-purple-200 text-lg">Piyush:</b>
                                                <span className="text-green-800 dark:text-green-300 ml-2 font-semibold text-base leading-relaxed break-words selection:bg-purple-200 selection:text-purple-900">{c.piyush && renderTextWithLinks(c.piyush)}</span>
                                            </div>
                                        </div>
                                    )}
                                </>}
                                {persona === "custom" && customName && c[customName] && (
                                    <div ref={isLast ? firstAIResponseRef : undefined} className="flex-1 bg-gradient-to-br from-green-300/80 via-lime-100/80 to-green-100/90 dark:from-green-900/80 dark:via-green-800/70 dark:to-lime-900/80 rounded-2xl p-4 flex items-start gap-3 border-2 border-green-400 shadow-2xl backdrop-blur-xl ring-1 ring-green-300/40">
                                        <img src={customImage} alt={customName} className="w-10 h-10 rounded-full border-2 border-green-400 object-cover bg-white shadow" onError={e => { (e.target as HTMLImageElement).src = defaultCustomImage; }} />
                                        <div>
                                            <b className="text-green-900 dark:text-green-200 text-lg">{customName}:</b>
                                            <span className="text-green-800 dark:text-green-300 ml-2 font-semibold text-base leading-relaxed break-words selection:bg-green-200 selection:text-green-900">{c[customName] && renderTextWithLinks(c[customName])}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })
            )}
            <div ref={chatEndRef} />
        </div>
    );
}
