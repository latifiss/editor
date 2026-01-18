'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { 
  useUpdateFeatureMutation, 
  useGetFeatureByIdQuery 
} from '@/store/features/ghanascore/feature/featureAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import { SelectDropdown } from '@/components/ui/inputs/dropdown';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import TiptapEditor, { type TiptapEditorRef } from '@/components/tiptap-editor';
import { categorySubcategories } from '@/categorySubcategories';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { ssr: false });

const decodeHtmlEntities = (html: string): string => {
  if (typeof window === 'undefined') return html;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

const categories = [
  'Football',
  'Basketball',
  'Athletics',
  'Boxing',
  'Motorsport',
  'Tennis',
  'OtherSports',
];

interface FormErrors {
  title?: string;
  description?: string;
  creator?: string;
  category?: string;
  content?: string;
}

export default function EditFeaturePage() {
  const router = useRouter();
  const params = useParams();
  const featureId = params.id as string;
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const admin = useSelector(selectCurrentAdmin);

  const { data: featureData, isLoading: isLoadingFeature, error: featureError, refetch } = 
    useGetFeatureByIdQuery(featureId, { skip: !featureId });
  const [updateFeature, { isLoading: isUpdating }] = useUpdateFeatureMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
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
    if (featureData?.data?.feature?.content && editorRef.current && isEditorReady) {
      const setContentWithRetry = (retryCount = 0) => {
        if (retryCount > 3) {
          return;
        }
        
        try {
          if (typeof editorRef.current?.setContent === 'function') {
            const success = editorRef.current.setContent(featureData.data.feature.content);
            if (success) {
            } else {
              setTimeout(() => setContentWithRetry(retryCount + 1), 300);
            }
          } else {
            if (editorRef.current && (editorRef.current as any).editor) {
              const editor = (editorRef.current as any).editor;
              editor.commands.setContent(featureData.data.feature.content);
            }
          }
        } catch (error) {
          setTimeout(() => setContentWithRetry(retryCount + 1), 300);
        }
      };
      
      setContentWithRetry();
    }
  }, [featureData, isEditorReady]);

  useEffect(() => {
    if (admin?.name && !creator) {
      setCreator(admin.name);
    }
  }, [admin, creator]);

  useEffect(() => {
    if (featureData && featureData.data && featureData.data.feature && !isInitialized) {
      const feature = featureData.data.feature;
      
      setTitle(feature.title || '');
      setDescription(feature.description || '');
      setLabel(feature.label || '');
      
      const creatorName = feature.creator || admin?.name || '';
      setCreator(creatorName);
      
      if (feature.category) {
        setCategory({ id: feature.category, label: feature.category });
      }
      
      if (feature.subcategory && Array.isArray(feature.subcategory)) {
        if (feature.subcategory.length > 0) {
          const subcat = feature.subcategory[0];
          setSelectedSubcategory({ id: subcat, label: subcat });
        }
      }
      
      if (feature.tags) {
        if (Array.isArray(feature.tags)) {
          setTags(feature.tags);
        } else if (typeof feature.tags === 'string') {
          const tagArray = feature.tags.split(',').map(t => t.trim()).filter(t => t);
          setTags(tagArray);
        }
      }
      
      if (feature.image_url) {
        setCurrentImageUrl(feature.image_url);
        setThumbnailPreview(feature.image_url);
      }
      
      if (feature.content && typeof feature.content === 'string') {
        setTimeout(() => {
          if (editorRef.current) {
            const decodedContent = decodeHtmlEntities(feature.content);
            try {
              editorRef.current.setContent(decodedContent);
            } catch (error) {}
          }
        }, 500);
      }
      
      setIsInitialized(true);
    }
  }, [featureData, admin, isInitialized]);

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
      const subs = categorySubcategories[categoryName as keyof typeof categorySubcategories] || [];
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
  }, [category]);

  useEffect(() => {
    if (featureError && !hasErrorBeenHandled && featureId) {
      notify('Failed to load feature. Please try again.', 'error');
      setHasErrorBeenHandled(true);
      
      setTimeout(() => {
        router.push('/ghanascore/features');
      }, 2000);
    }
  }, [featureError, hasErrorBeenHandled, featureId, router]);

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

    if (!creator.trim()) {
      newErrors.creator = 'Creator is required';
      isValid = false;
    } else if (creator.trim().length < 2) {
      newErrors.creator = 'Creator name must be at least 2 characters';
      isValid = false;
    }

    const editor = editorRef.current;
    if (!editor || !editor.getText().trim()) {
      newErrors.content = 'Feature content is required';
      isValid = false;
    } else if (editor.getText().trim().length < 50) {
      newErrors.content = 'Feature content must be at least 50 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('description', description.trim());
    payload.append('category', category!.label.trim());
    
    if (selectedSubcategory) {
      payload.append('subcategory', selectedSubcategory.label.trim());
    }
    
    const creatorName = admin?.name || creator.trim();
    payload.append('creator', creatorName);
    
    if (label.trim()) {
      payload.append('label', label.trim());
    }

    if (tags.length > 0) {
      payload.append('tags', tags.join(','));
    }

    payload.append('published_at', new Date().toISOString());
    payload.append('content', htmlContent);

    if (thumbnail) {
      payload.append('image', thumbnail);
    }

    try {
      const result = await updateFeature({
        id: featureId,
        formData: payload
      }).unwrap();
      
      notify('Feature updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanascore/features');
      }, 1500);
      
    } catch (err: any) {
      let errorMessage = 'Failed to update feature. Please try again.';
      
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
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  const subcategoryOptions = [
    { id: '', label: 'Select Subcategory (Optional)' },
    ...subcategories.map((sub) => ({ id: sub, label: sub })),
  ];

  const testDataLoading = () => {
    if (featureData?.data?.feature) {
      const feature = featureData.data.feature;
      setTitle(feature.title || '');
      setDescription(feature.description || '');
      if (feature.category) {
        setCategory({ id: feature.category, label: feature.category });
      }
      if (feature.tags) {
        setTags(Array.isArray(feature.tags) ? feature.tags : []);
      }
      notify('Data manually set', 'success');
    }
  };

  if (isLoadingFeature && !featureData?.data?.feature) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading feature...</p>
        </div>
      </div>
    );
  }

  if (featureError && hasErrorBeenHandled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Feature not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The feature you're trying to edit doesn't exist.</p>
          <Link href="/ghanascore/features">
            <Button className="mt-4">
              Back to Features
            </Button>
          </Link>
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
              Edit Feature
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Editing: <span className="font-semibold">{title || 'Feature'}</span>
            </p>
            {admin && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Feature will be authored by: <span className="font-semibold">{admin.name}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={testDataLoading}
              variant="outline"
              size="sm"
            >
              Test Data Load
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
                    placeholder="Enter feature title"
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

              <div className="space-y-2">
                <label htmlFor="label" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Label (Optional)
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    id="label"
                    type="text"
                    placeholder="Example: Annual Review"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

              <div className="hidden">
                <input
                  type="hidden"
                  name="creator"
                  value={admin?.name || creator}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="description"
                    placeholder="Describe the feature"
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
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Feature thumbnail (Optional)
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
                    alt="Selected Thumbnail"
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

            <div className="w-full space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Feature category *
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
              <Link href="/ghanascore/features" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingFeature}
                className="flex-1"
              >
                {!admin ? (
                  'Please log in to edit features'
                ) : isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClipLoader size={16} color="#fff" />
                    Updating...
                  </span>
                ) : (
                  'Update Feature'
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