import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/app/store';
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
  setRecentTopStories,
  setCategoryArticles,
  setSubcategoryArticles,
  setSearchResults,
  addArticle,
  updateArticleInList,
  removeArticleFromList,
} from './articleSlice';
import {
  Article,
  ArticlesResponse,
  ArticleResponse,
  HeadlineResponse,
  CreateArticlePayload,
  UpdateArticlePayload,
  PaginationParams,
  SearchParams,
  CategoryParams,
  SubcategoryParams,
} from './articleTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const articleApi = createApi({
  reducerPath: 'ghanascoreArticleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/ghanascore/article`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Article', 'Articles', 'Headline', 'Breaking', 'TopStories', 'Live', 'Status'],
  endpoints: (builder) => ({
    getArticles: builder.query<ArticlesResponse, PaginationParams>({
      query: ({ page = 1, limit = 10 }) => 
        `/?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
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
      subcategory?: string;
      hasLivescore?: boolean;
      livescoreTag?: string;
    }>({
      query: ({ status, page = 1, limit = 10, category, subcategory, hasLivescore, livescoreTag }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (category) params.append('category', category);
        if (subcategory) params.append('subcategory', subcategory);
        if (hasLivescore !== undefined) params.append('hasLivescore', hasLivescore.toString());
        if (livescoreTag) params.append('livescoreTag', livescoreTag);
        
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
      }),
      invalidatesTags: [
        { type: 'Articles', id: 'LIST' },
        { type: 'Headline', id: 'CURRENT' },
        { type: 'Breaking', id: 'LIST' },
        { type: 'TopStories', id: 'LIST' },
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
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Article', id },
        { type: 'Articles', id: 'LIST' },
        { type: 'Headline', id: 'CURRENT' },
        { type: 'Breaking', id: 'LIST' },
        { type: 'TopStories', id: 'LIST' },
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

    getRecentTopStories: builder.query<ArticlesResponse, number | void>({
      query: (limit = 10) => `/top-stories/recent?limit=${limit}`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setRecentTopStories(data.data.articles));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch recent top stories'));
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setCategoryArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
              category: data.category,
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSubcategoryArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
              subcategory: data.subcategory,
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

    getTopStoriesByCategory: builder.query<ArticlesResponse, { category: string; limit?: number }>({
      query: ({ category, limit = 10 }) => 
        `/top-stories/category/${category}?limit=${limit}`,
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
  useGetHeadlineQuery,
  useGetBreakingNewsQuery,
  useGetTopStoriesQuery,
  useGetRecentTopStoriesQuery,
  useGetLiveArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesBySubcategoryQuery,
  useGetSimilarArticlesQuery,
  useSearchArticlesQuery,
  useGetTopStoriesByCategoryQuery,
  usePrepareArticleFormDataMutation,
} = articleApi;

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