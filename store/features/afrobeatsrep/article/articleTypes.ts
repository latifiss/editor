export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  subcategory: string[];
  tags: string[];
  isHeadline: boolean;
  label?: string;
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
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
  data: {
    article: Article;
  };
}

export interface HeadlineResponse {
  status: string;
  cached: boolean;
  data: {
    headline: Article;
    similarArticles: Article[];
  };
}

export interface FeaturedResponse {
  status: string;
  cached: boolean;
  data: Article[];
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string;
  category: string;
  subcategory?: string | string[];
  tags?: string | string[];
  isHeadline?: boolean;
  label?: string;
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

export interface LabelParams extends PaginationParams {
  label: string;
}

export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  headline: Article | null;
  similarArticles: Article[];
  featuredArticles: Article[];
  recentArticles: Article[];
  categoryArticles: Article[];
  subcategoryArticles: Article[];
  labelArticles: Article[];
  searchResults: Article[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}