import Mustache from "mustache";
import {
	BlogCats,
	BlogTags,
	getCategories,
	getPostByURL,
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

export async function RenderNewForm(hx: boolean, domain: string) {
	const postHtml = await getFile("post_editor");
	const form: string = Mustache.render(postHtml, {
		form: 'hx-post="/new"',
		date: new Date().toLocaleDateString("en-CA", {
			timeZone: "America/New_York",
		}),
		tags: () => {
			let tags: string = "";
			const allTags = getTags();
			allTags.forEach((tag) => {
				tags += `<option value="${tag.name}"></option>`;
			});
			return tags;
		},
		cats: () => {
			let cats: string = "";
			const allCats = getCategories();
			allCats.forEach((cat) => {
				cats += `<option value="${cat.name}"></option>`;
			});
			return cats;
		},
	});
	if (hx) {
		return form;
	} else {
		const newHtml = await getFile("main");
		return Mustache.render(newHtml, {
			domain: domain,
			footer: "xero harrison",
			content: form,
			ripcache: Date.now(),
		});
	}
}
export async function RenderResponse(title: string, body: string) {
	const postHtml = await getFile("response");
	return Mustache.render(postHtml, {
		body: body,
		title: title,
	});
}

export async function RenderEditForm(post: any, domain: string) {
	const postHtml = await getFile("post_editor");
	const postData = getPostByURL(post);
	const live: string = postData[0].live == 1 ? "checked" : "";
	return Mustache.render(postHtml, {
		form: 'hx-put="/edit"',
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
	const blogPosts: any = getAllPosts();
	let list: string = "";
	blogPosts.forEach((post: any) => {
		list += `
				<option value="${post.url}"/>`;
	});
	const listHtml = await getFile("rm_select");
	const rmList: string = Mustache.render(listHtml, { list: list });
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

export async function RenderMeta(hx: boolean, domain: string) {
	const meta = await getFile("meta");
	const metaForm: string = Mustache.render(meta, {
		cats: () => {
			let cats: string = '';
			const allCats = getCategories();
			allCats.forEach((cat) => {
				cats += `<option value="${cat.url}">${cat.name}</option>`;
			});
			return cats;
		},
		parentCats: () => {
			let cats: string = '<option value="0">none</option>';
			const allCats = getCategories();
			allCats.forEach((cat) => {
				// top level categories only
				if (cat.blog_cat_id % 1 == 0 && cat.name != "uncategorized") {
					cats += `<option value="${cat.url}">${cat.name}</option>`;
				}
			});
			return cats;
		},
		tags: () => {
			let tags: string = "";
			const allTags = getTags();
			allTags.forEach((tag) => {
				tags += `<option value="${tag.tag_id}">${tag.name}</option>`;
			});
			return tags;
		},
	});
	if (hx) {
		return metaForm;
	} else {
		const metaHtml = await getFile("main");
		return Mustache.render(metaHtml, {
			domain: domain,
			footer: "xero harrison",
			content: metaForm,
			ripcache: Date.now(),
		});
	}
}

export async function RenderEditTag(tag: BlogTags) {
	const editTag = await getFile("edit_tag");
	const tagForm: string = Mustache.render(editTag, {
		tagName: tag[0].name,
		tagUrl: tag[0].url,
		tagId: tag[0].tag_id,
	});
	return tagForm;
}

export async function RenderEditCat(cat: BlogCats) {
	const editCat = await getFile("edit_cat");
	const catForm: string = Mustache.render(editCat, {
		catName: cat[0].name,
		catUrl: cat[0].url,
		catId: cat[0].cat_id,
		blogCatId: cat[0].blog_cat_id,
		parentCats: () => {
			let selected: boolean = false;
			let cats: string = `<option value="${cat[0].blog_cat_id}"`;
			// check if already a top level category
			if (Math.floor(cat[0].blog_cat_id) == cat[0].blog_cat_id) {
				cats += ' selected="selected" ';
				selected = true;
			}
			cats += '>none</option>';
			const allCats = getCategories();
			allCats.forEach((pcat) => {
				// top level categories only
				if (pcat.blog_cat_id % 1 == 0 && pcat.name != "uncategorized") {
					cats += `<option value="${pcat.blog_cat_id}"`;
					if (!selected && Math.floor(cat[0].blog_cat_id) == Math.floor(pcat.blog_cat_id)) {
						cats += ' selected="selected" ';
						selected = true;
					}
					cats += `>${pcat.name}</option>`;
				}
			});
			return cats;
		},
	});
	return catForm;
}
