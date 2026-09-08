import React from "react";
import { useTypedCode } from "@/hooks/useTypedCode";

interface MiniTerminalProps {
  lines: string[];
}

const MiniTerminal: React.FC<MiniTerminalProps> = ({ lines }) => {
  const { output, done } = useTypedCode(lines ?? []);

  if (!lines || lines.length === 0) return null;

  return (
    <div className="mx-auto mt-4 max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-[#0d1117]/80 shadow-2xl backdrop-blur-xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-white/40 font-mono">terminal</span>
      </div>
      {/* Code area */}
      <div className="p-4 font-mono text-sm leading-relaxed text-emerald-400/90">
        {output.map((line, i) => (
          <div key={i} className="min-h-[1.5em]">
            <span className="mr-2 select-none text-white/25">$</span>
            {line}
            {!done && i === output.findIndex((l, idx) => idx >= output.length - 1 || output[idx + 1] === "") && (
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-emerald-400/80" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniTerminal;
