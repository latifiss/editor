import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { opinionApi } from './opinionAPI';
import { Opinion, OpinionState } from './opinionTypes';

const initialState: OpinionState = {
  opinions: [],
  currentOpinion: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

const opinionSlice = createSlice({
  name: 'opinion',
  initialState,
  reducers: {
    setCurrentOpinion: (state, action: PayloadAction<Opinion | null>) => {
      state.currentOpinion = action.payload;
    },
    clearOpinionError: (state) => {
      state.error = null;
    },
    resetOpinionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      opinionApi.endpoints.getOpinions.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinions.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinions.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load opinions';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getOpinionById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionById.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentOpinion = action.payload.data;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionById.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load opinion';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getOpinionBySlug.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionBySlug.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentOpinion = action.payload.data;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionBySlug.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load opinion';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.createOpinion.matchPending,
      (state) => {
        state.isCreating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.createOpinion.matchFulfilled,
      (state) => {
        state.isCreating = false;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.createOpinion.matchRejected,
      (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create opinion';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.updateOpinion.matchPending,
      (state) => {
        state.isUpdating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.updateOpinion.matchFulfilled,
      (state) => {
        state.isUpdating = false;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.updateOpinion.matchRejected,
      (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update opinion';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.deleteOpinion.matchPending,
      (state) => {
        state.isDeleting = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.deleteOpinion.matchFulfilled,
      (state) => {
        state.isDeleting = false;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.deleteOpinion.matchRejected,
      (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete opinion';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getOpinionsByCategory.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionsByCategory.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getOpinionsByCategory.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load opinions by category';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getSimilarOpinions.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getSimilarOpinions.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getSimilarOpinions.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load similar opinions';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.searchOpinions.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.searchOpinions.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.searchOpinions.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search opinions';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getRecentOpinions.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getRecentOpinions.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getRecentOpinions.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load recent opinions';
      }
    );

    builder.addMatcher(
      opinionApi.endpoints.getFeaturedOpinions.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getFeaturedOpinions.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.opinions = action.payload.data.opinions;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      opinionApi.endpoints.getFeaturedOpinions.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load featured opinions';
      }
    );
  },
});

export const { 
  setCurrentOpinion, 
  clearOpinionError, 
  resetOpinionState 
} = opinionSlice.actions;

export default opinionSlice.reducer;