import { getPostAndMeta, getPosts, quit } from "./models/blog.js";

// const post = getPostAndMeta("cthulhu_ansi");
// console.log(post);

const posts = getPosts(200, 0);
console.log(posts);
Bun.write("posts.json", JSON.stringify(posts));
quit();
