export const runtime = 'edge';

import FeatureDetailPage from './featureDetailPage';
import { fetchFeatureBySlug } from '@/lib/api-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetchFeatureBySlug(slug, 'afrobeatsrep');
    
    if (response?.data) {
      const feature = response.data as { title?: string; description?: string; published_at?: string; creator?: string; tags?: string[]; image_url?: string };
      return {
        title: `${feature.title} | AfroBeats Feature`,
        description: feature.description || 'Entertainment and lifestyle feature on AfroBeats',
        openGraph: {
          title: feature.title,
          description: feature.description,
          type: 'article',
          publishedTime: feature.published_at,
          authors: feature.creator ? [feature.creator] : [],
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
    title: 'Entertainment Feature | AfroBeats',
    description: 'Featured entertainment and lifestyle content on AfroBeats',
  };
}

async function getFeatureData(slug: string) {
  return fetchFeatureBySlug(slug, 'afrobeatsrep');
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
