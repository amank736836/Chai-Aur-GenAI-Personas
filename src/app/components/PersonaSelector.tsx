import React from "react";

type PersonaSelectorProps = {
    persona: 'both' | 'hitesh' | 'piyush' | 'custom';
    setPersona: (p: 'both' | 'hitesh' | 'piyush' | 'custom') => void;
    customImage: string;
    defaultCustomImage: string;
    setCustomName: (name: string) => void;
};

const personaImages: Record<string, string> = {
    hitesh: "https://yt3.ggpht.com/a/AGF-l7-GpYFwHDMQVXkOcO3Ra8bIoZhhiU3oluiJBw=s900-c-k-c0xffffffff-no-rj-mo",
    piyush: "https://www.piyushgarg.dev/_next/image?url=%2Fimages%2Favatar.png&w=256&q=75",
};

export default function PersonaSelector({ persona, setPersona, customImage, defaultCustomImage }: PersonaSelectorProps) {
    return (
        <div className="flex items-center gap-10 mb-8 w-full justify-center">
            <button
                className={`flex flex-col items-center focus:outline-none ${persona === "both" ? "ring-2 ring-cyan-400" : ""}`}
                onClick={() => setPersona("both")}
            >
                <div className="flex gap-1">
                    <img
                        src={personaImages.hitesh}
                        alt="Hitesh Choudhary"
                        className="w-8 h-8 rounded-full border-2 border-blue-400 shadow-md object-cover bg-white persona-roll-hover"
                    />
                    <img
                        src={personaImages.piyush}
                        alt="Piyush Garg"
                        className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-md object-cover bg-white persona-roll-hover"
                    />
                </div>
                <span className="mt-2 font-semibold text-cyan-700 dark:text-cyan-200">HiPi</span>
            </button>
            <button
                className={`flex flex-col items-center focus:outline-none ${persona === "hitesh" ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => setPersona("hitesh")}
            >
                <img
                    src={personaImages.hitesh}
                    alt="Hitesh Choudhary"
                    className="w-16 h-16 rounded-full border-2 border-blue-400 shadow-md object-cover bg-white persona-roll-hover"
                />
                <span className="mt-2 font-semibold text-blue-700 dark:text-blue-200">Hitesh</span>
            </button>
            <button
                className={`flex flex-col items-center focus:outline-none ${persona === "piyush" ? "ring-2 ring-purple-400" : ""}`}
                onClick={() => setPersona("piyush")}
            >
                <img
                    src={personaImages.piyush}
                    alt="Piyush Garg"
                    className="w-16 h-16 rounded-full border-2 border-purple-400 shadow-md object-cover bg-white persona-roll-hover"
                />
                <span className="mt-2 font-semibold text-purple-700 dark:text-purple-200">Piyush</span>
            </button>
            <button
                className={`flex flex-col items-center focus:outline-none ${persona === "custom" ? "ring-2 ring-green-400" : ""}`}
                onClick={() => setPersona("custom")}
            >
                <img
                    src={customImage}
                    alt="Custom Persona"
                    className="w-16 h-16 rounded-full border-2 border-green-400 shadow-md object-cover bg-white persona-roll-hover"
                    onError={e => { (e.target as HTMLImageElement).src = defaultCustomImage; }}
                />
                <span className="mt-2 font-semibold text-green-700 dark:text-green-200">Custom</span>
            </button>
        </div>
    );
}
