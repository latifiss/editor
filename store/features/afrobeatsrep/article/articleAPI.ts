import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  setLoading,
  setError,
  setArticles,
  setCurrentArticle,
  setHeadline,
  setSimilarArticles,
  setFeaturedArticles,
  setRecentArticles,
  setCategoryArticles,
  setSubcategoryArticles,
  setLabelArticles,
  setSearchResults,
  addArticle,
  updateArticleInList,
  removeArticleFromList,
} from './articleSlice';
import {
  ArticlesResponse,
  ArticleResponse,
  HeadlineResponse,
  FeaturedResponse,
  CreateArticlePayload,
  PaginationParams,
  SearchParams,
  CategoryParams,
  SubcategoryParams,
  LabelParams,
} from './articleTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const afrobeatsrepArticleApi = createApi({
  reducerPath: 'afrobeatsrepArticleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/afrobeatsrep/article`,
  }),
  tagTypes: ['Article', 'Articles', 'Headline', 'Featured', 'Recent', 'Category', 'Subcategory', 'Label'],
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
        { type: 'Featured', id: 'LIST' },
        { type: 'Recent', id: 'LIST' },
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
        { type: 'Featured', id: 'LIST' },
        { type: 'Recent', id: 'LIST' },
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
        { type: 'Featured', id: 'LIST' },
        { type: 'Recent', id: 'LIST' },
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

    getFeaturedArticles: builder.query<FeaturedResponse, number | void>({
      query: (limit = 6) => `/featured?limit=${limit}`,
      providesTags: [{ type: 'Featured', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setFeaturedArticles(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch featured articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    getRecentArticles: builder.query<FeaturedResponse, number | void>({
      query: (limit = 10) => `/recent?limit=${limit}`,
      providesTags: [{ type: 'Recent', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setRecentArticles(data.data));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch recent articles'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    getArticlesByCategory: builder.query<ArticlesResponse, CategoryParams>({
      query: ({ category, page = 1, limit = 10 }) => 
        `/category/${category}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { category }) => [{ type: 'Category', id: category }],
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
      providesTags: (result, error, { subcategory }) => [{ type: 'Subcategory', id: subcategory }],
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

    getArticlesByLabel: builder.query<ArticlesResponse, LabelParams>({
      query: ({ label, page = 1, limit = 10 }) => 
        `/label/${label}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { label }) => [{ type: 'Label', id: label }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setLabelArticles({
              articles: data.data.articles,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              limit,
              label: data.label,
            }));
          }
        } catch (error: any) {
          dispatch(setError(error?.data?.message || 'Failed to fetch label articles'));
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
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetHeadlineQuery,
  useGetFeaturedArticlesQuery,
  useGetRecentArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesBySubcategoryQuery,
  useGetArticlesByLabelQuery,
  useGetSimilarArticlesQuery,
  useSearchArticlesQuery,
} = afrobeatsrepArticleApi;

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