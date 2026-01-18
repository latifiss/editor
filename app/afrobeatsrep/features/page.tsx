'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  useGetFeaturesQuery,
  useDeleteFeatureMutation,
  useSearchFeaturesQuery,
} from '@/store/features/afrobeatsrep/feature/featureAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Pencil, Trash2, Eye, Plus, Search, XCircle, Filter } from 'lucide-react';
import debounce from 'lodash/debounce';
import { SearchInput } from '@/components/ui/inputs/searchInput';

interface Feature {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  image_url?: string;
  slug: string;
  published_at: string;
  createdAt: string;
}

export default function FeaturesPage() {
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
  } = useSearchFeaturesQuery(
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
  } = useGetFeaturesQuery({ page, limit }, {
    skip: !!debouncedSearchTerm
  });

  const [deleteFeature, { isLoading: isDeleting }] = useDeleteFeatureMutation();

  const handleEdit = (id: string) => {
    router.push(`/afrobeatsrep/edit-feature/${id}`);
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
    window.open(`/afrobeatsrep/feature-detail/${slug}`, '_blank');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setPage(1);
  };

  const isLoading = debouncedSearchTerm ? isSearching : isFeaturesLoading;
  const isFetching = debouncedSearchTerm ? isSearchFetching : isFeaturesFetching;
  const error = debouncedSearchTerm ? searchError : featuresError;
  const displayData = debouncedSearchTerm ? searchData : featuresData;
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
            onClick={() => router.push('/afrobeatsrep/create-feature')} 
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
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
                onClick={() => router.push('/afrobeatsrep/create-feature')} 
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
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Author</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Published</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                    {displayData?.data?.features?.map((feature: Feature) => (
                      <tr key={feature._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {feature.image_url && (
                              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                <img src={feature.image_url} alt={feature.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                {feature.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {feature.description.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {feature.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{feature.creator}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(feature.published_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(feature.slug)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(feature._id)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(feature._id, feature.title)}
                              disabled={isDeleting}
                              className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                              title="Delete"
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
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
      <NotificationContainer position="bottom" />
    </div>
  );
}