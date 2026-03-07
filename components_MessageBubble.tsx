"use client";

import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`w-full ${isUser ? "bg-transparent" : "bg-[#2a2a2a]"}`}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-4">
          <div className="shrink-0 h-8 w-8 rounded-full bg-soft flex items-center justify-center text-xs">
            {isUser ? "U" : "AI"}
          </div>
          <div className="min-w-0 flex-1">
            {isUser ? (
              <div className="whitespace-pre-wrap text-[15px]">{message.content}</div>
            ) : (
              <div className="markdown text-[15px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}