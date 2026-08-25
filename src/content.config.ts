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
    /**
     * Embed a live calculator under the article body. A post that answers
     * "how should I split my income" beats a bank's prose answer by letting
     * the reader do it on the page — and it is the one thing the bank blogs
     * ranking for these queries do not have.
     */
    calculator: z.enum(["budget", "compound", "emergency", "debt"]).optional(),
    /** Rendered as an accordion + FAQPage JSON-LD (see ToolFaq.astro). */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /**
     * Where the figures came from. Financial claims without a citation are
     * exactly what Google discounts in YMYL content — and what the bank
     * pages ranking above us already do.
     */
    sources: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
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
    // Index grouping: "pamati" = the setup flows, "ikdiena" = everyday use.
    group: z.enum(["pamati", "ikdiena"]).default("pamati"),
    updatedDate: z.coerce.date(),
    locale: z.enum(["lv", "en"]).default("lv"),
    draft: z.boolean().default(false),
  }),
});

/**
 * Tools — long-form body copy for a calculator page, one file per tool per
 * locale (e.g. emergency-lv.md). The calculator itself is the reason people
 * land there, but a tool with 300 words around it loses to a bank article
 * with 2 000; this is where that depth lives. A tool with no entry for a
 * locale simply renders the short method section, so LV can go deep without
 * forcing an EN translation.
 */
const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    tool: z.enum(["budget", "compound", "emergency", "debt"]),
    locale: z.enum(["lv", "en"]).default("lv"),
    /** Citations rendered under the body — see the blog collection. */
    sources: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
  }),
});

export const collections = { blog, gids, tools };
