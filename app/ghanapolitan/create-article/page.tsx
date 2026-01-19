'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useCreateArticleMutation } from '@/store/features/ghanapolitan/articles/articleAPI';
import { useGetSectionsQuery } from '@/store/features/ghanapolitan/section/sectionApi';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import { SelectDropdown } from '@/components/ui/inputs/dropdown';
import { SearchDropdown } from '@/components/ui/inputs/searchDropdown';
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

interface SectionOption {
  id: string;
  label: string;
  section_id: string;
  section_name: string;
  section_code?: string;
  section_slug?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  content?: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [createArticle, { isLoading }] = useCreateArticleMutation();
  const admin = useSelector(selectCurrentAdmin);

  const { data: initialSectionsData, isLoading: initialSectionsLoading } = useGetSectionsQuery({
    page: 1,
    limit: 4,
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<{ id: string; label: string } | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isHeadline, setIsHeadline] = useState(false);
  const [isTopstory, setIsTopstory] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [sourceName, setSourceName] = useState('Ghanapolitan');
  
  const [selectedSection, setSelectedSection] = useState<SectionOption | null>(null);
  const [sectionName, setSectionName] = useState<string>('');
  const [sectionCode, setSectionCode] = useState<string>('');
  const [sectionSlug, setSectionSlug] = useState<string>('');
  const [hasSection, setHasSection] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<FormErrors>({});

  const defaultSectionOptions: SectionOption[] = React.useMemo(() => {
    if (!initialSectionsData?.data?.sections) return [];
    
    return initialSectionsData.data.sections.map(section => ({
      id: section._id,
      label: section.section_name,
      section_id: section._id,
      section_name: section.section_name,
      section_code: section.section_code || '',
      section_slug: section.section_slug || '',
    }));
  }, [initialSectionsData]);

  const searchSections = async (query: string): Promise<SectionOption[]> => {
    if (!query.trim()) {
      return defaultSectionOptions;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/ghanapolitan/sections/search?q=${encodeURIComponent(query)}&page=1&limit=10`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data?.sections) {
        return data.data.sections.map((section: any) => ({
          id: section._id,
          label: section.section_name,
          section_id: section._id,
          section_name: section.section_name,
          section_code: section.section_code || '',
          section_slug: section.section_slug || '',
        }));
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const handleSectionSelect = (section: SectionOption) => {
    setSelectedSection(section);
    setSectionName(section.section_name);
    setSectionCode(section.section_code || '');
    setSectionSlug(section.section_slug || '');
    setHasSection(true);
  };

  const clearSection = () => {
    setSelectedSection(null);
    setSectionName('');
    setSectionCode('');
    setSectionSlug('');
    setHasSection(false);
  };

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
      setSelectedSubcategories([]);
    } else {
      setSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [category]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Thumbnail selected:', file.name, file.size, file.type);
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
    
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category!.label.trim());
    formData.append('content', htmlContent);
    
    if (selectedSubcategories.length > 0) {
      selectedSubcategories.forEach(subcat => {
        formData.append('subcategory[]', subcat);
      });
    }
    
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    
    if (selectedSection) {
      formData.append('section_name', sectionName);
      formData.append('has_section', 'true');
      
      if (sectionCode) {
        formData.append('section_code', sectionCode);
      }
      
      if (sectionSlug) {
        formData.append('section_slug', sectionSlug);
      }
    } else {
      formData.append('has_section', 'false');
    }
    
    formData.append('isBreaking', String(isBreaking));
    formData.append('isHeadline', String(isHeadline));
    formData.append('isTopstory', String(isTopstory));
    formData.append('isLive', String(isLive));
    formData.append('source_name', sourceName.trim());
    
    if (admin?.name) {
      formData.append('creator', admin.name.trim());
    }
    
    formData.append('published_at', new Date().toISOString());

    if (thumbnail) {
      console.log('Appending thumbnail to FormData:', {
        name: thumbnail.name,
        size: thumbnail.size,
        type: thumbnail.type,
        fieldName: 'image'
      });
      
      formData.append('image', thumbnail);
      
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    } else {
      console.log('No thumbnail selected');
    }

    try {
      console.log('Sending create article request...');
      const result = await createArticle(formData).unwrap();
      console.log('Article created successfully:', result);
      
      notify('Article created successfully', 'success');
      
      const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      setThumbnail(null);
      setThumbnailPreview(null);
      
      setTimeout(() => {
        router.push('/ghanapolitan/articles');
      }, 1500);
      
    } catch (err: any) {
      console.error('Full submission error:', err);
      console.error('Error status:', err?.status);
      console.error('Error data:', err?.data);
      
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('title')) backendErrors.title = error;
          else if (error.toLowerCase().includes('description')) backendErrors.description = error;
          else if (error.toLowerCase().includes('category')) backendErrors.category = error;
          else if (error.toLowerCase().includes('content')) backendErrors.content = error;
          else if (error.toLowerCase().includes('image') || error.toLowerCase().includes('thumbnail')) {
            backendErrors.content = error;
          } else if (error.toLowerCase().includes('section')) {
            if (!backendErrors.content) backendErrors.content = error;
          }
        });
        setErrors(backendErrors);
      }
      
      const errorMessage =
        err?.data?.message ||
        err?.data?.errors?.join(', ') ||
        'Failed to create article. Please try again.';
      notify(errorMessage, 'error');
    }
  };

  const categoryOptions = [
    { id: '', label: 'Select Category' },
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Write a New Article
              </h2>
              {admin && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Article will be authored by: <span className="font-semibold">{admin.name}</span>
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
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="description"
                    placeholder="Brief description or excerpt of the article"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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

          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
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
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
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
            </div>

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
                  onChange={setCategory}
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

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Assign to Section (Optional)
                </label>
                {selectedSection && (
                  <button
                    type="button"
                    onClick={clearSection}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Clear Section
                  </button>
                )}
              </div>
              
              <div className="w-full">
                <SearchDropdown
                  placeholder={initialSectionsLoading ? "Loading sections..." : "Search for a section..."}
                  value={selectedSection}
                  onChange={handleSectionSelect}
                  onSearch={searchSections}
                  defaultResults={defaultSectionOptions}
                  showDefaultOnOpen={true}
                />
              </div>

              {selectedSection && (
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Section Name:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{sectionName}</p>
                    </div>
                    {sectionCode && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Section Code:</span>
                        <p className="text-gray-900 dark:text-gray-100">{sectionCode}</p>
                      </div>
                    )}
                    {sectionSlug && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Section Slug:</span>
                        <p className="text-gray-900 dark:text-gray-100">{sectionSlug}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Article will be assigned to this section
                  </p>
                </div>
              )}
            </div>

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
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              {!admin ? (
                'Please log in to create articles'
              ) : isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <ClipLoader size={16} color="#fff" />
                  Publishing...
                </span>
              ) : (
                'Publish Article'
              )}
            </Button>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}