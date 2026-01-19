import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  OpinionResponse,
  OpinionsResponse,
  CreateOpinionRequest,
  UpdateOpinionRequest,
  GetOpinionsParams,
} from './opinionTypes';

export const opinionApi = createApi({
  reducerPath: 'ghanapolitanOpinionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api`,
  }),
  tagTypes: ['Opinion'],
  endpoints: (builder) => ({
    getOpinions: builder.query<OpinionsResponse, GetOpinionsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('q', params.search);
        
        const queryString = queryParams.toString();
        return {
          url: `/ghanapolitan/opinion${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),

    getOpinionById: builder.query<OpinionResponse, string>({
      query: (id) => ({
        url: `/ghanapolitan/opinion/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Opinion', id }],
    }),

    getOpinionBySlug: builder.query<OpinionResponse, string>({
      query: (slug) => ({
        url: `/ghanapolitan/opinion/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{ type: 'Opinion', id: result.data._id }] : [],
    }),

    createOpinion: builder.mutation<OpinionResponse, CreateOpinionRequest>({
      query: ({ formData }) => ({
        url: '/ghanapolitan/opinion',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Opinion', id: 'LIST' }],
    }),

    updateOpinion: builder.mutation<OpinionResponse, UpdateOpinionRequest>({
      query: ({ id, formData }) => ({
        url: `/ghanapolitan/opinion/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Opinion', id },
        { type: 'Opinion', id: 'LIST' },
      ],
    }),

    deleteOpinion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ghanapolitan/opinion/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Opinion', id: 'LIST' }],
    }),

    getOpinionsByCategory: builder.query<OpinionsResponse, { 
      category: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ category, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/opinion/category/${category}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),

    getSimilarOpinions: builder.query<OpinionsResponse, { 
      slug: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ slug, page = 1, limit = 5 }) => ({
        url: `/ghanapolitan/opinion/similar/${slug}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),

    searchOpinions: builder.query<OpinionsResponse, { 
      query: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/opinion/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),

    getRecentOpinions: builder.query<OpinionsResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/ghanapolitan/opinion/recent?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),

    getFeaturedOpinions: builder.query<OpinionsResponse, { limit?: number }>({
      query: ({ limit = 6 }) => ({
        url: `/ghanapolitan/opinion/featured?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.opinions.map(({ _id }) => ({ 
                type: 'Opinion' as const, 
                id: _id 
              })),
              { type: 'Opinion', id: 'LIST' },
            ]
          : [{ type: 'Opinion', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOpinionsQuery,
  useGetOpinionByIdQuery,
  useGetOpinionBySlugQuery,
  useCreateOpinionMutation,
  useUpdateOpinionMutation,
  useDeleteOpinionMutation,
  useGetOpinionsByCategoryQuery,
  useGetSimilarOpinionsQuery,
  useSearchOpinionsQuery,
  useGetRecentOpinionsQuery,
  useGetFeaturedOpinionsQuery,
} = opinionApi;