import { Database } from "bun:sqlite";
import { BlogTags, getPostTags } from "./blog.js";

const db = new Database("src/db.sqlite");

/*   _           _ ___    _        __
 *  |_ | | |\ | /   |  | / \ |\ | (_
 *  |  |_| | \| \_  |  | \_/ | \| __)
 */
export const getAllPosts = (): any => {
  const results: any = db
    .query(
      `
SELECT * FROM blog_posts
ORDER BY date DESC;
    `,
    )
    .all({});
  return results;
};

export const checkTag = (tag: string): any => {
  const results: any = db
    .query(
      `
SELECT * FROM blog_tags
WHERE url = $tag or name = $tag
LIMIT 1;
    `,
    )
    .all({ $tag: tag });
  return results;
};

export const addTag = (tag: string, url: string): any => {
  let clean = url == "" ? tag : url;
  clean = clean
    .trim()
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/[^0-9a-z_]/g, "");
  db.query(
    `
INSERT INTO blog_tags
(tag_id, name, url, tag_count)
VALUES (NULL, $name, $url, 0);
`,
  ).all({
    $name: tag,
    $url: clean,
  });
  return checkTag(tag);
};

export const rmMeta = (post: number, type: string, val: number): void => {
  db.query(
    `
DELETE FROM blog_meta
WHERE blog_id = $post
AND meta_key = $type
and meta_val = $val;
`,
  ).all({
    $post: post,
    $type: type,
    $val: val,
  });

  if (type == "tag") {
    let tagCount: any = db
      .query(
        `
SELECT tag_count
FROM blog_tags
WHERE tag_id = $tag_id
LIMIT 1;
`,
      )
      .all({ $tag_id: val });
    let count: number = parseInt(tagCount[0].tag_count);
    if (count > 0) {
      count--;
    }
    db.query(
      `
UPDATE blog_tags
SET tag_count = $count
WHERE tag_id = $tag_id;
`,
    ).all({
      $count: count,
      $tag_id: val,
    });
  }
};

export const addMeta = (post: number, type: string, val: number): void => {
  db.query(
    `
INSERT INTO blog_meta
(meta_id, blog_id, meta_key, meta_val)
VALUES (NULL , $post, $type, $val);
`,
  ).all({
    $post: post,
    $type: type,
    $val: val,
  });

  if (type == "tag") {
    let tagCount: any = db
      .query(
        `
SELECT tag_count
FROM blog_tags
WHERE tag_id = $tag_id
LIMIT 1;
`,
      )
      .all({ $tag_id: val });
    let count: number = parseInt(tagCount[0].tag_count);
    count++;
    db.query(
      `
UPDATE blog_tags
SET tag_count = $count
WHERE tag_id = $tag_id;
`,
    ).all({
      $count: count,
      $tag_id: val,
    });
  }
};

export const updatePost = (post: any): void => {
  const live = post.live == "on" ? 1 : 0;

  // @todo: update db date format to mili epoch
  const date = new Date(post.date).valueOf() / 1000;
  db.query(
    `
UPDATE blog_posts
SET date = $date,
    title = $title,
    subtitle = $subtitle,
    excerpt = $excerpt,
    content = $content,
		url = $url,
    live = $live
WHERE post_id = $id;
    `,
  ).all({
    $id: post.id,
    $live: live,
    $date: date,
    $title: post.title,
    $subtitle: post.subtitle,
    $excerpt: post.excerpt,
    $content: post.content,
    $url: post.url,
  });

  const currentTags: BlogTags = getPostTags(post.id);
  post.tags.forEach((tag: any) => {
    if (currentTags.filter((t) => t.url == tag).toString().length == 0) {
      let tagId: BlogTags = checkTag(tag);
      if (tagId[0] == undefined) {
        tagId = addTag(tag, "");
      }
			addMeta(post.id, "tag", tagId[0].tag_id);
    }
  });
  currentTags.forEach((tag) => {
    if (!post.tags.includes(tag.url)) {
      rmMeta(post.id, "tag", tag.tag_id);
    }
  });
};
