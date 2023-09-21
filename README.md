# xero.0w.nz

testing bun, htmx, and tailwindcss


# ideas

* have `nginx` append `.html` to urls

## url structure

```
GET /                                         blog->newest
GET /page/:page                               blog->newest
GET /tag/:tag                                   blog->tags
GET /tag/:tag/page/:page                        blog->tags
GET /category/:cat                        blog->categories
GET /category/:cat/page/:page             blog->categories
GET /category/:cat/:subcat             blog->subcategories
GET /category/:cat/:subcat/page/:page  blog->subcategories
GET /:post                                      blog->post
```

# todo

* typscript sqlite adapter

# references

* https://tailwindcss.com/docs
* https://tailwindcomponents.com/cheatsheet
* https://htmx.org/docs
* https://htmx.org/api
* https://htmx.org/attributes/hx-push-url
* https://www.nerdfonts.com/cheat-sheet

