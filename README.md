# static blog

building a static site generator using sqlite, bun, htmx, and tailwindcss, mustache, & typescript.

> please note, i'm doing this project to learn these technologies, so i'm probably doing it wrong.

## status

demo build at [https://xero.0w.nz](https://xero.0w.nz)

core features are working. acutal posts need more formatting. that being said, project is active wip, so it my be broken at any time.

## todo & ideas

* htmx loading indicators
* fix max pagination
* global vars for things like domain
* optimizations. esp in the view templ8
* database
    * post cleanup (blockquotes, code, image urls, etc)
    * house keeping (unused columns like comments)
* `bun edit` for a local web wysiwyg editor?
* nginx alternatives (e.g. [caddy](https://caddyserver.com/docs/caddyfile/matchers))
    * nginx hx-header "root rewrite" vs inline hx-get to slug urls perf testing
* idk, maybe actually blogging?  •͡˘㇁•͡

# references

* https://bun.sh/docs
* https://bun.sh/docs/api/sqlite
* https://tailwindcss.com/docs
* https://tailwindcomponents.com/cheatsheet
* https://htmx.org/docs
* https://htmx.org/api
* https://htmx.org/attributes/hx-push-url
* https://www.nerdfonts.com/cheat-sheet
* https://github.com/janl/mustache.js
* http://mustache.github.io/mustache.5.html
