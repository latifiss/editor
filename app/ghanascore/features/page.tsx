import FeaturesPage from './featuresPage';
import { store } from '@/store/app/store';

import { featureApi } from '@/store/features/ghanascore/feature/featureAPI';

export const metadata = {
  title: 'Features | GhanaScore',
  description: 'Manage and view featured sports content for GhanaScore',
};

async function getInitialFeatures() {
  try {
    const response = await store.dispatch(
      featureApi.endpoints.getFeatures.initiate({ 
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