export const runtime = 'edge';

import ArticleDetailPage from './articleDetailPage';
import { fetchArticleBySlug, fetchSimilarArticles } from '@/lib/api-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetchArticleBySlug(slug, 'ghanapolitan');
    
    if (response?.data) {
      const article = response.data as { title?: string; description?: string; published_at?: string; creator?: string; tags?: string[] };
      return {
        title: `${article.title} | GhanaPolitan`,
        description: article.description || 'Read this article on GhanaPolitan',
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          publishedTime: article.published_at,
          authors: article.creator ? [article.creator] : [],
          tags: article.tags,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Article | GhanaPolitan',
    description: 'Read articles on GhanaPolitan',
  };
}

async function getArticleData(slug: string) {
  try {
    const [articleResponse, similarResponse] = await Promise.all([
      fetchArticleBySlug(slug, 'ghanapolitan'),
      fetchSimilarArticles(slug, 'ghanapolitan'),
    ]);
    
    return {
      article: articleResponse,
      similarArticles: similarResponse,
    };
  } catch (error) {
    console.error('Failed to fetch article data:', error);
    return {
      article: null,
      similarArticles: null,
    };
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    return null;
  }
  
  const { article, similarArticles } = await getArticleData(slug);
  
  return (
    <ArticleDetailPage 
      initialArticle={article?.data}
      initialSimilarArticles={similarArticles?.data?.articles}
    />
  );
}