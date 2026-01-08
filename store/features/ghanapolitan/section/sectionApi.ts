import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  setLoading,
  setError,
  setSections,
  setCurrentSection,
  setImportantSections,
  setActiveSections,
  setExpiringSections,
  setSectionWithArticles,
  setSearchResults,
  addSection,
  updateSectionInList,
  removeSectionFromList,
} from './sectionSlice';
import {
  SectionsResponse,
  SectionResponse,
  PaginationParams,
  SectionWithArticlesResponse,
  CreateSectionPayload,
  SectionExpirationResponse,
  ApiError,
} from './sectionTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ghanapolitanSectionApi = createApi({
  reducerPath: 'ghanapolitanSectionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/ghanapolitan/sections`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Section', 'Sections', 'ImportantSections', 'ActiveSections', 'ExpiringSections'],
  endpoints: (builder) => ({
    getSections: builder.query<SectionsResponse, PaginationParams>({
      query: ({
        page = 1,
        limit = 10,
        search,
        isActive,
        isSectionImportant,
        category,
        tags,
        sortBy = 'displayOrder',
        sortOrder = 'asc',
      }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        if (search) params.append('q', search);
        if (isActive !== undefined) params.append('isActive', isActive.toString());
        if (isSectionImportant !== undefined) params.append('isSectionImportant', isSectionImportant.toString());
        if (category) params.append('category', category);
        if (tags && tags.length > 0) params.append('tags', tags.join(','));
        return `/?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.sections
          ? [
              ...result.data.sections.map(({ _id }) => ({ type: 'Section' as const, id: _id })),
              { type: 'Sections', id: 'LIST' },
            ]
          : [{ type: 'Sections', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSections({
              sections: data.data.sections,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              currentPage: data.currentPage || 1,
              limit: 10,
            }));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to fetch sections'));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),

    getSectionById: builder.query<SectionResponse, string>({
      query: (id) => `/id/${id}`,
      providesTags: (result, error, id) => [{ type: 'Section', id }],
    }),

    getSectionBySlug: builder.query<SectionResponse, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Section', id: slug }],
    }),

    getSectionByCode: builder.query<SectionResponse, string>({
      query: (code) => `/code/${code}`,
      providesTags: (result, error, code) => [{ type: 'Section', id: code }],
    }),

    getImportantSections: builder.query<SectionsResponse, { limit?: number }>({
      query: ({ limit = 10 } = {}) => `/important?limit=${limit}`,
      providesTags: [{ type: 'ImportantSections', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setImportantSections({
              sections: data.data.sections,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              currentPage: data.currentPage || 1,
              limit: 10,
            }));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to fetch important sections'));
        }
      },
    }),

    getActiveSections: builder.query<SectionsResponse, void>({
      query: () => '/active',
      providesTags: [{ type: 'ActiveSections', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setActiveSections({
              sections: data.data.sections,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              currentPage: data.currentPage || 1,
              limit: 10,
            }));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to fetch active sections'));
        }
      },
    }),

    getExpiringSections: builder.query<SectionsResponse, { days?: number }>({
      query: ({ days = 7 } = {}) => `/expiring?days=${days}`,
      providesTags: [{ type: 'ExpiringSections', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setExpiringSections({
              sections: data.data.sections,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              currentPage: data.currentPage || 1,
              limit: 10,
            }));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to fetch expiring sections'));
        }
      },
    }),

    searchSections: builder.query<SectionsResponse, { q: string; page?: number; limit?: number }>({
      query: ({ q, page = 1, limit = 10 }) => `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(setSearchResults({
              sections: data.data.sections,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              currentPage: data.currentPage || 1,
              limit,
            }));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to search sections'));
        }
      },
    }),

    createSection: builder.mutation<SectionResponse, FormData>({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'Sections', id: 'LIST' },
        { type: 'ImportantSections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(addSection(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to create section'));
        }
      },
    }),

    updateSection: builder.mutation<SectionResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ImportantSections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to update section'));
        }
      },
    }),

    deleteSection: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ImportantSections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeSectionFromList(id));
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to delete section'));
        }
      },
    }),

    toggleImportance: builder.mutation<SectionResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/toggle-importance`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ImportantSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to toggle section importance'));
        }
      },
    }),

    toggleActiveStatus: builder.mutation<SectionResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to toggle section active status'));
        }
      },
    }),

    extendExpiration: builder.mutation<SectionExpirationResponse, { id: string; days: number }>({
      query: ({ id, days }) => ({
        url: `/${id}/extend-expiration`,
        method: 'POST',
        body: { days },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to extend expiration'));
        }
      },
    }),

    setExpiration: builder.mutation<SectionExpirationResponse, { id: string; expires_at: string }>({
      query: ({ id, expires_at }) => ({
        url: `/${id}/set-expiration`,
        method: 'POST',
        body: { expires_at },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to set expiration'));
        }
      },
    }),

    removeExpiration: builder.mutation<SectionResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/expiration`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
        { type: 'Sections', id: 'LIST' },
        { type: 'ActiveSections', id: 'LIST' },
        { type: 'ExpiringSections', id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === 'success') {
            dispatch(updateSectionInList(data.data.section));
          }
        } catch (error: unknown) {
          const err = error as { data?: ApiError };
          dispatch(setError(err?.data?.message || 'Failed to remove expiration'));
        }
      },
    }),

    addFeaturedArticle: builder.mutation<SectionResponse, { id: string; articleId: string }>({
      query: ({ id, articleId }) => ({
        url: `/${id}/featured`,
        method: 'POST',
        body: { articleId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    removeFeaturedArticle: builder.mutation<SectionResponse, { id: string; articleId: string }>({
      query: ({ id, articleId }) => ({
        url: `/${id}/featured/${articleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    addTag: builder.mutation<SectionResponse, { id: string; tag: string }>({
      query: ({ id, tag }) => ({
        url: `/${id}/tags`,
        method: 'POST',
        body: { tag },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    removeTag: builder.mutation<SectionResponse, { id: string; tag: string }>({
      query: ({ id, tag }) => ({
        url: `/${id}/tags/${tag}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    incrementArticlesCount: builder.mutation<SectionResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/articles/increment`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    decrementArticlesCount: builder.mutation<SectionResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}/articles/decrement`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Section', id },
      ],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useGetSectionByIdQuery,
  useGetSectionBySlugQuery,
  useGetSectionByCodeQuery,
  useGetImportantSectionsQuery,
  useGetActiveSectionsQuery,
  useGetExpiringSectionsQuery,
  useSearchSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useToggleImportanceMutation,
  useToggleActiveStatusMutation,
  useExtendExpirationMutation,
  useSetExpirationMutation,
  useRemoveExpirationMutation,
  useAddFeaturedArticleMutation,
  useRemoveFeaturedArticleMutation,
  useAddTagMutation,
  useRemoveTagMutation,
  useIncrementArticlesCountMutation,
  useDecrementArticlesCountMutation,
} = ghanapolitanSectionApi;