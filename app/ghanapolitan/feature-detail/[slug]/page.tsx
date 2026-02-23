export const runtime = 'edge';

import GhanapolitanFeatureDetailPage from './ghanapolitanFeatureDetailPage';
import { fetchFeatureBySlug } from '@/lib/api-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetchFeatureBySlug(slug, 'ghanapolitan');
    
    if (response?.data) {
      const feature = response.data as { title?: string; summary?: string; published_date?: string; author?: string; topics?: string[]; image_url?: string };
      return {
        title: `${feature.title} | Ghanapolitan`,
        description: feature.summary || 'In-depth feature article on Ghanapolitan',
        openGraph: {
          title: feature.title,
          description: feature.summary,
          type: 'article',
          publishedTime: feature.published_date,
          authors: feature.author ? [feature.author] : [],
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
  return fetchFeatureBySlug(slug, 'ghanapolitan');
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