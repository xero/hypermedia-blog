import { RenderDelete, RenderEdit, RenderEditForm, RenderForm } from "./views/admin/admin.js";
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
        break;

      case "/new":
        form = "new";
        return new Response(form, {
          headers: {
            "Content-Type": "text/html",
          },
        });
        break;

      case "/edit":
        if (req.method == "POST") {
          const post = await req.formData();
          form = await RenderEditForm(post.get("post_id")?.toString(), domain);
          return new Response(form, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        } else {
          form = await RenderEdit(req.headers.has("HX-Request"), domain);
          return new Response(form, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        }
        break;

			case "/clean":
				const str = await req.formData();
				let url = str.get("url")?.toString();
				url = url?.replaceAll(" ", "").toLowerCase();
				url = url?.replace(/((?!([a-z0-9])).)/gi, (match) => {
					return (match == "-") ? match : '';
				});
        return new Response(url);
        break;

      case "/delete":
        if (req.method == "DELETE") {
          const post = await req.formData();
          return new Response('<h1>RIP THAT POST &nbsp; <i class="nf nf-md-coffin"></i></h1>', {
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
        break;

      default:
        return new Response("404!");
        break;
    }
  },
});
