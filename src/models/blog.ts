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

/*   _           _ ___    _        __
 *  |_ | | |\ | /   |  | / \ |\ | (_
 *  |  |_| | \| \_  |  | \_/ | \| __)
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

export const getPost = (post_url: string): BlogPost => {
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

export const getPostCats = (post_id: number): BlogCats => {
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

export const getMainCat = (cat_id: number): BlogCats => {
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

export const getPostTags = (post_id: number): BlogTags => {
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

export const getCategories = (): BlogCats => {
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

export const getCategoryByID = (cat_id: number): BlogCats => {
  const results: any = db
    .query(
      `
SELECT blog_cat_id, name, url
FROM blog_categories
WHERE blog_cat_id = $cat_id
LIMIT 1;
`,
    )
    .all({ $cat_id: cat_id });
  return results;
};

export const getTags = (): BlogTags => {
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
export const getTotalPostCount = (): number => {
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

export const getTotalPostCountByCat = (cat_id: number): number => {
  const results = db
    .query(
      `
SELECT DISTINCT(blog_id)
FROM blog_meta
WHERE meta_key = 'category'
AND meta_val >= $greater AND meta_val < $less;
`,
    )
    .all({ $greater: cat_id, $less: cat_id + 1 });
  return results.length;
};
export const getTotalPostCountBySubCat = (subcat_id: number): number => {
  const results = db
    .query(
      `
SELECT DISTINCT(blog_id)
FROM blog_meta
WHERE meta_key = 'category'
AND meta_val = $subcat_id;
`,
    )
    .all({ $subcat_id: subcat_id });
  return results.length;
};

export const getTotalPostCountByTag = (tag_id: number): number => {
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
export const getCatByName = (cat_name: string) => {
  const results: any = db
    .query(
      `
SELECT blog_cat_id
FROM blog_categories
WHERE url = $cat_name
LIMIT 1;
`,
    )
    .all({ $cat_name: cat_name });
  return parseFloat(results[0].blog_cat_id);
};
export const getTagByName = (tag_name: string) => {
  const results: any = db
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
const getPostsByCat = (cat_id: number, limit: number, offset: number) => {
  const results = db
    .query(
      `
SELECT p.post_id, p.url, p.title, p.subtitle, p.excerpt, p.content, p.date
FROM blog_meta as m
INNER JOIN blog_posts as p
ON m.blog_id = p.post_id
WHERE m.meta_key = 'category'
AND m.meta_val >= $greater AND m.meta_val < $less AND p.live = 1
GROUP BY p.post_id
ORDER BY p.date DESC
LIMIT $offset, $limit;
`,
    )
    .all({
      $greater: cat_id,
      $less: cat_id + 1,
      $limit: limit,
      $offset: offset,
    });
  return results;
};

const getPostsBySubCat = (subcat_id: number, limit: number, offset: number) => {
  const results = db
    .query(
      `
SELECT p.post_id, p.url, p.title, p.subtitle, p.excerpt, p.content, p.date
FROM blog_meta as m
INNER JOIN blog_posts as p
ON m.blog_id = p.post_id
WHERE m.meta_key = 'category'
AND m.meta_val = $subcat_id AND p.live = 1
GROUP BY p.post_id
ORDER BY p.date DESC
LIMIT $offset, $limit;
`,
    )
    .all({
      $subcat_id: subcat_id,
      $limit: limit,
      $offset: offset,
    });
  return results;
};
const getPostsByTag = (tag_id: number, limit: number, offset: number) => {
  const results = db
    .query(
      `
SELECT p.post_id, p.url, p.title, p.subtitle, p.excerpt, p.content, p.date
FROM blog_meta as m
INNER JOIN blog_posts as p
ON m.blog_id = p.post_id
WHERE m.meta_key = 'tag' AND m.meta_val = $tag_id AND p.live = 1
GROUP BY p.post_id
ORDER BY p.date DESC
LIMIT $offset, $limit;
		`,
    )
    .all({
      $tag_id: tag_id,
      $limit: limit,
      $offset: offset,
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
    const cats = getPostCats(post.post_id);
    const tags = getPostTags(post.post_id);
    const main = getMainCat(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
};

export const getPostsByCatID = (
  cat_id: number,
  limit: number,
  offset: number,
) => {
  let posts = getPostsByCat(cat_id, limit, offset);
  posts.forEach((post: any) => {
    const cats = getPostCats(post.post_id);
    const tags = getPostTags(post.post_id);
    const main = getMainCat(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
};

export const getPostsBySubCatID = (
  subcat_id: number,
  limit: number,
  offset: number,
) => {
  let posts = getPostsBySubCat(subcat_id, limit, offset);
  posts.forEach((post: any) => {
    const cats = getPostCats(post.post_id);
    const tags = getPostTags(post.post_id);
    const main = getMainCat(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
};

export const getPostsByTagID = (
  tag_id: number,
  limit: number,
  offset: number,
) => {
  let posts = getPostsByTag(tag_id, limit, offset);
  posts.forEach((post: any) => {
    const cats = getPostCats(post.post_id);
    const tags = getPostTags(post.post_id);
    const main = getMainCat(cats[0].blog_cat_id);
    post.meta = { cats, tags, main };
  });
  return posts;
};

export { quit };
