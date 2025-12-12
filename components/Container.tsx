import { Children, ReactElement, ReactNode, isValidElement } from "react";

const TOP_PADDING_RE =
  /(^|\s)(?:[a-z]+:)*(?:pt|py|p)-(?:\d+|\[[^\]]+\])(?=\s|$)/;

function childManagesTopPadding(children: ReactNode): boolean {
  const arr = Children.toArray(children);

  // Look at the first React element child (common pattern: page wrapper div)
  const firstEl = arr.find((c) => isValidElement(c)) as ReactElement | undefined;
  const className = firstEl?.props?.className;

  if (typeof className !== "string") return false;

  // Defensive: if the page wrapper already sets top/vertical/all padding,
  // avoid adding Container top padding (prevents double-padding).
  return TOP_PADDING_RE.test(className);
}

export default function Container({ children }: { children: ReactNode }) {
  const hasOwnTopPad = childManagesTopPadding(children);

  const topPad = hasOwnTopPad ? "pt-0 md:pt-0" : "pt-10 md:pt-14";

  return (
    <div className={`w-full px-6 ${topPad} pb-10 md:pb-14 min-h-screen`}>
      {children}
    </div>
  );
}
