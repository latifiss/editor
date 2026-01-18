import ArticlesPage from './articlesPage';
import { store } from '@/store/app/store';
import { afrobeatsrepArticleApi } from '@/store/features/afrobeatsrep/article/articleAPI';

export const metadata = {
  title: 'Articles | AfroBeatsRep',
  description: 'Manage and view articles',
};

async function getInitialArticles() {
  try {
    const response = await store.dispatch(
      afrobeatsrepArticleApi.endpoints.getArticles.initiate({ page: 1, limit: 10 })
    );
    
    if ('data' in response) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch initial articles:', error);
    return null;
  }
}

export default async function Page() {
  const initialArticles = await getInitialArticles();
  
  return <ArticlesPage initialArticles={initialArticles} />;
}