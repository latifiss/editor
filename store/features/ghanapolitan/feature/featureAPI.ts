import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  GhanapolitanFeatureResponse,
  GhanapolitanFeaturesResponse,
  CreateGhanapolitanFeatureRequest,
  UpdateGhanapolitanFeatureRequest,
  GetGhanapolitanFeaturesParams,
} from './featureTypes';

export const ghanapolitanFeatureApi = createApi({
  reducerPath: 'ghanapolitanFeatureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api`,
  }),
  tagTypes: ['GhanapolitanFeature'],
  endpoints: (builder) => ({
    getGhanapolitanFeatures: builder.query<GhanapolitanFeaturesResponse, GetGhanapolitanFeaturesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('q', params.search);
        
        const queryString = queryParams.toString();
        return {
          url: `/ghanapolitan/feature${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getGhanapolitanFeatureById: builder.query<GhanapolitanFeatureResponse, string>({
      query: (id) => ({
        url: `/ghanapolitan/feature/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'GhanapolitanFeature', id }],
    }),

    getGhanapolitanFeatureBySlug: builder.query<GhanapolitanFeatureResponse, string>({
      query: (slug) => ({
        url: `/ghanapolitan/feature/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{ type: 'GhanapolitanFeature', id: result.data._id }] : [],
    }),

    createGhanapolitanFeature: builder.mutation<GhanapolitanFeatureResponse, CreateGhanapolitanFeatureRequest>({
      query: ({ formData }) => ({
        url: '/ghanapolitan/feature',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    updateGhanapolitanFeature: builder.mutation<GhanapolitanFeatureResponse, UpdateGhanapolitanFeatureRequest>({
      query: ({ id, formData }) => ({
        url: `/ghanapolitan/feature/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'GhanapolitanFeature', id },
        { type: 'GhanapolitanFeature', id: 'LIST' },
      ],
    }),

    deleteGhanapolitanFeature: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ghanapolitan/feature/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getGhanapolitanFeaturesByCategory: builder.query<GhanapolitanFeaturesResponse, { 
      category: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ category, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/feature/category/${category}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getGhanapolitanFeaturesBySubcategory: builder.query<GhanapolitanFeaturesResponse, { 
      subcategory: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ subcategory, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/feature/subcategory/${subcategory}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getSimilarGhanapolitanFeatures: builder.query<GhanapolitanFeaturesResponse, { 
      slug: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ slug, page = 1, limit = 5 }) => ({
        url: `/ghanapolitan/feature/similar/${slug}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    searchGhanapolitanFeatures: builder.query<GhanapolitanFeaturesResponse, { 
      query: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/feature/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getRecentGhanapolitanFeatures: builder.query<GhanapolitanFeaturesResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/ghanapolitan/feature/recent?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),

    getGhanapolitanFeaturedContent: builder.query<GhanapolitanFeaturesResponse, { limit?: number }>({
      query: ({ limit = 6 }) => ({
        url: `/ghanapolitan/feature/featured?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.features.map(({ _id }) => ({ 
                type: 'GhanapolitanFeature' as const, 
                id: _id 
              })),
              { type: 'GhanapolitanFeature', id: 'LIST' },
            ]
          : [{ type: 'GhanapolitanFeature', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetGhanapolitanFeaturesQuery,
  useGetGhanapolitanFeatureByIdQuery,
  useGetGhanapolitanFeatureBySlugQuery,
  useCreateGhanapolitanFeatureMutation,
  useUpdateGhanapolitanFeatureMutation,
  useDeleteGhanapolitanFeatureMutation,
  useGetGhanapolitanFeaturesByCategoryQuery,
  useGetGhanapolitanFeaturesBySubcategoryQuery,
  useGetSimilarGhanapolitanFeaturesQuery,
  useSearchGhanapolitanFeaturesQuery,
  useGetRecentGhanapolitanFeaturesQuery,
  useGetGhanapolitanFeaturedContentQuery,
} = ghanapolitanFeatureApi;