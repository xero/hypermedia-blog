# static blog

building a static site generator using bun, htmx, and tailwindcss, and typescript.

> please note, i'm doing this project to learn these technologies. i'm probably doing it wrong.

# ideas

* have `nginx` append `.html` to urls
* need a 404 handler

## url structure

```
GET /                                          getPosts(8,0)
GET /page/:page                                getPosts(8,#)
GET /tag/:tag                             getPostsByTag(s,0)
GET /tag/:tag/page/:page                  getPostsByTag(s,#)
GET /category/:cat                        getPostsByCat(s,0)
GET /category/:cat/page/:page             getPostsByCat(s,#)
GET /category/:cat/:subcat             getPostsBySubCat(s,s,0)
GET /category/:cat/:subcat/page/:page  getPostsBySubCat(s,s,#)
GET /:post                                 getPostByURL(s)
```

# references

* https://bun.sh/docs
* https://bun.sh/docs/api/sqlite
* https://tailwindcss.com/docs
* https://tailwindcomponents.com/cheatsheet
* https://htmx.org/docs
* https://htmx.org/api
* https://htmx.org/attributes/hx-push-url
* https://www.nerdfonts.com/cheat-sheet

