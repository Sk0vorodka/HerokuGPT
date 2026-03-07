import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "Chat UI clone powered by your API"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}