export interface Graphic {
  _id: string;
  title: string;
  description: string;
  content: string;
  content_images: ContentImage[];
  category: string;
  subcategory: string[];
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  featured_image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContentImage {
  url: string;
  caption?: string;
  alt_text?: string;
  order: number;
  _id?: string;
}

export interface GraphicResponse {
  status: string;
  cached: boolean;
  data: Graphic;
}

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
  search?: string;
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
}