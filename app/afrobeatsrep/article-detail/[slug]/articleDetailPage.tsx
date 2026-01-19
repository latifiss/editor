'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetArticleBySlugQuery } from '@/store/features/afrobeatsrep/article/articleAPI';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, Globe, TrendingUp } from 'lucide-react';

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
  isHeadline: boolean;
  label?: string;
  slug: string;
}

interface ArticleDetailPageProps {
  initialArticle?: Article;
}

export default function ArticleDetailPage({ initialArticle }: ArticleDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

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

  const [article, setArticle] = useState<Article | null>(initialArticle || null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (articleData?.data) {
      setArticle(articleData.data);
      setHasError(false);
    } else if (error) {
      setHasError(true);
    }
  }, [articleData, error]);

  // Only show loading if no initial SSR data and still loading
  if ((isLoading || isFetching) && !article && !hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
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

  if (!slug || (!isLoading && !article)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The article you're looking for doesn't exist or the slug is invalid.
          </p>
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

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} color="#10B981" />
      </div>
    );
  }

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

  // AfroBeats categories
  const afrobeatsCategories = [
    'Trending',
    'People & Lifestyle',
    'Music',
    'Movies',
    'Sports'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                  {article.isHeadline && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      HEADLINE
                    </span>
                  )}
                  {article.label && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {article.label}
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
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Content Creator</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {article.creator} covers entertainment, music, lifestyle, and trending topics for AfroBeats.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {afrobeatsCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => router.push(`/afrobeatsrep/articles?category=${cat}`)}
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
                    <span className={`font-medium ${article.isHeadline ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {article.isHeadline ? 'Headline' : 'Published'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Published:</span>
                    <span className="font-medium">{new Date(article.published_at).toLocaleDateString('en-GH')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium">{article.category}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  AfroBeats Entertainment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AfroBeats brings you the latest in entertainment, music, lifestyle, and trending content from Africa.
                </p>
                <Button
                  onClick={() => router.push('/afrobeatsrep/articles')}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  View All Articles
                </Button>
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
