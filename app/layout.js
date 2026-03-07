import "./globals.css";

export const metadata = {
  title: "ChatGPT Clone",
  description: "Chat clone with API"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}