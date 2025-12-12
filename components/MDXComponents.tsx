// components/MDXComponents.tsx  ← NEW
"use client";
import Image from "next/image";
import * as React from "react";

export const MDXComponents = {
  img: (props: any) => (
    <Image
      alt={props.alt || ""}
      src={props.src}
      width={props.width ? Number(props.width) : 1200}
      height={props.height ? Number(props.height) : 600}
      className={`rounded-2xl ${props.className || ""}`}
    />
  ),
  h1: (p: any) => <h1 className="text-2xl font-semibold tracking-tight" {...p} />,
  h2: (p: any) => <h2 className="mt-8 text-xl font-semibold" {...p} />,
  p: (p: any) => <p className="mt-4 leading-relaxed text-neutral-300" {...p} />,
  a: (p: any) => <a className="underline decoration-neutral-600 hover:text-white" {...p} />,
  ul: (p: any) => <ul className="mt-4 list-disc pl-5 space-y-2" {...p} />,
  ol: (p: any) => <ol className="mt-4 list-decimal pl-5 space-y-2" {...p} />,
  code: (p: any) => <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[0.92em]" {...p} />,
  pre: (p: any) => <pre className="mt-4 overflow-x-auto rounded-2xl border border-neutral-800 p-4" {...p} />,
};
