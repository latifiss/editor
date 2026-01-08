export interface Opinion {
  _id: string;
  title: string;
  description: string;
  content: any;
  category: string;
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

export interface OpinionResponse {
  status: string;
  cached: boolean;
  data: Opinion;
}

export interface OpinionsResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    opinions: Opinion[];
  };
}

export interface CreateOpinionRequest {
  formData: FormData;
}

export interface UpdateOpinionRequest {
  id: string;
  formData: FormData;
}

export interface GetOpinionsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface OpinionState {
  opinions: Opinion[];
  currentOpinion: Opinion | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
}