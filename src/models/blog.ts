import { db, quit } from "./db.js";

/*  ___     _   _  __
 *   | \_/ |_) |_ (_
 *   |  |  |   |_ __)
 */
export type BlogPost = {
  post_id: number;
  url: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  date: string;
}[];

export type BlogCats = {
  blog_cat_id: number;
  name: string;
  url: string;
}[];

export type BlogTags = {
  name: string;
  url: string;
  count?: number;
}[];

/*   _           _ ___ ___  _        __
 *  |_ | | |\ | /   |   |  / \ |\ | (_
 *  |  |_| | \| \_  |  _|_ \_/ | \| __)
 */
const getPostsRange = (limit: number, offset: number): BlogPost => {
  const results: any = db
    .query(
      `
SELECT * FROM blog_posts
WHERE live = 1
ORDER BY date DESC
LIMIT $offset, $limit;
    `,
    )
    .all({ $limit: limit, $offset: offset });
  return results;
};

const getPostByURL = (post_url: string): BlogPost => {
  const results: any = db
    .query(
      `
SELECT post_id, url, title, subtitle, excerpt, content, date
FROM blog_posts
WHERE url = $post_url AND live = 1
LIMIT 1;
    `,
    )
    .all({ $post_url: post_url });
  return results;
};

const getPostCatsByID = (post_id: number): BlogCats => {
  const results: any = db
    .query(
      `
SELECT c.blog_cat_id, c.name, c.url
FROM blog_meta m INNER JOIN blog_categories c
ON m.meta_val = c.blog_cat_id
WHERE m.blog_id = $post_id AND m.meta_key = "category";
`,
    )
    .all({ $post_id: post_id });
  if (!results) {
    return [
      {
        blog_cat_id: 0,
        name: "uncategorized",
        url: "uncategorized",
      },
    ];
  }
  return results;
};

const getPostMainCategory = (cat_id: number): BlogCats => {
  const results: any = db
    .query(
      `
SELECT blog_cat_id, name, url
FROM blog_categories
WHERE blog_cat_id = :cat_id LIMIT 0,1;
`,
    )
    .all({ $cat_id: cat_id });
  if (!results) {
    return [
      {
        blog_cat_id: 0,
        name: "uncategorized",
        url: "uncategorized",
      },
    ];
  }
  return results;
};

const getPostTagsByID = (post_id: number): BlogTags => {
  const results: any = db
    .query(
      `
SELECT t.name, t.url
FROM blog_meta m INNER JOIN blog_tags t
ON m.meta_val = t.tag_id
WHERE m.blog_id = $post_id AND m.meta_key = 'tag';
`,
    )
    .all({ $post_id: post_id });
  if (!results) {
    return [
      {
        name: "",
        url: "",
      },
    ];
  }
  return results;
};

const getCats = (): BlogCats => {
  const results: any = db
    .query(
      `
SELECT blog_cat_id, name, url
FROM blog_categories
ORDER BY blog_cat_id ASC;
`,
    )
    .all({});
  if (!results) {
    return [
      {
        blog_cat_id: 0,
        name: "uncategorized",
        url: "uncategorized",
      },
    ];
  }
  return results;
};


const getAllTags = (): BlogTags => {
  const results: any = db
    .query(
      `
SELECT name, url, tag_count as count
FROM blog_tags
ORDER BY url ASC;
`,
    )
    .all({});
  if (!results) {
    return [
      {
        name: "untagged",
        url: "untagged",
      },
    ];
  }
  return results;
};

/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const getPostAndMeta = (url: string) => {
  const post = getPostByURL(url);
  const cats = getPostCatsByID(post[0].post_id);
  const tags = getPostTagsByID(post[0].post_id);
  return { post, meta: { tags, cats } };
};

export const getPosts = (limit: number, offset: number) => {
  return getPostsRange(limit, offset);
};

export const getPost = (url: string): BlogPost => {
  return getPostByURL(url);
};

export const getPostCats = (id: number): BlogCats => {
  return getPostCatsByID(id);
};

export const getPostTags = (id: number): BlogTags => {
  return getPostTagsByID(id);
};

export const getPostMainCat = (id: number): BlogCats => {
  return getPostMainCategory(id);
};

export const getCategories = (): BlogCats => {
  return getCats();
};

export const getTags = (): BlogTags => {
  return getAllTags();
};

export { quit };
