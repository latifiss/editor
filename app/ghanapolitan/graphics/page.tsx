import GraphicsPage from './graphicsPage';
import { store } from '@/store/app/store';
import { graphicApi } from '@/store/features/ghanapolitan/graphic/graphicAPI';

export const metadata = {
  title: 'Graphics | GhanaPolitan',
  description: 'Manage and view graphics content for GhanaPolitan',
};

async function getInitialGraphics() {
  try {
    const response = await store.dispatch(
      graphicApi.endpoints.getGraphics.initiate({ 
        page: 1, 
        limit: 10 
      })
    );
    
    if ('data' in response) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch initial graphics:', error);
    return null;
  }
}

export default async function Page() {
  const initialGraphics = await getInitialGraphics();
  
  return <GraphicsPage initialGraphics={initialGraphics} />;
}