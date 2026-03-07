export const runtime = "nodejs";

function detectFileName(prompt, fallbackExt = "txt") {
  const cleaned = String(prompt || "").trim().toLowerCase();

  if (cleaned.includes("html")) return "generated-file.html";
  if (cleaned.includes("css")) return "generated-file.css";
  if (cleaned.includes("javascript") || cleaned.includes("js ")) return "generated-file.js";
  if (cleaned.includes("json")) return "generated-file.json";
  if (cleaned.includes("markdown") || cleaned.includes(".md")) return "generated-file.md";
  if (cleaned.includes("csv")) return "generated-file.csv";

  return `generated-file.${fallbackExt}`;
}

function detectMime(filename) {
  if (filename.endsWith(".html")) return "text/html; charset=utf-8";
  if (filename.endsWith(".css")) return "text/css; charset=utf-8";
  if (filename.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filename.endsWith(".json")) return "application/json; charset=utf-8";
  if (filename.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (filename.endsWith(".csv")) return "text/csv; charset=utf-8";
  return "text/plain; charset=utf-8";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const model = body?.model || process.env.OPENAI_MODEL || "gpt-5.4";

    if (!prompt) {
      return Response.json(
        {
          error: "Prompt is required"
        },
        { status: 400 }
      );
    }

    const system = `
Ты генератор файлов.
Пользователь просит создать файл.
Верни только чистое содержимое файла без пояснений.
Без markdown-оберток.
Без тройных кавычек.
Без вступления.
`.trim();

    const response = await fetch(`${process.env.OPENAI_BASE_URL || "https://sosiskibot.ru/api/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      })
    });

    const rawText = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          error: "File generation API error",
          status: response.status,
          raw: rawText
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return Response.json(
        {
          error: "Invalid JSON from upstream",
          raw: rawText
        },
        { status: 500 }
      );
    }

    const content =
      data?.choices?.[0]?.message?.content ||
      data?.message?.content ||
      data?.response ||
      data?.text ||
      "";

    const filename = body?.filename || detectFileName(prompt);
    const mime = detectMime(filename);

    return Response.json({
      filename,
      mime,
      content,
      raw: data
    });
  } catch (error) {
    return Response.json(
      {
        error: "Route error",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
