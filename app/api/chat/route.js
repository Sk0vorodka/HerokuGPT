export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const model = body.model || process.env.OPENAI_MODEL || "gpt-5.4";

    const upstreamBody = {
      model,
      messages,
      stream: false
    };

    const response = await fetch(
      `${process.env.OPENAI_BASE_URL || "https://sosiskibot.ru/api/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(upstreamBody)
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          error: "Upstream API error",
          status: response.status,
          raw: rawText || null,
          requestBody: upstreamBody
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

    const text =
      data?.choices?.[0]?.message?.content ||
      data?.message?.content ||
      data?.response ||
      data?.text ||
      "";

    return Response.json({
      text,
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
