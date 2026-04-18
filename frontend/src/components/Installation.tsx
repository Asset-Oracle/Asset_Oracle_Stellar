import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// One Dark or Atom Dark are very close to your screenshot's theme
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy } from "react-icons/fi"; // bun add react-icons
import { useState } from "react";
interface JsCodeSnippetProps {
  code: string;
}
export default function InstallationSnippet({ code }: JsCodeSnippetProps) {
  return (
    <div className="relative group rounded-lg overflow-hidden bg-[#0B1221] border border-white/5 shadow-lg max-w-full">
      {/* Copy Button - Positioned exactly like your screenshot */}
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-4 right-4 p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-all opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        <FiCopy size={18} />
      </button>

      <div className="p-1 sm:p-1 overflow-x-auto max-w-full">
        <SyntaxHighlighter
          language="javascript"
          style={atomDark}
          customStyle={{
            background: "transparent",
            padding: "1rem",
            fontSize: "0.875rem", // text-sm
            lineHeight: "1.5",
            fontFamily: "JetBrains Mono, Fira Code, monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
