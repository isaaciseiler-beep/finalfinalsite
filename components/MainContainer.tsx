// components/MainContainer.tsx
"use client";

import * as React from "react";

export default function MainContainer(
  props: React.PropsWithChildren<{ className?: string }>,
) {
  return (
    <main
      role="main"
      aria-live="polite"
      className={`w-full px-6 pb-24 pt-28 ${props.className ?? ""}`}
    >
      {props.children}
    </main>
  );
}
