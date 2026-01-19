import GhanapolitanGraphicDetailPage from './ghanapolitanGraphicDetailPage';
import { store } from '@/store/app/store';

import { graphicApi } from '@/store/features/ghanapolitan/graphic/graphicAPI';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const response = await store.dispatch(
      graphicApi.endpoints.getGraphicBySlug.initiate(slug)
    );
    
    if ('data' in response && response.data?.data) {
      const graphic = response.data.data;
      return {
        title: `${graphic.title} | Ghanapolitan`,
        description: graphic.description || 'Infographic and visual content on Ghanapolitan',
        openGraph: {
          title: graphic.title,
          description: graphic.description,
          type: 'article',
          publishedTime: graphic.created_at,
          authors: [graphic.creator],
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
  try {
    const response = await store.dispatch(
      graphicApi.endpoints.getGraphicBySlug.initiate(slug)
    );
    
    return ('data' in response) ? response.data : null;
  } catch (error) {
    console.error('Failed to fetch graphic:', error);
    return null;
  }
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
