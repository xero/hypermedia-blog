import { BlogPost } from "../models/blog.js";

export function generateRSS(domain: string, posts: BlogPost) {
	const buildDate = new Date().toUTCString();
	let feed: string =
`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>xero's blog: the RSS feed</title>
		<link>${domain}</link>
		<description>xero's blog: programming, code, art, ascii, pixel, text art, ansi, lab, notes, graffiti, neovim, vim, linux, unix, nerd, bun.sh, htmx, tailwindcss, xero, x-e.ro, xxe.ro, 0w.nz, xero.style</description>
		<lastBuildDate>${buildDate}</lastBuildDate>
		<language>en-us</language>
		<atom:link href="${domain}/rss.xml" rel="self" type="application/rss+xml" />`

	posts.forEach(post => {
		let postDate = new Date(post.date * 1000).toUTCString();
		let excerpt:string = post.excerpt.replaceAll('<img src="/ui/img', `<img src="${domain}/ui/img`);
		feed += `
		<item>
			<title>${post.title}</title>
			<link>${domain}/${post.url}</link>
			<guid>${domain}/${post.url}</guid>
			<pubDate>${postDate}</pubDate>
			<description> <![CDATA[ ${excerpt} ]]></description>
		</item>`
	});
	Bun.write('dist/rss.xml', `${feed}
	</channel>
</rss>`);
}

export function generateAtom(domain: string, posts: BlogPost) {
	const buildDate = new Date().toISOString();
	let feed: string =
`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>xero's blog: the atom feed</title>
    <subtitle type="html">xero's blog: programming, code, art, ascii, pixel, text art, ansi, lab, notes, graffiti, neovim, vim, linux, unix, nerd, bun.sh, htmx, tailwindcss, xero, x-e.ro, xxe.ro, 0w.nz, xero.style</subtitle>
    <link href="${domain}/"></link>
    <updated>${buildDate}</updated>
    <author>
        <name>xero harrison</name>
    </author>
    <id>${domain}/</id>
    <link rel="self" href="${domain}/atom.xml" />`

	posts.forEach(post => {
		let postDate = new Date(post.date * 1000).toISOString();
		let excerpt:string = post.excerpt.replaceAll('<img src="/ui/img', `<img src="${domain}/ui/img`);
		feed += `
    <entry>
        <title>${post.title}</title>
        <id>${domain}/${post.url}</id>
        <link rel="alternate" href="${domain}/${post.url}"/>
        <summary type="html"><![CDATA[ ${excerpt} ]]></summary>
        <author>
            <name>xero harrison</name>
        </author>
        <updated>${postDate}</updated>`
		post.meta.cats.forEach(cat => {
			feed += `<category term="${cat.name}"/>`
		});
		feed += `
		</entry>`
	});
	Bun.write('dist/atom.xml', `${feed}
</feed>`);
}
