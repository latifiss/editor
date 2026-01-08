export interface Feature {
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

export interface FeatureResponse {
  status: string;
  cached: boolean;
  data: Feature;
}

export interface FeaturesResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    features: Feature[];
  };
}

export interface CreateFeatureRequest {
  formData: FormData;
}

export interface UpdateFeatureRequest {
  id: string;
  formData: FormData;
}

export interface FeatureState {
  features: Feature[];
  currentFeature: Feature | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface GetFeaturesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}