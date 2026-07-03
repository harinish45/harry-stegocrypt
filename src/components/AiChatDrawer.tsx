import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Sparkles, Loader2, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'sentinel-chat-messages';
const CHAT_ID = 'sentinel-single';

const SUGGESTIONS = [
  'Explain AES-256-GCM in 3 bullets',
  'Is a 20-char password enough?',
  'How does LSB steganography work?',
  'When should I use RSA vs ChaCha20?',
];

function loadMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function AiChatDrawer() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [initialMessages] = useState<UIMessage[]>(loadMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sentinel-chat`;

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: CHAT_ID,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: endpoint,
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    }),
    onError: (err) => toast({ title: 'Chat error', description: err.message, variant: 'destructive' }),
  });

  // Persist to localStorage
  useEffect(() => {
    if (messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const busy = status === 'submitted' || status === 'streaming';

  const submit = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput('');
    await sendMessage({ text: t });
  };

  const clear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        className={cn(
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full grid place-items-center',
          'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground',
          'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50',
          'transition-all hover:scale-110 active:scale-95',
          open && 'opacity-0 pointer-events-none scale-90',
        )}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-background border border-primary rounded-full grid place-items-center">
          <Sparkles className="w-2.5 h-2.5 text-primary" />
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-in fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-card border-l shadow-2xl z-50',
          'flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/15 grid place-items-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">SentinelBot</div>
              <div className="text-[11px] text-muted-foreground">Cybersecurity assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button size="icon" variant="ghost" onClick={clear} title="Clear conversation">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ask me anything about security</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Crypto, passwords, steganography, or how to use StegoCrypt.
                </p>
              </div>
              <div className="grid gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-left text-xs p-2.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              ?.map((p) => (p.type === 'text' ? p.text : ''))
              .join('') ?? '';
            return (
              <div
                key={m.id}
                className={cn(
                  'flex gap-2',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {m.role !== 'user' && (
                  <div className="h-7 w-7 rounded-full bg-primary/15 grid place-items-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2'
                      : 'text-foreground',
                  )}
                >
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap break-words">{text}</div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:mb-1.5 prose-headings:mt-3 prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {status === 'submitted' && (
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/15 grid place-items-center shrink-0">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-3 bg-background/50">
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about crypto, keys, stego…"
              rows={2}
              className="resize-none pr-12 text-sm"
              disabled={busy && status === 'streaming'}
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8"
              onClick={busy ? () => stop() : () => submit()}
              disabled={!busy && !input.trim()}
              aria-label={busy ? 'Stop' : 'Send'}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Powered by Lovable AI · conversation stored locally
          </p>
        </div>
      </aside>
    </>
  );
}
