"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  { label: "Banquet Halls", prompt: "How can I find banquet halls on Baaraath?" },
  { label: "Our Services", prompt: "What event services can I find on Baaraath?" },
  { label: "How to Book", prompt: "How do I book a service on Baaraath?" },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hello! How can I help you today?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, open]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Baaraath Bot could not reply right now. Please try again.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply! }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="Baaraath Bot chat"
          className="mb-3 flex h-[min(500px,calc(100dvh-7.5rem))] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[#eadfd5] bg-white shadow-[0_16px_55px_rgba(26,19,15,0.25)]"
        >
          <header className="flex items-center justify-between bg-[#030719] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff9800] text-white">
                <Bot size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Baaraath Bot</h2>
                <p className="flex items-center gap-1.5 text-xs text-[#c0d1e5]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close Baaraath Bot"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8fafc] p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                  message.role === "user"
                    ? "ml-auto rounded-br-md bg-[#ff9800] text-white"
                    : "rounded-bl-md border border-[#e6edf5] bg-[#edf4ff] text-[#28384e]"
                }`}
              >
                {message.content}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => void sendMessage(suggestion.prompt)}
                    disabled={busy}
                    className="rounded-full border border-[#dbe3ee] bg-white px-3 py-1.5 text-xs font-medium text-[#455468] transition hover:border-[#ffb23e] hover:bg-[#fff8ec] disabled:opacity-60"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}
            {busy && (
              <p className="w-fit rounded-full bg-white px-3 py-2 text-xs text-[#65758a]" role="status">
                Baaraath Bot is typing…
              </p>
            )}
            {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-[#e7eaf0] bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <label className="sr-only" htmlFor="baaraath-bot-input">Message Baaraath Bot</label>
            <input
              id="baaraath-bot-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              maxLength={1500}
              disabled={busy}
              className="min-w-0 flex-1 rounded-lg border border-[#cbd5e1] px-3 py-2.5 text-sm text-[#172033] outline-none placeholder:text-[#8a96a7] focus:border-[#ff9800] focus:ring-2 focus:ring-[#ff9800]/20 disabled:bg-[#f8fafc]"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-10 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ff9800] text-white transition hover:bg-[#eb8700] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ff9800] text-white shadow-[0_8px_24px_rgba(164,84,0,0.38)] transition hover:-translate-y-0.5 hover:bg-[#eb8700]"
        aria-label={open ? "Close Baaraath Bot" : "Open Baaraath Bot"}
        aria-expanded={open}
      >
        {open ? <X size={23} aria-hidden="true" /> : <MessageCircle size={23} aria-hidden="true" />}
      </button>
    </div>
  );
}
