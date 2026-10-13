import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The CMS writes empty optional fields as ''. Treat those as "not set".
const blank = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

// Field names here must stay in sync with public/admin/config.yml (the CMS).

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    order: z.number().default(100),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: blank(z.coerce.date()),
    category: reference('categories'),
    tags: z.array(z.string()).default([]),
    heroImage: blank(z.string()),
    heroAlt: blank(z.string()),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repo: blank(z.url()),
    url: blank(z.url()),
    status: z.enum(['active', 'maintained', 'experimental', 'archived']).default('active'),
    category: blank(reference('categories')),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

export const collections = { categories, posts, projects };
