import { Database } from "bun:sqlite";
import { BlogCats, BlogPost, BlogTags, getPostByURL, getPostCats, getPostTags } from "./blog.js";

const db = new Database("src/db.sqlite");

/*   _           _ ___    _        __
 *  |_ | | |\ | /   |  | / \ |\ | (_
 *  |  |_| | \| \_  |  | \_/ | \| __)
 */
export const getAllPosts = (): any => {
	const results: any = db
		.query(`
SELECT * FROM blog_posts
ORDER BY date DESC;
    `).all({});
	return results;
};

export const checkCat = (cat: string): any => {
	const results: any = db
		.query(`
SELECT * FROM blog_categories
WHERE url = $cat or name = $cat
LIMIT 1;
    `).all({ $cat: cat });
	return results;
};

export const checkTag = (tag: string): any => {
	const results: any = db
		.query(`
SELECT * FROM blog_tags
WHERE url = $tag or name = $tag or tag_id = $tag
LIMIT 1;
    `).all({ $tag: tag });
	return results;
};

export const addCat = (cat: string, url: string, parent: number): any => {
	let clean = url == "" ? cat : url;
	clean = clean
		.trim()
		.toLowerCase()
		.replace(/ /g, "_")
		.replace(/[^0-9a-z_]/g, "");
	db.query(`
INSERT INTO blog_categories
(cat_id, blog_cat_id, name, url)
VALUES (NULL, $parent, $name, $url);
`).all({
		$parent: parent,
		$name: cat,
		$url: clean,
	});
	const catId = checkCat(cat);
	if (parent == 0) {
		db.query(`
UPDATE blog_categories
SET blog_cat_id = $id
WHERE cat_id = $id;
`).all({ $id: catId[0].cat_id });
	} else {
		let count: any = db.query(`
SELECT COUNT(cat_id) as count
FROM blog_categories
WHERE blog_cat_id > $parent
AND blog_cat_id < $next;
`).all({
			$parent: parent,
			$next: parent + 1,
		});

		count = count[0]["count"];
		const newId = parent + ((count + 1) * 0.001);
		db.query(`
UPDATE blog_categories
SET blog_cat_id = $catID
WHERE cat_id = $id;
`).all({
			$catID: newId,
			$id: catId[0].cat_id,
		});
	}
	return checkCat(cat);
};

export const addTag = (tag: string, url: string): any => {
	let clean = url == "" ? tag : url;
	clean = clean
		.trim()
		.toLowerCase()
		.replace(/ /g, "_")
		.replace(/[^0-9a-z_]/g, "");
	db.query(`
INSERT INTO blog_tags
(tag_id, name, url, tag_count)
VALUES (NULL, $name, $url, 0);
`).all({
		$name: tag,
		$url: clean,
	});
	return checkTag(tag);
};

export const rmMeta = (post: number, type: string, val: number): void => {
	db.query(`
DELETE FROM blog_meta
WHERE blog_id = $post
AND meta_key = $type
and meta_val = $val;
`).all({
		$post: post,
		$type: type,
		$val: val,
	});

	if (type == "tag") {
		let tagCount: any = db
			.query(`
SELECT tag_count
FROM blog_tags
WHERE tag_id = $tag_id
LIMIT 1;
`).all({ $tag_id: val });
		let count: number = parseInt(tagCount[0].tag_count);
		if (count > 0) {
			count--;
		}
		db.query(`
UPDATE blog_tags
SET tag_count = $count
WHERE tag_id = $tag_id;
`).all({
			$count: count,
			$tag_id: val,
		});
	}
};

export const addMeta = (post: number, type: string, val: number): void => {
	db.query(`
INSERT INTO blog_meta
(meta_id, blog_id, meta_key, meta_val)
VALUES (NULL , $post, $type, $val);
`).all({
		$post: post,
		$type: type,
		$val: val,
	});

	if (type == "tag") {
		let tagCount: any = db
			.query(`
SELECT tag_count
FROM blog_tags
WHERE tag_id = $tag_id
LIMIT 1;
`).all({ $tag_id: val });
		let count: number = parseInt(tagCount[0].tag_count);
		count++;
		db.query(`
UPDATE blog_tags
SET tag_count = $count
WHERE tag_id = $tag_id;
`).all({
			$count: count,
			$tag_id: val,
		});
	}
};

export const addPost = (post: any): void => {
	const live = post.live == "on" ? 1 : 0;
	// @todo: update db date format to mili epoch
	const date = new Date(post.date).valueOf() / 1000;
	db.query(`
INSERT INTO blog_posts
(post_id, url, title, subtitle, excerpt, content, comments, date, live)
VALUES (NULL, $url, $title, $subtitle, $excerpt, $content, 0, $date, $live);
    `).all({
		$live: live,
		$date: date,
		$title: post.title,
		$subtitle: post.subtitle,
		$excerpt: post.excerpt,
		$content: post.content,
		$url: post.url,
	});

	const id: BlogPost = getPostByURL(post.url);
	post.tags.forEach((tag: any) => {
		let tagId: BlogTags = checkTag(tag);
		if (tagId[0] == undefined) {
			tagId = addTag(tag, "");
		}
		addMeta(id[0].post_id, "tag", tagId[0].tag_id);
	});

	post.cats.forEach((cat: any) => {
		let catId: BlogCats = checkCat(cat);
		if (catId[0] == undefined) {
			catId = addCat(cat, "", 0);
		}
		addMeta(id[0].post_id, "category", catId[0].blog_cat_id);
	});
};

export const modPost = (post: any): void => {
	const live = post.live == "on" ? 1 : 0;
	// @todo: update db date format to mili epoch
	const date = new Date(post.date).valueOf() / 1000;
	db.query(`
UPDATE blog_posts
SET date = $date,
    title = $title,
    subtitle = $subtitle,
    excerpt = $excerpt,
    content = $content,
		url = $url,
    live = $live
WHERE post_id = $id;
    `).all({
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

	const currentCats: BlogCats = getPostCats(post.id);
	post.cats.forEach((cat: any) => {
		if (currentCats.filter((c) => c.url == cat).toString().length == 0) {
			let catId: BlogCats = checkCat(cat);
			if (catId[0] == undefined) {
				catId = addCat(cat, "", 0);
			}
			addMeta(post.id, "category", catId[0].blog_cat_id);
		}
	});
	currentCats.forEach((cat) => {
		if (!post.cats.includes(cat.url)) {
			rmMeta(post.id, "category", cat.blog_cat_id);
		}
	});
};

export const modTag = (tag_id: number, tag_name: string, tag_url: string) => {
	db.query(`
UPDATE blog_tags
SET name = $name, url = $url
WHERE tag_id = $id;
	`).all({
		$name: tag_name,
		$url: tag_url,
		$id: tag_id,
	});
}

export const modCat = (cat_id: number, blog_cat_id: number, parent_cat_id: number, cat_name: string, cat_url: string) => {
	if (parent_cat_id != 0) {
		if (Math.floor(blog_cat_id) == Math.floor(parent_cat_id)) {
			db.query(`
UPDATE blog_categories
SET name = $name, url = $url
WHERE blog_cat_id = $id;
		`).all({
				$name: cat_name,
				$url: cat_url,
				$id: blog_cat_id,
			});
		} else {
			let count: any = db.query(`
SELECT COUNT(blog_cat_id) as count
FROM blog_categories
WHERE blog_cat_id > $parent
AND blog_cat_id < $next;
`).all({
				$parent: parent_cat_id,
				$next: Math.floor(parent_cat_id + 1),
			});

			count = count[0]["count"];
			const newId: number = Math.floor(parent_cat_id) + ((count + 1) * 0.001);
			db.query(`
UPDATE blog_categories
SET blog_cat_id = $catID
WHERE cat_id = $id;
`).all({
				$catID: newId,
				$id: cat_id,
			});
		}
	} else {
		db.query(`
UPDATE blog_categories
SET name = $name, url = $url, blog_cat_id = $id
WHERE cat_id = $id;
		`).all({
			$name: cat_name,
			$url: cat_url,
			$id: cat_id,
		});
	}
};

export const rmPost = (post_id: number): void => {
	db.query(`
DELETE FROM blog_posts
WHERE post_id = $id;
    `).all({ $id: post_id });

	const currentTags: BlogTags = getPostTags(post_id);
	currentTags.forEach((tag) => {
		rmMeta(post_id, "tag", tag.tag_id);
	});

	const currentCats: BlogCats = getPostCats(post_id);
	currentCats.forEach((cat) => {
		rmMeta(post_id, "category", cat.blog_cat_id);
	});
};
