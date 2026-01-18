import FeatureDetailPage from './featureDetailPage';
import { store } from '@/store/app/store';

import { featureApi } from '@/store/features/ghanascore/feature/featureAPI';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await store.dispatch(
      featureApi.endpoints.getFeatureBySlug.initiate(slug)
    );
    
    if ('data' in response && response.data?.data) {
      const feature = response.data.data;
      return {
        title: `${feature.title} | GhanaScore Feature`,
        description: feature.description || 'Sports feature article on GhanaScore',
        openGraph: {
          title: feature.title,
          description: feature.description,
          type: 'article',
          publishedTime: feature.published_at,
          authors: [feature.creator],
          tags: feature.tags,
        },
        twitter: {
          card: feature.image_url ? 'summary_large_image' : 'summary',
          title: feature.title,
          description: feature.description,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Sports Feature | GhanaScore',
    description: 'Featured sports content on GhanaScore',
  };
}

async function getFeatureData(slug: string) {
  try {
    const response = await store.dispatch(
      featureApi.endpoints.getFeatureBySlug.initiate(slug)
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
    <FeatureDetailPage 
      initialFeature={featureData?.data}
    />
  );
}