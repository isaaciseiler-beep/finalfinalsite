// next.config.js  ← REPLACE
const createMDX = require("@next/mdx");

// unwrap ESM default when using require()
const esm = (m) =>
  m && typeof m === "object" && "default" in m ? m.default : m;

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [esm(require("remark-gfm"))],
    rehypePlugins: [
      esm(require("rehype-slug")),
      [esm(require("rehype-autolink-headings")), { behavior: "wrap" }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev",
      },
    ],
  },
  webpack: (config) => {
    // strip YAML front-matter before @next/mdx runs
    config.module.rules.unshift({
      test: /\.mdx?$/,
      enforce: "pre",
      use: [{ loader: require.resolve("./loaders/strip-frontmatter.cjs") }],
    });
    return config;
  },
};

module.exports = withMDX(nextConfig);
