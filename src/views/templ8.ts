import Mustache from "mustache";

/*   _           _ ___ ___  _        __
 *  |_ | | |\ | /   |   |  / \ |\ | (_
 *  |  |_| | \| \_  |  _|_ \_/ | \| __)
 */
async function blogging() {
  const blogtest = {
    domain: "//xero.0w.nz",
    keywords: "blog, static site, bun, bun.sh, tailwindcss, htmx, xero, x-e.ro, 0w.nz, xero.style",
    content: "<h1>hello world!</h1>",
    sidebar: "tagz and shit",
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  };
  let mainTemplate = Bun.file("src/views/main.html", { type: "text/html;charset=utf-8" });
  const mainTxt = await mainTemplate.text();
  Bun.write("dist/test.html", Mustache.render(mainTxt, blogtest));
}
/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const templateTest = ():void => {
  blogging();
};
