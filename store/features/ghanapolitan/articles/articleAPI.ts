import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import {
  setLoading,
  setError,
  setArticles,
  setCurrentArticle,
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
} from './articleSlice';
import {
  Article,
  ArticlesResponse,
  ArticleResponse,
  HeadlineResponse,
  SectionArticlesResponse,
  ArticlesWithSectionsResponse,
  ArticleFeedResponse,
  ArticleFeedByCategoryResponse,
  CreateArticlePayload,
  UpdateArticlePayload,
  PaginationParams,
  SearchParams,
  CategoryParams,
  SubcategoryParams,
  SectionParams,
  SectionSlugParams,
} from './articleTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const ghanapolitanArticleApi = createApi({
  reducerPath: 'ghanapolitanArticleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/ghanapolitan/article`,
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  tagTypes: [
    'Article', 
    'Articles', 
    'Headline', 
    'Breaking', 
    'TopStories', 
    'Live',
    'Section',
    'SectionBySlug',
    'ArticleFeed',
    'ArticleFeedByCategory',
    'Comments',
    'Status' 
  ],
  endpoints: (builder) => ({
    getArticles: builder.query<ArticlesResponse, PaginationParams>({
      query: ({ page = 1, limit = 10, category, section_id, section_name, section_slug, has_section, isBreaking, isLive, isTopstory }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (category) params.append('category', category);
        if (section_id) params.append('section_id', section_id);
        if (section_name) params.append('section_name', section_name);
        if (section_slug) params.append('section_slug', section_slug);
        if (has_section !== undefined) params.append('has_section', has_section.toString());
        if (isBreaking !== undefined) params.append('isBreaking', isBreaking.toString());
        if (isLive !== undefined) params.append('isLive', isLive.toString());
        if (isTopstory !== undefined) params.append('isTopstory', isTopstory.toString());
        
        return `/?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.articles
          ? [
              ...result.data.articles.map(({ _id }) => ({ type: 'Article' as const, id: _id })),
              { type: 'Articles', id: 'LIST' },
            ]
          : [{ type: 'Articles', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit: 10,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesByStatus: builder.query<ArticlesResponse, { 
      status: string; 
      page?: number; 
      limit?: number;
      category?: string;
      has_section?: boolean;
      section_id?: string;
      section_slug?: string;
    }>({
      query: ({ status, page = 1, limit = 10, category, has_section, section_id, section_slug }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (category) params.append('category', category);
        if (has_section !== undefined) params.append('has_section', has_section.toString());
        if (section_id) params.append('section_id', section_id);
        if (section_slug) params.append('section_slug', section_slug);
        
        return `/status/${status}?${params.toString()}`;
      },
      providesTags: (result, error, { status }) => [
        { type: 'Status', id: status },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit: 10,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles by status'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticleById: builder.query<ArticleResponse, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: any) => {
        if (response.data && response.data.article) {
          return {
            ...response,
            data: response.data.article
          };
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Article', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setCurrentArticle(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch article by ID'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticleBySlug: builder.query<ArticleResponse, string>({
      query: (slug) => `/slug/${slug}`,
      transformResponse: (response: any) => {
        if (response.data && !response.data.article) {
          return {
            ...response,
            data: response.data
          };
        }
        return response;
      },
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setCurrentArticle(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch article'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    createArticle: builder.mutation<ArticleResponse, FormData>({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
        headers: {} as Record<string, string>, 
      }),
      invalidatesTags: [
        { type: 'Articles', id: 'LIST' },
        { type: 'Headline', id: 'CURRENT' },
        { type: 'Breaking', id: 'LIST' },
        { type: 'TopStories', id: 'LIST' },
        { type: 'Section', id: 'LIST' },
        { type: 'SectionBySlug', id: 'LIST' },
        { type: 'ArticleFeed', id: 'LIST' },
        { type: 'ArticleFeedByCategory', id: 'LIST' },
        { type: 'Status', id: 'LIST' }, 
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(addArticle(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to create article'));
          throw error;
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    updateArticle: builder.mutation<ArticleResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData,
        headers: {} as Record<string, string>, 
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Article', id },
        { type: 'Articles', id: 'LIST' },
        { type: 'Headline', id: 'CURRENT' },
        { type: 'Breaking', id: 'LIST' },
        { type: 'TopStories', id: 'LIST' },
        { type: 'Section', id: 'LIST' },
        { type: 'SectionBySlug', id: 'LIST' },
        { type: 'ArticleFeed', id: 'LIST' },
        { type: 'ArticleFeedByCategory', id: 'LIST' },
        { type: 'Status', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateArticleInList(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to update article'));
          throw error;
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    deleteArticle: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Articles', id: 'LIST' },
        { type: 'Headline', id: 'CURRENT' },
        { type: 'Breaking', id: 'LIST' },
        { type: 'TopStories', id: 'LIST' },
        { type: 'Section', id: 'LIST' },
        { type: 'SectionBySlug', id: 'LIST' },
        { type: 'ArticleFeed', id: 'LIST' },
        { type: 'ArticleFeedByCategory', id: 'LIST' },
        { type: 'Status', id: 'LIST' }, 
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          await queryFulfilled;
          dispatch(removeArticleFromList(id));
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to delete article'));
          throw error;
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesBySection: builder.query<SectionArticlesResponse, SectionSlugParams>({
      query: ({ sectionSlug, page = 1, limit = 10 }) => 
        `/section/${sectionSlug}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { sectionSlug }) => [
        { type: 'SectionBySlug', id: sectionSlug },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSectionArticlesBySlug({
              section: data.section,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit: 10,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch section articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticleFeed: builder.query<ArticleFeedResponse, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => 
        `/feed?page=${page}&limit=${limit}`,
      providesTags: [{ type: 'ArticleFeed', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesFeed({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch article feed'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticleFeedByCategory: builder.query<ArticleFeedByCategoryResponse, CategoryParams>({
      query: ({ category, page = 1, limit = 10 }) => 
        `/feed/category/${category}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { category }) => [
        { type: 'ArticleFeedByCategory', id: category },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesFeedByCategory({
              category: data.category,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch article feed by category'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesBySectionId: builder.query<SectionArticlesResponse, SectionParams>({
      query: ({ sectionId, page = 1, limit = 10 }) => 
        `/section/id/${sectionId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { sectionId }) => [
        { type: 'Section', id: sectionId },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSectionArticles({
              section: data.section,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit: 10,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch section articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesBySectionSlug: builder.query<SectionArticlesResponse, { sectionSlug: string; page?: number; limit?: number }>({
      query: ({ sectionSlug, page = 1, limit = 10 }) => 
        `/section/slug/${sectionSlug}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { sectionSlug }) => [
        { type: 'SectionBySlug', slug: sectionSlug },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSectionArticlesBySlug({
              section: data.section,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit: 10,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch section articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesWithSections: builder.query<ArticlesWithSectionsResponse[], { limit?: number }>({
      query: ({ limit = 5 } = {}) => `/with-sections?limit=${limit}`,
      providesTags: [{ type: 'Section', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesWithSections(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles with sections'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesWithoutSection: builder.query<ArticleFeedResponse, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => 
        `/without-section?page=${page}&limit=${limit}`,
      providesTags: [{ type: 'Articles', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesWithoutSection({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles without section'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesWithoutSectionByCategory: builder.query<ArticleFeedResponse, CategoryParams>({
      query: ({ category, page = 1, limit = 10 }) => 
        `/without-section-by-category/${category}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { category }) => [
        { type: 'Article', category },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesWithoutSectionByCategory({
              category: data.category,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles without section by category'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesWithoutSectionBySubcategory: builder.query<ArticleFeedResponse, SubcategoryParams>({
      query: ({ subcategory, page = 1, limit = 10 }) => 
        `/without-section-by-subcategory/${subcategory}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { subcategory }) => [
        { type: 'Article', subcategory },
        { type: 'Articles', id: 'LIST' }
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setArticlesWithoutSectionBySubcategory({
              subcategory: data.subcategory,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch articles without section by subcategory'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    assignArticleToSection: builder.mutation<ArticleResponse, { 
      id: string; 
      section_id: string; 
      section_name?: string;
      section_code?: string;
      section_slug?: string;
    }>({
      query: ({ id, section_id, section_name, section_code, section_slug }) => ({
        url: `/${id}/assign-section`,
        method: 'POST',
        body: { section_id, section_name, section_code, section_slug },
      }),
      invalidatesTags: [
        { type: 'Article', id: 'LIST' },
        { type: 'Articles', id: 'LIST' },
        { type: 'Section', id: 'LIST' },
        { type: 'SectionBySlug', id: 'LIST' },
        { type: 'ArticleFeed', id: 'LIST' },
        { type: 'ArticleFeedByCategory', id: 'LIST' },
        { type: 'Status', id: 'LIST' }, 
      ],
    }),
    removeArticleFromSection: builder.mutation<ArticleResponse, string>({
      query: (id) => ({
        url: `/${id}/remove-section`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Article', id: 'LIST' },
        { type: 'Articles', id: 'LIST' },
        { type: 'Section', id: 'LIST' },
        { type: 'SectionBySlug', id: 'LIST' },
        { type: 'ArticleFeed', id: 'LIST' },
        { type: 'ArticleFeedByCategory', id: 'LIST' },
        { type: 'Status', id: 'LIST' }, 
      ],
    }),
    getHeadline: builder.query<HeadlineResponse, void>({
      query: () => '/headline/current',
      providesTags: [{ type: 'Headline', id: 'CURRENT' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setHeadline(data.data.headline));
            dispatch(setSimilarArticles(data.data.similarArticles));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch headline'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getBreakingNews: builder.query<ArticlesResponse, number | void>({
      query: (limit = 5) => `/breaking?limit=${limit}`,
      providesTags: [{ type: 'Breaking', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setBreakingNews(data.data.articles));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch breaking news'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getTopStories: builder.query<ArticlesResponse, number | void>({
      query: (limit = 10) => `/top-stories?limit=${limit}`,
      providesTags: [{ type: 'TopStories', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setTopStories(data.data.articles));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch top stories'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getLiveArticles: builder.query<ArticlesResponse, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => 
        `/live?page=${page}&limit=${limit}`,
      providesTags: [{ type: 'Live', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setLiveArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch live articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesByCategory: builder.query<ArticlesResponse, CategoryParams>({
      query: ({ category, page = 1, limit = 10 }) => 
        `/category/${category}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { category }) => [{ type: 'Article', category }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setCategoryArticles({
              category: data.category,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch category articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getArticlesBySubcategory: builder.query<ArticlesResponse, SubcategoryParams>({
      query: ({ subcategory, page = 1, limit = 10 }) => 
        `/subcategory/${subcategory}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { subcategory }) => [{ type: 'Article', subcategory }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSubcategoryArticles({
              subcategory: data.subcategory,
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch subcategory articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getSimilarArticles: builder.query<ArticlesResponse, { slug: string } & PaginationParams>({
      query: ({ slug, page = 1, limit = 5 }) => 
        `/similar/${slug}?page=${page}&limit=${limit}`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSimilarArticles(data.data.articles));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch similar articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    searchArticles: builder.query<ArticlesResponse, SearchParams>({
      query: ({ q, page = 1, limit = 10 }) => 
        `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSearchResults({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
              query: data.query,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to search articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getComments: builder.query<any, { slug: string; sort?: string; page?: number; limit?: number }>({
      query: ({ slug, sort = 'newest', page = 1, limit = 20 }) => 
        `/${slug}/comments?sort=${sort}&page=${page}&limit=${limit}`,
      providesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    addComment: builder.mutation<any, { slug: string; username: string; content: string }>({
      query: ({ slug, username, content }) => ({
        url: `/${slug}/comments`,
        method: 'POST',
        body: { username, content },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    editComment: builder.mutation<any, { slug: string; commentId: string; content: string }>({
      query: ({ slug, commentId, content }) => ({
        url: `/${slug}/comments/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    deleteComment: builder.mutation<any, { slug: string; commentId: string }>({
      query: ({ slug, commentId }) => ({
        url: `/${slug}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    addReply: builder.mutation<any, { slug: string; commentId: string; username: string; content: string }>({
      query: ({ slug, commentId, username, content }) => ({
        url: `/${slug}/comments/${commentId}/replies`,
        method: 'POST',
        body: { username, content },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    editReply: builder.mutation<any, { slug: string; commentId: string; replyId: string; content: string }>({
      query: ({ slug, commentId, replyId, content }) => ({
        url: `/${slug}/comments/${commentId}/replies/${replyId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    deleteReply: builder.mutation<any, { slug: string; commentId: string; replyId: string }>({
      query: ({ slug, commentId, replyId }) => ({
        url: `/${slug}/comments/${commentId}/replies/${replyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    upvoteComment: builder.mutation<any, { slug: string; commentId: string }>({
      query: ({ slug, commentId }) => ({
        url: `/${slug}/comments/${commentId}/upvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    downvoteComment: builder.mutation<any, { slug: string; commentId: string }>({
      query: ({ slug, commentId }) => ({
        url: `/${slug}/comments/${commentId}/downvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    upvoteReply: builder.mutation<any, { slug: string; commentId: string; replyId: string }>({
      query: ({ slug, commentId, replyId }) => ({
        url: `/${slug}/comments/${commentId}/replies/${replyId}/upvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    downvoteReply: builder.mutation<any, { slug: string; commentId: string; replyId: string }>({
      query: ({ slug, commentId, replyId }) => ({
        url: `/${slug}/comments/${commentId}/replies/${replyId}/downvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Comments', id: slug }],
    }),
    prepareArticleFormData: builder.mutation<FormData, CreateArticlePayload>({
      queryFn: (payload) => {
        const formData = new FormData();
        
        Object.keys(payload).forEach(key => {
          if (key !== 'image') {
            const value = payload[key as keyof CreateArticlePayload];
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                formData.append(key, value.join(','));
              } else if (typeof value === 'object' && !(value instanceof File)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value.toString());
              }
            }
          }
        });

        if (payload.image) {
          formData.append('image', payload.image);
        }

        return { data: formData };
      },
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticlesByStatusQuery, 
  useGetArticleBySlugQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetArticlesBySectionQuery,
  useGetArticleFeedQuery,
  useGetArticleFeedByCategoryQuery,
  useGetArticlesBySectionIdQuery,
  useGetArticlesBySectionSlugQuery,
  useGetArticlesWithSectionsQuery,
  useGetArticlesWithoutSectionQuery,
  useGetArticlesWithoutSectionByCategoryQuery,
  useGetArticlesWithoutSectionBySubcategoryQuery,
  useAssignArticleToSectionMutation,
  useRemoveArticleFromSectionMutation,
  useGetHeadlineQuery,
  useGetBreakingNewsQuery,
  useGetTopStoriesQuery,
  useGetLiveArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesBySubcategoryQuery,
  useGetSimilarArticlesQuery,
  useSearchArticlesQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useAddReplyMutation,
  useEditReplyMutation,
  useDeleteReplyMutation,
  useUpvoteCommentMutation,
  useDownvoteCommentMutation,
  useUpvoteReplyMutation,
  useDownvoteReplyMutation,
  usePrepareArticleFormDataMutation,
} = ghanapolitanArticleApi;

export const createArticleFormData = (payload: CreateArticlePayload): FormData => {
  const formData = new FormData();
  
  Object.keys(payload).forEach(key => {
    if (key !== 'image') {
      const value = payload[key as keyof CreateArticlePayload];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    }
  });

  if (payload.image) {
    formData.append('image', payload.image);
  }

  return formData;
};