'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetGraphicBySlugQuery } from '@/store/features/ghanapolitan/graphic/graphicAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, MapPin, Building2, Bookmark, Share2, Clock } from 'lucide-react';

interface Graphic {
  _id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  subcategory: string[];
  tags: string[];
  creator: string;
  image_url?: string;
  created_at: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GhanapolitanGraphicDetailPageProps {
  initialGraphic?: Graphic;
}

export default function GhanapolitanGraphicDetailPage({ initialGraphic }: GhanapolitanGraphicDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const { notify } = useNotify();
  const slug = params.slug as string;
  
  const { 
    data: graphicData, 
    isLoading, 
    error 
  } = useGetGraphicBySlugQuery(slug);
  
  const [graphic, setGraphic] = useState<Graphic | null>(initialGraphic || null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    if (graphicData?.data) {
      setGraphic(graphicData.data);
      
      const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_graphic_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(graphicData.data._id));
    }
  }, [graphicData]);
  
  const handleBookmark = () => {
    if (!graphic) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_graphic_bookmarks') || '[]');
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== graphic._id);
      localStorage.setItem('ghanapolitan_graphic_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      notify('Graphic removed from bookmarks', 'info');
    } else {
      bookmarks.push(graphic._id);
      localStorage.setItem('ghanapolitan_graphic_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      notify('Graphic bookmarked', 'success');
    }
  };
  
  const handleShare = async () => {
    if (navigator.share && graphic) {
      try {
        await navigator.share({
          title: graphic.title,
          text: graphic.description,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        notify('Link copied to clipboard', 'info');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify('Link copied to clipboard', 'info');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const parseContent = (content: any) => {
    if (typeof content === 'string') {
      return { __html: content };
    }
    return { __html: '' };
  };
  
  if (isLoading && !graphic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#059669" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading graphic...</p>
        </div>
      </div>
    );
  }
  
  if (error || !graphic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">Graphic not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">This graphic is currently unavailable.</p>
          <Button
            onClick={() => router.push('/ghanapolitan')}
            className="mt-4 bg-emerald-700 hover:bg-emerald-800"
          >
            Back to Ghanapolitan
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mb-6 flex items-center gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              <ChevronLeft size={18} />
              Back
            </Button>
            
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    INFOGRAPHIC
                  </span>
                  
                  {graphic.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <MapPin size={12} />
                      {graphic.category}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {graphic.title}
                </h1>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {graphic.description}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(graphic.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-medium">{graphic.creator}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBookmark}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isBookmarked ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
              
              {graphic.image_url && (
                <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-lg">
                  <Image
                    src={graphic.image_url}
                    alt={graphic.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              {graphic.subcategory && graphic.subcategory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Building2 size={14} />
                    <span>Subcategories:</span>
                  </div>
                  {graphic.subcategory.map((sub, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
              
              {graphic.tags && graphic.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Tag size={14} />
                    <span>Tags:</span>
                  </div>
                  {graphic.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="ghanapolitan-content"
                  dangerouslySetInnerHTML={parseContent(graphic.content)}
                />
              </div>
              
              <div className="pt-8 border-t border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Graphic ID: {graphic._id}
                  </div>
                  
                  <Button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  >
                    Back to Top
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  About the Creator
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <User size={24} className="text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{graphic.creator}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Graphics Designer</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {graphic.creator} creates infographics and visual content for Ghanapolitan.
                </p>
              </div>
              
              {graphic.category && (
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    <MapPin className="inline mr-2" size={18} />
                    Category Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This graphic is in the {graphic.category} category.
                  </p>
                  <Button
                    onClick={() => router.push(`/ghanapolitan?category=${graphic.category}`)}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    More from {graphic.category}
                  </Button>
                </div>
              )}
              
              {graphic.tags && graphic.tags.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Related Tags
                  </h3>
                  <div className="space-y-2">
                    {graphic.tags.slice(0, 5).map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => router.push(`/ghanapolitan?tag=${tag}`)}
                        className="block w-full text-left px-3 py-2 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Graphic Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="font-medium">{formatDate(graphic.created_at)}</span>
                  </div>
                  {graphic.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Published:</span>
                      <span className="font-medium">{formatDate(graphic.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  More Graphics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Explore more infographics and visual content from Ghanapolitan.
                </p>
                <Button
                  onClick={() => router.push('/ghanapolitan/graphics')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Browse All Graphics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .ghanapolitan-content {
          line-height: 1.8;
          font-size: 1.125rem;
          color: #374151;
        }
        
        .dark .ghanapolitan-content {
          color: #d1d5db;
        }
        
        .ghanapolitan-content p {
          margin-bottom: 1.5rem;
        }
        
        .ghanapolitan-content h1,
        .ghanapolitan-content h2,
        .ghanapolitan-content h3,
        .ghanapolitan-content h4,
        .ghanapolitan-content h5,
        .ghanapolitan-content h6 {
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #065f46;
        }
        
        .dark .ghanapolitan-content h1,
        .dark .ghanapolitan-content h2,
        .dark .ghanapolitan-content h3,
        .dark .ghanapolitan-content h4,
        .dark .ghanapolitan-content h5,
        .dark .ghanapolitan-content h6 {
          color: #10b981;
        }
        
        .ghanapolitan-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2.5rem 0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .ghanapolitan-content a {
          color: #059669;
          text-decoration: underline;
          font-weight: 500;
        }
        
        .dark .ghanapolitan-content a {
          color: #34d399;
        }
        
        .ghanapolitan-content blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          font-style: italic;
          color: #047857;
          background-color: #f0fdfa;
          padding: 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .dark .ghanapolitan-content blockquote {
          border-left-color: #34d399;
          color: #a7f3d0;
          background-color: #064e3b;
        }
        
        .ghanapolitan-content ul,
        .ghanapolitan-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .ghanapolitan-content li {
          margin-bottom: 0.75rem;
        }
        
        .ghanapolitan-content pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.95rem;
        }
        
        .ghanapolitan-content code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 0.9em;
          color: #0f172a;
        }
        
        .dark .ghanapolitan-content code {
          background-color: #334155;
          color: #cbd5e1;
        }
      `}</style>
      
      <NotificationContainer position="bottom" />
    </div>
  );
}
