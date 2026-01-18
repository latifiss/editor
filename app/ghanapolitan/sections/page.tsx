import SectionsPage from './sectionsPage';
import { store } from '@/store/app/store';

import { ghanapolitanSectionApi } from '@/store/features/ghanapolitan/section/sectionApi';

export const metadata = {
  title: 'Sections | GhanaPolitan',
  description: 'Manage sections for GhanaPolitan',
};

async function getInitialSections() {
  try {
    const response = await store.dispatch(
      ghanapolitanSectionApi.endpoints.getSections.initiate({ 
        page: 1, 
        limit: 10,
        sortBy: 'displayOrder',
        sortOrder: 'asc'
      })
    );
    
    if ('data' in response) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch initial sections:', error);
    return null;
  }
}

export default async function Page() {
  const initialSections = await getInitialSections();
  
  return <SectionsPage initialSections={initialSections} />;
}