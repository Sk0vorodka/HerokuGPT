"use client";

import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import Sidebar from "@/components/Sidebar";
import { createEmptyChat, createMessage, deriveChatTitle } from "@/lib/chat";
import { loadChats, saveChats } from "@/lib/storage";
import { Chat } from "@/types/chat";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = loadChats();
    if (stored.length > 0) {
      setChats(stored);
      setActiveChatId(stored[0].id);
    } else {
      const first = createEmptyChat();
      setChats([first]);
      setActiveChatId(first.id);
    }
  }, []);

  useEffect(() => {
    if (chats.length) saveChats(chats);
  }, [chats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, generating]);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId]
  );

  const updateChat = (chatId: string, updater: (chat: Chat) => Chat) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? updater(chat) : chat)));
  };

  const handleNewChat = () => {
    const chat = createEmptyChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        setActiveChatId(next[0]?.id || null);
      }
      return next.length ? next : [createEmptyChat()];
    });
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setGenerating(false);
  };

  const handleSend = async (text: string) => {
    let currentChatId = activeChatId;

    if (!currentChatId) {
      const newChat = createEmptyChat();
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      currentChatId = newChat.id;
    }

    const userMessage = createMessage("user", text);
    const assistantMessage = createMessage("assistant", "");

    updateChat(currentChatId!, (chat) => {
      const messages = [...chat.messages, userMessage, assistantMessage];
      return {
        ...chat,
        messages,
        title: deriveChatTitle(messages),
        updatedAt: Date.now()
      };
    });

    const targetChatId = currentChatId!;
    setGenerating(true);

    const currentChat = chats.find((c) => c.id === targetChatId);
    const requestMessages = [
      ...(currentChat?.messages || []).map((m) => ({
        role: m.role,
        content: m.content
      })),
      { role: "user", content: text }
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: requestMessages
        })
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to fetch response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || "";
            if (delta) {
              finalText += delta;
              updateChat(targetChatId, (chat) => ({
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: finalText } : m
                ),
                updatedAt: Date.now()
              }));
            }
          } catch {
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        updateChat(targetChatId, (chat) => ({
          ...chat,
          messages: chat.messages.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "Ошибка при получении ответа от API." }
              : m
          ),
          updatedAt: Date.now()
        }));
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  return (
    <main className="h-screen bg-bg text-text flex">
      <div className="hidden md:block">
        <Sidebar
          chats={[...chats].sort((a, b) => b.updatedAt - a.updatedAt)}
          activeChatId={activeChatId}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      <section className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden h-10 w-10 rounded-xl hover:bg-soft flex items-center justify-center"
          >
            <Menu size={18} />
          </button>
          <div className="font-medium truncate">{activeChat?.title || "New chat"}</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeChat && activeChat.messages.length > 0 ? (
            activeChat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-3xl font-semibold mb-3">Чем помочь?</h1>
                <p className="text-muted">Это клон интерфейса ChatGPT на твоём API.</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput generating={generating} onSend={handleSend} onStop={handleStop} />
      </section>
    </main>
  );
}