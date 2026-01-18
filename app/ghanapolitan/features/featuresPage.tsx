'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  useGetGhanapolitanFeaturesQuery,
  useDeleteGhanapolitanFeatureMutation,
  useSearchGhanapolitanFeaturesQuery
} from '@/store/features/ghanapolitan/feature/featureAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Pencil, Trash2, Eye, Plus, Search, XCircle, Calendar, User, Tag } from 'lucide-react';
import debounce from 'lodash/debounce';
import { SearchInput } from '@/components/ui/inputs/searchInput';

interface Feature {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  tags?: string[];
  subcategory?: string[];
}

interface FeaturesPageProps {
  initialFeatures?: any;
}

export default function FeaturesPage({ initialFeatures }: FeaturesPageProps) {
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
  } = useSearchGhanapolitanFeaturesQuery(
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
    data: featuresData, 
    isLoading: isFeaturesLoading, 
    error: featuresError, 
    refetch: refetchFeatures,
    isFetching: isFeaturesFetching
  } = useGetGhanapolitanFeaturesQuery({ page, limit }, {
    skip: !!debouncedSearchTerm
  });
  
  const [deleteFeature, { isLoading: isDeleting }] = useDeleteGhanapolitanFeatureMutation();
  
  const handleEdit = (id: string) => {
    router.push(`/ghanapolitan/edit-feature/${id}`);
  };
  
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteFeature(id).unwrap();
      notify('Feature deleted successfully', 'success');
      refetchFeatures();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete feature', 'error');
    }
  };
  
  const handleView = (slug: string) => {
    window.open(`/ghanapolitan/feature-detail/${slug}`, '_blank');
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
  
  const isLoading = debouncedSearchTerm ? isSearching : false;
  const isFetching = debouncedSearchTerm ? isSearchFetching : isFeaturesFetching;
  const error = debouncedSearchTerm ? searchError : featuresError;
  const displayData = debouncedSearchTerm ? searchData : featuresData || initialFeatures;
  const totalPages = displayData?.totalPages || 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {debouncedSearchTerm ? 'Searching features...' : 'Loading features...'}
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
            {debouncedSearchTerm ? 'Error searching features' : 'Error loading features'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Please try again later.'}
          </p>
          <Button
            onClick={() => debouncedSearchTerm ? clearSearch() : refetchFeatures()}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Features</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {debouncedSearchTerm ? (
                <>
                  Search results: {displayData?.total || 0} features found for "{debouncedSearchTerm}"
                </>
              ) : (
                <>Total: {displayData?.total || 0} features</>
              )}
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/ghanapolitan/create-feature')}
            className="flex items-center gap-2 flex-1 md:flex-none"
          >
            <Plus size={18} />
            Create Feature
          </Button>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                type="text"
                placeholder="Search features by title, description, or content..."
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
        
        {displayData?.data?.features?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {debouncedSearchTerm 
                ? `No features found for "${debouncedSearchTerm}"`
                : 'No features yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {debouncedSearchTerm
                ? 'Try a different search term'
                : 'Create your first feature to get started'
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
                onClick={() => router.push('/ghanapolitan/create-feature')}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Create Feature
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
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Feature Details</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Category & Tags</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Information</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                    {displayData?.data?.features?.map((feature: Feature) => (
                      <tr key={feature._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#e0e0e0] dark:border-neutral-700">
                              {feature.image_url ? (
                                <img
                                  src={feature.image_url}
                                  alt={feature.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                                {feature.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                {feature.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {feature.creator}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDate(feature.published_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <Tag size={12} className="mr-1" />
                                {feature.category}
                              </span>
                            </div>
                            
                            {feature.subcategory && feature.subcategory.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {feature.subcategory.slice(0, 3).map((subcat, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                  >
                                    {subcat}
                                  </span>
                                ))}
                                {feature.subcategory.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                    +{feature.subcategory.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {feature.tags && feature.tags.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {feature.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {feature.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                      +{feature.tags.length - 3}
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
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar size={12} />
                                Published: {formatDateTime(feature.published_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                Created: {formatDate(feature.createdAt)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                ID: {feature._id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleView(feature.slug)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                              title="View Feature"
                            >
                              <Eye size={14} className="mr-2" />
                              View
                            </button>
                            
                            <button
                              onClick={() => handleEdit(feature._id)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                              title="Edit Feature"
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(feature._id, feature.title)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50"
                              title="Delete Feature"
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