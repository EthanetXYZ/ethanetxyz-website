import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Category = CollectionEntry<'categories'>;

/** Published posts, newest first. Drafts are visible in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getCategories(): Promise<Category[]> {
  const cats = await getCollection('categories');
  return cats.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

export async function getCategoryMap(): Promise<Map<string, Category>> {
  return new Map((await getCategories()).map((c) => [c.id, c]));
}

export function readingTime(body = ''): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 225));
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
