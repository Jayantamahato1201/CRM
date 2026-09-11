import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Users,
  ArrowLeft,
  Paperclip,
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Download,
} from 'lucide-react'
import { Card } from '../components/ui'
import { chatConversations, formatTimeAgo } from '../lib/data'
import type { ChatConversation, ChatMessage, ChatAttachment } from '../lib/types'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getAttachmentIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type.startsWith('text/') || type.includes('document') || type.includes('pdf')) return FileText
  return File
}

export function Chat() {
  const [conversations, setConversations] = useState<ChatConversation[]>(chatConversations)
  const [activeId, setActiveId] = useState<string | null>(chatConversations[0]?.id ?? null)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(true)
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([])
  const [showEmoji, setShowEmoji] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const active = conversations.find((c) => c.id === activeId)

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length, pendingAttachments.length])

  function selectConversation(id: string) {
    setActiveId(id)
    setShowList(false)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) } : c))
    )
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: ChatAttachment[] = []
    let processed = 0
    const total = files.length

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
        })
        processed++
        if (processed === total) {
          setPendingAttachments((prev) => [...prev, ...newAttachments])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  function removeAttachment(id: string) {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function sendMessage() {
    if ((!input.trim() && pendingAttachments.length === 0) || !active) return
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'admin',
      senderName: 'Admin',
      senderAvatar: '',
      text: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, newMsg], lastMessageTime: newMsg.timestamp }
          : c
      )
    )
    setInput('')
    setPendingAttachments([])

    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
      const replies = [
        'Got it, thanks!',
        'Sounds good. I will take a look.',
        'Sure, let me check and get back to you.',
        'Thanks for the update!',
        'On it. Will update you shortly.',
        'Great, that works for me.',
        'Thanks for sharing!',
        'I will review this now.',
      ]
      const reply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        senderId: active.participantIds[0],
        senderName: active.participantNames[0],
        senderAvatar: active.participantAvatars[0],
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toISOString(),
        read: true,
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, messages: [...c.messages, reply], lastMessageTime: reply.timestamp }
            : c
        )
      )
    }, 2000)
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0)

  const emojis = ['👍', '❤️', '😊', '😂', '🎉', '🔥', '✅', '👏', '🙏', '💡', '🚀', '⭐', '✨', '💼', '📅', '📎']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat</h1>
          <p className="text-sm text-slate-400">
            {conversations.length} conversations · {totalUnread} unread messages
          </p>
        </div>
      </div>

      <Card className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
        {/* Conversation list */}
        <div className={`${showList ? 'flex' : 'hidden'} w-full flex-col border-r border-slate-800 md:flex md:w-80`}>
          <div className="border-b border-slate-800 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const lastMsg = c.messages[c.messages.length - 1]
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-slate-800/50 p-3 text-left transition hover:bg-slate-800/40 ${
                    activeId === c.id ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    {c.type === 'direct' ? (
                      <img src={c.avatar} alt={c.name} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {c.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-white">{c.name}</p>
                      <span className="shrink-0 text-[10px] text-slate-500">{formatTimeAgo(c.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-500">
                        {lastMsg && lastMsg.senderId === 'admin' ? 'You: ' : lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ` : ''}
                        {lastMsg?.text
                          ? lastMsg.text
                          : lastMsg?.attachments && lastMsg.attachments.length > 0
                            ? `${lastMsg.attachments.length} attachment${lastMsg.attachments.length > 1 ? 's' : ''}`
                            : 'No messages'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat window */}
        {active ? (
          <div className={`${showList ? 'hidden' : 'flex'} flex-1 flex-col md:flex`}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 p-3">
              <button onClick={() => setShowList(true)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              {active.type === 'direct' ? (
                <img src={active.avatar} alt={active.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600">
                  <Users className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{active.name}</p>
                <p className="text-xs text-slate-500">
                  {active.type === 'group' ? `${active.participantNames.length} members` : active.online ? 'Online' : 'Offline'}
                </p>
              </div>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <Phone className="h-4.5 w-4.5" />
              </button>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <Video className="h-4.5 w-4.5" />
              </button>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <MoreVertical className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {active.messages.map((msg, i) => {
                const isMe = msg.senderId === 'admin'
                const showAvatar = !isMe && (i === 0 || active.messages[i - 1].senderId !== msg.senderId)
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-7 shrink-0">
                        {showAvatar && <img src={msg.senderAvatar} alt={msg.senderName} className="h-7 w-7 rounded-full object-cover" />}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && showAvatar && (
                        <p className="mb-0.5 text-[10px] font-medium text-slate-500">{msg.senderName}</p>
                      )}

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mb-1 grid gap-2 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {msg.attachments.map((att) => {
                            const isImage = att.type.startsWith('image/')
                            const Icon = getAttachmentIcon(att.type)
                            return (
                              <a
                                key={att.id}
                                href={att.dataUrl}
                                download={att.name}
                                className={`group block overflow-hidden rounded-xl border ${
                                  isMe ? 'border-cyan-400/30' : 'border-slate-700'
                                } bg-slate-800/60 transition hover:border-cyan-500/50`}
                              >
                                {isImage ? (
                                  <div className="relative">
                                    <img src={att.dataUrl} alt={att.name} className="max-h-48 w-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                                      <Download className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
                                      <Icon className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium text-slate-200">{att.name}</p>
                                      <p className="text-[10px] text-slate-500">{formatFileSize(att.size)}</p>
                                    </div>
                                    <Download className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-cyan-400" />
                                  </div>
                                )}
                              </a>
                            )
                          })}
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && (
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-sm ${
                            isMe
                              ? 'rounded-br-md bg-cyan-500 text-white'
                              : 'rounded-bl-md bg-slate-800 text-slate-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      <p className={`mt-0.5 text-[10px] text-slate-600 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Pending attachments preview */}
            <AnimatePresence>
              {pendingAttachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-800 bg-slate-900/80 p-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((att) => {
                      const isImage = att.type.startsWith('image/')
                      const Icon = getAttachmentIcon(att.type)
                      return (
                        <div
                          key={att.id}
                          className="group relative flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 p-2"
                        >
                          {isImage ? (
                            <img src={att.dataUrl} alt={att.name} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-500/15">
                              <Icon className="h-5 w-5 text-cyan-400" />
                            </div>
                          )}
                          <div className="max-w-32">
                            <p className="truncate text-xs text-slate-200">{att.name}</p>
                            <p className="text-[10px] text-slate-500">{formatFileSize(att.size)}</p>
                          </div>
                          <button
                            onClick={() => removeAttachment(att.id)}
                            className="ml-1 rounded-full bg-slate-700 p-0.5 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-800 bg-slate-900/80 p-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInput((prev) => prev + emoji)
                          setShowEmoji(false)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-slate-800"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="border-t border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
                  title="Attach files"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
                  title="Attach images"
                >
                  <ImageIcon className="h-4.5 w-4.5" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                />
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`rounded-lg p-2 transition hover:bg-slate-800 ${showEmoji ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                  title="Emoji"
                >
                  <Smile className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && pendingAttachments.length === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-white transition hover:bg-cyan-400 disabled:opacity-40"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-sm text-slate-500 md:flex">
            Select a conversation to start chatting
          </div>
        )}
      </Card>
    </div>
  )
}
