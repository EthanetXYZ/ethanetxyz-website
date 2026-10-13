// Build-time GitHub stats for project cards. Fetched once per repo per build.
// In GitHub Actions, GITHUB_TOKEN raises the API rate limit; locally it works unauthenticated (60 req/hour).

export interface RepoStats {
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: Date;
  release?: { tag: string; url: string; publishedAt: Date };
}

const cache = new Map<string, Promise<RepoStats | undefined>>();

export function parseRepo(url?: string): string | undefined {
  const m = url?.match(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?].*)?$/i);
  return m ? `${m[1]}/${m[2]}` : undefined;
}

async function gh(path: string): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  return fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ethanet.xyz-build',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

async function load(slug: string): Promise<RepoStats | undefined> {
  try {
    const repoRes = await gh(`repos/${slug}`);
    if (!repoRes.ok) {
      console.warn(`[github] ${slug}: HTTP ${repoRes.status}, skipping stats`);
      return undefined;
    }
    const repo = await repoRes.json();
    const stats: RepoStats = {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      pushedAt: new Date(repo.pushed_at),
    };
    const relRes = await gh(`repos/${slug}/releases/latest`);
    if (relRes.ok) {
      const rel = await relRes.json();
      stats.release = { tag: rel.tag_name, url: rel.html_url, publishedAt: new Date(rel.published_at) };
    }
    return stats;
  } catch (err) {
    // Never fail the build because GitHub is unreachable.
    console.warn(`[github] ${slug}: ${(err as Error).message}, skipping stats`);
    return undefined;
  }
}

export function getRepoStats(repoUrl?: string): Promise<RepoStats | undefined> {
  const slug = parseRepo(repoUrl);
  if (!slug) return Promise.resolve(undefined);
  if (!cache.has(slug)) cache.set(slug, load(slug));
  return cache.get(slug)!;
}
