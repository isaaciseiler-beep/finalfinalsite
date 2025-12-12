const matter = require("gray-matter");

module.exports = function stripFrontMatter(source) {
  // Vercel/webpack expects sync loader. gray-matter is sync.
  const { content } = matter(source);
  return content;
};
