import React, { useState, useMemo } from 'react'
import {
  Table,
  Columns,
  Key,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  Database,
  Eye,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export function SchemaBrowser({
  schema = null,
  isLoading = false,
  error = null,
  onCopyIdentifier = null,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTables, setExpandedTables] = useState({})
  const [activeTab, setActiveTab] = useState({}) // { [tableName]: 'columns' | 'sample' }
  const [copiedText, setCopiedText] = useState(null)

  // Filter tables & columns based on search term and hide internal sqlite tables
  const visibleTables = useMemo(() => {
    if (!schema?.tables) return []

    const query = searchTerm.toLowerCase().trim()
    return schema.tables
      .filter((table) => !table.name.startsWith('sqlite_'))
      .filter((table) => {
        if (!query) return true
        const tableNameMatches = table.name.toLowerCase().includes(query)
        const columnMatches = table.columns?.some((col) =>
          col.name.toLowerCase().includes(query)
        )
        return tableNameMatches || columnMatches
      })
  }, [schema, searchTerm])

  const toggleExpand = (tableName) => {
    setExpandedTables((prev) => {
      const currentState = prev[tableName] ?? true
      return {
        ...prev,
        [tableName]: !currentState,
      }
    })
  }

  const handleCopy = (text, type = 'table') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setCopiedText(text)
    if (onCopyIdentifier) {
      onCopyIdentifier(text, type)
    }
    setTimeout(() => {
      setCopiedText((current) => (current === text ? null : current))
    }, 1500)
  }

  const toggleTab = (tableName, tab) => {
    setActiveTab((prev) => ({
      ...prev,
      [tableName]: tab,
    }))
  }

  if (isLoading) {
    return (
      <div
        className={`p-4 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl border border-amber-500/20 animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-amber-500 animate-spin" />
          <div className="h-5 bg-amber-500/20 rounded w-32"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-amber-500/10 rounded-lg"></div>
          <div className="h-12 bg-amber-500/10 rounded-lg"></div>
          <div className="h-12 bg-amber-500/10 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`p-4 bg-red-500/10 dark:bg-red-950/20 rounded-xl border border-red-500/30 text-red-700 dark:text-red-300 ${className}`}
      >
        <div className="flex items-center gap-2 font-medium mb-1">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>Không thể tải Cơ sở dữ liệu</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 pl-7">
          {error.message || 'Đã có lỗi xảy ra khi đọc cấu trúc Schema.'}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col h-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm ${className}`}
      data-testid="schema-browser"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-amber-500/5 dark:bg-stone-900/80">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
              Sơ Đồ Cơ Sở Dữ Liệu
            </h3>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {visibleTables.length} Bảng
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên bảng hoặc tên cột..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-stone-400"
            aria-label="Tìm kiếm bảng hoặc cột"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {visibleTables.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Table className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {searchTerm ? 'Không tìm thấy bảng hoặc cột phù hợp' : 'Chưa có bảng dữ liệu nào'}
            </p>
          </div>
        ) : (
          visibleTables.map((table) => {
            const isExpanded = searchTerm.trim()
              ? true
              : (expandedTables[table.name] ?? true) // auto-expand on search
            const currentTab = activeTab[table.name] || 'columns'

            return (
              <div
                key={table.name}
                className="border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950/50 overflow-hidden transition-colors"
                data-testid={`table-node-${table.name}`}
              >
                {/* Table Header Row */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`Bảng ${table.name}`}
                  className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-stone-100/70 dark:hover:bg-stone-900/80 transition-colors group select-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  onClick={() => toggleExpand(table.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(table.name)
                    }
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <Table className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold text-xs text-stone-800 dark:text-stone-200 truncate">
                      {table.name}
                    </span>
                    <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono">
                      {table.columns?.length || 0} cột
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(table.name, 'table')
                    }}
                    title="Sao chép tên bảng"
                    className="p-1 rounded text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    {copiedText === table.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Table Details */}
                {isExpanded && (
                  <div className="border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center border-b border-stone-100 dark:border-stone-800/80 px-2 py-1 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleTab(table.name, 'columns')}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors ${
                          currentTab === 'columns'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        <Columns className="w-3 h-3" />
                        Danh Sách Cột
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTab(table.name, 'sample')}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded font-medium transition-colors ${
                          currentTab === 'sample'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        Xem Mẫu (3 Hàng)
                      </button>
                    </div>

                    {/* Tab Content: Columns List */}
                    {currentTab === 'columns' && (
                      <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
                        {table.columns?.map((column) => (
                          <div
                            key={column.name}
                            className="flex items-center justify-between px-3 py-1.5 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-colors group/col text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {column.primaryKey ? (
                                <Key className="w-3 h-3 text-amber-500 shrink-0" title="Khóa chính (PK)" />
                              ) : (
                                <div className="w-3 h-3 shrink-0" />
                              )}
                              <span className="font-mono text-stone-700 dark:text-stone-300 font-medium truncate">
                                {column.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                {column.type}
                              </span>
                              {!column.nullable && (
                                <span
                                  className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded"
                                  title="Không được để trống (NOT NULL)"
                                >
                                  REQ
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopy(column.name, 'column')}
                                title={`Sao chép tên cột ${column.name}`}
                                className="p-0.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors opacity-0 group-hover/col:opacity-100 focus:opacity-100"
                              >
                                {copiedText === column.name ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab Content: Sample Rows */}
                    {currentTab === 'sample' && (
                      <div className="p-2 overflow-x-auto">
                        {!table.sampleRows || table.sampleRows.length === 0 ? (
                          <div className="py-4 text-center text-xs text-stone-400">
                            Không có hàng mẫu cho bảng này
                          </div>
                        ) : (
                          <table className="w-full text-left text-[11px] font-mono border-collapse">
                            <thead>
                              <tr className="bg-stone-200/50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400">
                                {table.columns?.map((col) => (
                                  <th key={col.name} className="px-2 py-1 font-semibold border-b border-stone-200 dark:border-stone-800">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.sampleRows.map((row, rowIdx) => (
                                <tr
                                  key={rowIdx}
                                  className="border-b border-stone-100 dark:border-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800/40"
                                >
                                  {row.map((val, colIdx) => (
                                    <td key={colIdx} className="px-2 py-1 whitespace-nowrap text-stone-700 dark:text-stone-300">
                                      {val === null ? (
                                        <span className="italic text-stone-400 text-[10px]">NULL</span>
                                      ) : (
                                        String(val)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
