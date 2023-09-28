import {
  getCategories,
  getPosts,
  getTagByName,
  getTags,
  getTotalPostCount,
  getTotalPostCountByCat,
  getTotalPostCountBySubCat,
  getTotalPostCountByTag,
} from "./models/blog.js";
import {
  generateCatPage,
  generateErrorPages,
  generatePage,
  generatePost,
  generateSubCatPage,
  generateTagPage,
} from "./views/templ8.js";

/*            _   __
 *  \  / /\  |_) (_
 *   \/ /--\ | \ __)
 */
const domain:string = "//xero.0w.nz"; // no trailing slash
const postsPerPage:number = 7;

/*   _           _ ___    _        __
 *  |_ | | |\ | /   |  | / \ |\ | (_
 *  |  |_| | \| \_  |  | \_/ | \| __)
 */
[
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`,
].forEach((eventType) => {
  process.on(eventType, (_) => {
    console.log(" BЦП ЯЦП DЦП ");
    process.exit();
  });
});

function makeErrorPages() {
  generateErrorPages(domain);
}
function makePages() {
  const total: number = getTotalPostCount();
  const limit: number = postsPerPage;
  const pages: number = total / limit + 1;
  let offset: number = 0;
  let current: number = 1;

  while (current <= pages) {
    generatePage(domain, limit, offset, total, current);
    offset += limit;
    current++;
  }
}
function makePosts() {
  const total: number = getTotalPostCount();
  const posts = getPosts(total, 0);
  posts.forEach((post) => {
    generatePost(domain, [post]);
  });
}
function makeTags() {
  const tags = getTags();
  tags.forEach((tag) => {
    let limit = postsPerPage;
    let current = 1;
    let offset = 0;
    let id = getTagByName(tag.url);
    let total = getTotalPostCountByTag(id);
    let pages = Math.ceil(total / limit);
    while (current <= pages) {
      generateTagPage(domain, tag.url, limit, offset, total, current);
      offset += limit;
      current++;
    }
  });
}
function makeCats() {
  const cats = getCategories();
  cats.forEach((cat) => {
    let type = cat.blog_cat_id.toString().includes(".") ? "subcat" : "cat";
    let limit = postsPerPage;
    let current = 1;
    let offset = 0;
    let total =
      type == "subcat"
        ? getTotalPostCountBySubCat(cat.blog_cat_id)
        : getTotalPostCountByCat(cat.blog_cat_id);
    let pages = Math.ceil(total / limit);
    while (current <= pages) {
      if (type == "subcat") {
        generateSubCatPage(
          domain,
          cat.url,
          cat.blog_cat_id,
          limit,
          offset,
          total,
          current,
        );
      } else {
        generateCatPage(domain, cat.url, limit, offset, total, current);
      }
      offset += limit;
      current++;
    }
  });
}

/*  |\/|  /\  | |\ |
 *  |  | /--\ | | \|
 */
makeErrorPages();
makePages();
makePosts();
makeTags();
makeCats();
