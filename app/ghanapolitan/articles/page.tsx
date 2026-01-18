import ArticlesPage from './articlesPage';
import { store } from '@/store/app/store';

import { ghanapolitanArticleApi } from '@/store/features/ghanapolitan/articles/articleAPI';

export const metadata = {
  title: 'Articles | Ghanapolitan',
  description: 'Manage and view articles for Ghanapolitan',
};

async function getInitialArticles() {
  try {
    const response = await store.dispatch(
      ghanapolitanArticleApi.endpoints.getArticles.initiate({ page: 1, limit: 10 })
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