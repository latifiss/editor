import ArticleDetailPage from './articleDetailPage';
import { store } from '@/store/app/store';

import { articleApi } from '@/store/features/ghanascore/article/articleAPI';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await store.dispatch(
      articleApi.endpoints.getArticleBySlug.initiate(slug)
    );
    
    if ('data' in response && response.data?.data) {
      const article = response.data.data;
      return {
        title: `${article.title} | GhanaScore`,
        description: article.description || 'Sports news and live scores from GhanaScore',
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          publishedTime: article.published_at,
          authors: [article.creator],
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
    title: 'Sports Article | GhanaScore',
    description: 'Latest sports news and live scores from GhanaScore',
  };
}

async function getArticleData(slug: string) {
  try {
    const response = await store.dispatch(
      articleApi.endpoints.getArticleBySlug.initiate(slug)
    );
    
    return ('data' in response) ? response.data : null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
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