import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

const sitemap = new SitemapStream({ hostname: "https://dy0r10h1o4v6b.cloudfront.net" });

const writeStream = createWriteStream("public/sitemap.xml");

sitemap.pipe(writeStream);

sitemap.write({ url: "/", priority: 1 });
sitemap.write({ url: "/category/doll", priority: 0.5 });
sitemap.write({ url: "/category/figure", priority: 0.5 });
sitemap.write({ url: "/category/toy", priority: 0.5 });
sitemap.write({ url: "/category/object", priority: 0.5 });
sitemap.write({ url: "/category/etc", priority: 0.5 });

streamToPromise(sitemap).then(() => console.log("Sitemap created!"));
sitemap.end();
