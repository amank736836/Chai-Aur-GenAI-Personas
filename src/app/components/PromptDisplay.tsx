import React from "react";

type PromptDisplayProps = {
    lastPrompt: string;
};

export default function PromptDisplay({ lastPrompt }: PromptDisplayProps) {
    if (!lastPrompt) return null;
    return (
        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-100 via-pink-100 to-blue-100/80 border border-yellow-300 rounded-xl text-sm text-gray-900 dark:text-gray-100 shadow-lg backdrop-blur-md bg-opacity-80 whitespace-pre-wrap max-h-40 overflow-auto font-mono" style={{ wordBreak: 'break-word' }}>
            <b className="text-yellow-700 dark:text-yellow-300">Prompt sent to AI:</b>
            <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100 text-xs font-mono">{lastPrompt}</pre>
        </div>
    );
}
