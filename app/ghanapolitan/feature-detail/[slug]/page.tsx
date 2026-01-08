'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetGhanapolitanFeatureBySlugQuery } from '@/store/features/ghanapolitan/feature/featureAPI'; // Ghanapolitan-specific change
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { ChevronLeft, Calendar, User, Tag, MapPin, Building2 } from 'lucide-react'; // Ghanapolitan-specific change: Added icons

// Ghanapolitan-specific change: Updated interface to match different data structure
interface Feature {
  _id: string;
  title: string;
  summary: string; // Different from Ghanascore's "description"
  article_body: any; // Different from Ghanascore's "content"
  region: string; // New field
  location_tags: string[]; // New field (replaces category/subcategory)
  topics: string[]; // New field (similar to tags)
  author: string; // Different from Ghanascore's "creator"
  image_url?: string;
  published_date: string; // Different from Ghanascore's "published_at"
  slug: string;
  read_time?: number; // New optional field
}

export default function GhanapolitanFeatureDetailPage() { // Ghanapolitan-specific change: Renamed component
  const params = useParams();
  const router = useRouter();
  const { notify } = useNotify();
  const slug = params.slug as string;
  
  // Ghanapolitan-specific change: Using the correct query hook
  const { 
    data: featureData, 
    isLoading, 
    error 
  } = useGetGhanapolitanFeatureBySlugQuery(slug);
  
  const [feature, setFeature] = useState<Feature | null>(null);
  
  useEffect(() => {
    if (featureData?.data) {
      setFeature(featureData.data);
    }
  }, [featureData]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', { // Ghanapolitan-specific change: Ghana locale
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          <ClipLoader size={40} color="#059669" /> {/* Ghanapolitan-specific change: Green color */}
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p> {/* Ghanapolitan-specific change: Updated text */}
        </div>
      </div>
    );
  }
  
  if (error || !feature) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">Article not found</h2> {/* Ghanapolitan-specific change: Amber color */}
          <p className="mt-2 text-gray-600 dark:text-gray-400">This article is currently unavailable.</p>
          <Button
            onClick={() => router.push('/ghanapolitan')} // Ghanapolitan-specific change: Route back to ghanapolitan home
            className="mt-4 bg-emerald-700 hover:bg-emerald-800" // Ghanapolitan-specific change: Green color
          >
            Back to Ghanapolitan
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950"> {/* Ghanapolitan-specific change: Lighter background */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6 flex items-center gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" // Ghanapolitan-specific change: Green theme
        >
          <ChevronLeft size={18} />
          Back
        </Button>
        
        <div className="space-y-6">
          <div>
            {/* Ghanapolitan-specific change: Different badge styling and logic */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                FEATURE
              </span>
              
              {feature.region && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  <MapPin size={12} />
                  {feature.region}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {feature.title}
            </h1>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {feature.summary} {/* Ghanapolitan-specific change: Using summary field */}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(feature.published_date)}</span> {/* Ghanapolitan-specific change: Using published_date */}
              </div>
              
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{feature.author}</span> {/* Ghanapolitan-specific change: Using author */}
              </div>
              
              {feature.read_time && (
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span className="font-medium">{feature.read_time} min read</span> {/* Ghanapolitan-specific change: Read time */}
                </div>
              )}
            </div>
          </div>
          
          {feature.image_url && (
            <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-lg"> {/* Ghanapolitan-specific change: Enhanced styling */}
              <Image
                src={feature.image_url}
                alt={feature.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          
          {/* Ghanapolitan-specific change: Displaying location_tags instead of subcategory */}
          {feature.location_tags && feature.location_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Building2 size={14} />
                <span>Locations:</span>
              </div>
              {feature.location_tags.map((location, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {location}
                </span>
              ))}
            </div>
          )}
          
          {/* Ghanapolitan-specific change: Displaying topics instead of tags */}
          {feature.topics && feature.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Tag size={14} />
                <span>Topics:</span>
              </div>
              {feature.topics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div 
              className="ghanapolitan-content" // Ghanapolitan-specific change: Different class name
              dangerouslySetInnerHTML={parseContent(feature.article_body)} // Ghanapolitan-specific change: Using article_body
            />
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Article ID: {feature._id}
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