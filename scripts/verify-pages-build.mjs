import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");

const failures = [];
if (html.includes("/src/main.tsx") || html.includes("./src/main.tsx")) {
  failures.push("開発用の src/main.tsx が公開HTMLに残っています");
}
if (!html.includes("./assets/") && !html.includes("/assets/")) {
  failures.push("公開用の assets がHTMLから読み込まれていません");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("GitHub Pages用HTMLの検証に成功しました");
