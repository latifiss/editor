'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  useGetGraphicsQuery,
  useDeleteGraphicMutation,
  useSearchGraphicsQuery
} from '@/store/features/ghanapolitan/graphic/graphicAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Pencil, Trash2, Eye, Plus, Search, XCircle, Calendar, User, Tag, Image as ImageIcon } from 'lucide-react';
import debounce from 'lodash/debounce';
import { SearchInput } from '@/components/ui/inputs/searchInput';

interface Graphic {
  _id: string;
  title: string;
  description: string;
  content: string;
  content_images: Array<{
    url: string;
    caption?: string;
    alt_text?: string;
    order: number;
  }>;
  category: string;
  creator: string;
  slug: string;
  featured_image_url?: string;
  published_at: string;
  createdAt: string;
  tags?: string[];
  subcategory?: string[];
  meta_title?: string;
  meta_description?: string;
}

interface GraphicsPageProps {
  initialGraphics?: any;
}

export default function GraphicsPage({ initialGraphics }: GraphicsPageProps) {
  const router = useRouter();
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
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
  } = useSearchGraphicsQuery(
    debouncedSearchTerm ? { 
      query: debouncedSearchTerm, 
      page, 
      limit 
    } : { query: '', page: 1, limit: 0 },
    { 
      skip: !debouncedSearchTerm,
      refetchOnMountOrArgChange: true 
    }
  );
  
  const { 
    data: graphicsData, 
    isLoading: isGraphicsLoading, 
    error: graphicsError, 
    refetch: refetchGraphics,
    isFetching: isGraphicsFetching
  } = useGetGraphicsQuery({ page, limit }, {
    skip: !!debouncedSearchTerm
  });
  
  const [deleteGraphic, { isLoading: isDeleting }] = useDeleteGraphicMutation();
  
  const handleEdit = (id: string) => {
    router.push(`/ghanapolitan/edit-graphic/${id}`);
  };
  
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all associated images.`)) return;
    
    try {
      await deleteGraphic(id).unwrap();
      notify('Graphic deleted successfully', 'success');
      refetchGraphics();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete graphic', 'error');
    }
  };
  
  const handleView = (slug: string) => {
    window.open(`/ghanapolitan/graphic-detail/${slug}`, '_blank');
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

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setPage(1);
  };

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  const getPreviewText = (content: string, maxLength: number = 100) => {
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };
  
  const isLoading = debouncedSearchTerm ? isSearching : false;
  const isFetching = debouncedSearchTerm ? isSearchFetching : isGraphicsFetching;
  const error = debouncedSearchTerm ? searchError : graphicsError;
  const displayData = debouncedSearchTerm ? searchData : graphicsData || initialGraphics;
  const totalPages = displayData?.totalPages || 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {debouncedSearchTerm ? 'Searching graphics...' : 'Loading graphics...'}
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {debouncedSearchTerm ? 'Error searching graphics' : 'Error loading graphics'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Please try again later.'}
          </p>
          <Button
            onClick={() => debouncedSearchTerm ? clearSearch() : refetchGraphics()}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Graphics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {debouncedSearchTerm ? (
                <>
                  Search results: {displayData?.total || 0} graphics found for "{debouncedSearchTerm}"
                </>
              ) : (
                <>Total: {displayData?.total || 0} graphics</>
              )}
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/ghanapolitan/create-graphic')}
            className="flex items-center gap-2 flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Plus size={18} />
            Create Graphic
          </Button>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                type="text"
                placeholder="Search graphics by title, description, or content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                icon={Search}
              />
            </div>
            
            {debouncedSearchTerm && (
              <Button
                onClick={clearSearch}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <XCircle size={16} />
                Clear Search
              </Button>
            )}
          </div>
        </div>

        {isFetching && !isLoading && (
          <div className="flex justify-center mb-4">
            <ClipLoader size={20} color="#10B981" />
          </div>
        )}
        
        {displayData?.data?.graphics?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {debouncedSearchTerm 
                ? `No graphics found for "${debouncedSearchTerm}"`
                : 'No graphics yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {debouncedSearchTerm
                ? 'Try a different search term'
                : 'Create your first graphic to get started'
              }
            </p>
            {debouncedSearchTerm ? (
              <Button
                onClick={clearSearch}
                className="flex items-center gap-2 mx-auto"
              >
                <XCircle size={18} />
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/ghanapolitan/create-graphic')}
                className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus size={18} />
                Create Graphic
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-[#e0e0e0] dark:border-neutral-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Graphic Details</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Category & Tags</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Content Info</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                    {displayData?.data?.graphics?.map((graphic: Graphic) => (
                      <tr key={graphic._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#e0e0e0] dark:border-neutral-700">
                              {graphic.featured_image_url ? (
                                <img
                                  src={graphic.featured_image_url}
                                  alt={graphic.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : graphic.content_images && graphic.content_images.length > 0 ? (
                                <img
                                  src={graphic.content_images[0].url}
                                  alt={graphic.content_images[0].alt_text || graphic.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                                {graphic.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                {graphic.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {graphic.creator}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDate(graphic.published_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Tag size={12} className="mr-1" />
                                {graphic.category}
                              </span>
                            </div>
                            
                            {graphic.subcategory && graphic.subcategory.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {graphic.subcategory.slice(0, 3).map((subcat, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                  >
                                    {subcat}
                                  </span>
                                ))}
                                {graphic.subcategory.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                    +{graphic.subcategory.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {graphic.tags && graphic.tags.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {graphic.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {graphic.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                      +{graphic.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="mb-1">
                                <div className="font-medium">Content Preview:</div>
                                <div className="line-clamp-2 text-gray-600 dark:text-gray-300">
                                  {getPreviewText(graphic.content)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <ImageIcon size={12} />
                                  <span>
                                    {graphic.content_images?.length || 0} image(s)
                                  </span>
                                </div>
                                {graphic.featured_image_url && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                ID: {graphic._id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleView(graphic.slug)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                              title="View Graphic"
                            >
                              <Eye size={14} className="mr-2" />
                              View
                            </button>
                            
                            <button
                              onClick={() => handleEdit(graphic._id)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                              title="Edit Graphic"
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(graphic._id, graphic.title)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50"
                              title="Delete Graphic"
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
                
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Page {page} of {totalPages}
                </span>
                
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