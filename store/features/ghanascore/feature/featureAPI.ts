import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  FeatureResponse,
  FeaturesResponse,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  GetFeaturesParams,
} from './featureTypes';

export const featureApi = createApi({
  reducerPath: 'ghanascoreFeatureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  }),
  tagTypes: ['Feature'],
  endpoints: (builder) => ({
    getFeatures: builder.query<FeaturesResponse, GetFeaturesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('q', params.search);
        
        const queryString = queryParams.toString();
        return {
          url: `/ghanascore/feature${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),

    getFeatureById: builder.query<FeatureResponse, string>({
      query: (id) => ({
        url: `/ghanascore/feature/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Feature', id }],
    }),

    getFeatureBySlug: builder.query<FeatureResponse, string>({
      query: (slug) => ({
        url: `/ghanascore/feature/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{ type: 'Feature', id: result.data._id }] : [],
    }),

    createFeature: builder.mutation<FeatureResponse, CreateFeatureRequest>({
      query: ({ formData }) => ({
        url: '/ghanascore/feature',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Feature', id: 'LIST' }],
    }),

    updateFeature: builder.mutation<FeatureResponse, UpdateFeatureRequest>({
      query: ({ id, formData }) => ({
        url: `/ghanascore/feature/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Feature', id },
        { type: 'Feature', id: 'LIST' },
      ],
    }),

    deleteFeature: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ghanascore/feature/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Feature', id: 'LIST' }],
    }),

    getFeaturesByCategory: builder.query<FeaturesResponse, { category: string; page?: number; limit?: number }>({
      query: ({ category, page = 1, limit = 10 }) => ({
        url: `/ghanascore/feature/category/${category}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),

    getFeaturesBySubcategory: builder.query<FeaturesResponse, { subcategory: string; page?: number; limit?: number }>({
      query: ({ subcategory, page = 1, limit = 10 }) => ({
        url: `/ghanascore/feature/subcategory/${subcategory}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),

    searchFeatures: builder.query<FeaturesResponse, { query: string; page?: number; limit?: number }>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: `/ghanascore/feature/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),

    getRecentFeatures: builder.query<FeaturesResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/ghanascore/feature/recent?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),

    getFeaturedContent: builder.query<FeaturesResponse, { limit?: number }>({
      query: ({ limit = 6 }) => ({
        url: `/ghanascore/feature/featured?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ type: 'Feature' as const, id: _id })),
              { type: 'Feature', id: 'LIST' },
            ]
          : [{ type: 'Feature', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFeaturesQuery,
  useGetFeatureByIdQuery,
  useGetFeatureBySlugQuery,
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useDeleteFeatureMutation,
  useGetFeaturesByCategoryQuery,
  useGetFeaturesBySubcategoryQuery,
  useSearchFeaturesQuery,
  useGetRecentFeaturesQuery,
  useGetFeaturedContentQuery,
} = featureApi;