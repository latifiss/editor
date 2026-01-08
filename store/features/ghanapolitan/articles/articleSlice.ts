import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Article, 
  ArticlesResponseData,
  SectionArticlesResponseData,
  ArticlesWithSectionsResponseData,
  CategoryArticlesResponseData,
  SubcategoryArticlesResponseData,
  SearchArticlesResponseData,
  LiveArticlesResponseData,
  ArticleFeedResponseData,
  ArticleFeedByCategoryResponseData
} from './articleTypes';

interface ArticleState {
  loading: boolean;
  error: string | null;
  articles: Article[];
  currentArticle: Article | null;
  headline: Article | null;
  similarArticles: Article[];
  breakingNews: Article[];
  topStories: Article[];
  liveArticles: Article[];
  categoryArticles: CategoryArticlesResponseData | null;
  subcategoryArticles: SubcategoryArticlesResponseData | null;
  searchResults: SearchArticlesResponseData | null;
  sectionArticles: SectionArticlesResponseData | null;
  sectionArticlesBySlug: SectionArticlesResponseData | null;
  articlesWithSections: ArticlesWithSectionsResponseData[];
  articlesWithoutSection: ArticleFeedResponseData | null;
  articlesFeed: ArticleFeedResponseData | null;
  articlesFeedByCategory: ArticleFeedByCategoryResponseData | null;
  articlesWithoutSectionByCategory: CategoryArticlesResponseData | null;
  articlesWithoutSectionBySubcategory: SubcategoryArticlesResponseData | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ArticleState = {
  loading: false,
  error: null,
  articles: [],
  currentArticle: null,
  headline: null,
  similarArticles: [],
  breakingNews: [],
  topStories: [],
  liveArticles: [],
  categoryArticles: null,
  subcategoryArticles: null,
  searchResults: null,
  sectionArticles: null,
  sectionArticlesBySlug: null,
  articlesWithSections: [],
  articlesWithoutSection: null,
  articlesFeed: null,
  articlesFeedByCategory: null,
  articlesWithoutSectionByCategory: null,
  articlesWithoutSectionBySubcategory: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const ghanapolitanArticleSlice = createSlice({
  name: 'ghanapolitanArticle',
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
    setArticles: (state, action: PayloadAction<ArticlesResponseData>) => {
      state.articles = action.payload.articles;
      state.pagination = {
        page: action.payload.currentPage || 1,
        limit: action.payload.limit || 10,
        total: action.payload.total || 0,
        totalPages: action.payload.totalPages || 1,
      };
    },
    setCurrentArticle: (state, action: PayloadAction<Article>) => {
      state.currentArticle = action.payload;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    setHeadline: (state, action: PayloadAction<Article>) => {
      state.headline = action.payload;
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
    setLiveArticles: (state, action: PayloadAction<LiveArticlesResponseData>) => {
      state.liveArticles = action.payload.articles;
      state.pagination = {
        page: action.payload.currentPage || 1,
        limit: action.payload.limit || 10,
        total: action.payload.total || 0,
        totalPages: action.payload.totalPages || 1,
      };
    },
    setCategoryArticles: (state, action: PayloadAction<CategoryArticlesResponseData>) => {
      state.categoryArticles = action.payload;
    },
    setSubcategoryArticles: (state, action: PayloadAction<SubcategoryArticlesResponseData>) => {
      state.subcategoryArticles = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchArticlesResponseData>) => {
      state.searchResults = action.payload;
    },
    setSectionArticles: (state, action: PayloadAction<SectionArticlesResponseData>) => {
      state.sectionArticles = action.payload;
    },
    setSectionArticlesBySlug: (state, action: PayloadAction<SectionArticlesResponseData>) => {
      state.sectionArticlesBySlug = action.payload;
    },
    setArticlesWithSections: (state, action: PayloadAction<ArticlesWithSectionsResponseData[]>) => {
      state.articlesWithSections = action.payload;
    },
    setArticlesWithoutSection: (state, action: PayloadAction<ArticleFeedResponseData>) => {
      state.articlesWithoutSection = action.payload;
    },
    setArticlesFeed: (state, action: PayloadAction<ArticleFeedResponseData>) => {
      state.articlesFeed = action.payload;
    },
    setArticlesFeedByCategory: (state, action: PayloadAction<ArticleFeedByCategoryResponseData>) => {
      state.articlesFeedByCategory = action.payload;
    },
    setArticlesWithoutSectionByCategory: (state, action: PayloadAction<CategoryArticlesResponseData>) => {
      state.articlesWithoutSectionByCategory = action.payload;
    },
    setArticlesWithoutSectionBySubcategory: (state, action: PayloadAction<SubcategoryArticlesResponseData>) => {
      state.articlesWithoutSectionBySubcategory = action.payload;
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
      
      if (state.headline?._id === action.payload._id) {
        state.headline = action.payload;
      }
      
      const breakingIndex = state.breakingNews.findIndex(article => article._id === action.payload._id);
      if (breakingIndex !== -1) {
        state.breakingNews[breakingIndex] = action.payload;
      }
      
      const topStoriesIndex = state.topStories.findIndex(article => article._id === action.payload._id);
      if (topStoriesIndex !== -1) {
        state.topStories[topStoriesIndex] = action.payload;
      }
      
      const liveIndex = state.liveArticles.findIndex(article => article._id === action.payload._id);
      if (liveIndex !== -1) {
        state.liveArticles[liveIndex] = action.payload;
      }
    },
    removeArticleFromList: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(article => article._id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      
      if (state.headline?._id === action.payload) {
        state.headline = null;
      }
      
      state.breakingNews = state.breakingNews.filter(article => article._id !== action.payload);
      state.topStories = state.topStories.filter(article => article._id !== action.payload);
      state.liveArticles = state.liveArticles.filter(article => article._id !== action.payload);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    resetArticleState: (state) => {
      return initialState;
    },
    resetArticles: (state) => {
      state.articles = [];
      state.pagination = initialState.pagination;
    },
    resetCategoryArticles: (state) => {
      state.categoryArticles = null;
    },
    resetSubcategoryArticles: (state) => {
      state.subcategoryArticles = null;
    },
    resetSearchResults: (state) => {
      state.searchResults = null;
    },
    resetSectionArticles: (state) => {
      state.sectionArticles = null;
    },
    resetSectionArticlesBySlug: (state) => {
      state.sectionArticlesBySlug = null;
    },
    resetArticlesWithSections: (state) => {
      state.articlesWithSections = [];
    },
    resetArticlesWithoutSection: (state) => {
      state.articlesWithoutSection = null;
    },
    resetArticlesFeed: (state) => {
      state.articlesFeed = null;
    },
    resetArticlesFeedByCategory: (state) => {
      state.articlesFeedByCategory = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setArticles,
  setCurrentArticle,
  clearCurrentArticle,
  setHeadline,
  setSimilarArticles,
  setBreakingNews,
  setTopStories,
  setLiveArticles,
  setCategoryArticles,
  setSubcategoryArticles,
  setSearchResults,
  setSectionArticles,
  setSectionArticlesBySlug,
  setArticlesWithSections,
  setArticlesWithoutSection,
  setArticlesFeed,
  setArticlesFeedByCategory,
  setArticlesWithoutSectionByCategory,
  setArticlesWithoutSectionBySubcategory,
  addArticle,
  updateArticleInList,
  removeArticleFromList,
  setPage,
  setLimit,
  resetArticleState,
  resetArticles,
  resetCategoryArticles,
  resetSubcategoryArticles,
  resetSearchResults,
  resetSectionArticles,
  resetSectionArticlesBySlug,
  resetArticlesWithSections,
  resetArticlesWithoutSection,
  resetArticlesFeed,
  resetArticlesFeedByCategory,
} = ghanapolitanArticleSlice.actions;

export default ghanapolitanArticleSlice.reducer;