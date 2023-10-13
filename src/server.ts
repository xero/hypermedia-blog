import { updatePost } from "./models/admin.js";
import {
  RenderDelete,
  RenderEdit,
  RenderEditForm,
  RenderForm,
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
        const html = await RenderResponse(
          'you wanna blog?',
          '<img src="https://0.xxe.ro/emacs.gif" alt="typing">'
        );
        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });

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
            updatePost(editpost);
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
          const post = await req.formData();
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
