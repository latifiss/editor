import ArticleDetailPage from './articleDetailPage';
import { store } from '@/store/app/store';

import { ghanapolitanArticleApi } from '@/store/features/ghanapolitan/articles/articleAPI';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await store.dispatch(
      ghanapolitanArticleApi.endpoints.getArticleBySlug.initiate(slug)
    );
    
    if ('data' in response && response.data?.data) {
      const article = response.data.data;
      return {
        title: `${article.title} | GhanaPolitan`,
        description: article.description || 'Read this article on GhanaPolitan',
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          publishedTime: article.published_at,
          authors: [article.creator],
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
      store.dispatch(articleApi.endpoints.getArticleBySlug.initiate(slug)),
      store.dispatch(articleApi.endpoints.getSimilarArticles.initiate({ slug }))
    ]);
    
    return {
      article: ('data' in articleResponse) ? articleResponse.data : null,
      similarArticles: ('data' in similarResponse) ? similarResponse.data : null,
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

export const dynamic = 'force-static';