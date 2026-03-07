export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const filename = String(body?.filename || "generated-file.txt");
    const mime = String(body?.mime || "text/plain; charset=utf-8");
    const content = String(body?.content || "");

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: "Download route error",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
