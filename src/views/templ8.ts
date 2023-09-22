import Mustache from "mustache";
import { getTags, BlogTags } from "../models/blog.js";

/*   _           _ ___ ___  _        __
 *  |_ | | |\ | /   |   |  / \ |\ | (_
 *  |  |_| | \| \_  |  _|_ \_/ | \| __)
 */
function tagCloud(min: number, max: number, domain: string): string {
  let tags: BlogTags = getTags();
  let count = new Array();
  tags.forEach((tag) => {
    count.push(tag.count);
  });
  const maxCount: number = Math.max(...count);
  const minCount: number = Math.min(...count);
  let spread: number = maxCount - minCount;
  if (spread <= 0) {
    spread = 1;
  }
  let step: number = (max - min) / spread;
  let html: string = '<ul class="tags">';
  tags.forEach((tag) => {
    let size: number = min + (tag.count - minCount) * step;
    // size = Math.ceil(size); // uncomment for whole numbers;
    html += `<li><a href="${domain}/tag/${tag.url}" style="font-size: ${size}%" title="${tag.count} posts tagged ${tag.name}">${tag.name}</a></li> `;
  });
  html += "</ul>";
  return html;
}
async function blogging() {
  const domain = "//xero.0w.nz";
  let sidebar = "<section><h3><em>tags</em></h3>" + tagCloud(80, 175, domain) + "</section>";
  let sidebarTemplate = Bun.file("src/views/sidebar.html", {
    type: "text/html;charset=utf-8",
  });
  const sidebarHtml = await sidebarTemplate.text();
  sidebar += Mustache.render(sidebarHtml, { domain: domain});

  const blogtest = {
    domain: domain,
    keywords:
      "blog, static site, bun, bun.sh, tailwindcss, htmx, xero, x-e.ro, 0w.nz, xero.style",
    content: "<article><h1>hello world!</h1></article>",
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  };
  let mainTemplate = Bun.file("src/views/main.html", {
    type: "text/html;charset=utf-8",
  });
  const mainHtml = await mainTemplate.text();
  Bun.write("dist/test.html", Mustache.render(mainHtml, blogtest));
}
/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const templateTest = (): void => {
  blogging();
};
