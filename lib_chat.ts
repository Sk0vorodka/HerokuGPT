import { Chat, Message } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export function createEmptyChat(): Chat {
  const now = Date.now();
  return {
    id: uuidv4(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

export function createMessage(role: Message["role"], content: string): Message {
  return {
    id: uuidv4(),
    role,
    content
  };
}

export function deriveChatTitle(messages: Message[]) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  return firstUser.content.slice(0, 40) || "New chat";
}