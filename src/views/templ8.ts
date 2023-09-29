import Mustache from "mustache";
import { mkdirSync } from "fs";
import {
  getPosts,
  getTags,
  BlogTags,
  BlogPost,
  getPostsByTagID,
  getTagByName,
  getPostsByCatID,
  getPostsBySubCatID,
  getCatByName,
  getCategoryByID,
} from "../models/blog.js";

/*   _           _ ___    _        __
 *  |_ | | |\ | /   |  | / \ |\ | (_
 *  |  |_| | \| \_  |  | \_/ | \| __)
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

function pagination(
  domain: string,
  totalRows: number,
  perPage: number,
  currentPage: number,
  linkCount: number = 5,
) {
  if (totalRows == 0 || perPage == 0) {
    return "";
  }
  const pageCount = Math.ceil(totalRows / perPage);
  if (pageCount == 1) {
    return "";
  }
  if (currentPage > totalRows) {
    currentPage = (pageCount - 1) * perPage;
  }

  let first = currentPage - linkCount;
  let last = currentPage + linkCount;
	if (first < 0) {
		first = 1;
		last += linkCount - first;
	}
	if (last > pageCount) {
		last = pageCount;
		first -= linkCount;
	}

  let DOM = "";
  if (currentPage != first) {
    DOM += `<li><a href="${domain}/page/1">«</a></li>`;
  }
  if (currentPage != 1) {
    let prev = currentPage - 1;
    if (prev <= 0) {
      prev = currentPage;
    }
    DOM += `<li><a href="${domain}/page/${prev}">&lt;</a></li>`;
  }
  for (let i = first - 1; i <= last; i++) {
    if (i > 0) {
      if (currentPage == i) {
        DOM += `<li class="selected"><a href="#">${i}</a></li>`;
      } else {
        DOM += `<li><a href="${domain}/page/${i}">${i}</a></li>`;
      }
    }
  }
  if (currentPage < pageCount) {
    let next = currentPage + 1;
    if (next >= last) {
      next = last;
    }
    DOM += `<li><a href="${domain}/page/${next}">&gt;</a></li>`;
  }
  if (currentPage != last) {
		// last should be pageCount, but i kinda like the stepping better
    DOM += `<li><a href="${domain}/page/${last}">»</a></li>`;
  }
  return `<nav class="pagination"><ul>${DOM}</ul></nav>`;
}

async function getFile(file: string) {
  return Bun.file(`src/views/${file}.html`, {
    type: "text/html;charset=utf-8",
  }).text();
}

async function RenderSidebar(domain: string) {
  let sidebar =
    "<section><h3><em>tags</em></h3>" +
    tagCloud(80, 175, domain) +
    "</section>";
  let sidebarHtml = await getFile("sidebar");
  sidebar += Mustache.render(sidebarHtml, { domain: domain });
  return sidebar;
}

async function RenderCatPagePosts(
  domain: string,
  title: string,
  cat_id: number,
  cat_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const data = getPostsByCatID(cat_id, limit, offset);
  const postHtml = await getFile("preview");
  let DOM: string = `<title>${title} ${cat_url}: page ${current} of ${total}</title>`;
  data.forEach((post: any) => {
    const postDate = new Date(post.date * 1000);
    DOM += Mustache.render(postHtml, {
      domain: domain,
      url: post.url,
      title: post.title,
      content: post.excerpt,
      mainCat: post.meta.main[0].url,
      mainCatUrl: post.meta.main[0].url,
      subtitle: post.subtitle,
      day: postDate.getDate(),
      month: postDate.toLocaleString("default", { month: "short" }),
      year: postDate.getFullYear(),
      tagList: () => {
        let list = "";
        post.meta.tags.forEach((tag: any) => {
          list += `<a href="${domain}/tag/${tag.url}">${tag.name}</a>, `;
        });
        return list.slice(0, -2);
      },
      catList: () => {
        let list = "";
        post.meta.cats.forEach((cat: any) => {
          if (cat.blog_cat_id.toString().includes(".")) {
            const parentID: number = Math.floor(cat.blog_cat_id);
            const parent = getCategoryByID(parentID);
            list += `<a href="${domain}/category/${parent[0].url}">${parent[0].name}</a>/<a href="${domain}/category/${parent[0].url}/${cat.url}">${cat.name}</a>, `;
          } else {
            list += `<a href="${domain}/category/${cat.url}">${cat.name}</a>, `;
          }
        });
        return list.slice(0, -2);
      },
    });
  });
  DOM += pagination(`${domain}/category/${cat_url}`, total, limit, current);
  return DOM;
}

async function RenderSubCatPagePosts(
  domain: string,
  title: string,
  subcat_id: number,
  subcat_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const data = getPostsBySubCatID(subcat_id, limit, offset);
  const postHtml = await getFile("preview");
  let DOM: string = `<title>${title} ${subcat_url}: page ${current} of ${total}</title>`;
  data.forEach((post: any) => {
    const postDate = new Date(post.date * 1000);
    DOM += Mustache.render(postHtml, {
      domain: domain,
      url: post.url,
      title: post.title,
      content: post.excerpt,
      mainCat: post.meta.main[0].url,
      mainCatUrl: post.meta.main[0].url,
      subtitle: post.subtitle,
      day: postDate.getDate(),
      month: postDate.toLocaleString("default", { month: "short" }),
      year: postDate.getFullYear(),
      tagList: () => {
        let list = "";
        post.meta.tags.forEach((tag: any) => {
          list += `<a href="${domain}/tag/${tag.url}">${tag.name}</a>, `;
        });
        return list.slice(0, -2);
      },
      catList: () => {
        let list = "";
        post.meta.cats.forEach((cat: any) => {
          if (cat.blog_cat_id.toString().includes(".")) {
            const parentID: number = Math.floor(cat.blog_cat_id);
            const parent = getCategoryByID(parentID);
            list += `<a href="${domain}/category/${parent[0].url}">${parent[0].name}</a>/<a href="${domain}/category/${parent[0].url}/${cat.url}">${cat.name}</a>, `;
          } else {
            list += `<a href="${domain}/category/${cat.url}">${cat.name}</a>, `;
          }
        });
        return list.slice(0, -2);
      },
    });
  });
  const parentID: number = Math.floor(subcat_id);
  const parent = getCategoryByID(parentID);
  DOM += pagination(
    `${domain}/category/${parent[0].url}/${subcat_url}`,
    total,
    limit,
    current,
  );
  return DOM;
}

async function RenderTagPagePosts(
  domain: string,
  title: string,
  tag_id: number,
  tag_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const data = getPostsByTagID(tag_id, limit, offset);
  const postHtml = await getFile("preview");
  let DOM: string = `<title>${title} ${tag_url}: page ${current} of ${total}</title>`;
  data.forEach((post: any) => {
    const postDate = new Date(post.date * 1000);
    DOM += Mustache.render(postHtml, {
      domain: domain,
      url: post.url,
      title: post.title,
      content: post.excerpt,
      mainCat: post.meta.main[0].url,
      mainCatUrl: post.meta.main[0].url,
      subtitle: post.subtitle,
      day: postDate.getDate(),
      month: postDate.toLocaleString("default", { month: "short" }),
      year: postDate.getFullYear(),
      tagList: () => {
        let list = "";
        post.meta.tags.forEach((tag: any) => {
          list += `<a href="${domain}/tag/${tag.url}">${tag.name}</a>, `;
        });
        return list.slice(0, -2);
      },
      catList: () => {
        let list = "";
        post.meta.cats.forEach((cat: any) => {
          if (cat.blog_cat_id.toString().includes(".")) {
            const parentID: number = Math.floor(cat.blog_cat_id);
            const parent = getCategoryByID(parentID);
            list += `<a href="${domain}/category/${parent[0].url}">${parent[0].name}</a>/<a href="${domain}/category/${parent[0].url}/${cat.url}">${cat.name}</a>, `;
          } else {
            list += `<a href="${domain}/category/${cat.url}">${cat.name}</a>, `;
          }
        });
        return list.slice(0, -2);
      },
    });
  });
  DOM += pagination(`${domain}/tag/${tag_url}`, total, limit, current);
  return DOM;
}

async function RenderPagePosts(
  domain: string,
  title: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  let data = getPosts(limit, offset);
  const postHtml = await getFile("preview");
  let DOM: string = `<title>${title} page ${current} of ${total}</title>`;
  data.forEach((post) => {
    const postDate = new Date(post.date * 1000);
    DOM += Mustache.render(postHtml, {
      domain: domain,
      url: post.url,
      title: post.title,
      content: post.excerpt,
      mainCat: post.meta.main[0].url,
      mainCatUrl: post.meta.main[0].url,
      subtitle: post.subtitle,
      day: postDate.getDate(),
      month: postDate.toLocaleString("default", { month: "short" }),
      year: postDate.getFullYear(),
      tagList: () => {
        let list = "";
        post.meta.tags.forEach((tag) => {
          list += `<a href="${domain}/tag/${tag.url}">${tag.name}</a>, `;
        });
        return list.slice(0, -2);
      },
      catList: () => {
        let list = "";
        post.meta.cats.forEach((cat) => {
          if (cat.blog_cat_id.toString().includes(".")) {
            const parentID: number = Math.floor(cat.blog_cat_id);
            const parent = getCategoryByID(parentID);
            list += `<a href="${domain}/category/${parent[0].url}">${parent[0].name}</a>/<a href="${domain}/category/${parent[0].url}/${cat.url}">${cat.name}</a>, `;
          } else {
            list += `<a href="${domain}/category/${cat.url}">${cat.name}</a>, `;
          }
        });
        return list.slice(0, -2);
      },
    });
  });
  DOM += pagination(domain, total, limit, current);
  return DOM;
}

async function RenderPost(domain: string, title: string, data: BlogPost) {
  const postHtml = await getFile("post");
  const post = data[0];
  const postDate = new Date(post.date * 1000);
  return Mustache.render(postHtml, {
    domain: domain,
    pageTitle: title,
    url: post.url,
    title: post.title,
    content: post.content,
    mainCat: post.meta.main[0].url,
    mainCatUrl: post.meta.main[0].url,
    subtitle: post.subtitle,
    day: postDate.getDate(),
    month: postDate.toLocaleString("default", { month: "short" }),
    year: postDate.getFullYear(),
    tagList: () => {
      let list = "";
      post.meta.tags.forEach((tag) => {
        list += `<a href="${domain}/tag/${tag.url}">${tag.name}</a>, `;
      });
      return list.slice(0, -2);
    },
    catList: () => {
      let list = "";
      post.meta.cats.forEach((cat) => {
        if (cat.blog_cat_id.toString().includes(".")) {
          const parentID: number = Math.floor(cat.blog_cat_id);
          const parent = getCategoryByID(parentID);
          list += `<a href="${domain}/category/${parent[0].url}">${parent[0].name}</a>/<a href="${domain}/category/${parent[0].url}/${cat.url}">${cat.name}</a>, `;
        } else {
          list += `<a href="${domain}/category/${cat.url}">${cat.name}</a>, `;
        }
      });
      return list.slice(0, -2);
    },
  });
}

async function SaveErrorPages(domain: string, title: string) {
  const sidebar = await RenderSidebar(domain);
  let errorHtml = await getFile("error");
  const renderedError = Mustache.render(errorHtml, {
    domain: domain,
    title: title,
  });
  let mainHtml = await getFile("main");

  const renderedHtml = Mustache.render(mainHtml, {
    ripcache: Date.now(),
    domain: domain,
    description: `${title} the error page`,
    content: renderedError,
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  });
  mkdirSync(`dist/htmx/`, { recursive: true });
  Bun.write(`dist/htmx/error.html`, renderedError);
  Bun.write(`dist/error.html`, renderedHtml);
}

async function SaveCatPage(
  domain: string,
  title: string,
  cat_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const cat_id: number = getCatByName(cat_url);
  const sidebar = await RenderSidebar(domain);
  const content = await RenderCatPagePosts(
    domain,
    title,
    cat_id,
    cat_url,
    limit,
    offset,
    total,
    current,
  );
  let mainHtml = await getFile("main");

  const renderedHtml = Mustache.render(mainHtml, {
    ripcache: Date.now(),
    domain: domain,
    description: `${title} posts categorized: ${cat_url}, page ${current} of ${total}`,
    content: content,
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  });
  mkdirSync(`dist/htmx/category/${cat_url}/page`, { recursive: true });
  mkdirSync(`dist/category/${cat_url}/page`, { recursive: true });

  if (current == 1) {
    Bun.write(`dist/htmx/category/${cat_url}/index.html`, content);
    Bun.write(`dist/category/${cat_url}/index.html`, renderedHtml);
    /* @todo: is this cheaper than nginix? */
    Bun.write(`dist/category/${cat_url}/page/index.html`, renderedHtml);
  }
  Bun.write(`dist/htmx/category/${cat_url}/page/${current}.html`, content);
  Bun.write(`dist/category/${cat_url}/page/${current}.html`, renderedHtml);
}

async function SaveSubCatPage(
  domain: string,
  title: string,
  subcat_url: string,
  subcat_id: number,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const sidebar = await RenderSidebar(domain);
  const content = await RenderSubCatPagePosts(
    domain,
    title,
    subcat_id,
    subcat_url,
    limit,
    offset,
    total,
    current,
  );
  let mainHtml = await getFile("main");

  const renderedHtml = Mustache.render(mainHtml, {
    ripcache: Date.now(),
    domain: domain,
    description: `${title} posts categorized: ${subcat_url}, page ${current} of ${total}`,
    content: content,
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  });

  const parentID: number = Math.floor(subcat_id);
  const parent = getCategoryByID(parentID);
  const cat_url = parent[0].url;

  mkdirSync(`dist/htmx/category/${cat_url}/${subcat_url}/page`, {
    recursive: true,
  });
  mkdirSync(`dist/category/${cat_url}/${subcat_url}/page`, { recursive: true });

  if (current == 1) {
    Bun.write(
      `dist/htmx/category/${cat_url}/${subcat_url}/index.html`,
      content,
    );
    Bun.write(
      `dist/category/${cat_url}/${subcat_url}/index.html`,
      renderedHtml,
    );
    /* @todo: is this cheaper than nginix? */
    Bun.write(
      `dist/category/${cat_url}/${subcat_url}/page/index.html`,
      renderedHtml,
    );
  }
  Bun.write(
    `dist/htmx/category/${cat_url}/${subcat_url}/page/${current}.html`,
    content,
  );
  Bun.write(
    `dist/category/${cat_url}/${subcat_url}/page/${current}.html`,
    renderedHtml,
  );
}

async function SaveTagPage(
  domain: string,
  title: string,
  tag_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const tag_id: number = getTagByName(tag_url);
  const sidebar = await RenderSidebar(domain);
  const content = await RenderTagPagePosts(
    domain,
    title,
    tag_id,
    tag_url,
    limit,
    offset,
    total,
    current,
  );
  let mainHtml = await getFile("main");

  const renderedHtml = Mustache.render(mainHtml, {
    ripcache: Date.now(),
    domain: domain,
    description: `${title} posts tagged: ${tag_url}, page ${current} of ${total}`,
    content: content,
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  });
  mkdirSync(`dist/htmx/tag/${tag_url}/page`, { recursive: true });
  mkdirSync(`dist/tag/${tag_url}/page`, { recursive: true });

  if (current == 1) {
    Bun.write(`dist/htmx/tag/${tag_url}/index.html`, content);
    Bun.write(`dist/tag/${tag_url}/index.html`, renderedHtml);
    /* @todo: is this cheaper than nginix? */
    Bun.write(`dist/tag/${tag_url}/page/index.html`, renderedHtml);
  }
  Bun.write(`dist/htmx/tag/${tag_url}/page/${current}.html`, content);
  Bun.write(`dist/tag/${tag_url}/page/${current}.html`, renderedHtml);
}

async function SavePage(
  domain: string,
  title: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
) {
  const sidebar = await RenderSidebar(domain);
  const content = await RenderPagePosts(
    domain,
    title,
    limit,
    offset,
    total,
    current,
  );
  let mainHtml = await getFile("main");

  const renderedHtml = Mustache.render(mainHtml, {
    ripcache: Date.now(),
    domain: domain,
    description: `${title} page ${current} of ${total}`,
    content: content,
    sidebar: sidebar,
    footer: () => {
      const year = new Date().getFullYear();
      return `${year} xero harrison`;
    },
  });
  mkdirSync(`dist/page`, { recursive: true });
  mkdirSync(`dist/htmx/page`, { recursive: true });

  if (current == 1) {
    Bun.write(`dist/htmx/index.html`, content);
    Bun.write(`dist/index.html`, renderedHtml);
  }
  Bun.write(`dist/htmx/page/${current}.html`, content);
  Bun.write(`dist/page/${current}.html`, renderedHtml);
}

async function SavePost(domain: string, title: string, data: BlogPost) {
  const sidebar = await RenderSidebar(domain);
  const content = await RenderPost(domain, title, data);
  const file = data[0].url;

  Bun.write(`dist/htmx/${file}.html`, content);

  let mainHtml = await getFile("main");
  Bun.write(
    `dist/${file}.html`,
    Mustache.render(mainHtml, {
      ripcache: Date.now(),
      domain: domain,
      description: `${title} ${data[0].title} : ${data[0].subtitle}`,
      content: content,
      sidebar: sidebar,
      footer: () => {
        const year = new Date().getFullYear();
        return `${year} xero harrison`;
      },
    }),
  );
}
/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const generatePage = (
  domain: string,
  title: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
): void => {
  SavePage(domain, title, limit, offset, total, current);
};
export const generatePost = (
  domain: string,
  title: string,
  data: BlogPost,
): void => {
  SavePost(domain, title, data);
};
export const generateTagPage = (
  domain: string,
  title: string,
  tag_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
): void => {
  SaveTagPage(domain, title, tag_url, limit, offset, total, current);
};
export const generateCatPage = (
  domain: string,
  title: string,
  cat_url: string,
  limit: number,
  offset: number,
  total: number,
  current: number,
): void => {
  SaveCatPage(domain, title, cat_url, limit, offset, total, current);
};
export const generateSubCatPage = (
  domain: string,
  title: string,
  subcat_url: string,
  subcat_id: number,
  limit: number,
  offset: number,
  total: number,
  current: number,
): void => {
  SaveSubCatPage(
    domain,
    title,
    subcat_url,
    subcat_id,
    limit,
    offset,
    total,
    current,
  );
};
export const generateErrorPages = (domain: string, title: string): void => {
  SaveErrorPages(domain, title);
};
