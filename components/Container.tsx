import { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-6 py-10 md:py-14 min-h-screen">
      {children}
    </div>
  );
}
