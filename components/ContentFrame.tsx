// components/ContentFrame.tsx
"use client";

import { PropsWithChildren } from "react";

export default function ContentFrame({ children }: PropsWithChildren) {
  // sidebar spacing is handled globally by SiteShell.
  return <div className="w-full px-4 md:px-6">{children}</div>;
}
