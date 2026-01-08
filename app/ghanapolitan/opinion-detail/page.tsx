'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetOpinionBySlugQuery } from '@/store/features/ghanapolitan/opinion/opinionAPI';
import { useGetSimilarOpinionsQuery } from '@/store/features/ghanapolitan/opinion/opinionAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, MessageSquare, Share2, Bookmark } from 'lucide-react';

interface Opinion {
  _id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SimilarOpinion {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
}

export default function OpinionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { notify } = useNotify();
  const slug = params.slug as string;
  
  const { 
    data: opinionData, 
    isLoading, 
    error 
  } = useGetOpinionBySlugQuery(slug);
  
  const {
    data: similarOpinionsData,
    isLoading: isLoadingSimilar
  } = useGetSimilarOpinionsQuery({ slug, limit: 3 });
  
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [similarOpinions, setSimilarOpinions] = useState<SimilarOpinion[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    if (opinionData?.data) {
      setOpinion(opinionData.data);
      // Check if opinion is bookmarked in localStorage
      const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(opinionData.data._id));
    }
  }, [opinionData]);
  
  useEffect(() => {
    if (similarOpinionsData?.data?.opinions) {
      setSimilarOpinions(similarOpinionsData.data.opinions);
    }
  }, [similarOpinionsData]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
  
  const handleBookmark = () => {
    if (!opinion) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_bookmarks') || '[]');
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== opinion._id);
      localStorage.setItem('ghanapolitan_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      notify('Removed from bookmarks', 'success');
    } else {
      bookmarks.push(opinion._id);
      localStorage.setItem('ghanapolitan_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      notify('Added to bookmarks', 'success');
    }
  };
  
  const handleShare = async () => {
    if (navigator.share && opinion) {
      try {
        await navigator.share({
          title: opinion.title,
          text: opinion.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify('Link copied to clipboard', 'success');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading opinion...</p>
        </div>
      </div>
    );
  }
  
  if (error || !opinion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Opinion not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The opinion you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/ghanapolitan')}
            className="mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    OPINION
                  </span>
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {opinion.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {opinion.title}
                </h1>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {opinion.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(opinion.published_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span className="font-medium">{opinion.creator}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="font-medium">Opinion</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isBookmarked ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
              
              {opinion.image_url && (
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src={opinion.image_url}
                    alt={opinion.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              {opinion.tags && opinion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {opinion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <Tag size={14} className="mr-1" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="opinion-content"
                  dangerouslySetInnerHTML={parseContent(opinion.content)}
                />
              </div>
              
              <div className="pt-8 border-t border-[#e0e0e0] dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Opinion ID: {opinion._id}
                  </div>
                  
                  <Button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    variant="outline"
                    size="sm"
                  >
                    Back to Top
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  About the Author
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User size={24} className="text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{opinion.creator}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Opinion Writer</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {opinion.creator} is a contributor to Ghanapolitan, providing insights and perspectives on current affairs.
                </p>
              </div>
              
              {similarOpinions.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Similar Opinions
                  </h3>
                  <div className="space-y-4">
                    {similarOpinions.map((similar) => (
                      <div 
                        key={similar._id}
                        className="p-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => router.push(`/ghanapolitan/opinion-detail/${similar.slug}`)}
                      >
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">
                          {similar.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{similar.creator}</span>
                          <span>{new Date(similar.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {opinionCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => router.push(`/ghanapolitan/opinions?category=${cat}`)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm ${opinion.category === cat ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .opinion-content {
          line-height: 1.8;
          font-size: 1.125rem;
          color: #374151;
        }
        
        .dark .opinion-content {
          color: #d1d5db;
        }
        
        .opinion-content p {
          margin-bottom: 1.5rem;
        }
        
        .opinion-content h1,
        .opinion-content h2,
        .opinion-content h3,
        .opinion-content h4,
        .opinion-content h5,
        .opinion-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #111827;
        }
        
        .dark .opinion-content h1,
        .dark .opinion-content h2,
        .dark .opinion-content h3,
        .dark .opinion-content h4,
        .dark .opinion-content h5,
        .dark .opinion-content h6 {
          color: #f3f4f6;
        }
        
        .opinion-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .opinion-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .dark .opinion-content a {
          color: #60a5fa;
        }
        
        .opinion-content blockquote {
          border-left: 4px solid #f59e0b;
          padding-left: 1rem;
          margin: 2rem 0;
          font-style: italic;
          background-color: #fffbeb;
          padding: 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .dark .opinion-content blockquote {
          border-left-color: #fbbf24;
          background-color: #451a03;
        }
        
        .opinion-content ul,
        .opinion-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .opinion-content li {
          margin-bottom: 0.5rem;
        }
        
        .opinion-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .dark .opinion-content pre {
          background-color: #1f2937;
        }
        
        .opinion-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .dark .opinion-content code {
          background-color: #1f2937;
        }
      `}</style>
      
      <NotificationContainer position="bottom" />
    </div>
  );
}