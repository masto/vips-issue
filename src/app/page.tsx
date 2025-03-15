import { spawnSync } from "child_process";
import { randomBytes } from "crypto";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import path from "path";

// For simplicity, we'll put this all in one file.

declare global {
  // eslint-disable-next-line no-var
  var files: string[];
}

const uploadDir = "/tmp";
globalThis.files = [];

function randomFilename() {
  const randomName = randomBytes(8).toString("hex");
  return randomName;
}

// This server action handles the file upload:
//   * Copy it to a random filename in the upload directory.
//   * Shell out to the vips command line tool to convert to grayscale.
//   * Add it to the global list of processed files so we can display it.
async function processFile(formData: FormData) {
  "use server";

  // First, save the file somewhere.
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const id = randomFilename();
  const tempFile = path.join(uploadDir, id);
  await fs.writeFile(tempFile, buffer);
  console.log("Wrote upload to ", tempFile);

  // Now, convert it to grayscale.
  const bwFile = `${tempFile}.jpg`;
  // In a real application, this would not be done synchronously, but this
  // makes it easy to see any output or errors.
  spawnSync(
    "vips",
    [
      "colourspace", // operation
      tempFile, // in
      bwFile, // out
      "b-w", // space
    ],
    { stdio: "inherit" }
  );

  // Again, never do this, but we're trying to make a minimal demo here.
  globalThis.files.push(id);

  revalidatePath("/");
}

export default function Home() {
  return (
    <div className="gap-16 p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] items-start">
        <h1 className="text-5xl font-bold tracking-[-.01em]">
          Upload some images.
        </h1>
        <form className="flex flex-row gap-4" action={processFile}>
          <input
            className="border border-solid border-white/[.145] hover:bg-[#1a1a1a] hover:border-transparent font-medium h-12 px-5"
            type="file"
            name="file"
          />
          <button
            className="rounded-full border border-solid border-white/[.145] hover:bg-[#1a1a1a] hover:border-transparent font-medium h-12 px-5"
            type="submit"
          >
            Upload
          </button>
        </form>
        {globalThis.files.map((id) => (
          <Image
            key={id}
            alt="Thumbnail"
            src={`/i/${id}`}
            width={200}
            height={200}
          />
        ))}
      </main>
    </div>
  );
}
