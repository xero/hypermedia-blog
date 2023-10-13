import Mustache from "mustache";
import {
  BlogPost,
  getCategories,
  getPostByURL,
  getPosts,
  getTags,
} from "../../models/blog.js";
import { getAllPosts } from "../../models/admin.js";

async function getFile(file: string) {
  return Bun.file(`src/views/admin/${file}.html`, {
    type: "text/html;charset=utf-8",
  }).text();
}

export async function RenderForm(domain: string) {
  const body = await RenderResponse(
    "welcome to hypermedia",
    '<img src="https://0.xxe.ro/power.gif" alt="now yer bloggin with hypermedia">',
  );
  const postHtml = await getFile("main");
  return Mustache.render(postHtml, {
    domain: domain,
    footer: "xero harrison",
    content: body,
    ripcache: Date.now(),
  });
}

export async function RenderResponse(title: string, body: string) {
  const postHtml = await getFile("response");
  return Mustache.render(postHtml, {
    body: body,
    title: title,
  });
}

export async function RenderEditForm(post: any, domain: string) {
  const postHtml = await getFile("edit_post");
  const postData = getPostByURL(post);
  const live: string = postData[0].live == 1 ? "checked" : "";
  return Mustache.render(postHtml, {
    url: postData[0].url,
    date: new Date(postData[0].date * 1000).toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    }),
    post_id: postData[0].post_id,
    title: postData[0].title,
    subtitle: postData[0].subtitle,
    excerpt: postData[0].excerpt,
    content: postData[0].content,
    live: live,
    tagcloud: () => {
      let tags = "";
      postData[0].meta.tags.forEach((tag) => {
        tags += `<button onclick="remove(event, 'btn${tag.url}')" id="btn${tag.url}" class="tag">${tag.name}<input type="hidden" name="tags" value="${tag.url}"/></button>`;
      });
      return tags;
    },
    tags: () => {
      let tags: string = "";
      const allTags = getTags();
      allTags.forEach((tag) => {
        tags += `<option value="${tag.name}"></option>`;
      });
      return tags;
    },
    pounce: () => {
      let cats: string = "";
      postData[0].meta.cats.forEach((cat) => {
        cats += `<button onclick="remove(event, 'btn${cat.url}')" id="btn${cat.url}" class="cat">${cat.name}<input type="hidden" name="cats" value="${cat.url}"/></button>`;
      });
      return cats;
    },
    cats: () => {
      let cats: string = "";
      const allCats = getCategories();
      allCats.forEach((cat) => {
        cats += `<option value="${cat.name}"></option>`;
      });
      return cats;
    },
    domain: domain,
    footer: "xero harrison",
    ripcache: Date.now(),
  });
}

export async function RenderEdit(hx: boolean, domain: string) {
  const blogPosts: any = getAllPosts();
  let list: string = "";
  blogPosts.forEach((post: any) => {
    list += `
				<option value="${post.url}"/>`;
  });
  const listHtml = await getFile("edit_select");
  const editList: string = Mustache.render(listHtml, {
    list: list,
  });
  if (hx) {
    return editList;
  } else {
    const editHtml = await getFile("main");
    return Mustache.render(editHtml, {
      domain: domain,
      footer: "xero harrison",
      content: editList,
      ripcache: Date.now(),
    });
  }
}

export async function RenderDelete(hx: boolean, domain: string) {
  const blogPosts: BlogPost = getPosts(1000, 0);
  let list: string = "";
  blogPosts.forEach((post: any) => {
    list += `
				<option value="${post.title}"/>`;
  });
  const listHtml = await getFile("rm_select");
  const rmList: string = Mustache.render(listHtml, {
    list: list,
  });
  if (hx) {
    return rmList;
  } else {
    const rmHtml = await getFile("main");
    return Mustache.render(rmHtml, {
      domain: domain,
      footer: "xero harrison",
      content: rmList,
      ripcache: Date.now(),
    });
  }
}
