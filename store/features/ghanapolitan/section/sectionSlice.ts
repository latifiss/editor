import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Section,
  SectionsResponseData,
  ImportantSectionsResponseData,
  ActiveSectionsResponseData,
  SectionWithArticlesResponseData,
  ExpiringSectionsResponseData,
} from './sectionTypes';

interface SectionState {
  loading: boolean;
  error: string | null;
  sections: Section[];
  currentSection: Section | null;
  importantSections: Section[];
  activeSections: Section[];
  expiringSections: Section[];
  sectionWithArticles: SectionWithArticlesResponseData | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchResults: SectionsResponseData | null;
}

const initialState: SectionState = {
  loading: false,
  error: null,
  sections: [],
  currentSection: null,
  importantSections: [],
  activeSections: [],
  expiringSections: [],
  sectionWithArticles: null,
  searchResults: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const ghanapolitanSectionSlice = createSlice({
  name: 'ghanapolitanSection',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    setSections: (state, action: PayloadAction<SectionsResponseData>) => {
      state.sections = action.payload.sections;
      state.pagination = {
        page: action.payload.currentPage || 1,
        limit: action.payload.limit || 10,
        total: action.payload.total || 0,
        totalPages: action.payload.totalPages || 1,
      };
    },

    setCurrentSection: (state, action: PayloadAction<Section>) => {
      state.currentSection = action.payload;
    },
    clearCurrentSection: (state) => {
      state.currentSection = null;
    },

    setImportantSections: (state, action: PayloadAction<ImportantSectionsResponseData>) => {
      state.importantSections = action.payload.sections;
    },

    setActiveSections: (state, action: PayloadAction<ActiveSectionsResponseData>) => {
      state.activeSections = action.payload.sections;
    },

    setExpiringSections: (state, action: PayloadAction<ExpiringSectionsResponseData>) => {
      state.expiringSections = action.payload.sections;
    },

    setSectionWithArticles: (state, action: PayloadAction<SectionWithArticlesResponseData>) => {
      state.sectionWithArticles = action.payload;
    },

    setSearchResults: (state, action: PayloadAction<SectionsResponseData>) => {
      state.searchResults = action.payload;
    },

    addSection: (state, action: PayloadAction<Section>) => {
      state.sections.unshift(action.payload);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      
      if (action.payload.isSectionImportant) {
        state.importantSections.unshift(action.payload);
      }
      
      if (action.payload.isActive) {
        state.activeSections.unshift(action.payload);
      }
    },

    updateSectionInList: (state, action: PayloadAction<Section>) => {
      const index = state.sections.findIndex(section => section._id === action.payload._id);
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
      
      const importantIndex = state.importantSections.findIndex(section => section._id === action.payload._id);
      if (importantIndex !== -1) {
        if (action.payload.isSectionImportant) {
          state.importantSections[importantIndex] = action.payload;
        } else {
          state.importantSections = state.importantSections.filter(section => section._id !== action.payload._id);
        }
      } else if (action.payload.isSectionImportant) {
        state.importantSections.unshift(action.payload);
      }
      
      const activeIndex = state.activeSections.findIndex(section => section._id === action.payload._id);
      if (activeIndex !== -1) {
        if (action.payload.isActive) {
          state.activeSections[activeIndex] = action.payload;
        } else {
          state.activeSections = state.activeSections.filter(section => section._id !== action.payload._id);
        }
      } else if (action.payload.isActive) {
        state.activeSections.unshift(action.payload);
      }
      
      if (state.currentSection?._id === action.payload._id) {
        state.currentSection = action.payload;
      }
    },

    removeSectionFromList: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(section => section._id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      
      state.importantSections = state.importantSections.filter(section => section._id !== action.payload);
      state.activeSections = state.activeSections.filter(section => section._id !== action.payload);
      state.expiringSections = state.expiringSections.filter(section => section._id !== action.payload);
      
      if (state.currentSection?._id === action.payload) {
        state.currentSection = null;
      }
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },

    resetSectionState: (state) => {
      return initialState;
    },

    resetSections: (state) => {
      state.sections = [];
      state.pagination = initialState.pagination;
    },
    
    resetImportantSections: (state) => {
      state.importantSections = [];
    },
    
    resetActiveSections: (state) => {
      state.activeSections = [];
    },
    
    resetExpiringSections: (state) => {
      state.expiringSections = [];
    },
    
    resetSearchResults: (state) => {
      state.searchResults = null;
    },
    
    resetSectionWithArticles: (state) => {
      state.sectionWithArticles = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setSections,
  setCurrentSection,
  clearCurrentSection,
  setImportantSections,
  setActiveSections,
  setExpiringSections,
  setSectionWithArticles,
  setSearchResults,
  addSection,
  updateSectionInList,
  removeSectionFromList,
  setPage,
  setLimit,
  resetSectionState,
  resetSections,
  resetImportantSections,
  resetActiveSections,
  resetExpiringSections,
  resetSearchResults,
  resetSectionWithArticles,
} = ghanapolitanSectionSlice.actions;

export default ghanapolitanSectionSlice.reducer;