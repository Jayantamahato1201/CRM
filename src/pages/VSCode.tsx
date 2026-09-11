import { useState, useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Blocks,
  Settings,
  ChevronRight,
  ChevronDown,
  FileCode2,
  FileJson,
  FileText,
  FilePlus,
  FolderPlus,
  RefreshCw,
  X,
  Terminal as TerminalIcon,
  PanelBottom,
  Circle,
  Check,
  AlertCircle,
  Bell,
  Zap,
} from 'lucide-react'
import { fileSystem, handleTerminalCommand, type FileNode } from '../lib/vscode-data'

// ---- Helpers ----

function getFileIcon(name: string) {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return FileCode2
  if (name.endsWith('.json')) return FileJson
  if (name.endsWith('.md') || name.endsWith('.css')) return FileText
  return FileCode2
}

function getFileColor(name: string) {
  if (name.endsWith('.tsx')) return 'text-cyan-400'
  if (name.endsWith('.ts')) return 'text-blue-400'
  if (name.endsWith('.json')) return 'text-amber-400'
  if (name.endsWith('.css')) return 'text-violet-400'
  if (name.endsWith('.md')) return 'text-slate-400'
  return 'text-slate-400'
}

function findFileByPath(nodes: FileNode[], path: string): FileNode | undefined {
  for (const node of nodes) {
    if (node.path === path && node.type === 'file') return node
    if (node.children) {
      const found = findFileByPath(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const node of nodes) {
    if (node.type === 'file') result.push(node)
    if (node.children) result.push(...flattenFiles(node.children))
  }
  return result
}

// ---- File Tree Node Component ----

function FileTreeNode({
  node,
  level,
  onFileOpen,
  activeFilePath,
}: {
  node: FileNode
  level: number
  onFileOpen: (file: FileNode) => void
  activeFilePath: string | null
}) {
  const [expanded, setExpanded] = useState(level < 2)

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1 px-2 py-0.5 text-left text-xs text-slate-300 transition hover:bg-slate-700/40"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
          <span className="text-cyan-400">{expanded ? '📂' : '📁'}</span>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        <AnimatePresence>
          {expanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {node.children
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
                  return a.name.localeCompare(b.name)
                })
                .map((child) => (
                  <FileTreeNode
                    key={child.path}
                    node={child}
                    level={level + 1}
                    onFileOpen={onFileOpen}
                    activeFilePath={activeFilePath}
                  />
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const Icon = getFileIcon(node.name)
  const isActive = activeFilePath === node.path
  return (
    <button
      onClick={() => onFileOpen(node)}
      className={`flex w-full items-center gap-1.5 px-2 py-0.5 text-left text-xs transition ${
        isActive ? 'bg-cyan-500/10 text-white' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
      }`}
      style={{ paddingLeft: `${level * 12 + 22}px` }}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${getFileColor(node.name)}`} />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

// ---- Main VS Code Component ----

interface OpenTab {
  path: string
  name: string
  content: string
  language: string
  dirty: boolean
}

interface TerminalLine {
  output: string
  type: 'output' | 'error' | 'command'
}

export function VSCode() {
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'git' | 'debug' | 'extensions'>('explorer')
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    { path: '/src/App.tsx', name: 'App.tsx', content: fileSystem[0].children?.find((c) => c.name === 'src')?.children?.find((c) => c.name === 'App.tsx')?.content || '', language: 'typescript', dirty: false },
  ])
  const [activeTab, setActiveTab] = useState<string | null>('/src/App.tsx')
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    '/src/App.tsx': fileSystem[0].children?.find((c) => c.name === 'src')?.children?.find((c) => c.name === 'App.tsx')?.content || '',
  })
  const [showTerminal, setShowTerminal] = useState(true)
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { output: 'PulseTrack Development Terminal', type: 'output' },
    { output: 'Type "help" for available commands', type: 'output' },
    { output: '', type: 'output' },
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const terminalInputRef = useRef<HTMLInputElement>(null)

  const currentTab = openTabs.find((t) => t.path === activeTab)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  function openFile(file: FileNode) {
    if (!file.content && !file.language) return

    if (openTabs.find((t) => t.path === file.path)) {
      setActiveTab(file.path)
      return
    }

    const content = file.content || ''
    if (!fileContents[file.path]) {
      setFileContents((prev) => ({ ...prev, [file.path]: content }))
    }

    setOpenTabs((prev) => [...prev, {
      path: file.path,
      name: file.name,
      content: fileContents[file.path] ?? content,
      language: file.language || 'plaintext',
      dirty: false,
    }])
    setActiveTab(file.path)
  }

  function closeTab(path: string, e: React.MouseEvent) {
    e.stopPropagation()
    const idx = openTabs.findIndex((t) => t.path === path)
    const newTabs = openTabs.filter((t) => t.path !== path)
    setOpenTabs(newTabs)
    if (activeTab === path) {
      setActiveTab(newTabs[Math.max(0, idx - 1)]?.path ?? null)
    }
  }

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!activeTab || !value) return
    setFileContents((prev) => ({ ...prev, [activeTab]: value }))
    setOpenTabs((prev) => prev.map((t) => t.path === activeTab ? { ...t, content: value, dirty: true } : t))
  }, [activeTab])

  function saveFile() {
    if (!activeTab) return
    setOpenTabs((prev) => prev.map((t) => t.path === activeTab ? { ...t, dirty: false } : t))
    setTerminalLines((prev) => [...prev, { output: `$ File saved: ${activeTab}`, type: 'command' }, { output: '', type: 'output' }])
  }

  function runTerminalCommand() {
    if (!terminalInput.trim()) return
    const results = handleTerminalCommand(terminalInput)
    if (terminalInput.trim() === 'clear') {
      setTerminalLines([])
    } else {
      setTerminalLines((prev) => [...prev, ...results, { output: '', type: 'output' }])
    }
    setTerminalInput('')
  }

  // Search in files
  const allFiles = flattenFiles(fileSystem)
  const searchResults = searchQuery
    ? allFiles.filter((f) => {
        if (!f.content) return false
        const lines = f.content.split('\n')
        return lines.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
      })
    : []

  // Command palette
  const commands = [
    { id: 'file.new', label: 'File: New File', icon: FilePlus },
    { id: 'file.save', label: 'File: Save', icon: Check },
    { id: 'terminal.toggle', label: 'Terminal: Toggle', icon: TerminalIcon },
    { id: 'view.explorer', label: 'View: Explorer', icon: Files },
    { id: 'view.search', label: 'View: Search', icon: Search },
    { id: 'view.git', label: 'View: Source Control', icon: GitBranch },
    { id: 'git.status', label: 'Git: Status', icon: GitBranch },
    { id: 'npm.dev', label: 'npm: Start Dev Server', icon: Zap },
    { id: 'npm.build', label: 'npm: Build Project', icon: Zap },
  ]
  const filteredCommands = commands.filter((c) => c.label.toLowerCase().includes(commandQuery.toLowerCase()))

  function executeCommand(cmdId: string) {
    switch (cmdId) {
      case 'file.save': saveFile(); break
      case 'terminal.toggle': setShowTerminal(!showTerminal); break
      case 'view.explorer': setActiveView('explorer'); break
      case 'view.search': setActiveView('search'); break
      case 'view.git': setActiveView('git'); break
      case 'npm.dev':
        setShowTerminal(true)
        setTerminalLines((prev) => [...prev, ...handleTerminalCommand('npm run dev'), { output: '', type: 'output' }])
        break
      case 'npm.build':
        setShowTerminal(true)
        setTerminalLines((prev) => [...prev, ...handleTerminalCommand('npm run build'), { output: '', type: 'output' }])
        break
    }
    setShowCommandPalette(false)
    setCommandQuery('')
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveFile()
      }
      if (e.key === '`' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowTerminal(!showTerminal)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [activeTab, showTerminal])

  const activityItems = [
    { id: 'explorer' as const, icon: Files, label: 'Explorer' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'git' as const, icon: GitBranch, label: 'Source Control' },
    { id: 'debug' as const, icon: Bug, label: 'Run & Debug' },
    { id: 'extensions' as const, icon: Blocks, label: 'Extensions' },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#1e1e1e]">
      {/* ===== Menu Bar ===== */}
      <div className="flex items-center gap-1 border-b border-slate-700/50 bg-[#252526] px-2 py-1 text-xs text-slate-400">
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">File</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Edit</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Selection</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">View</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Go</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Run</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Terminal</button>
        <button className="rounded px-2 py-0.5 hover:bg-slate-700/60">Help</button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-1 rounded bg-slate-700/40 px-2 py-0.5 text-slate-500 hover:bg-slate-700/60 hover:text-slate-300"
          >
            <Search className="h-3 w-3" /> Search files... (Ctrl+P)
          </button>
        </div>
      </div>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-slate-700/50 bg-[#333333] py-2">
          {activityItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
                activeView === item.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={item.label}
            >
              {activeView === item.id && (
                <span className="absolute left-0 h-6 w-0.5 rounded-r bg-cyan-400" />
              )}
              <item.icon className="h-5 w-5" />
            </button>
          ))}
          <div className="mt-auto">
            <button className="flex h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-300">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-64 shrink-0 border-r border-slate-700/50 bg-[#252526]">
          {activeView === 'explorer' && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Explorer
                <div className="flex items-center gap-1">
                  <button className="rounded p-1 hover:bg-slate-700/60" title="New File"><FilePlus className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1 hover:bg-slate-700/60" title="New Folder"><FolderPlus className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1 hover:bg-slate-700/60" title="Refresh"><RefreshCw className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-2">
                {fileSystem.map((node) => (
                  <FileTreeNode
                    key={node.path}
                    node={node}
                    level={0}
                    onFileOpen={openFile}
                    activeFilePath={activeTab}
                  />
                ))}
              </div>
            </div>
          )}

          {activeView === 'search' && (
            <div className="flex h-full flex-col">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Search</div>
              <div className="px-3">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in files..."
                  autoFocus
                  className="w-full rounded border border-slate-600 bg-[#3c3c3c] px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mt-2 flex-1 overflow-y-auto px-2">
                {searchQuery && searchResults.length === 0 && (
                  <p className="px-2 py-2 text-xs text-slate-500">No results found.</p>
                )}
                {searchResults.map((file) => {
                  const matchingLines = file.content!.split('\n')
                    .map((line, i) => ({ line, num: i + 1 }))
                    .filter((l) => l.line.toLowerCase().includes(searchQuery.toLowerCase()))
                  return (
                    <div key={file.path} className="mb-2">
                      <button
                        onClick={() => openFile(file)}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-700/40"
                      >
                        {getFileIcon(file.name) && <FileCode2 className={`h-3 w-3 ${getFileColor(file.name)}`} />}
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="text-slate-600">{matchingLines.length}</span>
                      </button>
                      {matchingLines.slice(0, 5).map((ml) => (
                        <button
                          key={ml.num}
                          onClick={() => openFile(file)}
                          className="block w-full truncate px-6 py-0.5 text-left text-[11px] text-slate-500 hover:bg-slate-700/40"
                        >
                          {ml.line.trim().slice(0, 60)}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeView === 'git' && (
            <div className="flex h-full flex-col">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Source Control</div>
              <div className="px-3 py-1">
                <input
                  placeholder="Message (Ctrl+Enter to commit)"
                  className="w-full rounded border border-slate-600 bg-[#3c3c3c] px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button className="mx-3 mt-2 rounded bg-cyan-600/80 py-1.5 text-xs font-medium text-white hover:bg-cyan-600">
                ✓ Commit
              </button>
              <div className="mt-4 px-3 text-[11px] font-semibold uppercase text-slate-500">Changes (3)</div>
              <div className="mt-1 flex-1 overflow-y-auto">
                {[
                  { name: 'Dashboard.tsx', path: '/src/pages/Dashboard.tsx', status: 'M' },
                  { name: 'auth.tsx', path: '/src/lib/auth.tsx', status: 'M' },
                  { name: 'api.ts', path: '/src/lib/api.ts', status: 'U' },
                ].map((f) => (
                  <button
                    key={f.path}
                    onClick={() => {
                      const file = findFileByPath(fileSystem, f.path)
                      if (file) openFile(file)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700/40"
                  >
                    <span className={`font-bold ${f.status === 'M' ? 'text-amber-400' : 'text-emerald-400'}`}>{f.status}</span>
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-700/50 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>main</span>
                  <span className="text-slate-600">↑0 ↓0</span>
                </div>
              </div>
            </div>
          )}

          {activeView === 'debug' && (
            <div className="flex h-full flex-col">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Run & Debug</div>
              <div className="px-3 py-4">
                <button className="flex w-full items-center justify-center gap-2 rounded bg-cyan-600/80 py-2 text-xs font-medium text-white hover:bg-cyan-600">
                  <Bug className="h-3.5 w-3.5" /> Run and Debug
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  To customize Run and Debug, create a launch.json file.
                </p>
              </div>
              <div className="border-t border-slate-700/50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Breakpoints</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Circle className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                    App.tsx:15
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Circle className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                    auth.tsx:28
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'extensions' && (
            <div className="flex h-full flex-col">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Extensions</div>
              <div className="px-3 py-1">
                <input
                  placeholder="Search Extensions"
                  className="w-full rounded border border-slate-600 bg-[#3c3c3c] px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="mt-2 flex-1 overflow-y-auto">
                {[
                  { name: 'Prettier', desc: 'Code formatter', author: 'Prettier', installed: true },
                  { name: 'ESLint', desc: 'Integrates ESLint', author: 'Microsoft', installed: true },
                  { name: 'GitLens', desc: 'Supercharge Git', author: 'GitKraken', installed: false },
                  { name: 'Tailwind CSS', desc: 'IntelliSense for Tailwind', author: 'Tailwind Labs', installed: true },
                  { name: 'Monaco', desc: 'Editor integration', author: 'Microsoft', installed: true },
                  { name: 'Error Lens', desc: 'Highlight errors', author: 'Alexander', installed: false },
                ].map((ext) => (
                  <div key={ext.name} className="flex items-start gap-2 px-3 py-2 hover:bg-slate-700/40">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400">
                      <Blocks className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200">{ext.name}</p>
                      <p className="truncate text-[10px] text-slate-500">{ext.desc}</p>
                      <p className="text-[10px] text-slate-600">{ext.author}</p>
                    </div>
                    {ext.installed ? (
                      <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-400">Installed</span>
                    ) : (
                      <button className="shrink-0 rounded bg-cyan-600/80 px-2 py-0.5 text-[9px] text-white hover:bg-cyan-600">Install</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center bg-[#252526]">
            <div className="flex flex-1 overflow-x-auto">
              {openTabs.map((tab) => {
                const Icon = getFileIcon(tab.name)
                return (
                  <div
                    key={tab.path}
                    onClick={() => setActiveTab(tab.path)}
                    className={`group flex cursor-pointer items-center gap-2 border-r border-slate-700/50 px-3 py-2 text-xs transition ${
                      activeTab === tab.path
                        ? 'bg-[#1e1e1e] text-white'
                        : 'bg-[#2d2d2d] text-slate-400 hover:bg-[#252526]'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${getFileColor(tab.name)}`} />
                    <span className="whitespace-nowrap">{tab.name}</span>
                    {tab.dirty && <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />}
                    <button
                      onClick={(e) => closeTab(tab.path, e)}
                      className="ml-1 rounded p-0.5 opacity-0 hover:bg-slate-600 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-1 px-2">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className={`rounded p-1.5 transition hover:bg-slate-700/60 ${showTerminal ? 'text-cyan-400' : 'text-slate-500'}`}
                title="Toggle Terminal (Ctrl+`)"
              >
                <PanelBottom className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
            {currentTab ? (
              <Editor
                height="100%"
                language={currentTab.language}
                value={fileContents[currentTab.path] ?? currentTab.content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                  fontLigatures: true,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  lineNumbers: 'on',
                  renderWhitespace: 'selection',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  wordWrap: 'off',
                  padding: { top: 10 },
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <FileCode2 className="mx-auto h-16 w-16 text-slate-700" />
                  <p className="mt-4 text-sm text-slate-600">Open a file to start editing</p>
                  <p className="mt-1 text-xs text-slate-700">Select a file from the Explorer sidebar</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '260px' }}
                exit={{ height: 0 }}
                className="shrink-0 overflow-hidden border-t border-slate-700/50 bg-[#1e1e1e]"
              >
                <div className="flex h-full flex-col">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-1 bg-[#252526] px-2 py-1">
                    <div className="flex items-center gap-3 px-2 text-xs">
                      <button className="flex items-center gap-1.5 border-b-2 border-cyan-400 py-1 text-white">
                        <TerminalIcon className="h-3.5 w-3.5" /> Terminal
                      </button>
                      <button className="py-1 text-slate-500 hover:text-slate-300">Problems</button>
                      <button className="py-1 text-slate-500 hover:text-slate-300">Output</button>
                      <button className="py-1 text-slate-500 hover:text-slate-300">Debug Console</button>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <select className="rounded bg-[#3c3c3c] px-2 py-0.5 text-[10px] text-slate-400 focus:outline-none">
                        <option>zsh - pulsetrack</option>
                        <option>bash - pulsetrack</option>
                        <option>node - pulsetrack</option>
                      </select>
                      <button onClick={() => setTerminalLines([])} className="rounded p-1 text-slate-500 hover:bg-slate-700/60" title="Clear">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setShowTerminal(false)} className="rounded p-1 text-slate-500 hover:bg-slate-700/60" title="Close">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Terminal Output */}
                  <div
                    className="flex-1 cursor-text overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
                    onClick={() => terminalInputRef.current?.focus()}
                  >
                    {terminalLines.map((line, i) => (
                      <div
                        key={i}
                        className={line.type === 'error' ? 'text-rose-400' : line.type === 'command' ? 'text-slate-300' : 'text-slate-400'}
                      >
                        {line.output || '\u00A0'}
                      </div>
                    ))}
                    {/* Input line */}
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">❯</span>
                      <input
                        ref={terminalInputRef}
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runTerminalCommand()}
                        className="flex-1 bg-transparent font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                        placeholder="Type a command... (try: help, ls, npm run dev, git status)"
                        autoFocus
                      />
                    </div>
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Status Bar ===== */}
      <div className="flex items-center gap-3 bg-[#007acc] px-3 py-0.5 text-[11px] text-white">
        <button className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
          <GitBranch className="h-3.5 w-3.5" /> main
        </button>
        <button className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
          <RefreshCw className="h-3.5 w-3.5" /> 0↑ 0↓
        </button>
        <button className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
          <AlertCircle className="h-3.5 w-3.5" /> 0
          <Circle className="h-2.5 w-2.5 fill-amber-300 text-amber-300" /> 0
        </button>
        <div className="ml-auto flex items-center gap-3">
          <button className="hover:bg-white/10 px-1.5 py-0.5 rounded">Ln 1, Col 1</button>
          <button className="hover:bg-white/10 px-1.5 py-0.5 rounded">Spaces: 2</button>
          <button className="hover:bg-white/10 px-1.5 py-0.5 rounded">UTF-8</button>
          <button className="hover:bg-white/10 px-1.5 py-0.5 rounded">{currentTab?.language || 'plaintext'}</button>
          <button className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded">
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ===== Command Palette ===== */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommandPalette(false)}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-16"
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-600 bg-[#252526] shadow-2xl"
            >
              <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredCommands[0]) executeCommand(filteredCommands[0].id)
                  }}
                  placeholder="Type a command or search..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
                <kbd className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-cyan-500/15 hover:text-white"
                  >
                    <cmd.icon className="h-4 w-4 text-slate-500" />
                    {cmd.label}
                  </button>
                ))}
                {filteredCommands.length === 0 && (
                  <p className="px-3 py-2 text-sm text-slate-500">No matching commands</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
