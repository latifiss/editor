'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { 
  useUpdateArticleMutation, 
  useGetArticleByIdQuery 
} from '@/store/features/ghanapolitan/articles/articleAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import { SelectDropdown } from '@/components/ui/inputs/dropdown';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import TiptapEditor, { type TiptapEditorRef } from '@/components/tiptap-editor';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { ssr: false });

const decodeHtmlEntities = (html: string): string => {
  if (typeof window === 'undefined') return html;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

const categories = [
  'Politics',
  'Local',
  'Business',
  'Sports',
  'Entertainment',
  'Africa',
  'Technology',
  'World',
  'Health',
  'Education',
  'Lifestyle',
];

const categorySubcategories = {
  'Politics': ['Government', 'Elections', 'Policy', 'International Relations', 'Local Politics'],
  'Local': ['Community', 'Crime & Safety', 'Infrastructure', 'Transport', 'Environment', 'Weather', 'Public Services', 'Social Issues', 'Regional'],
  'Business': ['Economy', 'Markets', 'Companies & Investments', 'Entrepreneurship', 'Finance'],
  'Sports': ['Football', 'Basketball', 'Athletics', 'Boxing', 'Other sports'],
  'Africa': ['North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'],
  'Entertainment': ['Movies', 'Music', 'Celebrities', 'Radio & TV Shows', 'Events & Festivals', 'Arts & Culture'],
  'Technology': ['AI & Infrastructure', 'Software', 'Hardware', 'Startups', 'Gadgets', 'Social Media', 'Other Tech'],
  'World': [ 'Europe', 'Asia', 'Americas', 'Middle East'],
  'Health': ['Medical', 'Nutrition', 'Healthcare'],
  'Education': ['Schools', 'Universities', 'Research', 'Policy'],
  'Lifestyle': ['Fashion', 'Food', 'Travel', 'Culture', 'Relationships'],
};

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  content?: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const admin = useSelector(selectCurrentAdmin);

  // Use article API from your Redux logic
  const { data: articleData, isLoading: isLoadingArticle, error: articleError, refetch } = 
    useGetArticleByIdQuery(articleId, { skip: !articleId });
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<{ id: string; label: string } | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isHeadline, setIsHeadline] = useState(false);
  const [isTopstory, setIsTopstory] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [sourceName, setSourceName] = useState('Ghanapolitan');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasErrorBeenHandled, setHasErrorBeenHandled] = useState(false);

  // Editor ready state
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Check editor ref availability
  useEffect(() => {
    const checkEditorRef = () => {
      if (editorRef.current) {
        setIsEditorReady(true);
      }
    };
    
    checkEditorRef();
    
    const interval = setInterval(checkEditorRef, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Update creator when admin data is available
  useEffect(() => {
    if (admin?.name && !articleData?.data?.creator) {
      // This will be set when article loads
    }
  }, [admin, articleData]);

  // Pre-fill form with article data when loaded
  useEffect(() => {
    console.log('=== Loading Article Data ===');
    console.log('articleData:', articleData);
    
    if (articleData?.data && !isInitialized) {
      const article = articleData.data;
      
      console.log('✅ Article loaded successfully:', {
        title: article.title,
        category: article.category,
        tags: article.tags,
        contentExists: !!article.content,
        contentLength: article.content?.length || 0,
        subcategory: article.subcategory
      });
      
      // 1. Set basic text fields
      setTitle(article.title || '');
      setDescription(article.description || '');
      
      // 2. Set category
      if (article.category) {
        console.log('Setting category:', article.category);
        setCategory({ id: article.category, label: article.category });
      } else {
        console.warn('⚠️ No category found in article');
      }
      
      // 3. Set subcategories
      if (article.subcategory && Array.isArray(article.subcategory) && article.subcategory.length > 0) {
        console.log('Setting subcategories:', article.subcategory);
        setSelectedSubcategories(article.subcategory);
      }
      
      // 4. Set tags
      if (article.tags) {
        if (Array.isArray(article.tags)) {
          console.log('Setting tags:', article.tags);
          setTags(article.tags);
        } else if (typeof article.tags === 'string') {
          const tagArray = article.tags.split(',').map(t => t.trim()).filter(t => t);
          console.log('Parsed tags from string:', tagArray);
          setTags(tagArray);
        }
      }
      
      // 5. Set boolean flags
      console.log('Setting boolean flags:', {
        isBreaking: article.isBreaking,
        isHeadline: article.isHeadline,
        isTopstory: article.isTopstory,
        isLive: article.isLive
      });
      
      setIsBreaking(!!article.isBreaking);
      setIsHeadline(!!article.isHeadline);
      setIsTopstory(!!article.isTopstory);
      setIsLive(!!article.isLive);
      
      // 6. Set source name
      if (article.source_name) {
        setSourceName(article.source_name);
      }
      
      // 7. Set image
      if (article.image_url) {
        console.log('Setting image URL:', article.image_url);
        setCurrentImageUrl(article.image_url);
        setThumbnailPreview(article.image_url);
      }
      
      // 8. Set editor content (with delay to ensure editor is ready)
      if (article.content && typeof article.content === 'string') {
        console.log('Article content found, length:', article.content.length);
        
        setTimeout(() => {
          if (editorRef.current) {
            console.log('Setting content to editor via ref');
            
            // Decode HTML entities first
            const decodedContent = decodeHtmlEntities(article.content);
            console.log('Decoded content length:', decodedContent.length);
            
            try {
              editorRef.current.setContent(decodedContent);
              console.log('✅ Editor content set successfully');
            } catch (error) {
              console.error('Error setting editor content:', error);
            }
          } else {
            console.warn('⚠️ Editor ref not available');
          }
        }, 500);
      } else if (Array.isArray(article.content)) {
        console.log('Content is an array (Live Article Content)');
        // Handle live article content if needed
      } else {
        console.warn('⚠️ No content found or content is not a string');
      }
      
      // Mark as initialized
      setIsInitialized(true);
      console.log('✅ Form initialized successfully');
      
    } else if (articleData && !isInitialized) {
      console.log('❌ Article data structure issue:', {
        hasData: !!articleData,
        hasDataData: !!articleData?.data,
        fullData: articleData
      });
    }
  }, [articleData, isInitialized]);

  // Handle Enter key in dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLElement) {
        if (e.target.closest('[role="listbox"]') || e.target.closest('.dropdown-container')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      const categoryName = category.label;
      const subs = categorySubcategories[categoryName as keyof typeof categorySubcategories] || [];
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
  }, [category]);

  // Handle loading and error states
  useEffect(() => {
    if (articleError && !hasErrorBeenHandled && articleId) {
      console.error('Article loading error:', articleError);
      notify('Failed to load article. Please try again.', 'error');
      setHasErrorBeenHandled(true);
      
      setTimeout(() => {
        router.push('/ghanapolitan/articles');
      }, 2000);
    }
  }, [articleError, hasErrorBeenHandled, articleId, router, notify]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setCurrentImageUrl(null);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategory) 
        ? prev.filter(item => item !== subcategory)
        : [...prev, subcategory]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      isValid = false;
    }

    if (!category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    const editor = editorRef.current;
    if (!editor || !editor.getText().trim()) {
      newErrors.content = 'Article content is required';
      isValid = false;
    } else if (editor.getText().trim().length < 50) {
      newErrors.content = 'Article content must be at least 50 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const debugFormData = (formData: FormData) => {
    console.log('🔍 DEBUG FormData Contents:');
    const entries: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === 'image') {
        entries[key] = {
          type: 'File',
          name: (value as File).name,
          size: (value as File).size,
          mimetype: (value as File).type
        };
      } else if (key === 'content') {
        entries[key] = {
          type: 'String',
          preview: (value as string).substring(0, 100) + '...',
          length: (value as string).length
        };
      } else {
        entries[key] = {
          type: typeof value,
          value: value,
          isBooleanString: value === 'true' || value === 'false'
        };
      }
    }
    
    console.table(entries);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      notify('Please fix the errors in the form', 'error');
      return;
    }

    const editor = editorRef.current;
    if (!editor) {
      notify('Editor not loaded', 'error');
      return;
    }

    const htmlContent = editor.getHTML();

    const formData = new FormData();
    
    // Required fields
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category!.label.trim());
    formData.append('content', htmlContent);
    
    // Optional fields
    if (selectedSubcategories.length > 0) {
      selectedSubcategories.forEach(subcat => {
        formData.append('subcategory[]', subcat);
      });
    }
    
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    
    formData.append('isBreaking', String(isBreaking));
    formData.append('isHeadline', String(isHeadline));
    formData.append('isTopstory', String(isTopstory));
    formData.append('isLive', String(isLive));
    formData.append('source_name', sourceName.trim());
    
    // Use admin name as creator
    if (admin?.name) {
      formData.append('creator', admin.name.trim());
    }
    
    // Add image if uploaded
    if (thumbnail) {
      formData.append('image', thumbnail);
    }

    // Debug the FormData
    debugFormData(formData);

    try {
      const result = await updateArticle({
        id: articleId,
        formData: formData
      }).unwrap();
      
      console.log('✅ Update successful:', result);
      
      notify('Article updated successfully', 'success');
      
      // Navigate to articles list after successful update
      setTimeout(() => {
        router.push('/ghanapolitan/articles');
      }, 1500);
      
    } catch (err: any) {
      console.error('🚨 FULL ERROR DETAILS:', {
        error: err,
        data: err?.data,
        message: err?.message,
        status: err?.status,
        statusText: err?.statusText
      });
      
      let errorMessage = 'Failed to update article. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors.join(', ');
        
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('title')) backendErrors.title = error;
          else if (error.toLowerCase().includes('description')) backendErrors.description = error;
          else if (error.toLowerCase().includes('category')) backendErrors.category = error;
          else if (error.toLowerCase().includes('content')) backendErrors.content = error;
        });
        setErrors(backendErrors);
      }
      
      notify(errorMessage, 'error');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleCategoryChange = (option: { id: string; label: string } | null) => {
    setCategory(option);
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const categoryOptions = [
    { id: '', label: 'Select Category' },
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  // Show loading state
  if (isLoadingArticle && !articleData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  // Show error state if article not found
  if (articleError && hasErrorBeenHandled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The article you're trying to edit doesn't exist.</p>
          <Button
            onClick={() => router.push('/ghanapolitan/articles')}
            className="mt-4"
          >
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Article
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Editing: <span className="font-semibold">{title || 'Article'}</span>
          </p>
          {admin && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Article will be authored by: <span className="font-semibold">{admin.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Title *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="title"
                    placeholder="Enter article title"
                    value={title}
                    onChange={handleTitleChange}
                    error={!!errors.title}
                    aria-describedby="title-error"
                  />
                </div>
                {errors.title && (
                  <p id="title-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="description"
                    placeholder="Brief description or excerpt of the article"
                    value={description}
                    onChange={handleDescriptionChange}
                    error={!!errors.description}
                    aria-describedby="description-error"
                  />
                </div>
                {errors.description && (
                  <p id="description-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Source Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Source Name (Optional)
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="e.g., Ghanapolitan, Reuters, etc."
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                  />
                </div>
              </div>

              {/* SEO Meta Fields - DISABLED */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg opacity-60 cursor-not-allowed">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  SEO Settings (Disabled)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  SEO fields are automatically generated from the article content.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    SEO Meta Title
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="Auto-generated from title"
                      value={`${title.substring(0, 60)}${title.length > 60 ? '...' : ''} | Ghanapolitan`}
                      disabled
                      className="bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-generated: Title + " | Ghanapolitan"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    SEO Meta Description
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <Textarea
                      placeholder="Auto-generated from description"
                      value={description.substring(0, 160) + (description.length > 160 ? '...' : '')}
                      disabled
                      rows={3}
                      className="bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-generated from article description (max 160 chars)
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Article Content *
                </label>
                {errors.content && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    {errors.content}
                  </p>
                )}
                <div className="w-full">
                  <TiptapEditorDynamic
                    ref={editorRef}
                    output="html"
                    minHeight={320}
                    maxHeight={640}
                    placeholder={{
                      paragraph: "Write your article content here...",
                      imageCaption: "Type caption for image (optional)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            {/* Thumbnail */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Featured Image (Optional)
              </label>
              <div className="relative flex items-center justify-center h-[220px] w-full bg-gray-50 dark:bg-neutral-800 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="thumbnail"
                />
                {thumbnailPreview || currentImageUrl ? (
                  <Image
                    src={thumbnailPreview || currentImageUrl || ''}
                    alt="Selected Featured Image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tap to upload
                  </div>
                )}
              </div>
              {currentImageUrl && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current image will be replaced if you upload a new one
                </p>
              )}
            </div>

            {/* Category */}
            <div className="w-full space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article Category *
              </label>
              <div className="w-full [&>div]:!w-full">
                <SelectDropdown
                  id="category"
                  options={categoryOptions}
                  placeholder="Select Category"
                  value={category}
                  onChange={handleCategoryChange}
                  error={!!errors.category}
                  aria-describedby="category-error"
                />
              </div>
              {errors.category && (
                <p id="category-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="w-full space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Subcategories (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subcategories.map((subcat) => (
                    <button
                      key={subcat}
                      type="button"
                      onClick={() => handleSubcategoryToggle(subcat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedSubcategories.includes(subcat) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
                    >
                      {subcat}
                    </button>
                  ))}
                </div>
                {selectedSubcategories.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selected: {selectedSubcategories.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Tags (Optional)
              </label>
              <div className="w-full [&>div]:!w-full">
                <TextInput
                  type="text"
                  placeholder="Enter tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article Flags */}
            <div className="w-full space-y-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Article Flags
              </h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Breaking News
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHeadline}
                  onChange={(e) => setIsHeadline(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Headline Article
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTopstory}
                  onChange={(e) => setIsTopstory(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Top Story
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Live Article
                </span>
              </label>
            </div>

            {/* Article Details */}
            <div className="w-full p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Article Details
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Original Author:</span> {articleData?.data?.creator || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Created:</span> {articleData?.data?.createdAt ? new Date(articleData.data.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Published:</span> {articleData?.data?.published_at ? new Date(articleData.data.published_at).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Slug:</span> {articleData?.data?.slug || 'N/A'}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/ghanapolitan/articles')}
                className="flex-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingArticle}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {!admin ? (
                  'Please log in to edit articles'
                ) : isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClipLoader size={16} color="#fff" />
                    Updating...
                  </span>
                ) : (
                  'Update Article'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}