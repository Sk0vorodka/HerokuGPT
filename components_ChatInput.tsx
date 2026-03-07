"use client";

import { SendHorizonal, Square } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface ChatInputProps {
  disabled?: boolean;
  generating?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export default function ChatInput({
  disabled,
  generating,
  onSend,
  onStop
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled || generating) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="rounded-3xl border border-border bg-soft p-3 shadow-lg">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Спроси что-нибудь"
            className="w-full resize-none bg-transparent outline-none text-sm text-text placeholder:text-muted"
          />
          <div className="mt-3 flex justify-end">
            {generating ? (
              <button
                onClick={onStop}
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 flex items-center gap-2 text-sm"
              >
                <Square size={16} />
                Stop
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={disabled}
                className="h-10 w-10 rounded-xl bg-accent hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
              >
                <SendHorizonal size={18} />
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted mt-2">
          Это MVP-клон интерфейса. Проверь свой API и лимиты.
        </p>
      </div>
    </div>
  );
}