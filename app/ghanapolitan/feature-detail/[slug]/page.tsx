import GhanapolitanFeatureDetailPage from './ghanapolitanFeatureDetailPage';
import { store } from '@/store/app/store';

import { ghanapolitanFeatureApi } from '@/store/features/ghanapolitan/feature/featureAPI';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await store.dispatch(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureBySlug.initiate(slug)
    );
    
    if ('data' in response && response.data?.data) {
      const feature = response.data.data;
      return {
        title: `${feature.title} | Ghanapolitan`,
        description: feature.summary || 'In-depth feature article on Ghanapolitan',
        openGraph: {
          title: feature.title,
          description: feature.summary,
          type: 'article',
          publishedTime: feature.published_date,
          authors: [feature.author],
          tags: feature.topics,
        },
        twitter: {
          card: feature.image_url ? 'summary_large_image' : 'summary',
          title: feature.title,
          description: feature.summary,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Feature Article | Ghanapolitan',
    description: 'In-depth features and articles on Ghanapolitan',
  };
}

async function getFeatureData(slug: string) {
  try {
    const response = await store.dispatch(
      featureApi.endpoints.getGhanapolitanFeatureBySlug.initiate(slug)
    );
    
    return ('data' in response) ? response.data : null;
  } catch (error) {
    console.error('Failed to fetch feature:', error);
    return null;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    return null;
  }
  
  const featureData = await getFeatureData(slug);
  
  return (
    <GhanapolitanFeatureDetailPage 
      initialFeature={featureData?.data}
    />
  );
}