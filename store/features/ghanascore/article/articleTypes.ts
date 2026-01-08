export interface LiveArticleContent {
  content_title: string;
  content_description: string;
  content_detail: string;
  content_image_url?: string;
  content_published_at: string;
  isKey: boolean;
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory: string[];
  tags: string[];
  isLive: boolean;
  wasLive: boolean;
  isBreaking: boolean;
  isTopstory: boolean;
  hasLivescore: boolean;
  livescoreTag?: string;
  breakingExpiresAt?: string;
  topstoryExpiresAt?: string;
  isHeadline: boolean;
  source_name: string;
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  keyEvents?: LiveArticleContent[];
}

export interface ArticlesResponse {
  status: string;
  cached: boolean;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: {
    articles: Article[];
  };
}

export interface ArticleResponse {
  status: string;
  cached: boolean;
  data: Article;
}

export interface HeadlineResponse {
  status: string;
  cached: boolean;
  data: {
    headline: Article;
    similarArticles: Article[];
  };
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory?: string | string[];
  tags?: string | string[];
  isLive?: boolean;
  isBreaking?: boolean;
  isHeadline?: boolean;
  isTopstory?: boolean;
  hasLivescore?: boolean;
  livescoreTag?: string;
  breakingExpiresAt?: string;
  topstoryExpiresAt?: string;
  source_name?: string;
  meta_title?: string;
  meta_description?: string;
  creator?: string;
  slug?: string;
  published_at?: string;
  image?: File;
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  id: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q: string;
}

export interface CategoryParams extends PaginationParams {
  category: string;
}

export interface SubcategoryParams extends PaginationParams {
  subcategory: string;
}

export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  headline: Article | null;
  similarArticles: Article[];
  breakingNews: Article[];
  topStories: Article[];
  liveArticles: Article[];
  recentTopStories: Article[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export interface CreateArticleFormData extends FormData {
  append(name: string, value: string | Blob, fileName?: string): void;
}