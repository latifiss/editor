export const runtime = 'edge';

import GhanapolitanGraphicDetailPage from './ghanapolitanGraphicDetailPage';
import { fetchGraphicBySlug } from '@/lib/api-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await fetchGraphicBySlug(slug);
    
    if (response?.data) {
      const graphic = response.data as { title?: string; description?: string; created_at?: string; creator?: string; tags?: string[]; image_url?: string };
      return {
        title: `${graphic.title} | Ghanapolitan`,
        description: graphic.description || 'Infographic and visual content on Ghanapolitan',
        openGraph: {
          title: graphic.title,
          description: graphic.description,
          type: 'article',
          publishedTime: graphic.created_at,
          authors: graphic.creator ? [graphic.creator] : [],
          tags: graphic.tags,
        },
        twitter: {
          card: graphic.image_url ? 'summary_large_image' : 'summary',
          title: graphic.title,
          description: graphic.description,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Graphic | Ghanapolitan',
    description: 'Infographics and visual content on Ghanapolitan',
  };
}

async function getGraphicData(slug: string) {
  return fetchGraphicBySlug(slug);
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    return null;
  }
  
  const graphicData = await getGraphicData(slug);
  
  return (
    <GhanapolitanGraphicDetailPage 
      initialGraphic={graphicData?.data}
    />
  );
}
