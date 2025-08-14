import React from "react";

type MessageInputProps = {
    message: string;
    setMessage: (msg: string) => void;
    sendMessage: () => void;
    thinking: boolean;
    persona: 'hitesh' | 'piyush' | 'custom' | 'both';
    customReady: boolean;
    creatingPersona: boolean;
};

export default function MessageInput({ message, setMessage, sendMessage, thinking, persona, customReady, creatingPersona }: MessageInputProps) {
    return (
        <div className="flex w-full max-w-4xl gap-4 mt-6">
            <input
                className="flex-1 border-2 border-blue-400 rounded-2xl p-4 text-lg focus:ring-2 focus:ring-blue-400 bg-white/90 dark:bg-zinc-900/80 text-gray-900 dark:text-gray-100 shadow-lg transition-all backdrop-blur-md placeholder-gray-500 dark:placeholder-gray-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
                onKeyDown={(e) => { if (e.key === 'Enter' && !thinking) sendMessage(); }}
                disabled={thinking || (persona === "custom" && (!customReady || creatingPersona))}
                style={{ caretColor: '#6366f1' }}
            />
            <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={sendMessage}
                disabled={thinking || (persona === "custom" && (!customReady || creatingPersona))}
            >
                {thinking ? 'Waiting...' : 'Send'}
            </button>
        </div>
    );
}
