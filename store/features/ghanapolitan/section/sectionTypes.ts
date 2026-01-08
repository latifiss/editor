
export interface Section {
  _id: string;
  section_name: string;
  section_code: string;
  section_slug: string;
  section_description?: string;
  isSectionImportant: boolean;
  tags: string[];
  category?: string;
  subcategory: string[];
  isActive: boolean;
  displayOrder: number;
  meta_title?: string;
  meta_description?: string;
  section_image_url?: string;
  section_color: string;
  section_background_color?: string;
  createdBy: string;
  updatedBy?: string;
  articles_count: number;
  featured_articles: string[];
  expires_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SectionInput {
  section_name: string;
  section_code: string;
  section_slug?: string;
  section_description?: string;
  isSectionImportant?: boolean;
  tags?: string[];
  category?: string;
  subcategory?: string[];
  isActive?: boolean;
  displayOrder?: number;
  meta_title?: string;
  meta_description?: string;
  section_image?: File | string;
  section_color?: string;
  section_background_color?: string;
  createdBy?: string;
  updatedBy?: string;
  featured_articles?: string[];
  expires_at?: string | null;
}

export interface SectionsResponse {
  status: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: { sections: Section[] };
}

export interface SectionResponse {
  status: string;
  data: { section: Section };
}

export interface SectionWithArticlesResponse {
  status: string;
  data: SectionWithArticlesResponseData;
}

export interface SectionExpirationResponse {
  status: string;
  data: {
    section: Section;
    expires_at: string;
  };
}

export interface SectionsResponseData {
  sections: Section[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface SectionWithArticlesResponseData {
  section: Section;
  articles: any[];
}

export interface ImportantSectionsResponseData extends SectionsResponseData {
  isImportant: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isSectionImportant?: boolean;
  category?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSectionPayload {
  section_name: string;
  section_code: string;
  section_description?: string;
  isSectionImportant?: boolean;
  tags?: string[];
  category?: string;
  subcategory?: string[];
  isActive?: boolean;
  displayOrder?: number;
  meta_title?: string;
  meta_description?: string;
  section_image?: File;
  section_color?: string;
  section_background_color?: string;
  createdBy?: string;
  featured_articles?: string[];
  expires_at?: string | null;
}

export interface UpdateSectionPayload extends Partial<CreateSectionPayload> {
  id: string;
}

export type ActiveSectionsResponseData = SectionsResponseData;
export type ImportantSectionsResponseData = SectionsResponseData;
export type ExpiringSectionsResponseData = SectionsResponseData;

export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}