import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { graphicApi } from './graphicAPI';
import { Graphic, GraphicState } from './graphicTypes';

const initialState: GraphicState = {
  graphics: [],
  currentGraphic: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

const graphicSlice = createSlice({
  name: 'graphic',
  initialState,
  reducers: {
    setCurrentGraphic: (state, action: PayloadAction<Graphic | null>) => {
      state.currentGraphic = action.payload;
    },
    clearGraphicError: (state) => {
      state.error = null;
    },
    resetGraphicState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      graphicApi.endpoints.getGraphics.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphics.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphics.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load graphics';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getGraphicById.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicById.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentGraphic = action.payload.data;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicById.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load graphic';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getGraphicBySlug.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicBySlug.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.currentGraphic = action.payload.data;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicBySlug.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load graphic';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.createGraphic.matchPending,
      (state) => {
        state.isCreating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.createGraphic.matchFulfilled,
      (state) => {
        state.isCreating = false;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.createGraphic.matchRejected,
      (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create graphic';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.updateGraphic.matchPending,
      (state) => {
        state.isUpdating = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.updateGraphic.matchFulfilled,
      (state) => {
        state.isUpdating = false;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.updateGraphic.matchRejected,
      (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update graphic';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.deleteGraphic.matchPending,
      (state) => {
        state.isDeleting = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.deleteGraphic.matchFulfilled,
      (state) => {
        state.isDeleting = false;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.deleteGraphic.matchRejected,
      (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete graphic';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getGraphicsByCategory.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicsByCategory.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getGraphicsByCategory.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load graphics by category';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getSimilarGraphics.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getSimilarGraphics.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getSimilarGraphics.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load similar graphics';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.searchGraphics.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.searchGraphics.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.searchGraphics.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search graphics';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getRecentGraphics.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getRecentGraphics.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getRecentGraphics.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load recent graphics';
      }
    );

    builder.addMatcher(
      graphicApi.endpoints.getFeaturedGraphics.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getFeaturedGraphics.matchFulfilled,
      (state, action) => {
        state.isLoading = false;
        state.graphics = action.payload.data.graphics;
      }
    );
    builder.addMatcher(
      graphicApi.endpoints.getFeaturedGraphics.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load featured graphics';
      }
    );
  },
});

export const { 
  setCurrentGraphic, 
  clearGraphicError, 
  resetGraphicState 
} = graphicSlice.actions;

export default graphicSlice.reducer;