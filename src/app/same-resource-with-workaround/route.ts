// not setting correct encoding prevents decompression and data can be cached
export async function GET() {
  // abirtrary 3MB of data
  const data = "a".repeat(3 * 1024 * 1024);

  return new Response(
    new ReadableStream({
      start: (controller) => {
        controller.enqueue(
          Buffer.from(
            JSON.stringify({
              message: "This will be cached but is hacky",
              data,
            })
          )
        );
        controller.close();
      },
    }).pipeThrough(new CompressionStream("deflate")),
    {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    }
  );
}
