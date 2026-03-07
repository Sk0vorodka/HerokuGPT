export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const model = body?.model || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const size = body?.size || "1024x1024";

    if (!prompt) {
      return Response.json(
        {
          error: "Prompt is required"
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt,
        size
      })
    });

    const rawText = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          error: "Image API error",
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
          error: "Invalid JSON from image API",
          raw: rawText
        },
        { status: 500 }
      );
    }

    const imageUrl = data?.data?.[0]?.url || null;
    const b64 = data?.data?.[0]?.b64_json || null;

    return Response.json({
      imageUrl,
      b64,
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
