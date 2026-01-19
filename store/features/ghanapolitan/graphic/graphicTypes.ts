export interface Graphic {
  _id: string;
  title: string;
  description: string;
  content: any; // Using any since it's Schema.Types.Mixed
  category: string;
  subcategory: string[];
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string; // This is the main image from backend
  published_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Remove ContentImage interface since it doesn't exist in backend
// export interface ContentImage {
//   url: string;
//   caption?: string;
//   alt_text?: string;
//   order: number;
//   _id?: string;
// }

// For GET /graphics/:id
export interface GraphicResponse {
  status: string;
  cached: boolean;
  data: {
    graphic: Graphic;
  };
}

// For GET /graphics/slug/:slug
export interface GraphicBySlugResponse {
  status: string;
  cached: boolean;
  data: Graphic; // Note: different structure than GraphicResponse
}

// For GET /graphics/
export interface GraphicsResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    graphics: Graphic[];
  };
}

// For GET /graphics/category/:category
export interface GraphicsByCategoryResponse {
  status: string;
  cached: boolean;
  category: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    graphics: Graphic[];
  };
}

// For GET /graphics/subcategory/:subcategory
export interface GraphicsBySubcategoryResponse {
  status: string;
  cached: boolean;
  subcategory: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    graphics: Graphic[];
  };
}

// For GET /graphics/similar/:slug
export interface SimilarGraphicsResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    graphics: Graphic[];
  };
}

// For GET /graphics/search
export interface SearchGraphicsResponse {
  status: string;
  cached: boolean;
  query: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    graphics: Graphic[];
  };
}

// For GET /graphics/recent
export interface RecentGraphicsResponse {
  status: string;
  cached: boolean;
  data: Graphic[];
}

// For GET /graphics/featured
export interface FeaturedGraphicsResponse {
  status: string;
  cached: boolean;
  data: Graphic[];
}

// For POST /graphics/
export interface CreateGraphicSuccessResponse {
  status: string;
  data: {
    graphic: Graphic;
  };
}

// For PUT /graphics/:id
export interface UpdateGraphicSuccessResponse {
  status: string;
  data: {
    graphic: Graphic;
  };
}

// For DELETE /graphics/:id
export interface DeleteGraphicSuccessResponse {
  status: string;
  message: string;
}

// Error response interface
export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
}

export interface CreateGraphicRequest {
  formData: FormData;
}

export interface UpdateGraphicRequest {
  id: string;
  formData: FormData;
}

export interface GetGraphicsParams {
  page?: number;
  limit?: number;
  category?: string;
}

export interface GetGraphicsByCategoryParams {
  category: string;
  page?: number;
  limit?: number;
}

export interface GetGraphicsBySubcategoryParams {
  subcategory: string;
  page?: number;
  limit?: number;
}

export interface GetSimilarGraphicsParams {
  slug: string;
  page?: number;
  limit?: number;
}

export interface SearchGraphicsParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface GetRecentGraphicsParams {
  limit?: number;
}

export interface GetFeaturedGraphicsParams {
  limit?: number;
}

export interface GraphicState {
  graphics: Graphic[];
  currentGraphic: Graphic | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  recentGraphics: Graphic[];
  featuredGraphics: Graphic[];
  similarGraphics: Graphic[];
  searchResults: Graphic[];
  categoryGraphics: Graphic[];
  subcategoryGraphics: Graphic[];
  categoryGraphicsTotal?: number;
  categoryGraphicsTotalPages?: number;
  categoryGraphicsCurrentPage?: number;
  subcategoryGraphicsTotal?: number;
  subcategoryGraphicsTotalPages?: number;
  subcategoryGraphicsCurrentPage?: number;
  similarGraphicsTotal?: number;
  similarGraphicsTotalPages?: number;
  similarGraphicsCurrentPage?: number;
  searchTotal?: number;
  searchTotalPages?: number;
  searchCurrentPage?: number;
}