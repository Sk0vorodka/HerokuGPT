"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const STORAGE_KEY = "imba_chat_history_v8";

const MODEL_OPTIONS = [
  { id: "gpt-5-pro", label: "GPT-5 Pro" },
  { id: "gpt-5.2-chat", label: "GPT-5.2 Chat" },
  { id: "gpt-5.2-pro", label: "GPT-5.2 Pro" },
  { id: "gpt-5.3-chat", label: "GPT-5.3 Chat" },
  { id: "gpt-5.4", label: "GPT-5.4" },
  { id: "gpt-5.4-pro", label: "GPT-5.4 Pro" }
];

const MODE_PRESETS = {
  default: "",
  web: "Используй поиск в сети при ответе, если режим поддерживается API.",
  study: "Отвечай как помощник для учебы и обучения: структурно, понятно, с примерами.",
  image: "Пользователь хочет создать изображение. Сформируй хороший промпт или выполни генерацию, если API поддерживает это.",
  files: "Пользователь хочет работать с файлами. Учитывай прикрепленные файлы, если API поддерживает это.",
  research: "Выполни глубокое исследование темы: структурированный разбор, факты, сравнения, выводы."
};

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="sendIcon">
      <path
        d="M12 17V7M12 7L8.8 10.2M12 7l3.2 3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm3 9l2.5-3 2.5 3 3.5-5 3 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18zm-7-9h14M12 3a15 15 0 010 18M12 3a15 15 0 000 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 004 20.5v-14zM4 20.5A2.5 2.5 0 016.5 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TelescopeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M3 21l6-6M14.5 4.5l5 5M8 15l8-8 3 3-8 8-4 1 1-4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M21.44 11.05l-8.49 8.49a6 6 0 11-8.49-8.49l8.49-8.49a4 4 0 115.66 5.66l-8.5 8.49a2 2 0 11-2.82-2.83l7.78-7.78" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M3 6h18M8 6V4h8v2M8 10v7M12 10v7M16 10v7M6 6l1 14h10l1-14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="codeBlock">
      <div className="codeHeader">
        <div className="codeLang">{language}</div>
        <button className="codeCopyBtn" onClick={onCopy}>
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          background: "#0b0f17",
          padding: "18px",
          fontSize: "14px",
          lineHeight: "1.65",
          borderRadius: "0 0 18px 18px"
        }}
        codeTagProps={{
          style: {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function ChatMessage({ message }) {
  const isStreaming = message.role === "assistant" && message.streaming;

  return (
    <div className={message.role === "user" ? "messageRow user fadeInUp" : "messageRow assistant fadeInUp"}>
      <div className={message.role === "user" ? "messageBubble userBubble" : "assistantContent"}>
        {message.role === "user" ? (
          <div>
            {message.attachments?.length > 0 && (
              <div className="messageAttachments">
                {message.attachments.map((file) => (
                  <div key={file.id} className="messageAttachmentThumb">
                    {file.type?.startsWith("image/") ? <img src={file.previewUrl} alt={file.name} /> : <div className="filePill">{file.name}</div>}
                  </div>
                ))}
              </div>
            )}
            <div>{message.content}</div>
          </div>
        ) : (
          <div className={isStreaming ? "streamingMessage" : ""}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeText = String(children).replace(/\n$/, "");

                  if (inline) {
                    return (
                      <code className="inlineCode" {...props}>
                        {children}
                      </code>
                    );
                  }

                  return <CodeBlock language={match?.[1] || "text"} code={codeText} />;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="streamCursor" />}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5.4");
  const [mode, setMode] = useState("default");
  const [attachments, setAttachments] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const chatRef = useRef(null);
  const menuRef = useRef(null);
  const modelRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingAbortRef = useRef({ aborted: false });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const firstChat = {
        id: crypto.randomUUID(),
        title: "Новый чат",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
      setChats([firstChat]);
      setActiveChatId(firstChat.id);
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (parsed?.chats?.length) {
        setChats(parsed.chats);
        setActiveChatId(parsed.activeChatId || parsed.chats[0].id);
        setSelectedModel(parsed.selectedModel || "gpt-5.4");
        setMode(parsed.mode || "default");
        setSidebarCollapsed(Boolean(parsed.sidebarCollapsed));
      } else {
        const firstChat = {
          id: crypto.randomUUID(),
          title: "Новый чат",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: []
        };
        setChats([firstChat]);
        setActiveChatId(firstChat.id);
      }
    } catch {
      const firstChat = {
        id: crypto.randomUUID(),
        title: "Новый чат",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
      setChats([firstChat]);
      setActiveChatId(firstChat.id);
    }
  }, []);

  useEffect(() => {
    if (!chats.length) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        chats,
        activeChatId,
        selectedModel,
        mode,
        sidebarCollapsed
      })
    );
  }, [chats, activeChatId, selectedModel, mode, sidebarCollapsed]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target)) {
        setModelOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      typingAbortRef.current.aborted = true;
    };
  }, []);

  const activeChat = useMemo(() => chats.find((chat) => chat.id === activeChatId) || null, [chats, activeChatId]);
  const selectedModelLabel = useMemo(() => MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label || "GPT-5.4", [selectedModel]);
  const sortedChats = useMemo(() => [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)), [chats]);
  const canSend = useMemo(() => (text.trim().length > 0 || attachments.length > 0) && !loading, [text, attachments, loading]);

  const createChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: "Новый чат",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setText("");
    setAttachments([]);
    setMode("default");
  };

  const deleteChat = (chatId) => {
    const nextChats = chats.filter((chat) => chat.id !== chatId);

    if (nextChats.length === 0) {
      const newChat = {
        id: crypto.randomUUID(),
        title: "Новый чат",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
      return;
    }

    setChats(nextChats);

    if (activeChatId === chatId) {
      setActiveChatId(nextChats[0].id);
    }
  };

  const startRenameChat = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title || "Новый чат");
  };

  const saveRenameChat = () => {
    const nextTitle = editingTitle.trim() || "Новый чат";

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === editingChatId
          ? {
              ...chat,
              title: nextTitle,
              updatedAt: Date.now()
            }
          : chat
      )
    );

    setEditingChatId(null);
    setEditingTitle("");
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
  };

  const patchActiveChatMessages = (updater) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              updatedAt: Date.now(),
              messages: typeof updater === "function" ? updater(chat.messages) : updater
            }
          : chat
      )
    );
  };

  const animateAssistantText = async (messageId, fullText) => {
    typingAbortRef.current = { aborted: false };
    let current = "";

    for (let i = 0; i < fullText.length; i++) {
      if (typingAbortRef.current.aborted) return;

      current += fullText[i];

      patchActiveChatMessages((messages) =>
        messages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: current,
                streaming: true
              }
            : msg
        )
      );

      if (i % 3 === 0) {
        scrollToBottom();
      }

      const char = fullText[i];
      if (char === "\n") {
        await sleep(8);
      } else if (char === " ") {
        await sleep(6);
      } else {
        await sleep(9);
      }
    }

    patchActiveChatMessages((messages) =>
      messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: fullText,
              streaming: false
            }
          : msg
      )
    );

    scrollToBottom();
  };

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const prepared = await Promise.all(
      files
        .filter((file) => allowed.includes(file.type))
        .map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
          dataUrl: await fileToDataUrl(file)
        }))
    );

    setAttachments((prev) => [...prev, ...prepared]);
    event.target.value = "";
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);

    const prepared = await Promise.all(
      files.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          previewUrl: isImage ? URL.createObjectURL(file) : null,
          dataUrl: await fileToDataUrl(file)
        };
      })
    );

    setAttachments((prev) => [...prev, ...prepared]);
    event.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const sendMessage = async () => {
    if (!activeChat || loading) return;

    typingAbortRef.current.aborted = true;

    const value = text.trim();
    if (!value && attachments.length === 0) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: value || "Отправлены вложения",
      attachments
    };

    const assistantMessageId = crypto.randomUUID();

    const nextMessages = [
      ...activeChat.messages,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        streaming: true
      }
    ];

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? (value || attachments[0]?.name || "Новый чат").slice(0, 30) : chat.title,
              updatedAt: Date.now(),
              messages: nextMessages
            }
          : chat
      )
    );

    setText("");
    setAttachments([]);
    setLoading(true);
    setMenuOpen(false);
    scrollToBottom();

    try {
      const systemPrompt = MODE_PRESETS[mode] || "";

      const payloadMessages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...activeChat.messages.map((m) => {
          if (m.attachments?.length) {
            const contentParts = [];

            if (m.content) {
              contentParts.push({
                type: "text",
                text: m.content
              });
            }

            m.attachments.forEach((file) => {
              if (file.type?.startsWith("image/")) {
                contentParts.push({
                  type: "image_url",
                  image_url: {
                    url: file.dataUrl
                  }
                });
              } else {
                contentParts.push({
                  type: "text",
                  text: `Файл: ${file.name}`
                });
              }
            });

            return {
              role: m.role,
              content: contentParts
            };
          }

          return {
            role: m.role,
            content: m.content
          };
        }),
        (() => {
          const contentParts = [];

          if (userMessage.content) {
            contentParts.push({
              type: "text",
              text: userMessage.content
            });
          }

          userMessage.attachments?.forEach((file) => {
            if (file.type?.startsWith("image/")) {
              contentParts.push({
                type: "image_url",
                image_url: {
                  url: file.dataUrl
                }
              });
            } else {
              contentParts.push({
                type: "text",
                text: `Файл: ${file.name}`
              });
            }
          });

          return {
            role: "user",
            content: contentParts.length ? contentParts : userMessage.content
          };
        })()
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          mode,
          messages: payloadMessages
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.raw || data?.details || data?.error || `HTTP ${res.status}`);
      }

      const fullText = data.text || "Пустой ответ от API";
      await animateAssistantText(assistantMessageId, fullText);
    } catch (error) {
      patchActiveChatMessages((messages) =>
        messages.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Ошибка API: ${error.message}`,
                streaming: false
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const menuItems = [
    { icon: <PaperclipIcon />, label: "Добавить фотографии", action: () => imageInputRef.current?.click() },
    { icon: <GlobeIcon />, label: "Поиск в сети", action: () => setMode("web") },
    { icon: <BookIcon />, label: "Учеба и обучение", action: () => setMode("study") },
    { separator: true },
    { icon: <ImageIcon />, label: "Создать изображение", action: () => setMode("image") },
    { icon: <FileIcon />, label: "Добавить файлы", action: () => fileInputRef.current?.click() },
    { icon: <TelescopeIcon />, label: "Глубокое исследование", action: () => setMode("research") }
  ];

  return (
    <main className="appShell">
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />

      {!sidebarCollapsed && (
        <aside className="sidebar">
          <div className="sidebarTop">
            <button className="newChatBtn" onClick={createChat}>
              <PenIcon />
              <span>Новый чат</span>
            </button>

            <div className="historyList">
              {sortedChats.map((chat, index) => (
                <div
                  key={chat.id}
                  className={`historyCard ${chat.id === activeChatId ? "activeHistory" : ""}`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {editingChatId === chat.id ? (
                    <div className="historyEditRow">
                      <input
                        className="historyEditInput"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRenameChat();
                          if (e.key === "Escape") {
                            setEditingChatId(null);
                            setEditingTitle("");
                          }
                        }}
                        autoFocus
                      />
                      <button className="historyMiniBtn" onClick={saveRenameChat}>
                        OK
                      </button>
                    </div>
                  ) : (
                    <>
                      <button className="historyItemMain" onClick={() => setActiveChatId(chat.id)}>
                        <span className="historyTitle">{chat.title || "Новый чат"}</span>
                      </button>

                      <div className="historyActions">
                        <button className="historyIconBtn" onClick={() => startRenameChat(chat)} title="Переименовать">
                          <EditIcon />
                        </button>
                        <button className="historyIconBtn dangerBtn" onClick={() => deleteChat(chat.id)} title="Удалить">
                          <TrashIcon />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebarFooter">
            <button className="profileBtn">
              <div className="avatar">A</div>
              <div className="profileMeta">
                <div className="profileName">Аккаунт</div>
                <div className="profileSub">{selectedModelLabel}</div>
              </div>
            </button>
          </div>
        </aside>
      )}

      <section className="mainArea">
        <header className="topbar">
          <div className="topbarLeft">
            <button className="ghostIconBtn topbarMenuBtn" aria-label="Меню" onClick={() => setSidebarCollapsed((prev) => !prev)}>
              <MenuIcon />
            </button>

            <div className="topbarTitle">ChatGPT</div>

            <div className="modelPickerWrap" ref={modelRef}>
              <button className="modelPickerBtn" onClick={() => setModelOpen((prev) => !prev)}>
                <span>{selectedModelLabel}</span>
                <ChevronDownIcon />
              </button>

              {modelOpen && (
                <div className="modelDropdown scaleIn">
                  <div className="modelDropdownTitle">модель</div>
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      className={`modelOption ${selectedModel === model.id ? "activeModelOption" : ""}`}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setModelOpen(false);
                      }}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="chatArea" ref={chatRef}>
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="emptyState">
              <h1 className="fadeInUp">Чем помочь?</h1>
            </div>
          ) : (
            <div className="messagesWrap">
              {activeChat.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        <div className="composerOuter">
          {attachments.length > 0 && (
            <div className="attachmentsBar">
              {attachments.map((file) => (
                <div key={file.id} className="attachmentChip fadeInUp">
                  {file.type?.startsWith("image/") ? (
                    <img src={file.previewUrl} alt={file.name} className="attachmentThumb" />
                  ) : (
                    <div className="attachmentFileIcon">
                      <FileIcon />
                    </div>
                  )}
                  <div className="attachmentMeta">
                    <div className="attachmentName">{file.name}</div>
                    <div className="attachmentType">{file.type || "file"}</div>
                  </div>
                  <button className="attachmentRemoveBtn" onClick={() => removeAttachment(file.id)}>
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="composer">
            <div className="plusMenuWrap" ref={menuRef}>
              <button className={`toolBtn ${menuOpen ? "toolBtnActive" : ""}`} aria-label="Добавить" onClick={() => setMenuOpen((prev) => !prev)}>
                <PlusIcon />
              </button>

              {menuOpen && (
                <div className="plusMenu scaleIn">
                  {menuItems.map((item, index) =>
                    item.separator ? (
                      <div key={`sep-${index}`} className="plusMenuSeparator" />
                    ) : (
                      <button
                        key={item.label}
                        className="plusMenuItem"
                        onClick={() => {
                          item.action();
                          setMenuOpen(false);
                        }}
                      >
                        <span className="plusMenuIcon">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <button className={`searchModeBtn ${mode === "web" ? "searchModeBtnActive" : ""}`} aria-label="Поиск" onClick={() => setMode((prev) => (prev === "web" ? "default" : "web"))}>
              <GlobeIcon />
              <span>Поиск</span>
            </button>

            <textarea className="composerInput" placeholder="Спросите ChatGPT" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} rows={1} />

            <button className={`sendBtn ${canSend ? "active" : ""}`} onClick={sendMessage} disabled={!canSend} aria-label="Отправить">
              <ArrowUpIcon />
            </button>
          </div>

          {mode !== "default" && (
            <div className="modeBadgeRow fadeInUp">
              <div className="modeBadge">
                Режим: {mode === "web" && "Поиск в сети"}
                {mode === "study" && "Учеба и обучение"}
                {mode === "image" && "Создать изображение"}
                {mode === "files" && "Файлы"}
                {mode === "research" && "Глубокое исследование"}
              </div>
              <button className="modeResetBtn" onClick={() => setMode("default")}>
                Сбросить
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
