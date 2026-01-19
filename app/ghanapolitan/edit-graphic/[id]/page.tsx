'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { 
  useUpdateGraphicMutation, 
  useGetGraphicByIdQuery 
} from '@/store/features/ghanapolitan/graphic/graphicAPI';
import { useNotify } from '@/hooks/useNotify';
import { useImageUrlReplacement } from '@/hooks/useImageUrlReplacement';
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

const ghanapolitanCategories = [
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

const ghanapolitanSubcategories: Record<string, string[]> = {
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
  creator?: string;
  category?: string;
  content?: string;
}

export default function EditGraphicPage() {
  const router = useRouter();
  const params = useParams();
  const graphicId = params.id as string;
  const { notify } = useNotify();
  const { processHTMLContent } = useImageUrlReplacement();
  const editorRef = useRef<TiptapEditorRef>(null);
  const admin = useSelector(selectCurrentAdmin);

  const { 
    data: graphicData, 
    isLoading: isLoadingGraphic, 
    error: graphicError, 
    refetch 
  } = useGetGraphicByIdQuery(graphicId, { skip: !graphicId });
  
  const [updateGraphic, { isLoading: isUpdating }] = useUpdateGraphicMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState(admin?.name || '');
  const [category, setCategory] = useState<{ id: string; label: string } | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ id: string; label: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasErrorBeenHandled, setHasErrorBeenHandled] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

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

  useEffect(() => {
    if (graphicData?.data?.content && editorRef.current && isEditorReady) {
      const setContentWithRetry = (retryCount = 0) => {
        if (retryCount > 3) {
          return;
        }
        
        try {
          if (typeof editorRef.current?.setContent === 'function') {
            const success = editorRef.current.setContent(graphicData.data.content);
            if (!success) {
              setTimeout(() => setContentWithRetry(retryCount + 1), 300);
            }
          } else if (editorRef.current && (editorRef.current as any).editor) {
            const editor = (editorRef.current as any).editor;
            editor.commands.setContent(graphicData.data.content);
          }
        } catch (error) {
          setTimeout(() => setContentWithRetry(retryCount + 1), 300);
        }
      };
      
      setContentWithRetry();
    }
  }, [graphicData, isEditorReady]);

  useEffect(() => {
    if (admin?.name && !creator) {
      setCreator(admin.name);
    }
  }, [admin, creator]);

  useEffect(() => {
    if (graphicData && graphicData.data && !isInitialized) {
      const graphic = graphicData.data;
      
      setTitle(graphic.title || '');
      setDescription(graphic.description || '');
      
      const creatorName = graphic.creator || admin?.name || '';
      setCreator(creatorName);
      
      if (graphic.category) {
        setCategory({ id: graphic.category, label: graphic.category });
      }
      
      if (graphic.subcategory && Array.isArray(graphic.subcategory)) {
        if (graphic.subcategory.length > 0) {
          const subcat = graphic.subcategory[0];
          setSelectedSubcategory({ id: subcat, label: subcat });
        }
      }
      
      if (graphic.tags) {
        if (Array.isArray(graphic.tags)) {
          setTags(graphic.tags);
        } else if (typeof graphic.tags === 'string') {
          const tagArray = graphic.tags.split(',').map(t => t.trim()).filter(t => t);
          setTags(tagArray);
        }
      }
      
      if (graphic.featured_image_url) {
        setCurrentImageUrl(graphic.featured_image_url);
        setThumbnailPreview(graphic.featured_image_url);
      }
      
      if (graphic.content && typeof graphic.content === 'string') {
        setTimeout(() => {
          if (editorRef.current) {
            const decodedContent = decodeHtmlEntities(graphic.content);
            try {
              editorRef.current.setContent(decodedContent);
            } catch (error) {}
          }
        }, 500);
      }
      
      setIsInitialized(true);
    }
  }, [graphicData, admin, isInitialized]);

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

  useEffect(() => {
    if (category) {
      const categoryName = category.label;
      const subs = ghanapolitanSubcategories[categoryName as keyof typeof ghanapolitanSubcategories] || [];
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
  }, [category]);

  useEffect(() => {
    if (graphicError && !hasErrorBeenHandled && graphicId) {
      notify('Failed to load graphic. Please try again.', 'error');
      setHasErrorBeenHandled(true);
      
      setTimeout(() => {
        router.push('/ghanapolitan/graphics');
      }, 2000);
    }
  }, [graphicError, hasErrorBeenHandled, graphicId, router, notify]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notify('Please upload an image file', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        notify('Image size should be less than 5MB', 'error');
        return;
      }
      
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    const editor = editorRef.current;
    if (!editor) {
      newErrors.content = 'Editor is not loaded';
      return false;
    }

    const htmlContent = editor.getHTML();
    if (!htmlContent.replace(/<[^>]*>/g, '').trim()) {
      newErrors.content = 'Content is required';
    }

    if (!creator.trim()) {
      newErrors.creator = 'Creator is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    const finalHtmlContent = processHTMLContent(htmlContent, (warning) => {
      notify(warning, 'warning');
    });

    if (!finalHtmlContent) {
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('description', description.trim());
    payload.append('category', category!.label.trim());
    
    if (selectedSubcategory) {
      payload.append('subcategory', selectedSubcategory.label.trim());
    }
    
    const creatorName = admin?.name || creator.trim();
    payload.append('creator', creatorName);

    if (tags.length > 0) {
      payload.append('tags', tags.join(','));
    }

    payload.append('published_at', new Date().toISOString());
    payload.append('content', finalHtmlContent);

    if (thumbnail) {
      payload.append('image_url', thumbnail);
    }

    try {
      await updateGraphic({
        id: graphicId,
        formData: payload
      }).unwrap();
      
      notify('Graphic updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanapolitan/graphics');
      }, 1500);
      
    } catch (err: any) {
      let errorMessage = 'Failed to update graphic. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors.join(', ');
        
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('title')) backendErrors.title = error;
          else if (error.toLowerCase().includes('description')) backendErrors.description = error;
          else if (error.toLowerCase().includes('category')) backendErrors.category = error;
          else if (error.toLowerCase().includes('creator')) backendErrors.creator = error;
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

  const handleCreatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreator(e.target.value);
    if (errors.creator) {
      setErrors(prev => ({ ...prev, creator: undefined }));
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
    ...ghanapolitanCategories.map((cat) => ({ id: cat, label: cat })),
  ];

  const subcategoryOptions = [
    { id: '', label: 'Select Subcategory (Optional)' },
    ...subcategories.map((sub) => ({ id: sub, label: sub })),
  ];

  if (isLoadingGraphic && !graphicData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading graphic...</p>
        </div>
      </div>
    );
  }

  if (graphicError && hasErrorBeenHandled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Graphic not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The graphic you're trying to edit doesn't exist.</p>
          <Button
            onClick={() => router.push('/ghanapolitan/graphics')}
            className="mt-4"
          >
            Back to Graphics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit Graphic
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Editing: <span className="font-semibold">{title || 'Graphic'}</span>
            </p>
            {admin && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Graphic will be authored by: <span className="font-semibold">{admin.name}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => router.push('/ghanapolitan/graphics')}
              variant="outline"
              size="sm"
            >
              Back to Graphics
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Title *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="title"
                    placeholder="Enter graphic title"
                    value={title}
                    onChange={handleTitleChange}
                    error={!!errors.title}
                    aria-describedby="title-error"
                    rows={2}
                  />
                </div>
                {errors.title && (
                  <p id="title-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="description"
                    placeholder="Describe the graphic"
                    value={description}
                    onChange={handleDescriptionChange}
                    error={!!errors.description}
                    aria-describedby="description-error"
                    rows={3}
                  />
                </div>
                {errors.description && (
                  <p id="description-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Content *
                </label>
                {errors.content && (
                  <p id="content-error" className="text-sm text-red-600 dark:text-red-400 mb-2">
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
                      paragraph: "Type your content here...",
                      imageCaption: "Type caption for image (optional)",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Tip: You can add images directly in the editor.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Featured image (Optional)
              </label>
              <div className="relative flex items-center justify-center h-[220px] w-full bg-gray-50 dark:bg-neutral-800 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="featured-image"
                />
                {thumbnailPreview || currentImageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={thumbnailPreview || currentImageUrl || ''}
                      alt="Selected Featured Image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Click to upload featured image
                    <p className="text-xs mt-1">Max 5MB, JPG/PNG</p>
                  </div>
                )}
              </div>
              {currentImageUrl && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current image will be replaced if you upload a new one
                </p>
              )}
            </div>

            <div className="w-full space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Graphic category *
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

            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Subcategory (Optional)
              </label>
              <div className="w-full [&>div]:!w-full">
                <SelectDropdown
                  options={subcategoryOptions}
                  placeholder="Select Subcategory"
                  value={selectedSubcategory}
                  onChange={(option) => setSelectedSubcategory(option)}
                  disabled={!category || subcategories.length === 0}
                />
              </div>
              {category && subcategories.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No subcategories available for this category
                </p>
              )}
            </div>

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
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Author Information
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Author:</span> {admin?.name || 'Not logged in'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span> {admin?.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Role:</span> {admin?.role ? admin.role.replace('_', ' ').toUpperCase() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/ghanapolitan/graphics')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingGraphic}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {!admin ? (
                  'Please log in to edit graphics'
                ) : isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClipLoader size={16} color="#fff" />
                    Updating...
                  </span>
                ) : (
                  'Update Graphic'
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