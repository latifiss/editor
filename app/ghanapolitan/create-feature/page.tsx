'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useCreateGhanapolitanFeatureMutation } from '@/store/features/ghanapolitan/feature/featureAPI';
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
  creator?: string;
  category?: string;
  content?: string;
}

export default function CreateFeaturePage() {
  const router = useRouter();
  const { notify } = useNotify();
  const { processHTMLContent } = useImageUrlReplacement();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [createFeature, { isLoading }] = useCreateGhanapolitanFeatureMutation();
  const admin = useSelector(selectCurrentAdmin);

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
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (admin?.name && !creator) {
      setCreator(admin.name);
    }
  }, [admin, creator]);

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
      setSelectedSubcategory(null);
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [category]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
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
    
    if (label.trim()) {
      payload.append('label', label.trim());
    }

    if (tags.length > 0) {
      payload.append('tags', tags.join(','));
    }

    payload.append('published_at', new Date().toISOString());
    payload.append('content', finalHtmlContent);

    if (thumbnail) {
      payload.append('image', thumbnail);
    }

    try {
      await createFeature({ formData: payload }).unwrap();
      notify('Feature created successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanapolitan/features');
      }, 1500);
      
    } catch (err: any) {
      console.error('Submission error:', err);
      
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
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
      
      const errorMessage =
        err?.data?.message ||
        err?.data?.errors?.join(', ') ||
        'Failed to create feature. Please try again.';
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

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Write a new feature
              </h2>
              {admin && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Feature will be authored by: <span className="font-semibold">{admin.name}</span>
                </p>
              )}
            </div>

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
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
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

            <Button
              type="submit"
              disabled={isLoading || !admin}
              className="w-full mt-4"
            >
              {!admin ? (
                'Please log in to create features'
              ) : isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <ClipLoader size={16} color="#fff" />
                  Publishing...
                </span>
              ) : (
                'Publish Feature'
              )}
            </Button>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}