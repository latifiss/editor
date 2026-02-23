/**
 * Edge-safe API fetch helpers.
 * Use these in Edge runtime pages instead of RTK Query to avoid React hooks bundling issues.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://oak.21centurynews.com';

export async function fetchFeatureBySlug(
  slug: string,
  site: 'afrobeatsrep' | 'ghanascore' | 'ghanapolitan'
): Promise<{ data?: unknown } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/${site}/feature/slug/${encodeURIComponent(slug)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchArticleBySlug(
  slug: string,
  site: 'afrobeatsrep' | 'ghanascore' | 'ghanapolitan'
): Promise<{ data?: unknown } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/${site}/article/slug/${encodeURIComponent(slug)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchGraphicBySlug(slug: string): Promise<{ data?: unknown } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/ghanapolitan/graphic/slug/${encodeURIComponent(slug)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSimilarArticles(
  slug: string,
  site: 'ghanapolitan'
): Promise<{ data?: { articles?: unknown[] } } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/${site}/article/similar/${encodeURIComponent(slug)}?page=1&limit=5`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
