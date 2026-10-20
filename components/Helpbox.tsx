"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Helpbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/helpbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, conversationId }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.conversationId) setConversationId(j.conversationId);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: j.answer ?? j.error ?? "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Unable to connect right now. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="helpbox-launch"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Study help ↗
      </button>
      {open && (
        <section className="helpbox" aria-label="Study helpbox">
          <header>
            <strong>Study helpbox</strong>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close study help"
            >
              ×
            </button>
          </header>
          <p className="help-disclaimer">
            Study aid only. Answers may contain errors; verify important work
            with your teacher or textbook.
          </p>
          <div className="chat-messages">
            {messages.length === 0 && (
              <p>Ask a school subject or competitive-exam study question.</p>
            )}
            {messages.map((m, i) => (
              <p key={i} className={`chat-${m.role}`}>
                <b>{m.role === "user" ? "You" : "Study AI"}</b>
                <br />
                {m.content}
              </p>
            ))}
          </div>
          <form onSubmit={send}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={3000}
              placeholder="Ask a study question…"
              aria-label="Study question"
            />
            <button disabled={busy || !text.trim()}>
              {busy ? "…" : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
