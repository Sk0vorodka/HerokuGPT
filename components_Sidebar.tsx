"use client";

import { Chat } from "@/types/chat";
import { MessageSquarePlus, PanelLeftClose, Trash2 } from "lucide-react";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  open: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  open,
  onToggle,
  onNewChat,
  onSelectChat,
  onDeleteChat
}: SidebarProps) {
  return (
    <aside
      className={`${
        open ? "w-[260px]" : "w-[72px]"
      } bg-panel border-r border-border h-screen transition-all duration-200 flex flex-col`}
    >
      <div className="p-3 flex items-center gap-2">
        <button
          onClick={onToggle}
          className="h-10 w-10 rounded-xl hover:bg-soft flex items-center justify-center"
        >
          <PanelLeftClose size={18} />
        </button>
        {open && (
          <button
            onClick={onNewChat}
            className="flex-1 h-10 rounded-xl border border-border hover:bg-soft flex items-center justify-center gap-2 text-sm"
          >
            <MessageSquarePlus size={16} />
            New chat
          </button>
        )}
      </div>

      <div className="px-2 pb-2 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 rounded-xl px-2 py-2 cursor-pointer mb-1 ${
              activeChatId === chat.id ? "bg-soft" : "hover:bg-soft/70"
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex-1 text-left truncate text-sm"
              title={chat.title}
            >
              {open ? chat.title : "•"}
            </button>
            {open && (
              <button
                onClick={() => onDeleteChat(chat.id)}
                className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg hover:bg-black/20 flex items-center justify-center"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}