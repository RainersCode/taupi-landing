import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Blog ("Padomi") — the SEO content engine. Each markdown file in
 * src/content/blog/ becomes /padomi/<filename>/. LV is the primary
 * (and for now only) locale; the `locale` field exists so EN posts can
 * be added later without a schema change.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    locale: z.enum(["lv", "en"]).default("lv"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/**
 * Gids ("Palīdzība") — task-based app guides. Each markdown file in
 * src/content/gids/ becomes /gids/<filename>/. A guide is a topic hub:
 * its H2 sections are the individual sub-guides (anchor-linkable, so the
 * app can deep-link straight to /gids/merki/#ka-dzest-merki). `order`
 * drives the index listing; LV-only for now, same locale escape hatch
 * as the blog.
 */
const gids = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gids" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    updatedDate: z.coerce.date(),
    locale: z.enum(["lv", "en"]).default("lv"),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, gids };
