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

export const collections = { blog };
