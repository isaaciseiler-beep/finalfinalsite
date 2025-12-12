// app/news/page.tsx  ← NEW
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In the News",
  description: "press, mentions, and media highlights.",
};

export default function NewsPage() {
  return (
    <main className="w-full px-6 pb-24 pt-28">
      <h1 className="text-2xl font-semibold tracking-tight">In the News</h1>
      <p className="mt-3 text-sm text-neutral-400">
        a clean space for press mentions, interviews, and media highlights. we’ll build cards and filters here later.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-neutral-800 p-4">
          <p className="text-neutral-400 text-sm">
            placeholder. add your first press item or RSS-backed feed soon.
          </p>
        </div>
      </div>
    </main>
  );
}
