import { Suspense } from "react";

import { promisify } from "util";
import { inflate } from "zlib";

const inflateAsync = promisify(inflate);

const BASE = process.env.VERCEL_URL ?? "localhost:3000";

const ComponentFetchingDataRegularly = async () => {
  const res = await fetch(`https://${BASE}/some-resource`, {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  const json = await res.json();

  return (
    <p>
      Fetched with correct encoding (~{json.data.length / 1024 / 1024} MB),{" "}
      {res.headers.get("date")}
    </p>
  );
};

const ComponentFetchingDataWithWorkaround = async () => {
  const res = await fetch(`https://${BASE}/same-resource-with-workaround`, {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  const buffer = Buffer.from(await res.arrayBuffer());
  const json = JSON.parse((await inflateAsync(buffer)).toString());

  return (
    <p>
      Fetched with manual decoding (~{json.data.length / 1024 / 1024} MB),{" "}
      {res.headers.get("date")}
    </p>
  );
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p>
          Two components fetching the same data (uncompressed 3MB) from two
          routes. The first route sets correct content encoding, the second
          deliberately not and the component deflates the response manually. Due
          to the deflated size greater than 2MB the correctly encoded response
          won&apos;t be cached, while the still compressed response of the
          second route/component will be cached. Reload and check the dates to
          visualize cache hit.
        </p>
        <Suspense fallback={<div>Loading</div>}>
          <ComponentFetchingDataRegularly />
        </Suspense>
        <Suspense fallback={<div>Loading</div>}>
          <ComponentFetchingDataWithWorkaround />
        </Suspense>
        <p>
          Also check the <code>Failed to set fetch cache</code> warning in the
          console (when run locally).
        </p>
        <a href="/some-resource" target="_blank">
          Click here for the correct encoded first route and check size in
          network monitor (~3kB)
        </a>
        <a href="/same-resource-with-workaround" target="_blank">
          Click here for the second route - browser will download the deflated
          data
        </a>
        <a href="https://github.com/phidol/next-caching-decoded-responses">
          GitHub repository
        </a>
      </main>
    </div>
  );
}

// prerendering during build fails due to unavailability of route handlers – irrelevant to the issue
export const dynamic = "force-dynamic";
