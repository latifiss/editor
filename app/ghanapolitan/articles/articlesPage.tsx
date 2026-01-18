'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { 
  useGetArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesByStatusQuery,
  useDeleteArticleMutation,
  useSearchArticlesQuery
} from '@/store/features/ghanapolitan/articles/articleAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Plus, 
  XCircle,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Clock,
  Zap,
  TrendingUp,
  Radio,
  Newspaper,
  Star
} from 'lucide-react';
import { SearchInput } from '@/components/ui/inputs/searchInput';
import debounce from 'lodash/debounce';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = ''
}: { 
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'indigo' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
}) => {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700',
    primary: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    secondary: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    info: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    purple: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    pink: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className="flex-shrink-0" />}
      {children}
    </span>
  );
};

const AVAILABLE_CATEGORIES = [
  'Politics',
  'Business',
  'Technology',
  'Entertainment',
  'Sports',
  'Health',
  'Science',
  'Education',
  'Lifestyle',
  'Crime',
  'World',
  'Local',
  'Opinion',
  'Weather'
];

interface Article {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  image_url?: string;
  isBreaking: boolean;
  isHeadline: boolean;
  isTopstory: boolean;
  isLive: boolean;
  slug: string;
  published_at: string;
  createdAt: string;
  tags?: string[];
  subcategory?: string[];
  section_name?: string;
}

interface ArticlesPageProps {
  initialArticles?: any;
}

export default function ArticlesPage({ initialArticles }: ArticlesPageProps) {
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const debounceSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchTerm);
    return () => {
      debounceSearch.cancel();
    };
  }, [searchTerm, debounceSearch]);

  const { 
    data: searchData, 
    isLoading: isSearching,
    error: searchError,
    isFetching: isSearchFetching
  } = useSearchArticlesQuery(
    debouncedSearchTerm ? { 
      q: debouncedSearchTerm, 
      page, 
      limit 
    } : { q: '', page: 1, limit: 0 },
    { 
      skip: !debouncedSearchTerm,
      refetchOnMountOrArgChange: true 
    }
  );
  
  const { 
    data: categoryArticlesData, 
    isLoading: isCategoryArticlesLoading, 
    error: categoryArticlesError, 
    refetch: refetchCategoryArticles,
    isFetching: isCategoryArticlesFetching
  } = useGetArticlesByCategoryQuery(
    categoryFilter ? { 
      category: categoryFilter,
      page, 
      limit 
    } : { category: '', page: 1, limit: 0 },
    { 
      skip: !categoryFilter || !!debouncedSearchTerm,
      refetchOnMountOrArgChange: true 
    }
  );
  
  const { 
    data: statusArticlesData, 
    isLoading: isStatusArticlesLoading, 
    error: statusArticlesError, 
    refetch: refetchStatusArticles,
    isFetching: isStatusArticlesFetching
  } = useGetArticlesByStatusQuery(
    statusFilter !== 'all' ? { 
      status: statusFilter,
      page, 
      limit 
    } : { status: '', page: 1, limit: 0 },
    { 
      skip: statusFilter === 'all' || !!debouncedSearchTerm || !!categoryFilter,
      refetchOnMountOrArgChange: true 
    }
  );
  
  const { 
    data: articlesData, 
    isLoading: isArticlesLoading, 
    error: articlesError, 
    refetch: refetchArticles,
    isFetching: isArticlesFetching
  } = useGetArticlesQuery({ 
    page, 
    limit,
  }, {
    skip: !!debouncedSearchTerm || !!categoryFilter || statusFilter !== 'all'
  });
  
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();
  
  const refetch = useCallback(() => {
    if (debouncedSearchTerm) {
      return;
    }
    if (categoryFilter) {
      refetchCategoryArticles();
    } else if (statusFilter !== 'all') {
      refetchStatusArticles();
    } else {
      refetchArticles();
    }
  }, [debouncedSearchTerm, categoryFilter, statusFilter, refetchCategoryArticles, refetchStatusArticles, refetchArticles]);
  
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteArticle(id).unwrap();
      notify('Article deleted successfully', 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete article', 'error');
    }
  };
  
  const handleView = (slug: string) => {
    window.open(`/ghanapolitan/article-detail/${slug}`, '_blank');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffMs = now.getTime() - articleDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = () => {
    return searchTerm || categoryFilter || statusFilter !== 'all';
  };

  const isLoading = debouncedSearchTerm 
    ? isSearching 
    : categoryFilter 
      ? isCategoryArticlesLoading 
      : statusFilter !== 'all'
        ? isStatusArticlesLoading
        : false; 
  
  const isFetching = debouncedSearchTerm 
    ? isSearchFetching 
    : categoryFilter 
      ? isCategoryArticlesFetching 
      : statusFilter !== 'all'
        ? isStatusArticlesFetching
        : isArticlesFetching;
  
  const error = debouncedSearchTerm 
    ? searchError 
    : categoryFilter 
      ? categoryArticlesError 
      : statusFilter !== 'all'
        ? statusArticlesError
        : articlesError;
  
  const displayData = debouncedSearchTerm 
    ? searchData 
    : categoryFilter 
      ? categoryArticlesData 
      : statusFilter !== 'all'
        ? statusArticlesData
        : articlesData || initialArticles; 
  
  const totalPages = displayData?.totalPages || 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {debouncedSearchTerm 
              ? 'Searching articles...' 
              : categoryFilter 
                ? `Loading ${categoryFilter} articles...`
                : statusFilter !== 'all'
                  ? `Loading ${statusFilter} articles...`
                  : 'Loading articles...'
            }
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error('API Error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {debouncedSearchTerm 
              ? 'Error searching articles' 
              : categoryFilter 
                ? `Error loading ${categoryFilter} articles`
                : statusFilter !== 'all'
                  ? `Error loading ${statusFilter} articles`
                  : 'Error loading articles'
            }
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Please try again later.'}
          </p>
          <Button
            onClick={() => {
              if (debouncedSearchTerm) {
                setSearchTerm('');
                setDebouncedSearchTerm('');
              } else {
                refetch();
              }
            }}
            className="mt-4"
          >
            {debouncedSearchTerm ? 'Clear Search' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {categoryFilter ? `${categoryFilter} Articles` : statusFilter !== 'all' ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Articles` : 'Articles'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {debouncedSearchTerm ? (
                <>
                  Search results: {displayData?.total || 0} articles found for "{debouncedSearchTerm}"
                </>
              ) : (
                <>
                  Total: {displayData?.total || 0} articles
                  {categoryFilter && ` • Category: ${categoryFilter}`}
                  {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                </>
              )}
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/ghanapolitan/create-article" passHref>
              <Button
                className="flex items-center gap-2 flex-1 md:flex-none"
              >
                <Plus size={18} />
                Create Article
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                type="text"
                placeholder="Search articles by title, description, or content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                icon={Search}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  disabled={!!debouncedSearchTerm}
                  className="pl-10 pr-3 py-2 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-neutral-800 dark:text-gray-100 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Categories</option>
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <Zap size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  disabled={!!debouncedSearchTerm || !!categoryFilter}
                  className="pl-10 pr-3 py-2 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-neutral-800 dark:text-gray-100 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Status</option>
                  <option value="breaking">Breaking News</option>
                  <option value="live">Live Articles</option>
                  <option value="headline">Headline</option>
                  <option value="topstory">Top Stories</option>
                </select>
              </div>
              
              {hasActiveFilters() && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {!debouncedSearchTerm && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge 
                variant={!categoryFilter && statusFilter === 'all' ? 'primary' : 'default'}
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => {
                  setCategoryFilter('');
                  setStatusFilter('all');
                }}
              >
                All Articles
              </Badge>
              
              <Badge 
                variant={statusFilter === 'breaking' ? 'danger' : 'default'}
                icon={Zap}
                className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => {
                  setStatusFilter('breaking');
                  setCategoryFilter('');
                }}
              >
                Breaking
              </Badge>
              
              <Badge 
                variant={statusFilter === 'live' ? 'purple' : 'default'}
                icon={Radio}
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                onClick={() => {
                  setStatusFilter('live');
                  setCategoryFilter('');
                }}
              >
                Live
              </Badge>
              
              <Badge 
                variant={statusFilter === 'headline' ? 'warning' : 'default'}
                icon={Star}
                className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                onClick={() => {
                  setStatusFilter('headline');
                  setCategoryFilter('');
                }}
              >
                Headline
              </Badge>
              
              <Badge 
                variant={statusFilter === 'topstory' ? 'success' : 'default'}
                icon={TrendingUp}
                className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                onClick={() => {
                  setStatusFilter('topstory');
                  setCategoryFilter('');
                }}
              >
                Top Stories
              </Badge>
            </div>
          )}
        </div>
        
        {isFetching && !isLoading && (
          <div className="flex justify-center mb-4">
            <ClipLoader size={20} color="#10B981" />
          </div>
        )}
        
        {displayData?.data?.articles?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Newspaper className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {debouncedSearchTerm 
                ? `No articles found for "${debouncedSearchTerm}"`
                : categoryFilter
                  ? `No articles found in ${categoryFilter} category`
                  : statusFilter !== 'all'
                    ? `No ${statusFilter} articles found`
                    : hasActiveFilters() 
                      ? 'No articles match your filters' 
                      : 'No articles yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {debouncedSearchTerm
                ? 'Try a different search term'
                : categoryFilter
                  ? 'Try selecting a different category'
                  : statusFilter !== 'all'
                    ? 'Try a different status filter'
                    : hasActiveFilters() 
                      ? 'Try adjusting your filters or search terms' 
                      : 'Create your first article to get started'
              }
            </p>
            {hasActiveFilters() ? (
              <Button
                onClick={clearFilters}
                className="flex items-center gap-2 mx-auto"
              >
                <XCircle size={18} />
                Clear Filters
              </Button>
            ) : (
              <Link href="/ghanapolitan/create-article" passHref>
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus size={18} />
                  Create Article
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-[#e0e0e0] dark:border-neutral-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Article Details</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Category & Tags</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Status & Info</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                    {displayData?.data?.articles?.map((article: Article) => (
                      <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#e0e0e0] dark:border-neutral-700">
                              {article.image_url ? (
                                <img
                                  src={article.image_url}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                  <Newspaper size={24} className="text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                                {article.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                {article.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {article.creator}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {getTimeSince(article.published_at)}
                                </span>
                                {article.section_name && (
                                  <Badge variant="secondary" size="sm">
                                    {article.section_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div>
                              <Badge variant="primary" icon={Tag}>
                                {article.category}
                              </Badge>
                            </div>
                            
                            {article.subcategory && article.subcategory.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {article.subcategory.slice(0, 3).map((subcat, index) => (
                                  <Badge key={index} variant="default" size="sm">
                                    {subcat}
                                  </Badge>
                                ))}
                                {article.subcategory.length > 3 && (
                                  <Badge variant="default" size="sm">
                                    +{article.subcategory.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {article.tags && article.tags.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <Badge 
                                      key={index}
                                      variant={index % 2 === 0 ? "info" : "secondary"}
                                      size="sm"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <Badge variant="default" size="sm">
                                      +{article.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {article.isBreaking && (
                                <Badge variant="danger" icon={Zap} size="sm" className="animate-pulse">
                                  Breaking
                                </Badge>
                              )}
                              {article.isHeadline && (
                                <Badge variant="warning" icon={Star} size="sm">
                                  Headline
                                </Badge>
                              )}
                              {article.isTopstory && (
                                <Badge variant="success" icon={TrendingUp} size="sm">
                                  Top Story
                                </Badge>
                              )}
                              {article.isLive && (
                                <Badge variant="purple" icon={Radio} size="sm">
                                  Live
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={12} />
                                Published: {formatDateTime(article.published_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                Created: {formatDate(article.createdAt)}
                              </div>
                            </div>
                            
                            <div>
                              <Badge variant="default" size="sm" className="cursor-help" title="Article ID">
                                ID: {article._id.substring(0, 8)}...
                              </Badge>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleView(article.slug)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                              title="View Article"
                            >
                              <Eye size={14} className="mr-2" />
                              View
                            </button>
                            
                            {article.isLive ? (
                              <Link href={`/ghanapolitan/edit-live-article/${article._id}`} passHref>
                                <button
                                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors border border-purple-200 dark:border-purple-800 w-full"
                                  title="Edit Live Article"
                                >
                                  <Pencil size={14} className="mr-2" />
                                  Edit Live
                                </button>
                              </Link>
                            ) : (
                              <Link href={`/ghanapolitan/edit-article/${article._id}`} passHref>
                                <button
                                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 w-full"
                                  title="Edit Article"
                                >
                                  <Pencil size={14} className="mr-2" />
                                  Edit
                                </button>
                              </Link>
                            )}
                            
                            <button
                              onClick={() => handleDelete(article._id, article.title)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50"
                              title="Delete Article"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Previous
                </Button>
                
                <Badge variant="info" size="md" className="px-4">
                  Page {page} of {totalPages}
                </Badge>
                
                <Button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}