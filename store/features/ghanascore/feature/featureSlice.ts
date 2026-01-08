import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { featureApi } from './featureAPI';
import { Feature, FeatureState } from './featureTypes';

const initialState: FeatureState = {
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

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setCurrentFeature: (state, action: PayloadAction<Feature | null>) => {
      state.currentFeature = action.payload;
    },
    clearFeatureError: (state) => {
      state.error = null;
    },
    resetFeatureState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      featureApi.endpoints.getFeatures.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.getFeatures.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.features = action.payload.data.features;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.getFeatures.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load features';
      }
    );

    builder.addMatcher(
      featureApi.endpoints.getFeatureById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.getFeatureById.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentFeature = action.payload.data;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.getFeatureById.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load feature';
      }
    );

    builder.addMatcher(
      featureApi.endpoints.createFeature.matchPending,
      (state) => {
        state.isCreating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.createFeature.matchFulfilled,
      (state) => {
        state.isCreating = false;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.createFeature.matchRejected,
      (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create feature';
      }
    );

    builder.addMatcher(
      featureApi.endpoints.updateFeature.matchPending,
      (state) => {
        state.isUpdating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.updateFeature.matchFulfilled,
      (state) => {
        state.isUpdating = false;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.updateFeature.matchRejected,
      (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update feature';
      }
    );

    builder.addMatcher(
      featureApi.endpoints.deleteFeature.matchPending,
      (state) => {
        state.isDeleting = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.deleteFeature.matchFulfilled,
      (state) => {
        state.isDeleting = false;
      }
    );
    builder.addMatcher(
      featureApi.endpoints.deleteFeature.matchRejected,
      (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete feature';
      }
    );
  },
});

export const { setCurrentFeature, clearFeatureError, resetFeatureState } =
  featureSlice.actions;

export default featureSlice.reducer;