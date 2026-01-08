import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/app/store';
import { Article, ArticlesState } from './articleTypes';

const initialState: ArticlesState = {
  articles: [],
  currentArticle: null,
  headline: null,
  similarArticles: [],
  breakingNews: [],
  topStories: [],
  liveArticles: [],
  recentTopStories: [],
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
  name: 'articles',
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

    setBreakingNews: (state, action: PayloadAction<Article[]>) => {
      state.breakingNews = action.payload;
    },

    setTopStories: (state, action: PayloadAction<Article[]>) => {
      state.topStories = action.payload;
    },

    setLiveArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    }>) => {
      state.liveArticles = action.payload.articles;
      state.pagination = {
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        limit: action.payload.limit,
      };
    },

    setRecentTopStories: (state, action: PayloadAction<Article[]>) => {
      state.recentTopStories = action.payload;
    },

    setCategoryArticles: (state, action: PayloadAction<{
      articles: Article[];
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      category: string;
    }>) => {
      state.articles = action.payload.articles;
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
      state.articles = action.payload.articles;
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
      state.articles = action.payload.articles;
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
  setBreakingNews,
  setTopStories,
  setLiveArticles,
  setRecentTopStories,
  setCategoryArticles,
  setSubcategoryArticles,
  setSearchResults,
  resetArticlesState,
} = articleSlice.actions;

export const selectArticles = (state: RootState) => state.articles.articles;
export const selectCurrentArticle = (state: RootState) => state.articles.currentArticle;
export const selectHeadline = (state: RootState) => state.articles.headline;
export const selectSimilarArticles = (state: RootState) => state.articles.similarArticles;
export const selectBreakingNews = (state: RootState) => state.articles.breakingNews;
export const selectTopStories = (state: RootState) => state.articles.topStories;
export const selectLiveArticles = (state: RootState) => state.articles.liveArticles;
export const selectRecentTopStories = (state: RootState) => state.articles.recentTopStories;
export const selectArticlesLoading = (state: RootState) => state.articles.isLoading;
export const selectArticlesError = (state: RootState) => state.articles.error;
export const selectPagination = (state: RootState) => state.articles.pagination;

export default articleSlice.reducer;