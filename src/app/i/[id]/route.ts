import fs from "fs/promises";
import { after } from "next/server";
import path from "path";

// Serve the processed image from the upload directory.

const uploadDir = "/tmp";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  // This would be all kinds of wrong if this weren't just a demo.
  const filePath = path.join(uploadDir, `${id}.jpg`);
  const stats = await fs.stat(filePath);
  const fileHandle = await fs.open(filePath);
  const stream = fileHandle.readableWebStream({
    type: "bytes",
  }) as ReadableStream;

  after(() => {
    fileHandle.close();
  });
  return new Response(stream, {
    status: 200,
    headers: new Headers({
      "content-type": "image/jpeg",
      "content-length": stats.size.toFixed(0),
    }),
  });
}
