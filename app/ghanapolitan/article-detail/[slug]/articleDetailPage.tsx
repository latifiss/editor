'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetArticleBySlugQuery, useGetSimilarArticlesQuery } from '@/store/features/ghanapolitan/articles/articleAPI';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, Clock, AlertCircle, Share2, Bookmark, MessageSquare } from 'lucide-react';
import { LiveArticleContent } from '@/store/features/ghanapolitan/articles/articleTypes';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: string | LiveArticleContent[];
  category: string;
  subcategory: string[];
  tags: string[];
  source_name?: string;
  section_id?: string;
  section_name?: string;
  isLive: boolean;
  wasLive: boolean;
  isBreaking: boolean;
  isTopstory: boolean;
  isHeadline: boolean;
  creator: string;
  slug: string;
  image_url?: string;
  published_at: string;
  createdAt: string;
  updatedAt: string;
  comments?: any[];
}

interface ArticleDetailPageProps {
  initialArticle?: Article;
  initialSimilarArticles?: Article[];
}

const categories = [
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

export default function ArticleDetailPage({ 
  initialArticle, 
  initialSimilarArticles 
}: ArticleDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const {
    data: articleData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useGetArticleBySlugQuery(slug, {
    skip: !slug,
    refetchOnMountOrArgChange: true
  });

  const {
    data: similarArticlesData,
    isLoading: isLoadingSimilar
  } = useGetSimilarArticlesQuery({ slug }, {
    skip: !slug
  });

  const [article, setArticle] = useState<Article | null>(initialArticle || null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>(initialSimilarArticles || []);
  const [hasError, setHasError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLiveUpdates, setShowLiveUpdates] = useState(true);

  useEffect(() => {
    if (articleData?.data) {
      setArticle(articleData.data);
      setHasError(false);
      
      const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(articleData.data._id));
    } else if (error) {
      setHasError(true);
    }
  }, [articleData, error]);

  useEffect(() => {
    if (similarArticlesData?.data?.articles) {
      setSimilarArticles(similarArticlesData.data.articles);
    }
  }, [similarArticlesData]);

  const handleBookmark = () => {
    if (!article) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('ghanapolitan_bookmarks') || '[]');
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== article._id);
      localStorage.setItem('ghanapolitan_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(article._id);
      localStorage.setItem('ghanapolitan_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Only show loading if no initial SSR data and still loading
  if ((isLoading || isFetching) && !article && !hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#059669" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (hasError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Failed to Load Article
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Please check your network connection'}
          </p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => refetch()} className="bg-emerald-600 hover:bg-emerald-700">
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/ghanapolitan')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!slug || (!isLoading && !article)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The article you're looking for doesn't exist or the slug is invalid.
          </p>
          <Button
            onClick={() => router.push('/ghanapolitan')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
          >
            Back to Ghanapolitan
          </Button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} color="#059669" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const parseContent = (content: any) => {
    if (!content) {
      return { __html: '' };
    }

    if (typeof content === 'string') {
      return { __html: content };
    }
    return { __html: '' };
  };

  const isLiveContent = (content: any): content is LiveArticleContent[] => {
    return Array.isArray(content) && content.length > 0 && content[0].content_title !== undefined;
  };

  const renderLiveArticleContent = () => {
    if (!isLiveContent(article.content)) {
      return null;
    }

    const liveUpdates = article.content as LiveArticleContent[];
    const keyEvents = liveUpdates.filter(update => update.isKey);

    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Clock className="text-red-500" />
            Live Coverage
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveUpdates(!showLiveUpdates)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              {showLiveUpdates ? 'Hide updates' : 'Show updates'}
            </button>
          </div>
        </div>

        {showLiveUpdates && (
          <div className="space-y-6">
            {keyEvents.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-amber-500" />
                  Key Events
                </h4>
                <div className="space-y-4">
                  {keyEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                          Key Event
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.content_published_at ? new Date(event.content_published_at).toLocaleTimeString('en-GH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                      <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {event.content_title}
                      </h5>
                      {event.content_description && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {event.content_description}
                        </p>
                      )}
                      {event.content_detail && (
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: event.content_detail }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-neutral-700"></div>
              
              <div className="space-y-8 pl-10">
                {liveUpdates.map((update, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                      <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      update.isKey 
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' 
                        : 'bg-gray-50 dark:bg-neutral-800 border-l-4 border-gray-300 dark:border-neutral-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-900 dark:text-gray-100">
                          {update.content_title}
                        </h5>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {update.content_published_at ? new Date(update.content_published_at).toLocaleTimeString('en-GH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                      
                      {update.content_description && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {update.content_description}
                        </p>
                      )}
                      
                      {update.content_detail && (
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: update.content_detail }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRegularArticleContent = () => {
    if (isLiveContent(article.content)) {
      return null;
    }

    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div
          className="article-content"
          dangerouslySetInnerHTML={parseContent(article.content)}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
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
                  {article.isBreaking && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <AlertCircle size={14} className="mr-1" />
                      BREAKING
                    </span>
                  )}
                  {article.isHeadline && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      HEADLINE
                    </span>
                  )}
                  {article.isTopstory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      TOP STORY
                    </span>
                  )}
                  {article.isLive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <Clock size={14} className="mr-1" />
                      LIVE NOW
                    </span>
                  )}
                  {article.wasLive && !article.isLive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <Clock size={14} className="mr-1" />
                      LIVE COVERAGE
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {article.title}
                </h1>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {article.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(article.published_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-medium">{article.creator}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <span className="font-medium">{article.category}</span>
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

              {article.image_url && (
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {article.subcategory && article.subcategory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.subcategory.map((subcat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {subcat}
                    </span>
                  ))}
                </div>
              )}

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {article.isLive || article.wasLive ? renderLiveArticleContent() : renderRegularArticleContent()}

              {article.source_name && (
                <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Source: <span className="font-medium">{article.source_name}</span>
                  </p>
                </div>
              )}

              <div className="pt-8 border-t border-[#e0e0e0] dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Article ID: {article._id}
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
              <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  About the Author
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <User size={24} className="text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{article.creator}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contributor</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {article.creator} writes for Ghanapolitan, covering various topics with in-depth analysis and reporting.
                </p>
              </div>

              {(similarArticles.length > 0 || initialSimilarArticles?.length) && (
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    More Like This
                  </h3>
                  <div className="space-y-4">
                    {(similarArticles.length > 0 ? similarArticles : initialSimilarArticles || [])
                      .slice(0, 3)
                      .map((similar) => (
                      <div 
                        key={similar._id}
                        className="p-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => router.push(`/ghanapolitan/article-detail/${similar.slug}`)}
                      >
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">
                          {similar.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{similar.creator}</span>
                          <span>{new Date(similar.published_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}</span>
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
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => router.push(`/ghanapolitan/articles?category=${cat}`)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm ${article.category === cat ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Article Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${article.isLive ? 'text-red-600 dark:text-red-400' : article.wasLive ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {article.isLive ? 'Live Now' : article.wasLive ? 'Live Coverage' : 'Published'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Published:</span>
                    <span className="font-medium">{new Date(article.published_at).toLocaleDateString('en-GH')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="font-medium">{new Date(article.updatedAt).toLocaleDateString('en-GH')}</span>
                  </div>
                  {article.comments && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Comments:</span>
                      <span className="font-medium flex items-center gap-1">
                        <MessageSquare size={14} />
                        {article.comments.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .article-content {
          line-height: 1.8;
          font-size: 1.125rem;
          color: #374151;
        }
        
        .dark .article-content {
          color: #d1d5db;
        }
        
        .article-content p {
          margin-bottom: 1.5rem;
        }
        
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #111827;
        }
        
        .dark .article-content h1,
        .dark .article-content h2,
        .dark .article-content h3,
        .dark .article-content h4,
        .dark .article-content h5,
        .dark .article-content h6 {
          color: #f3f4f6;
        }
        
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .article-content a {
          color: #059669;
          text-decoration: underline;
        }
        
        .dark .article-content a {
          color: #10b981;
        }
        
        .article-content blockquote {
          border-left: 4px solid #059669;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #065f46;
          background-color: #f0fdf4;
          padding: 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .dark .article-content blockquote {
          border-left-color: #10b981;
          color: #a7f3d0;
          background-color: #064e3b;
        }
        
        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .article-content li {
          margin-bottom: 0.75rem;
        }
        
        .article-content pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.95rem;
        }
        
        .article-content code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 0.9em;
          color: #0f172a;
        }
        
        .dark .article-content code {
          background-color: #334155;
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}