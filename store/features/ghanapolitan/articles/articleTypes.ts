export interface LiveArticleContent {
  content_title: string;
  content_description: string;
  content_detail: string;
  content_image_url?: string;
  content_published_at: string;
  isKey: boolean;
}

export interface CommentReply {
  _id: string;
  username: string;
  content: string;
  isEdited: boolean;
  editedAt?: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleComment {
  _id: string;
  username: string;
  content: string;
  isEdited: boolean;
  editedAt?: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  replies: CommentReply[];
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory: string[];
  tags: string[];
  section_id?: string;
  section_name?: string;
  section_code?: string;
  section_slug?: string;
  has_section: boolean;
  isLive: boolean;
  wasLive: boolean;
  isBreaking: boolean;
  isTopstory: boolean;
  breakingExpiresAt?: string;
  isHeadline: boolean;
  comments: ArticleComment[];
  source_name: string;
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleInput {
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory?: string[];
  tags?: string[];
  section_id?: string;
  section_name?: string;
  section_code?: string;
  section_slug?: string;
  has_section?: boolean;
  isLive?: boolean;
  isBreaking?: boolean;
  isTopstory?: boolean;
  isHeadline?: boolean;
  source_name?: string;
  meta_title?: string;
  meta_description?: string;
  creator?: string;
  slug?: string;
  image_url?: File | string;
  published_at?: string;
}

export interface ArticlesResponse {
  status: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: { articles: Article[] };
}

export interface ArticleResponse {
  status: string;
  data: { article: Article };
}

export interface HeadlineResponse {
  status: string;
  data: {
    headline: Article;
    similarArticles: Article[];
  };
}

export interface SectionArticlesResponse {
  status: string;
  section: {
    id: string;
    name: string;
    description?: string;
    slug?: string;
  };
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: { articles: Article[] };
}

export interface ArticlesWithSectionsResponse {
  status: string;
  data: ArticlesWithSectionsResponseData[];
}

export interface ArticleFeedResponse {
  status: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: { articles: Article[] };
}

export interface ArticleFeedByCategoryResponse {
  status: string;
  category: string;
  results: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: { articles: Article[] };
}

export interface ArticlesResponseData {
  articles: Article[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface SectionArticlesResponseData {
  section: {
    id: string;
    name: string;
    description?: string;
    slug?: string;
  };
  articles: Article[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ArticlesWithSectionsResponseData {
  section: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    color?: string;
    articles_count: number;
  };
  articles: Article[];
}

export interface CategoryArticlesResponseData extends ArticlesResponseData {
  category: string;
}

export interface SubcategoryArticlesResponseData extends ArticlesResponseData {
  subcategory: string;
}

export interface SearchArticlesResponseData extends ArticlesResponseData {
  query: string;
}

export type LiveArticlesResponseData = ArticlesResponseData;

export interface ArticleFeedResponseData extends ArticlesResponseData {}

export interface ArticleFeedByCategoryResponseData extends ArticlesResponseData {
  category: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  section_id?: string;
  section_name?: string;
  section_slug?: string;
  has_section?: boolean;
  isBreaking?: boolean;
  isLive?: boolean;
  isTopstory?: boolean;
}

export interface CategoryParams {
  category: string;
  page?: number;
  limit?: number;
}

export interface SubcategoryParams {
  subcategory: string;
  page?: number;
  limit?: number;
}

export interface SectionParams {
  sectionId: string;
  page?: number;
  limit?: number;
}

export interface SectionSlugParams {
  sectionSlug: string;
  page?: number;
  limit?: number;
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory?: string[];
  tags?: string[];
  section_id?: string;
  section_name?: string;
  section_code?: string;
  section_slug?: string;
  has_section?: boolean;
  isLive?: boolean;
  isBreaking?: boolean;
  isTopstory?: boolean;
  isHeadline?: boolean;
  source_name?: string;
  meta_title?: string;
  meta_description?: string;
  creator?: string;
  slug?: string;
  image?: File;
  published_at?: string;
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  id: string;
}