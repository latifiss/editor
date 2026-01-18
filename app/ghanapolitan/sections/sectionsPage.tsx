'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  useGetSectionsQuery,
  useDeleteSectionMutation,
  useToggleActiveStatusMutation,
  useToggleImportanceMutation
} from '@/store/features/ghanapolitan/section/sectionApi';
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
  Star, 
  CheckCircle, 
  XCircle, 
  MoveUp, 
  MoveDown,
  Tag,
  Calendar,
  Hash,
  Clock,
  Users,
  Image as ImageIcon,
  Layers,
  BookOpen,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { SearchInput } from '@/components/ui/inputs/searchInput';

const SectionBadge = ({ 
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

interface Section {
  _id: string;
  section_name: string;
  section_code: string;
  section_slug: string;
  section_description?: string;
  isSectionImportant: boolean;
  isActive: boolean;
  displayOrder: number;
  section_image_url?: string;
  section_color: string;
  section_background_color?: string;
  articles_count: number;
  tags: string[];
  category?: string;
  subcategory: string[];
  featured_articles: string[];
  expires_at?: string | null;
  createdBy: string;
  updatedBy?: string;
  meta_title?: string;
  meta_description?: string;
  createdAt: string;
  updatedAt: string;
}

interface SectionsPageProps {
  initialSections?: any;
}

export default function SectionsPage({ initialSections }: SectionsPageProps) {
  const router = useRouter();
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [importantFilter, setImportantFilter] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: sectionsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetSectionsQuery({ 
    page, 
    limit, 
    isActive: activeFilter,
    isSectionImportant: importantFilter,
    search: searchTerm || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc'
  });
  
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();
  const [toggleActive] = useToggleActiveStatusMutation();
  const [toggleImportance] = useToggleImportanceMutation();
  
  const handleCreateSection = () => {
    router.push('/ghanapolitan/create-section');
  };

  const handleEditSection = (id: string) => {
    router.push(`/ghanapolitan/edit-section/${id}`);
  };
  
  const handleViewSection = (slug: string) => {
    router.push(`/ghanapolitan/section-detail/${slug}`);
  };
  
  const handleDeleteSection = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all articles from this section.`)) return;
    
    try {
      await deleteSection(id).unwrap();
      notify('Section deleted successfully', 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to delete section', 'error');
    }
  };

  const handleToggleActive = async (id: string, isCurrentlyActive: boolean, name: string) => {
    try {
      await toggleActive({ id }).unwrap();
      notify(`Section ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully`, 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to update section status', 'error');
    }
  };

  const handleToggleImportance = async (id: string, isCurrentlyImportant: boolean, name: string) => {
    try {
      await toggleImportance({ id }).unwrap();
      notify(`Section marked as ${!isCurrentlyImportant ? 'important' : 'normal'} successfully`, 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to update section importance', 'error');
    }
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    notify('Order update feature coming soon', 'info');
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
  
  const isExpiringSoon = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };
  
  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };
  
  const displayData = sectionsData || initialSections;
  const totalPages = displayData?.totalPages || 1;
  
  const clearFilters = () => {
    setActiveFilter(undefined);
    setImportantFilter(undefined);
    setSearchTerm('');
  };
  
  if (isLoading && !initialSections) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sections...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error loading sections</h2>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sections</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {displayData?.total || 0} sections
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={handleCreateSection}
              className="flex items-center gap-2 flex-1 md:flex-none"
            >
              <Plus size={18} />
              Create Section
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                type="text"
                placeholder="Search sections by name, code, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={activeFilter === undefined ? '' : activeFilter.toString()}
                onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="px-3 py-2 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-neutral-800 dark:text-gray-100"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              
              <select
                value={importantFilter === undefined ? '' : importantFilter.toString()}
                onChange={(e) => setImportantFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="px-3 py-2 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-neutral-800 dark:text-gray-100"
              >
                <option value="">All Importance</option>
                <option value="true">Important</option>
                <option value="false">Normal</option>
              </select>
              
              {(activeFilter !== undefined || importantFilter !== undefined || searchTerm) && (
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
        </div>
        
        {displayData?.data?.sections?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sections found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters or create a new section</p>
            <Button
              onClick={handleCreateSection}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Create Section
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-[#e0e0e0] dark:border-neutral-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Section Details</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Info</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0] dark:divide-neutral-800">
                    {displayData?.data?.sections?.map((section: Section) => (
                      <tr key={section._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${!section.section_image_url ? 'border' : ''}`}
                                 style={{ 
                                   backgroundColor: section.section_background_color || section.section_color || '#f3f4f6',
                                   borderColor: section.section_color || '#e5e7eb'
                                 }}>
                              {section.section_image_url ? (
                                <img
                                  src={section.section_image_url}
                                  alt={section.section_name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon size={20} className="text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                                  {section.section_name}
                                </h3>
                                {section.isSectionImportant && (
                                  <SectionBadge 
                                    variant="warning" 
                                    size="sm"
                                    icon={Star}
                                    className="animate-pulse"
                                  >
                                    Important
                                  </SectionBadge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                {section.section_description || 'No description'}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <SectionBadge 
                                  variant="primary" 
                                  size="sm"
                                  icon={Hash}
                                >
                                  {section.section_code}
                                </SectionBadge>
                                
                                <SectionBadge 
                                  variant="secondary" 
                                  size="sm"
                                >
                                  /{section.section_slug}
                                </SectionBadge>
                                
                                {section.category && (
                                  <SectionBadge 
                                    variant="purple" 
                                    size="sm"
                                    icon={Layers}
                                  >
                                    {section.category}
                                  </SectionBadge>
                                )}
                                
                                {section.subcategory.length > 0 && (
                                  <SectionBadge 
                                    variant="indigo" 
                                    size="sm"
                                    className="cursor-help"
                                    title={`Subcategories: ${section.subcategory.join(', ')}`}
                                  >
                                    <Layers size={12} />
                                    +{section.subcategory.length}
                                  </SectionBadge>
                                )}
                                
                                {section.featured_articles.length > 0 && (
                                  <SectionBadge 
                                    variant="success" 
                                    size="sm"
                                    icon={TrendingUp}
                                  >
                                    {section.featured_articles.length} featured
                                  </SectionBadge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <SectionBadge 
                                variant="info" 
                                size="sm"
                                icon={BookOpen}
                              >
                                {section.articles_count} articles
                              </SectionBadge>
                            </div>
                            
                            {section.tags.length > 0 && (
                              <div>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {section.tags.slice(0, 3).map((tag, index) => (
                                    <SectionBadge 
                                      key={index}
                                      variant={index % 2 === 0 ? "default" : "secondary"}
                                      size="sm"
                                      icon={Tag}
                                    >
                                      {tag}
                                    </SectionBadge>
                                  ))}
                                  {section.tags.length > 3 && (
                                    <SectionBadge 
                                      variant="default"
                                      size="sm"
                                    >
                                      +{section.tags.length - 3}
                                    </SectionBadge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <SectionBadge 
                                variant="default" 
                                size="sm"
                                icon={Calendar}
                              >
                                {formatDate(section.createdAt)}
                              </SectionBadge>
                            </div>
                            
                            {section.expires_at && (
                              <div className="mt-1">
                                {isExpired(section.expires_at) ? (
                                  <SectionBadge 
                                    variant="danger" 
                                    size="sm"
                                    icon={AlertCircle}
                                  >
                                    Expired: {formatDate(section.expires_at)}
                                  </SectionBadge>
                                ) : isExpiringSoon(section.expires_at) ? (
                                  <SectionBadge 
                                    variant="warning" 
                                    size="sm"
                                    icon={Clock}
                                    className="animate-pulse"
                                  >
                                    Expires: {formatDate(section.expires_at)}
                                  </SectionBadge>
                                ) : (
                                  <SectionBadge 
                                    variant="success" 
                                    size="sm"
                                    icon={Clock}
                                  >
                                    Expires: {formatDate(section.expires_at)}
                                  </SectionBadge>
                                )}
                              </div>
                            )}
                            
                            {section.createdBy && (
                              <div className="mt-1">
                                <SectionBadge 
                                  variant="default" 
                                  size="sm"
                                  icon={Users}
                                >
                                  By: {section.createdBy}
                                </SectionBadge>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div>
                              <button
                                onClick={() => handleToggleActive(section._id, section.isActive, section.section_name)}
                                disabled={toggleActive.isLoading}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${section.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 border border-emerald-200 dark:border-emerald-700' : 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600 border border-gray-200 dark:border-neutral-600'} disabled:opacity-50 w-full justify-center`}
                                title={section.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                              >
                                {section.isActive ? (
                                  <>
                                    <CheckCircle size={14} className="mr-2" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} className="mr-2" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </div>
                            
                            <div>
                              <button
                                onClick={() => handleToggleImportance(section._id, section.isSectionImportant, section.section_name)}
                                disabled={toggleImportance.isLoading}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${section.isSectionImportant ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 border border-amber-200 dark:border-amber-700' : 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600 border border-gray-200 dark:border-neutral-600'} disabled:opacity-50 w-full justify-center`}
                                title={section.isSectionImportant ? 'Important - Click to remove' : 'Mark as important'}
                              >
                                <Star size={14} className="mr-2" />
                                {section.isSectionImportant ? 'Important' : 'Normal'}
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-center gap-1 pt-1">
                              <SectionBadge 
                                variant="primary" 
                                size="sm"
                                className="px-4"
                              >
                                Order: #{section.displayOrder}
                              </SectionBadge>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleMoveOrder(section._id, 'up')}
                                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                  title="Move up"
                                >
                                  <MoveUp size={14} />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(section._id, 'down')}
                                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                  title="Move down"
                                >
                                  <MoveDown size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleViewSection(section.section_slug)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                              title="View Section"
                            >
                              <Eye size={14} className="mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditSection(section._id)}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                              title="Edit Section"
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section._id, section.section_name)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50"
                              title="Delete Section"
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
                
                <SectionBadge variant="info" size="md" className="px-4">
                  Page {page} of {totalPages}
                </SectionBadge>
                
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