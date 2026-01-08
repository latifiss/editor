'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  useGetArticlesBySectionSlugQuery,
  useDeleteArticleMutation,
  useRemoveArticleFromSectionMutation
} from '@/store/features/ghanapolitan/articles/articleAPI';
import { 
  useGetSectionBySlugQuery,
  useGetSectionByIdQuery
} from '@/store/features/ghanapolitan/section/sectionApi';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Pencil, Trash2, Eye, Plus, X, ArrowLeft, Calendar, User, Tag, MoveRight, Info, BarChart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badges/badge';

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
}

interface Section {
  _id: string;
  section_name: string;
  section_id: string;
  section_slug: string;
  section_description?: string;
  isSectionImportant: boolean;
  isActive: boolean;
  section_image_url?: string;
  section_color: string;
  articles_count: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function SectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isRemovingArticle, setIsRemovingArticle] = useState<string | null>(null);
  
  // Fetch section by slug
  const { 
    data: sectionData, 
    isLoading: isLoadingSection, 
    error: sectionError, 
    refetch: refetchSection 
  } = useGetSectionBySlugQuery(slug, { skip: !slug });
  
  // Fetch articles for this section
  const { 
    data: articlesData, 
    isLoading: isLoadingArticles, 
    error: articlesError, 
    refetch: refetchArticles 
  } = useGetArticlesBySectionSlugQuery(
    { sectionSlug: slug, page, limit }, 
    { skip: !slug }
  );
  
  const [deleteArticle] = useDeleteArticleMutation();
  const [removeArticleFromSection] = useRemoveArticleFromSectionMutation();
  
  const section = sectionData?.data?.section;
  const articles = articlesData?.data?.articles || [];
  const totalPages = articlesData?.totalPages || 1;
  
  const handleBack = () => {
    router.push('/ghanapolitan/sections');
  };

  const handleCreateArticle = () => {
    router.push('/ghanapolitan/create-article');
  };

  const handleEditArticle = (id: string, isLive: boolean) => {
    if (isLive) {
      router.push(`/ghanapolitan/edit-live-article/${id}`);
    } else {
      router.push(`/ghanapolitan/edit-article/${id}`);
    }
  };
  
  const handleViewArticle = (articleSlug: string) => {
    window.open(`/ghanapolitan/article-detail/${articleSlug}`, '_blank');
  };
  
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    
    try {
      await deleteArticle(id).unwrap();
      notify('Article deleted successfully', 'success');
      refetchArticles();
      if (section) {
        // Refetch section to update article count
        refetchSection();
      }
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete article', 'error');
    }
  };

  const handleRemoveFromSection = async (articleId: string, title: string) => {
    if (!confirm(`Remove "${title}" from this section? The article will remain in the system.`)) return;
    
    setIsRemovingArticle(articleId);
    try {
      await removeArticleFromSection(articleId).unwrap();
      notify('Article removed from section successfully', 'success');
      refetchArticles();
      if (section) {
        refetchSection();
      }
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to remove article from section', 'error');
    } finally {
      setIsRemovingArticle(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  if (isLoadingSection || isLoadingArticles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading section...</p>
        </div>
      </div>
    );
  }
  
  if (sectionError || articlesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error loading section</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {sectionError?.data?.message || articlesError?.data?.message || 'Please try again later.'}
          </p>
          <Button
            onClick={() => {
              refetchSection();
              refetchArticles();
            }}
            className="mt-4"
          >
            Retry
          </Button>
          <Button
            onClick={handleBack}
            variant="outline"
            className="mt-2"
          >
            Back to Sections
          </Button>
        </div>
      </div>
    );
  }
  
  if (!section) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Section not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The section you're looking for doesn't exist.</p>
          <Button
            onClick={handleBack}
            className="mt-4"
          >
            Back to Sections
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              <ArrowLeft size={18} />
              Back to Sections
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/ghanapolitan/edit-section/${section._id}`)}
                variant="outline"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                Edit Section
              </Button>
              <Button
                onClick={handleCreateArticle}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Add Article
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Section Image */}
              {section.section_image_url && (
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                    <img
                      src={section.section_image_url}
                      alt={section.section_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Section Info */}
              <div className={`flex-1 ${section.section_image_url ? 'md:w-2/3' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {section.section_name}
                    </h1>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      >
                        {section.section_id}
                      </Badge>
                      {section.isSectionImportant && (
                        <Badge
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        >
                          <Star size={12} className="mr-1" />
                          Important
                        </Badge>
                      )}
                      <Badge
                        className={section.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}
                      >
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {section.articles_count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Articles
                    </div>
                  </div>
                </div>
                
                {section.section_description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {section.section_description}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Info size={14} />
                      <span className="font-medium">Slug:</span> {section.section_slug}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span className="font-medium">Created:</span> {formatDate(section.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span className="font-medium">Updated:</span> {formatDate(section.updatedAt)}
                    </div>
                  </div>
                  
                  {section.tags && section.tags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {section.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Articles Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Articles in Section
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {articlesData?.total || 0} articles found
              </p>
            </div>
            
            {articles.length > 0 && (
              <div className="flex items-center gap-2">
                <BarChart size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </div>
          
          {articles.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No articles yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add articles to this section to get started</p>
              <Button
                onClick={handleCreateArticle}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Create Article
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-[#e0e0e0] dark:border-neutral-700">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Article</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Author</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Published</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                      {articles.map((article: Article) => (
                        <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {article.image_url && (
                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={article.image_url}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                  {article.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {article.description.substring(0, 60)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge size="sm" variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                              {article.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <User size={12} />
                              {article.creator}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {article.isBreaking && (
                                <Badge size="sm" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Breaking
                                </Badge>
                              )}
                              {article.isHeadline && (
                                <Badge size="sm" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Headline
                                </Badge>
                              )}
                              {article.isTopstory && (
                                <Badge size="sm" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Top Story
                                </Badge>
                              )}
                              {article.isLive && (
                                <Badge size="sm" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex flex-col">
                              <span>{formatDate(article.published_at)}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(article.published_at)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewArticle(article.slug)}
                                className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                title="View Article"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEditArticle(article._id, article.isLive)}
                                className="p-1.5 text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                                title="Edit Article"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveFromSection(article._id, article.title)}
                                disabled={isRemovingArticle === article._id}
                                className="p-1.5 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded disabled:opacity-50"
                                title="Remove from Section"
                              >
                                {isRemovingArticle === article._id ? (
                                  <ClipLoader size={16} color="#F97316" />
                                ) : (
                                  <MoveRight size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article._id, article.title)}
                                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Delete Article"
                              >
                                <Trash2 size={16} />
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
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Section Stats */}
        <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Section Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {section.articles_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Articles
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {articles.filter(a => a.isLive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Live Articles
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {articles.filter(a => a.isBreaking).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Breaking News
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[#e0e0e0] dark:border-neutral-800">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/ghanapolitan/edit-section/${section._id}`)}
                variant="outline"
                size="sm"
                className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                Edit Section Info
              </Button>
              <Button
                onClick={handleCreateArticle}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={16} className="mr-2" />
                Add New Article
              </Button>
              <Button
                onClick={() => router.push('/ghanapolitan/articles')}
                variant="outline"
                size="sm"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                Browse All Articles
              </Button>
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}