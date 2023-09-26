import {
  getPosts,
  getTagByName,
  getTags,
  getTotalPostCount,
  getTotalPostCountByTag,
} from "./models/blog.js";
import {
  generateErrorPages,
  generatePage,
  generatePost,
  generateTagPage,
} from "./views/templ8.js";

function makeErrorPages() {
  generateErrorPages("//xero.0w.nz");
}
function makePages() {
  const total: number = getTotalPostCount();
  const limit: number = 7;
  const pages: number = total / limit + 1;
  let offset: number = 0;
  let current: number = 1;

  while (current <= pages) {
    generatePage("//xero.0w.nz", limit, offset, total, current);
    offset += limit;
    current++;
  }
}
function makePosts() {
  const total: number = getTotalPostCount();
  const posts = getPosts(total, 0);
  posts.forEach((post) => {
    generatePost("//xero.0w.nz", [post]);
  });
}
function makeTags() {
  const tags = getTags();
  tags.forEach((tag) => {
    let limit = 7;
    let current = 1;
    let offset = 0;
    let id = getTagByName(tag.url);
    let total = getTotalPostCountByTag(id);
    let pages = Math.ceil(total / limit);
    while (current <= pages) {
      generateTagPage("//xero.0w.nz", tag.url, limit, offset, total, current);
      offset += limit;
      current++;
    }
  });
}
makeErrorPages();
makePages();
makePosts();
makeTags();
console.log(" BЦП ЯЦП DЦП ");
