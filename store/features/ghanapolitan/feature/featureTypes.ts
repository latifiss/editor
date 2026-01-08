export interface GhanapolitanFeature {
  _id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  subcategory: string[];
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GhanapolitanFeatureResponse {
  status: string;
  cached: boolean;
  data: GhanapolitanFeature;
}

export interface GhanapolitanFeaturesResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    features: GhanapolitanFeature[];
  };
}

export interface CreateGhanapolitanFeatureRequest {
  formData: FormData;
}

export interface UpdateGhanapolitanFeatureRequest {
  id: string;
  formData: FormData;
}

export interface GetGhanapolitanFeaturesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface GhanapolitanFeatureState {
  features: GhanapolitanFeature[];
  currentFeature: GhanapolitanFeature | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
}