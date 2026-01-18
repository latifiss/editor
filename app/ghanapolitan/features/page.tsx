import FeaturesPage from './featuresPage';
import { store } from '@/store/app/store';

import { ghanapolitanFeatureApi } from '@/store/features/ghanapolitan/feature/featureAPI';

export const metadata = {
  title: 'Features | GhanaPolitan',
  description: 'Manage and view featured articles for GhanaPolitan',
};

async function getInitialFeatures() {
  try {
    const response = await store.dispatch(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatures.initiate({ 
        page: 1, 
        limit: 10 
      })
    );
    
    if ('data' in response) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch initial features:', error);
    return null;
  }
}

export default async function Page() {
  const initialFeatures = await getInitialFeatures();
  
  return <FeaturesPage initialFeatures={initialFeatures} />;
}