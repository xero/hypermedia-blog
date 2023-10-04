# hypermedia static blog generator

### what are you doing?

i'm rebuilding my website using the "[islands](https://jasonformat.com/islands-architecture/)" design pattern. taking a database driven site and converting it to a static  ｈｙｐｅｒｍｅｄｉａ powered site generator.

(i was thinking about calling this project **TNTHUMBS** b/c it's built using: [t](https://typescriptlang.org)ypescript [n](https://nginx.org)ginx [t](https://tailwindcss.com)ailwindcss [h](https://htmx.org)tmx [u](https://unix.org)nix [m](https://mustache.github.io)ustache [b](https://bun.sh)un [s](https://sqlite.org/)qlite)

> please note, i'm doing this project to learn some of these technologies, so i'm undoubtly doing it wrong in a lot of places. suggestions & pr's are always welcome.

## how does it work?

the scripts loops through the database creating both fully rendered html documents and dom snippets for every page on the site. nginx reads requests and will serve one or the other based on the existence of the `hx-request` header.
`hx-boost` is employed to automatically hoist all anchor tags to ajax requests, making the magic happen. the response documents contain `<title>` tags which htmx recognizes and applies to the page for better UX & SEO.

### building

all build commands are run using bun.

* `bun install` will pull down all the required dependencies.
* `bun run init` builds the `dist` folder structure and moves files into place for the rendered site.
* `bun htmx` will run the typescript to actually generate the site's html assets.
* `bun css` runs the postcss scripts to generate & optimize the site's styling using tailwindscss.
* `bun start` runs init, htmx, and css.
* `bun edit` runs the backend server for database management.

### data

the site's content is generated from a 4 table [sqlite database](https://github.com/xero/static-blog/blob/main/src/db.sqlite) containing: posts, categories, tags, and a relational metadata table that correlates them. database logic exists in: [src/models](https://github.com/xero/static-blog/tree/main/src/models).

### templates

html/mustache templates live in: [src/views](https://github.com/xero/static-blog/tree/main/src/views)

the main stylesheet is here: [src/ui/theme.css](https://github.com/xero/static-blog/blob/main/src/ui/theme.css). i know i'm using tailwinds _"wrong"_ get outta here.

# status

demo build at [https://xero.0w.nz](https://xero.0w.nz)

core features are working. actual posts need a bit more formatting. the admin backed is still super wip. project is under active dev, so the demo site may be broken at any time.

## todo & ideas

* `bun edit` for a local web wysiwyg editor
    * CRUD ops for posts, cats, tags, & metadata
    * real-time post previews
* database house keeping
    * post cleanup (blockquotes, code, image urls, etc)
    * table cleanup (unused columns like comments, rename some meta cols)
* nginx alternatives (e.g. [caddy](https://caddyserver.com/docs/caddyfile/matchers))
    * nginx hx-header "root rewrite" vs inline hx-get to slug urls perf testing
* idk, maybe actual blogging?     •͡˘㇁•͡

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
