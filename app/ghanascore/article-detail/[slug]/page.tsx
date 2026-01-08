'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetArticleBySlugQuery } from '@/store/features/ghanascore/article/articleAPI';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, Globe } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  subcategory: string[];
  tags: string[];
  creator: string;
  image_url?: string;
  published_at: string;
  isBreaking: boolean;
  isHeadline: boolean;
  isTopstory: boolean;
  isLive: boolean;
  hasLivescore: boolean;
  livescoreTag?: string;
  slug: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Add extensive debugging
  console.log('🔍 ArticleDetailPage rendered');
  console.log('🔍 Slug from params:', slug);
  console.log('🔍 Params object:', params);

  // Use the query with skip option and add refetchOnMountOrArgChange
  const {
    data: articleData,
    isLoading,
    error,
    isFetching,
    isUninitialized,
    refetch
  } = useGetArticleBySlugQuery(slug, {
    skip: !slug,
    refetchOnMountOrArgChange: true
  });

  console.log('🔍 RTK Query State:', {
    isLoading,
    isFetching,
    isUninitialized,
    error,
    hasData: !!articleData,
    articleData
  });

  const [article, setArticle] = useState<Article | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🔍 useEffect triggered with articleData:', articleData);
    if (articleData?.data) {
      console.log('🔍 Setting article state with data');
      setArticle(articleData.data);
      setHasError(false);
    } else if (error) {
      console.error('🔍 Error from RTK Query:', error);
      setHasError(true);
    }
  }, [articleData, error]);

  // Show loading state
  if ((isLoading || isFetching) && !hasError) {
    console.log('🔍 Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
          <p className="text-sm text-gray-500 mt-2">Slug: {slug || 'No slug found'}</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError || error) {
    console.log('🔍 Showing error state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Failed to Load Article
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Please check your network connection'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Slug: {slug}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show article not found
  if (!slug || (!isLoading && !article)) {
    console.log('🔍 Showing article not found');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The article you're looking for doesn't exist or the slug is invalid.
          </p>
          <p className="text-sm text-gray-500 mt-2">Slug: {slug || 'No slug provided'}</p>
          <Button
            onClick={() => router.push('/')}
            className="mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // If we have an article, render it
  if (!article) {
    console.log('🔍 No article data, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} color="#10B981" />
      </div>
    );
  }

  console.log('🔍 Rendering article:', article.title);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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
    } else if (Array.isArray(content)) {
      return { __html: content.map(item => item.content_detail || '').join('') };
    }
    return { __html: '' };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {article.isBreaking && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  BREAKING
                </span>
              )}
              {article.isHeadline && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  HEADLINE
                </span>
              )}
              {article.isTopstory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  TOP STORY
                </span>
              )}
              {article.isLive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  LIVE
                </span>
              )}
              {article.hasLivescore && article.livescoreTag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Globe size={14} className="mr-1" />
                  {article.livescoreTag}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {article.title}
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {article.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
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
          </div>

          {article.image_url && (
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  console.error('Failed to load image:', article.image_url);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {article.subcategory && article.subcategory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.subcategory.map((subcat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
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

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div
              className="article-content"
              dangerouslySetInnerHTML={parseContent(article.content)}
            />
          </div>

          <div className="pt-8 border-t border-[#e0e0e0] dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Article ID: {article._id}
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
          color: #2563eb;
          text-decoration: underline;
        }

        .dark .article-content a {
          color: #60a5fa;
        }

        .article-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 2rem 0;
          font-style: italic;
        }

        .dark .article-content blockquote {
          border-left-color: #4b5563;
        }

        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .article-content li {
          margin-bottom: 0.5rem;
        }

        .article-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .dark .article-content pre {
          background-color: #1f2937;
        }

        .article-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }

        .dark .article-content code {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
}