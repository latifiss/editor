import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/app/store';
import { Article, ArticlesState } from './articleTypes';

const initialState: ArticlesState = {
  articles: [],
  currentArticle: null,
  headline: null,
  similarArticles: [],
  featuredArticles: [],
  recentArticles: [],
  categoryArticles: [],
  subcategoryArticles: [],
  labelArticles: [],
  searchResults: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    limit: 10,
  },
};

const articleSlice = createSlice({
  name: 'afrobeatsrepArticles',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    setArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    }>) => {
      state.articles = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },
    addArticle: (state, action: PayloadAction<Article>) => {
      state.articles.unshift(action.payload);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
    },
    updateArticleInList: (state, action: PayloadAction<Article>) => {
      const index = state.articles.findIndex(article => article._id === action.payload._id);
      if (index !== -1) {
        state.articles[index] = action.payload;
      }
    },
    removeArticleFromList: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(article => article._id !== action.payload);
      state.pagination.total -= 1;
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
    },

    setCurrentArticle: (state, action: PayloadAction<Article>) => {
      state.currentArticle = action.payload;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    updateCurrentArticle: (state, action: PayloadAction<Partial<Article>>) => {
      if (state.currentArticle) {
        state.currentArticle = { ...state.currentArticle, ...action.payload };
      }
    },

    setHeadline: (state, action: PayloadAction<Article>) => {
      state.headline = action.payload;
    },
    clearHeadline: (state) => {
      state.headline = null;
    },

    setSimilarArticles: (state, action: PayloadAction<Article[]>) => {
      state.similarArticles = action.payload;
    },

    setFeaturedArticles: (state, action: PayloadAction<Article[]>) => {
      state.featuredArticles = action.payload;
    },

    setRecentArticles: (state, action: PayloadAction<Article[]>) => {
      state.recentArticles = action.payload;
    },

    setCategoryArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      category: string;
    }>) => {
      state.categoryArticles = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },

    setSubcategoryArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      subcategory: string;
    }>) => {
      state.subcategoryArticles = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },

    setLabelArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      label: string;
    }>) => {
      state.labelArticles = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },

    setSearchResults: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      query: string;
    }>) => {
      state.searchResults = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },

    resetArticlesState: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setArticles,
  addArticle,
  updateArticleInList,
  removeArticleFromList,
  setCurrentArticle,
  clearCurrentArticle,
  updateCurrentArticle,
  setHeadline,
  clearHeadline,
  setSimilarArticles,
  setFeaturedArticles,
  setRecentArticles,
  setCategoryArticles,
  setSubcategoryArticles,
  setLabelArticles,
  setSearchResults,
  resetArticlesState,
} = articleSlice.actions;

export const selectArticles = (state: RootState) => state.afrobeatsrepArticles.articles;
export const selectCurrentArticle = (state: RootState) => state.afrobeatsrepArticles.currentArticle;
export const selectHeadline = (state: RootState) => state.afrobeatsrepArticles.headline;
export const selectSimilarArticles = (state: RootState) => state.afrobeatsrepArticles.similarArticles;
export const selectFeaturedArticles = (state: RootState) => state.afrobeatsrepArticles.featuredArticles;
export const selectRecentArticles = (state: RootState) => state.afrobeatsrepArticles.recentArticles;
export const selectCategoryArticles = (state: RootState) => state.afrobeatsrepArticles.categoryArticles;
export const selectSubcategoryArticles = (state: RootState) => state.afrobeatsrepArticles.subcategoryArticles;
export const selectLabelArticles = (state: RootState) => state.afrobeatsrepArticles.labelArticles;
export const selectSearchResults = (state: RootState) => state.afrobeatsrepArticles.searchResults;
export const selectArticlesLoading = (state: RootState) => state.afrobeatsrepArticles.isLoading;
export const selectArticlesError = (state: RootState) => state.afrobeatsrepArticles.error;
export const selectPagination = (state: RootState) => state.afrobeatsrepArticles.pagination;

export default articleSlice.reducer;