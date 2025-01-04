// could be also an external service
// on Vercel I would let the Edge handle the compression, but for the sake of local demo...
export async function GET() {
  // abirtrary 3MB of data
  const data = "a".repeat(3 * 1024 * 1024);

  return new Response(
    new ReadableStream({
      start: (controller) => {
        controller.enqueue(
          Buffer.from(
            JSON.stringify({
              message: "This should be cached imho",
              data,
            })
          )
        );
        controller.close();
      },
    }).pipeThrough(new CompressionStream("deflate")),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "deflate",
      },
    }
  );
}
