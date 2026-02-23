"use client"

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '')

import { useChat } from 'ai/react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuth } from '@/contexts/auth-context'
import { useState, useRef, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTIONS_FUNDER = [
  'Draft a bounty to validate a new cancer biomarker with CRISPR',
  'What budget should I set for a 3-month protein folding study?',
  'List my bounties that need attention',
  'What evidence should a lab provide for milestone 1?',
]

const SUGGESTIONS_LAB = [
  'What open bounties match my specialties?',
  'Show me proposals I have pending',
  'What budget should I bid for a 60-day genomics study?',
  'How do I submit milestone evidence?',
]

const SUGGESTIONS_DEFAULT = [
  'Draft a bounty to validate a new cancer biomarker with CRISPR',
  'What budget should I set for a 3-month protein folding study?',
  'Review this proposal: 60 days, $45k, gene editing in human cells',
  'What evidence should a lab provide for milestone 1?',
]

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-accent" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-secondary/50 text-foreground rounded-tl-sm'
        )}
      >
        {isUser ? (
          content
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-headings:my-2 prose-pre:my-2 prose-table:text-sm prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const isInternal = href?.startsWith('/') || href?.includes(BASE_URL || 'localhost')
                  return (
                    <a
                      href={href}
                      target={isInternal ? undefined : '_blank'}
                      rel={isInternal ? undefined : 'noopener noreferrer'}
                      className="text-accent"
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

export default function AgentPage() {
  const { getAccessToken } = usePrivy()
  const { dbUser } = useAuth()
  const suggestions = useMemo(() => {
    if (dbUser?.role === 'funder') return SUGGESTIONS_FUNDER
    if (dbUser?.role === 'lab') return SUGGESTIONS_LAB
    return SUGGESTIONS_DEFAULT
  }, [dbUser?.role])
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/agent',
    headers: async () => {
      const token = await getAccessToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const useSuggestion = (s: string) => {
    setInput(s)
    inputRef.current?.focus()
  }

  const empty = messages.length === 0

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-border/40">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-medium text-foreground">Research Agent</h1>
          <p className="text-xs text-muted-foreground">Draft bounties · Review proposals · Suggest verification</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4">
        {empty ? (
          <div className="space-y-5 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Ask me anything about structuring research bounties.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => useSuggestion(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border/40 hover:border-border hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/40 pt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask the research agent…"
            disabled={isLoading}
            className="flex-1 rounded-xl"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-xl h-11 w-11">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
