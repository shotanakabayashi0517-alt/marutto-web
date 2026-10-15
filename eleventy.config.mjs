// Eleventy 設定ファイル
// 入力はリポジトリ直下、出力は _site/（Cloudflare Pages の出力先も _site）
export default function (eleventyConfig) {
  // そのままコピーする静的ファイル
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("_headers");
  // Cloudflare Pages は直下の 404.html を使うため、テンプレート処理せずそのままコピー
  eleventyConfig.addPassthroughCopy("404.html");

  // 改行を <br> に変換する（HTML として危険な文字は先にエスケープ）
  eleventyConfig.addFilter("nl2br", (value) => {
    const escaped = String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    return escaped.replace(/\r?\n/g, "<br>");
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      data: "_data",
    },
    templateFormats: ["html"],
    htmlTemplateEngine: "njk",
  };
}
