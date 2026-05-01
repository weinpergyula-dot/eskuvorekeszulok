"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Mail, MailOpen } from "lucide-react";

interface Message {
  id: string;
  sender_name: string;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface Props {
  onUnreadChange: (count: number) => void;
}

export function MessagesSection({ onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        onUnreadChange(data.filter((m: Message) => !m.read).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExpand = async (msg: Message) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    if (!msg.read) {
      await fetch(`/api/messages/${msg.id}/read`, { method: "PATCH" });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      onUnreadChange(messages.filter((m) => !m.read && m.id !== msg.id).length);
    }
  };

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
        <p className="text-base">Még nem érkezett üzeneted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`border rounded-xl overflow-hidden transition-colors ${
            msg.read ? "border-gray-200 bg-white" : "border-[#84AAA6] bg-[#84AAA6]/5"
          }`}
        >
          <button
            onClick={() => handleExpand(msg)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
          >
            {msg.read
              ? <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
              : <Mail className="h-4 w-4 text-[#84AAA6] shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-base truncate ${!msg.read ? "font-semibold" : ""} text-gray-900`}>
                {msg.subject}
              </p>
              <p className="text-sm text-gray-500">
                {msg.sender_name} · {new Date(msg.created_at).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {expanded === msg.id
              ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
              : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            }
          </button>
          {expanded === msg.id && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-base text-gray-900 whitespace-pre-line leading-relaxed">{msg.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
