import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Sparkles } from 'lucide-react';

export function SyntaxBlock({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normLang = language.toLowerCase();
  const isRunnable = normLang === 'excel' || normLang === 'sql';

  const handleTryIt = () => {
    const params = new URLSearchParams({
      tool: normLang,
      code: code.trim(),
    });
    navigate(`/sandbox?${params.toString()}`);
  };

  return (
    <div className="relative group rounded-lg bg-zinc-950 overflow-hidden my-4 border border-border/50">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-white/10">
        <span className="text-xs font-mono text-zinc-400 uppercase">{language}</span>
        <div className="flex items-center gap-1.5">
          {isRunnable && (
            <button
              type="button"
              onClick={handleTryIt}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
              title="Thực hành ngay trong Sandbox (Try it Yourself)"
            >
              <Sparkles className="size-3" />
              <span>Thử ngay</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Sao chép code"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-zinc-50 leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
