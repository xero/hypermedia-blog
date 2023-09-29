# static blog

### what are you doing?

i'm rebuild my website using the "islands" pattern. taking a database driven site and converting it to a static  ｈｙｐｅｒｍｅｄｉａ site generator using sqlite, bun, htmx, and tailwindcss, mustache, & typescript.

> please note, i'm doing this project to learn these technologies, so i'm probably doing it wrong.

## how does it work?

the scripts loops through the database creating both fully rendered html documents and dom snippets for every page on the site. nginx reads requests and will serve one or the other based on the existence of the `hx-request` header.
`hx-boost` is employed to automatically hoist all anchor tags to ajax requests, making the magic happen. the response documents contain `<title>` tags which htmx recognizes and applies to the page for better UX & SEO.

### building

all build commands are run using bun.

* `bun install` will pull down all the required dependencies.
* `bun init` builds the `dist` folder which will contain the rendered site. (also moves files into place)
* `bun htmx` will run the typescript to actually generate the site.
* `bun css` runs the postcss scripts to generate & optimize the site's styling using tailwindscss.
* `bun start` runs all three commands.

### data

the site's content is generated from a 4 table [sqlite database](https://github.com/xero/static-blog/blob/main/src/db.sqlite) containing: posts, categories, tags, and a relational metadata table that correlates them. database logic exists in: [src/models](https://github.com/xero/static-blog/tree/main/src/models).

### templates

html/mustache templates live in: [src/views](https://github.com/xero/static-blog/tree/main/src/views)

the main stylesheet: [src/ui/theme.css](https://github.com/xero/static-blog/blob/main/src/ui/theme.css)

# status

demo build at [https://xero.0w.nz](https://xero.0w.nz)

core features are working. actual posts need more formatting. that being said, project is active wip, so it my be broken at any time.

## todo & ideas

* fix max pagination (max pages seems ignored)
* syntax highlighting for code posts
* optimizations (esp in the view templ8)
* database
    * post cleanup (blockquotes, code, image urls, etc)
    * house keeping (unused columns like comments)
* `bun edit` for a local web wysiwyg editor?
* nginx alternatives (e.g. [caddy](https://caddyserver.com/docs/caddyfile/matchers))
    * nginx hx-header "root rewrite" vs inline hx-get to slug urls perf testing
* idk, maybe actual blogging?   •͡˘㇁•͡

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

# license

![kopimi logo](https://gist.githubusercontent.com/xero/cbcd5c38b695004c848b73e5c1c0c779/raw/6b32899b0af238b17383d7a878a69a076139e72d/kopimi-sm.png)

all files in this repo, including my blog's content, are released [CC0](https://creativecommons.org/publicdomain/zero/1.0/) / [kopimi](https://kopimi.com)! in the spirit of _freedom of information_, i encourage you to fork, modify, change, share, or do whatever you like with this project! `^c^v`
