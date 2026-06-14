"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  sendMessage,
  getMessagesForApplication,
  markMessagesAsRead,
} from "@/lib/db/message-actions";

interface MessageData {
  id: string;
  senderRole: string;
  senderName: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export function MessageThread({
  applicationId,
  currentRole,
  currentName,
  currentId,
  otherName,
  unreadCount,
}: {
  applicationId: string;
  currentRole: "worker" | "clinic";
  currentName: string;
  currentId: string;
  otherName: string;
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    setLoading(true);
    const msgs = await getMessagesForApplication(applicationId);
    setMessages(msgs);
    setLoading(false);
    // Mark messages from other party as read
    await markMessagesAsRead(applicationId, currentRole);
  }

  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await sendMessage({
      applicationId,
      senderRole: currentRole,
      senderName: currentName,
      content: newMessage,
      senderId: currentId,
    });

    if (result.success) {
      setNewMessage("");
      await loadMessages();
    }
    setSending(false);
  }

  function formatTime(date: Date) {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    if (diffDays === 0) return `Today ${time}`;
    if (diffDays === 1) return `Yesterday ${time}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` ${time}`;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <MessageSquare className="h-3 w-3" />
        Messages
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 min-w-[18px] h-4">
            {unreadCount}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <Card className="mt-3 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Messages with {otherName}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {/* Messages */}
        <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === currentRole;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className={`text-xs font-medium ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {msg.senderName}
                    </p>
                    <p className="text-sm mt-0.5">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${otherName}...`}
            className="text-sm"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
