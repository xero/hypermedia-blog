import {
	addCat,
	addPost,
	addTag,
	checkCat,
	checkTag,
	modCat,
	modPost,
	modTag,
	rmPost,
} from "./models/admin.js";
import { getPostByURL } from "./models/blog.js";
import {
	RenderDelete,
	RenderEdit,
	RenderEditCat,
	RenderEditForm,
	RenderEditTag,
	RenderForm,
	RenderMeta,
	RenderNewForm,
	RenderResponse,
} from "./views/admin/admin.js";

const domain: string = "https://xero.0w.nz";

Bun.serve({
	port: 8999,
	hostname: "xero.0w.nz",
	tls: {
		cert: Bun.file("/etc/ssl/private/letsencrypt-domain.pem"),
		key: Bun.file("/etc/ssl/private/letsencrypt-domain.key"),
	},
	async fetch(req) {
		const url = new URL(req.url);
		let form: string;
		switch (url.pathname) {
			case "/":
				form = await RenderForm(domain);
				return new Response(form, {
					headers: {
						"Content-Type": "text/html",
					},
				});

			case "/new":
				switch (req.method) {
					case "GET":
						form = await RenderNewForm(req.headers.has("HX-Request"), domain);
						return new Response(form, {
							headers: {
								"Content-Type": "text/html",
							},
						});

					case "POST":
						const newdata = await req.formData();
						const newpost = {
							id: newdata.get("post_id"),
							live: newdata.get("live"),
							date: newdata.get("date"),
							title: newdata.get("title"),
							url: newdata.get("url"),
							subtitle: newdata.get("subtitle"),
							excerpt: newdata.get("excerpt"),
							content: newdata.get("content"),
							tags: newdata.getAll("tags").filter(function(el) {
								return el != "";
							}),
							cats: newdata.getAll("cats").filter(function(el) {
								return el != "";
							}),
						};
						addPost(newpost);
						const html = await RenderResponse(
							"new post saved!",
							'<img src="https://0.xxe.ro/adventure-5.gif" alt="high five!">'
						);
						return new Response(html, {
							headers: {
								"Content-Type": "text/html",
							},
						});
				}

			case "/edit":
				switch (req.method) {
					case "POST":
						const postid = await req.formData();
						form = await RenderEditForm(
							postid.get("post_id")?.toString(),
							domain,
						);
						return new Response(form, {
							headers: {
								"Content-Type": "text/html",
							},
						});

					case "PUT":
						const editdata = await req.formData();
						const editpost = {
							id: editdata.get("post_id"),
							live: editdata.get("live"),
							date: editdata.get("date"),
							title: editdata.get("title"),
							url: editdata.get("url"),
							subtitle: editdata.get("subtitle"),
							excerpt: editdata.get("excerpt"),
							content: editdata.get("content"),
							tags: editdata.getAll("tags").filter(function(el) {
								return el != "";
							}),
							cats: editdata.getAll("cats").filter(function(el) {
								return el != "";
							}),
						};
						modPost(editpost);
						const html = await RenderResponse(
							"update complete",
							'<img src="https://0.xxe.ro/ok.gif" alt="ok">',
						);
						return new Response(html, {
							headers: {
								"Content-Type": "text/html",
							},
						});

					case "GET":
						form = await RenderEdit(req.headers.has("HX-Request"), domain);
						return new Response(form, {
							headers: {
								"Content-Type": "text/html",
							},
						});
				}

			case "/delete":
				if (req.method == "DELETE") {
					const post: any = await req.formData();
					const id = getPostByURL(post.get("post_id")?.toString());
					rmPost(id[0].post_id);
					const html = await RenderResponse(
						'RIP THAT POST <i class="nf nf-md-coffin"></i>',
						'<img src="https://0.xxe.ro/delete.gif" alt="rip">',
					);
					return new Response(html, {
						headers: {
							"Content-Type": "text/html",
						},
					});
				} else {
					form = await RenderDelete(req.headers.has("HX-Request"), domain);
					return new Response(form, {
						headers: {
							"Content-Type": "text/html",
						},
					});
				}

			case "/meta":
				form = await RenderMeta(req.headers.has("HX-Request"), domain);
				return new Response(form, {
					headers: {
						"Content-Type": "text/html",
					},
				});

			case "/meta/tag/new":
				const newTag: any = await req.formData();
				const tagName = newTag.get("tagname")?.toString();
				const tagUrl = newTag.get("tagurl")?.toString();
				addTag(tagName, tagUrl);
				const newTagHtml = await RenderResponse(
					'created new tag: <em>' + tagName + '</em>',
					'<img src="https://0.xxe.ro/ok.gif" alt="ok">',
				);
				return new Response(newTagHtml, {
					headers: {
						"Content-Type": "text/html",
					},
				});

			case "/meta/cat/new":
				const newCat: any = await req.formData();
				const catName = newCat.get("catname")?.toString();
				const catUrl = newCat.get("caturl")?.toString();
				const catParent = parseInt(newCat.get("catparent")?.toString());
				addCat(catName, catUrl, catParent);
				const newCatHtml = await RenderResponse(
					'created new category: <em>' + catName + '</em>',
					'<img src="https://0.xxe.ro/ok.gif" alt="ok">',
				);
				return new Response(newCatHtml, {
					headers: {
						"Content-Type": "text/html",
					},
				});

			case "/meta/tag/edit":
				switch (req.method) {
					case "POST":
						const tagForm: any = await req.formData();
						const editTag = tagForm.get("edittag")?.toString();
						const tagInfo = checkTag(editTag);
						form = await RenderEditTag(tagInfo);
						return new Response(form, {
							headers: {
								"Content-Type": "text/html",
							},
						});

					case "PUT":
						const editTagForm: any = await req.formData();
						const editTagName: string = editTagForm.get("tagname")?.toString();
						modTag(
							editTagForm.get("tagid")?.toString(),
							editTagName,
							editTagForm.get("tagurl")?.toString()
						);
						const editTagHtml = await RenderResponse(
							'category edited: <em>' + editTagName + '</em>',
							'<img src="https://0.xxe.ro/ok.gif" alt="ok">',
						);
						return new Response(editTagHtml, {
							headers: {
								"Content-Type": "text/html",
							},
						});
				}

			case "/meta/cat/edit":
				switch (req.method) {
					case "POST":
						const catForm: any = await req.formData();
						const editCat = catForm.get("editcat")?.toString();
						const catInfo = checkCat(editCat);
						form = await RenderEditCat(catInfo);
						return new Response(form, {
							headers: {
								"Content-Type": "text/html",
							},
						});

					case "PUT":
						const editCatForm: any = await req.formData();
						const editCatName = editCatForm.get("catname")?.toString();
						modCat(
							editCatForm.get("catid")?.toString(),
							editCatForm.get("blogcatid")?.toString(),
							editCatForm.get("catparent")?.toString(),
							editCatName,
							editCatForm.get("caturl")?.toString(),
						);
						const editCatHtml = await RenderResponse(
							'category edited: <em>' + editCatName + '</em>',
							'<img src="https://0.xxe.ro/ok.gif" alt="ok">',
						);
						return new Response(editCatHtml, {
							headers: {
								"Content-Type": "text/html",
							},
						});
				}

			default:
				return new Response("404!");
		}
	},
});
