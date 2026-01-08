'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  useGetOpinionsQuery,
  useDeleteOpinionMutation,
  useGetFeaturedOpinionsQuery 
} from '@/store/features/ghanapolitan/opinion/opinionAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Pencil, Trash2, Eye, Plus, Search, Filter, TrendingUp } from 'lucide-react';

interface Opinion {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
}

export default function OpinionsPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { 
    data: opinionsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetOpinionsQuery({ 
    page, 
    limit, 
    search: debouncedSearch || undefined,
    category: selectedCategory || undefined
  });
  
  const {
    data: featuredOpinionsData,
    isLoading: isLoadingFeatured
  } = useGetFeaturedOpinionsQuery({ limit: 3 });
  
  const [deleteOpinion, { isLoading: isDeleting }] = useDeleteOpinionMutation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when searching
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleEdit = (id: string) => {
    router.push(`/ghanapolitan/edit-opinion/${id}`);
  };
  
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteOpinion(id).unwrap();
      notify('Opinion deleted successfully', 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete opinion', 'error');
    }
  };
  
  const handleView = (slug: string) => {
    router.push(`/ghanapolitan/opinion-detail/${slug}`);
  };
  
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPage(1);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const totalPages = opinionsData?.totalPages || 1;
  
  const opinionCategories = [
    'Politics',
    'Business',
    'Culture',
    'Education',
    'Health',
    'Technology',
    'Environment',
    'Sports',
    'Entertainment',
    'Lifestyle',
    'International',
    'Editorial',
    'Opinion'
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading opinions...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error loading opinions</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please try again later.</p>
          <Button
            onClick={() => refetch()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Opinions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {opinionsData?.total || 0} opinion pieces
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search opinions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Button
              onClick={() => router.push('/ghanapolitan/create-opinion')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Opinion
            </Button>
          </div>
        </div>
        
        {featuredOpinionsData?.data?.opinions && featuredOpinionsData.data.opinions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Featured Opinions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredOpinionsData.data.opinions.map((opinion: Opinion) => (
                <div 
                  key={opinion._id}
                  className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleView(opinion.slug)}
                >
                  {opinion.image_url && (
                    <div className="h-48 relative">
                      <img
                        src={opinion.image_url}
                        alt={opinion.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        FEATURED
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(opinion.published_at)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {opinion.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {opinion.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {opinion.creator}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${!selectedCategory ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
            >
              All Categories
            </button>
            {opinionCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedCategory === category ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {selectedCategory && (
          <div className="mb-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Showing opinions in: <span className="font-bold">{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-2 text-xs underline"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}
        
        {opinionsData?.data?.opinions?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No opinions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedCategory ? 'Try a different search or filter' : 'Create your first opinion to get started'}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                router.push('/ghanapolitan/create-opinion');
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Create Opinion
            </Button>
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
                    {opinionsData?.data?.opinions?.map((opinion: Opinion) => (
                      <tr key={opinion._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {opinion.image_url && (
                              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={opinion.image_url}
                                  alt={opinion.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                {opinion.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {opinion.description.substring(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {opinion.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {opinion.creator}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(opinion.published_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(opinion.slug)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            {admin && (
                              <>
                                <button
                                  onClick={() => handleEdit(opinion._id)}
                                  className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(opinion._id, opinion.title)}
                                  disabled={isDeleting}
                                  className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {page} of {totalPages} • {opinionsData?.total || 0} total opinions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${page === pageNum ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}