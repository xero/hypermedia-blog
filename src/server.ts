import {
	addPost,
	modPost,
	rmPost,
} from "./models/admin.js";
import { getPostByURL } from "./models/blog.js";
import {
	RenderDelete,
	RenderEdit,
	RenderEditForm,
	RenderForm,
	RenderNewForm,
	RenderResponse,
} from "./views/admin/admin.js";

const domain: string = "https://xero.0w.nz";

Bun.serve({
	port: 8888,
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
					const post:any = await req.formData();
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

			default:
				return new Response("404!");
		}
	},
});
