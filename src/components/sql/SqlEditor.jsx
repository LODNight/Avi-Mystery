import React, { useRef } from 'react'
import { Play, RotateCcw, Code2, Sparkles } from 'lucide-react'

function renderSqlLine(line) {
  if (!line) return <span>&nbsp;</span>

  if (/^\s*--/.test(line)) {
    return <span className="text-emerald-700 dark:text-emerald-400/90 italic font-normal">{line}</span>
  }

  const regex = /(\b(?:SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|ON|AS|DISTINCT|AND|OR|NOT|IN|IS|NULL|LIKE|WITH|UNION|ALL|SUM|COUNT|AVG|MIN|MAX)\b|'[^']*'|"[^"]*"|\b\d+\b|--.*$)/gi

  const parts = line.split(regex)

  return parts.map((part, idx) => {
    if (!part) return null

    if (/^--.*$/.test(part)) {
      return <span key={idx} className="text-emerald-700 dark:text-emerald-400/90 italic font-normal">{part}</span>
    }
    if (/^'[^']*'|"([^"]*)"$/.test(part)) {
      return <span key={idx} className="text-emerald-800 dark:text-emerald-300 font-semibold">{part}</span>
    }
    if (/^\d+$/.test(part)) {
      return <span key={idx} className="text-purple-700 dark:text-purple-400 font-semibold">{part}</span>
    }
    if (/^(SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|ON|AS|DISTINCT|AND|OR|NOT|IN|IS|NULL|LIKE|WITH|UNION|ALL|SUM|COUNT|AVG|MIN|MAX)$/i.test(part)) {
      return <span key={idx} className="text-blue-700 dark:text-cyan-400 font-bold tracking-wide">{part.toUpperCase()}</span>
    }

    return <span key={idx} className="text-stone-900 dark:text-stone-100">{part}</span>
  })
}

export function SqlEditor({
  value = '',
  onChange,
  onRun,
  onReset,
  disabled = false,
  isRunning = false,
  className = '',
}) {
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    // 1. Ctrl+Enter or Cmd+Enter to Run query
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!disabled && !isRunning && onRun) {
        onRun()
      }
      return
    }

    // 2. Tab key handling for soft 2-space indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)

      if (onChange) {
        onChange(newValue)
      }

      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const lines = value.split('\n')
  const lineCount = lines.length

  return (
    <div className={`flex flex-col rounded-3xl border border-stone-200 dark:border-stone-800 bg-card shadow-sm overflow-hidden ${className}`}>
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 bg-stone-100/60 dark:bg-stone-900/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Code2 className="size-4 text-amber-600 dark:text-cyan-400" />
          <span>Trình soạn thảo SQL</span>
          <span className="font-mono text-[10px] text-muted-foreground font-normal">
            ({lineCount} {lineCount === 1 ? 'dòng' : 'dòng'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled || isRunning}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-background px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
              title="Đặt lại về câu lệnh mẫu ban đầu"
              aria-label="Đặt lại mã SQL"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRun}
            disabled={disabled || isRunning || !value.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-amber-950 font-extrabold px-4 py-1.5 text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Chạy phím tắt (Ctrl + Enter)"
            aria-label="Chạy câu lệnh SQL"
          >
            <Play className={`size-3.5 fill-current text-amber-950 ${isRunning ? 'animate-spin' : ''}`} />
            <span className="text-amber-950">{isRunning ? 'Đang thực thi...' : 'Chạy truy vấn'}</span>
            <kbd className="hidden md:inline-block rounded bg-amber-950/15 dark:bg-amber-950/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-950 font-bold">
              Ctrl + ↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Code Textarea Area with Line Numbers preview & Syntax Highlight overlay */}
      <div className="relative flex-1 min-h-[18rem] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono text-sm leading-6 flex overflow-hidden">
        {/* Line Numbers Column */}
        <div className="select-none py-4 pl-3 pr-2 text-right text-stone-400 dark:text-stone-600 bg-stone-100/80 dark:bg-stone-900/50 text-xs font-mono border-r border-stone-200 dark:border-stone-800/80 min-w-[2.5rem] shrink-0">
          {Array.from({ length: Math.max(lineCount, 8) }).map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor Layer (Overlay + Textarea) */}
        <div className="relative flex-1 overflow-hidden">
          {/* Syntax Highlight Overlay */}
          <div
            className="absolute inset-0 p-4 pointer-events-none whitespace-pre font-mono text-sm leading-6 select-none overflow-hidden"
            aria-hidden="true"
          >
            {lines.map((line, i) => (
              <div key={i} className="h-6 leading-6">
                {renderSqlLine(line)}
              </div>
            ))}
          </div>

          {/* Textarea Code Input */}
          <textarea
            ref={textareaRef}
            id="sql-query-editor"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isRunning}
            aria-label="Khung soạn thảo câu lệnh SQL"
            placeholder="-- Nhập câu lệnh SQL tại đây (Ví dụ: SELECT * FROM sales;)"
            spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-amber-600 dark:caret-amber-400 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 selection:bg-amber-500/20 dark:selection:bg-amber-500/30 overflow-auto"
          />
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800/80 bg-stone-100/40 dark:bg-stone-900/30 px-4 py-2 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3 text-amber-500" />
          <span>Mẹo: Dùng phím Tab để lề dòng 2 khoảng trắng.</span>
        </div>
        <div>
          <span>{value.length} ký tự</span>
        </div>
      </div>
    </div>
  )
}
