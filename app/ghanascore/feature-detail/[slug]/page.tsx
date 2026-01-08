'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetFeatureBySlugQuery } from '@/store/features/ghanascore/feature/featureAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react';

interface Feature {
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
  slug: string;
}

export default function FeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { notify } = useNotify();
  const slug = params.slug as string;
  
  const { 
    data: featureData, 
    isLoading, 
    error 
  } = useGetFeatureBySlugQuery(slug);
  
  const [feature, setFeature] = useState<Feature | null>(null);
  
  useEffect(() => {
    if (featureData?.data) {
      setFeature(featureData.data);
    }
  }, [featureData]);
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading feature...</p>
        </div>
      </div>
    );
  }
  
  if (error || !feature) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Feature not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The feature you're looking for doesn't exist.</p>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                FEATURE
              </span>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {feature.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {feature.title}
            </h1>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {feature.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(feature.published_at)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{feature.creator}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span className="font-medium">Feature</span>
              </div>
            </div>
          </div>
          
          {feature.image_url && (
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={feature.image_url}
                alt={feature.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          
          {feature.subcategory && feature.subcategory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {feature.subcategory.map((subcat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >
                  {subcat}
                </span>
              ))}
            </div>
          )}
          
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {feature.tags.map((tag, index) => (
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
              className="feature-content"
              dangerouslySetInnerHTML={parseContent(feature.content)}
            />
          </div>
          
          <div className="pt-8 border-t border-[#e0e0e0] dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Feature ID: {feature._id}
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
        .feature-content {
          line-height: 1.8;
          font-size: 1.125rem;
          color: #374151;
        }
        
        .dark .feature-content {
          color: #d1d5db;
        }
        
        .feature-content p {
          margin-bottom: 1.5rem;
        }
        
        .feature-content h1,
        .feature-content h2,
        .feature-content h3,
        .feature-content h4,
        .feature-content h5,
        .feature-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #111827;
        }
        
        .dark .feature-content h1,
        .dark .feature-content h2,
        .dark .feature-content h3,
        .dark .feature-content h4,
        .dark .feature-content h5,
        .dark .feature-content h6 {
          color: #f3f4f6;
        }
        
        .feature-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .feature-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .dark .feature-content a {
          color: #60a5fa;
        }
        
        .feature-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 2rem 0;
          font-style: italic;
        }
        
        .dark .feature-content blockquote {
          border-left-color: #4b5563;
        }
        
        .feature-content ul,
        .feature-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .feature-content li {
          margin-bottom: 0.5rem;
        }
        
        .feature-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .dark .feature-content pre {
          background-color: #1f2937;
        }
        
        .feature-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .dark .feature-content code {
          background-color: #1f2937;
        }
      `}</style>
      
      <NotificationContainer position="bottom" />
    </div>
  );
}