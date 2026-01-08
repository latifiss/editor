import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ghanapolitanFeatureApi } from './featureAPI';
import { GhanapolitanFeature, GhanapolitanFeatureState } from './featureTypes';

const initialState: GhanapolitanFeatureState = {
  features: [],
  currentFeature: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

const ghanapolitanFeatureSlice = createSlice({
  name: 'ghanapolitanFeature',
  initialState,
  reducers: {
    setCurrentGhanapolitanFeature: (state, action: PayloadAction<GhanapolitanFeature | null>) => {
      state.currentFeature = action.payload;
    },
    clearGhanapolitanFeatureError: (state) => {
      state.error = null;
    },
    resetGhanapolitanFeatureState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatures.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatures.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.features = action.payload.data.features;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatures.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load features';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureById.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentFeature = action.payload.data;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureById.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load feature';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureBySlug.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureBySlug.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentFeature = action.payload.data;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeatureBySlug.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load feature';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.createGhanapolitanFeature.matchPending,
      (state) => {
        state.isCreating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.createGhanapolitanFeature.matchFulfilled,
      (state) => {
        state.isCreating = false;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.createGhanapolitanFeature.matchRejected,
      (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create feature';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.updateGhanapolitanFeature.matchPending,
      (state) => {
        state.isUpdating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.updateGhanapolitanFeature.matchFulfilled,
      (state) => {
        state.isUpdating = false;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.updateGhanapolitanFeature.matchRejected,
      (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update feature';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.deleteGhanapolitanFeature.matchPending,
      (state) => {
        state.isDeleting = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.deleteGhanapolitanFeature.matchFulfilled,
      (state) => {
        state.isDeleting = false;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.deleteGhanapolitanFeature.matchRejected,
      (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete feature';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeaturesByCategory.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeaturesByCategory.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.features = action.payload.data.features;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getGhanapolitanFeaturesByCategory.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load features by category';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getSimilarGhanapolitanFeatures.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getSimilarGhanapolitanFeatures.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.features = action.payload.data.features;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.getSimilarGhanapolitanFeatures.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load similar features';
      }
    );

    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.searchGhanapolitanFeatures.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.searchGhanapolitanFeatures.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.features = action.payload.data.features;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      ghanapolitanFeatureApi.endpoints.searchGhanapolitanFeatures.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search features';
      }
    );
  },
});

export const { 
  setCurrentGhanapolitanFeature, 
  clearGhanapolitanFeatureError, 
  resetGhanapolitanFeatureState 
} = ghanapolitanFeatureSlice.actions;

export default ghanapolitanFeatureSlice.reducer;