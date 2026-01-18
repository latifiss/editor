import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  GraphicResponse,
  GraphicsResponse,
  CreateGraphicRequest,
  UpdateGraphicRequest,
  GetGraphicsParams,
} from './graphicTypes';

export const graphicApi = createApi({
  reducerPath: 'graphicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  }),
  tagTypes: ['Graphic'],
  endpoints: (builder) => ({
    getGraphics: builder.query<GraphicsResponse, GetGraphicsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('q', params.search);
        
        const queryString = queryParams.toString();
        return {
          url: `/ghanapolitan/graphic${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    getGraphicById: builder.query<GraphicResponse, string>({
      query: (id) => ({
        url: `/ghanapolitan/graphic/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Graphic', id }],
    }),

    getGraphicBySlug: builder.query<GraphicResponse, string>({
      query: (slug) => ({
        url: `/ghanapolitan/graphic/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result ? [{ type: 'Graphic', id: result.data._id }] : [],
    }),

    createGraphic: builder.mutation<GraphicResponse, CreateGraphicRequest>({
      query: ({ formData }) => ({
        url: '/ghanapolitan/graphic',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Graphic', id: 'LIST' }],
    }),

    updateGraphic: builder.mutation<GraphicResponse, UpdateGraphicRequest>({
      query: ({ id, formData }) => ({
        url: `/ghanapolitan/graphic/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Graphic', id },
        { type: 'Graphic', id: 'LIST' },
      ],
    }),

    deleteGraphic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ghanapolitan/graphic/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Graphic', id: 'LIST' }],
    }),

    getGraphicsByCategory: builder.query<GraphicsResponse, { 
      category: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ category, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/graphic/category/${category}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    getGraphicsBySubcategory: builder.query<GraphicsResponse, { 
      subcategory: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ subcategory, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/graphic/subcategory/${subcategory}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    getSimilarGraphics: builder.query<GraphicsResponse, { 
      slug: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ slug, page = 1, limit = 5 }) => ({
        url: `/ghanapolitan/graphic/similar/${slug}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    searchGraphics: builder.query<GraphicsResponse, { 
      query: string; 
      page?: number; 
      limit?: number 
    }>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: `/ghanapolitan/graphic/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    getRecentGraphics: builder.query<GraphicsResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/ghanapolitan/graphic/recent?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),

    getFeaturedGraphics: builder.query<GraphicsResponse, { limit?: number }>({
      query: ({ limit = 6 }) => ({
        url: `/ghanapolitan/graphic/featured?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.graphics.map(({ _id }) => ({ 
                type: 'Graphic' as const, 
                id: _id 
              })),
              { type: 'Graphic', id: 'LIST' },
            ]
          : [{ type: 'Graphic', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetGraphicsQuery,
  useGetGraphicByIdQuery,
  useGetGraphicBySlugQuery,
  useCreateGraphicMutation,
  useUpdateGraphicMutation,
  useDeleteGraphicMutation,
  useGetGraphicsByCategoryQuery,
  useGetGraphicsBySubcategoryQuery,
  useGetSimilarGraphicsQuery,
  useSearchGraphicsQuery,
  useGetRecentGraphicsQuery,
  useGetFeaturedGraphicsQuery,
} = graphicApi;