export const runtime = 'edge';

import ArticleDetailPage from './articleDetailPage';
import { fetchArticleBySlug } from '@/lib/api-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetchArticleBySlug(slug, 'afrobeatsrep');
    
    if (response?.data) {
      const article = response.data as { title?: string; description?: string; published_at?: string; creator?: string; tags?: string[]; image_url?: string };
      return {
        title: `${article.title} | AfroBeats`,
        description: article.description || 'Entertainment, music, and lifestyle content from AfroBeats',
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          publishedTime: article.published_at,
          authors: article.creator ? [article.creator] : [],
          tags: article.tags,
        },
        twitter: {
          card: article.image_url ? 'summary_large_image' : 'summary',
          title: article.title,
          description: article.description,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Entertainment Article | AfroBeats',
    description: 'Latest entertainment, music, and lifestyle content from AfroBeats',
  };
}

async function getArticleData(slug: string) {
  return fetchArticleBySlug(slug, 'afrobeatsrep');
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    return null;
  }
  
  const articleData = await getArticleData(slug);
  
  return (
    <ArticleDetailPage 
      initialArticle={articleData?.data}
    />
  );
}
