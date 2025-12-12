// mdx.d.ts  ← ADD at project root
declare module "*.mdx" {
  import * as React from "react";
  const MDXComponent: React.ComponentType<any>;
  export default MDXComponent;
}
