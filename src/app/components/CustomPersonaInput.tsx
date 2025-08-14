import React from "react";

type CustomPersonaInputProps = {
    customName: string;
    setCustomName: (name: string) => void;
    creatingPersona: boolean;
    createCustomPersona: () => void;
    customReady: boolean;
};

export default function CustomPersonaInput({ customName, setCustomName, creatingPersona, createCustomPersona, customReady }: CustomPersonaInputProps) {
    if (customReady) return null;
    return (
        <div className="text-center text-gray-500">
            {creatingPersona ? (
                <span className="text-lg font-semibold animate-pulse">Creating persona for <b className="text-green-700">{customName}</b>... Please wait.</span>
            ) : (
                <>
                    <input
                        className="border-2 border-green-400 rounded-xl p-3 mr-2 bg-white/70 focus:ring-2 focus:ring-green-400 transition-all shadow-md" style={{ width: 'calc(32rem + 10px)' }}
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="Enter any person's name or @username (example: @amank736836)"
                        disabled={creatingPersona}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !creatingPersona && customName.trim()) {
                                createCustomPersona();
                            }
                        }}
                    />
                    <button
                        className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-xl font-bold shadow-lg hover:from-green-500 hover:to-blue-500 transition-all"
                        onClick={createCustomPersona}
                        disabled={creatingPersona || !customName.trim()}
                    >
                        Create Persona
                    </button>
                </>
            )}
        </div>
    );
}
