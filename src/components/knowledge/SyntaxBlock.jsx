import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function SyntaxBlock({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg bg-zinc-950 overflow-hidden my-4 border border-border/50">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-white/10">
        <span className="text-xs font-mono text-zinc-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Sao chép code"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-zinc-50 leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
