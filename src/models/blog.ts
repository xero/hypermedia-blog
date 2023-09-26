import { db, isEmpty, quit } from "./db.js";

/*  ___     _   _  __
 *   | \_/ |_) |_ (_
 *   |  |  |   |_ __)
 */
export type BlogCats = {
  blog_cat_id: number;
  name: string;
  url: string;
}[];

export type BlogTags = {
  name: string;
  url: string;
  count: number;
}[];

export type BlogMeta = {
  main: BlogCats;
  cats: BlogCats;
  tags: BlogTags;
};

export type BlogPost = {
  post_id: number;
  url: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  date: number;
  meta: BlogMeta;
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
  if (isEmpty(results)) {
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

const getMainCategory = (cat_id: number): BlogCats => {
  const results: any = db
    .query(
      `
SELECT blog_cat_id, name, url
FROM blog_categories
WHERE blog_cat_id = $cat_id LIMIT 0,1;
`,
    )
    .all({ $cat_id: Math.floor(cat_id) });
  if (isEmpty(results)) {
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
SELECT t.name, t.url, t.tag_count as count
FROM blog_meta m INNER JOIN blog_tags t
ON m.meta_val = t.tag_id
WHERE m.blog_id = $post_id AND m.meta_key = 'tag';
`,
    )
    .all({ $post_id: post_id });
  if (isEmpty(results)) {
    return [
      {
        name: "",
        url: "",
        count: 0,
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
  if (isEmpty(results)) {
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
  if (isEmpty(results)) {
    return [
      {
        name: "untagged",
        url: "untagged",
        count: 0,
      },
    ];
  }
  return results;
};
const getPostsCount = (): number => {
  const results = db
    .query(
      `
SELECT post_id AS total
FROM blog_posts
WHERE live = 1;
`,
    )
    .all({});
  return results.length;
};
const getTagPostCount = (tag_id: number): number => {
  const results = db
    .query(
      `
SELECT blog_id as total
FROM blog_meta
WHERE meta_key = 'tag'
AND meta_val = $tag_id;
`,
    )
    .all({ $tag_id: tag_id });
  return results.length;
};
const getTagByURL = (tag_name: string) => {
  const results:any = db
    .query(
      `
SELECT tag_id
FROM blog_tags
WHERE url = $tag_name
LIMIT 1;",
`,
    )
    .all({ $tag_name: tag_name });
  return parseInt(results[0].tag_id);
};

const getPostsByTag = (
  tag_id: number,
  limit: number,
  offset: number,
) => {
  const results = db
    .query(
      `
SELECT p.post_id, p.url, p.title, p.subtitle, p.excerpt, p.content, p.date
FROM blog_meta as m
INNER JOIN blog_posts as p
ON m.blog_id = p.post_id
WHERE m.meta_key = 'tag' AND m.meta_val = $tag_id AND p.live = 1
GROUP BY p.post_id
ORDER BY p.date
DESC LIMIT $offset, $limit;",
`,
    )
    .all({
      $tag_id: tag_id,
      $limit: limit,
      $offset: offset
    });
  return results;
};

/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const getPosts = (limit: number, offset: number): BlogPost => {
  let posts = getPostsRange(limit, offset);
  posts.forEach((post) => {
    const cats = getPostCatsByID(post.post_id);
    const tags = getPostTagsByID(post.post_id);
    const main = getMainCategory(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
};

export const getPostsByTagID = (tag_id: number, limit: number, offset: number) => {
  let posts = getPostsByTag(tag_id, limit, offset);
  posts.forEach((post:any) => {
    const cats = getPostCatsByID(post.post_id);
    const tags = getPostTagsByID(post.post_id);
    const main = getMainCategory(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
}

export const getTotalPostCountByTag = (tag_id: number) => {
  return getTagPostCount(tag_id);
}

export const getTagByName = (url: string):number => {
  return getTagByURL(url);
}

export const getTotalPostCount = (): number => {
  return getPostsCount();
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

export const getMainCat = (id: number): BlogCats => {
  return getMainCategory(id);
};

export const getCategories = (): BlogCats => {
  return getCats();
};

export const getTags = (): BlogTags => {
  return getAllTags();
};

export { quit };
