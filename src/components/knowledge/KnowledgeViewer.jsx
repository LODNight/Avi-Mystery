import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SyntaxBlock } from './SyntaxBlock.jsx';

export function KnowledgeViewer({ markdown }) {
  if (!markdown) return null;

  return (
    <div className="prose prose-amber dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            if (!inline && (match || codeString.includes('\n'))) {
              return (
                <SyntaxBlock
                  code={codeString}
                  language={match ? match[1] : 'text'}
                />
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-muted text-amber-600 dark:text-amber-400 font-mono text-xs md:text-sm font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return <h1 className="text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4 pb-2 border-b border-border/60 text-foreground">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h4>;
          },
          p({ children }) {
            return <p className="my-4 leading-relaxed text-foreground/90">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-4 space-y-1.5 text-foreground/90">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-4 space-y-1.5 text-foreground/90">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-amber-500/60 pl-4 py-1 my-4 italic text-muted-foreground bg-amber-500/5 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border text-sm text-left">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/60 font-semibold text-foreground">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-3 text-xs uppercase tracking-wider font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2.5 whitespace-nowrap text-sm border-t border-border/40">{children}</td>;
          },
          tr({ children }) {
            return <tr className="hover:bg-muted/30 transition-colors">{children}</tr>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
