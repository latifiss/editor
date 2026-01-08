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

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-lg"></div>
});

const categories = [
  'Politics',
  'Sports',
  'Entertainment',
  'Technology',
  'Business',
  'Health',
  'Education',
  'Lifestyle',
  'World News',
  'Local News',
];

const categorySubcategories = {
  'Politics': ['Government', 'Elections', 'Policy', 'International Relations', 'Local Politics'],
  'Sports': ['Football', 'Basketball', 'Athletics', 'Boxing', 'Golf', 'Tennis', 'Rugby', 'Cricket'],
  'Entertainment': ['Movies', 'Music', 'Celebrities', 'TV Shows', 'Events'],
  'Technology': ['AI', 'Software', 'Hardware', 'Startups', 'Gadgets', 'Social Media'],
  'Business': ['Economy', 'Markets', 'Companies', 'Entrepreneurship', 'Finance'],
  'Health': ['Medical', 'Fitness', 'Mental Health', 'Nutrition', 'Healthcare'],
  'Education': ['Schools', 'Universities', 'Research', 'Policy', 'Exams'],
  'Lifestyle': ['Fashion', 'Food', 'Travel', 'Culture', 'Relationships'],
  'World News': ['Africa', 'Europe', 'Asia', 'Americas', 'Middle East'],
  'Local News': ['Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Regional']
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

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const admin = useSelector(selectCurrentAdmin);

  const { data: articleData, isLoading: isLoadingArticle, error: articleError, refetch } = 
    useGetArticleByIdQuery(articleId, { skip: !articleId });
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState(''); // Add this
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
  const [creator, setCreator] = useState(admin?.name || ''); // Add this
  
  const [selectedSection, setSelectedSection] = useState<SectionOption | null>(null);
  const [sectionName, setSectionName] = useState<string>('');
  const [sectionCode, setSectionCode] = useState<string>('');
  const [sectionSlug, setSectionSlug] = useState<string>('');
  const [hasSection, setHasSection] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Add this

  const { data: initialSectionsData, isLoading: initialSectionsLoading } = useGetSectionsQuery({
    page: 1,
    limit: 50,
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

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

  // Check editor ref periodically
  useEffect(() => {
    const checkEditorRef = () => {
      if (editorRef.current) {
        console.log('Editor ref available, setting ready state');
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

  // FIXED: Pre-fill form with article data when loaded
  useEffect(() => {
    console.log('=== Loading Article Data ===');
    console.log('articleData:', articleData);
    
    // Check if we have the article data and haven't initialized yet
    if (articleData?.data?.article && !isInitialized) {
      const article = articleData.data.article;
      
      console.log('✅ Article loaded successfully:', {
        title: article.title,
        category: article.category,
        tags: article.tags,
        label: article.label,
        creator: article.creator,
        contentExists: !!article.content,
        section_name: article.section_name,
        isBreaking: article.isBreaking,
        isTopstory: article.isTopstory
      });
      
      // 1. Set basic text fields
      setTitle(article.title || '');
      setDescription(article.description || '');
      setLabel(article.label || ''); // Set label
      
      // 2. Set creator - use article creator or admin name
      const creatorName = article.creator || admin?.name || '';
      setCreator(creatorName);
      
      // 3. Set source name
      setSourceName(article.source_name || 'Ghanapolitan');
      
      // 4. Set category
      if (article.category) {
        console.log('Setting category:', article.category);
        setCategory({ id: article.category, label: article.category });
      }
      
      // 5. Set subcategories
      if (article.subcategory && Array.isArray(article.subcategory)) {
        console.log('Setting subcategories:', article.subcategory);
        setSelectedSubcategories(article.subcategory);
      }
      
      // 6. Set tags
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
      
      // 7. Set boolean flags
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
      
      // 8. Set section data
      if (article.section_name) {
        console.log('Article has section:', article.section_name);
        setSectionName(article.section_name);
        setHasSection(true);
        
        if (article.section_code) {
          setSectionCode(article.section_code);
        }
        if (article.section_slug) {
          setSectionSlug(article.section_slug);
        }
        
        // Create a section option from article data
        const articleSectionOption: SectionOption = {
          id: article.section_id || 'temp-' + Date.now(),
          label: article.section_name,
          section_id: article.section_id || 'temp-' + Date.now(),
          section_name: article.section_name,
          section_code: article.section_code || '',
          section_slug: article.section_slug || '',
        };
        
        console.log('Created section option from article:', articleSectionOption);
        setSelectedSection(articleSectionOption);
      }
      
      // 9. Set image
      if (article.image_url) {
        console.log('Setting image URL:', article.image_url);
        setCurrentImageUrl(article.image_url);
        setThumbnailPreview(article.image_url);
      }
      
      // 10. Set editor content with delay
      if (article.content && typeof article.content === 'string') {
        console.log('Article content found, length:', article.content.length);
        
        // Use a more robust approach for setting content
        const setContentWithRetry = (retryCount = 0) => {
          if (retryCount > 5) {
            console.error('Failed to set content after 5 retries');
            return;
          }
          
          if (editorRef.current && isEditorReady) {
            try {
              console.log('Attempting to set content (attempt', retryCount + 1, ')');
              const success = editorRef.current.setContent(article.content);
              if (success) {
                console.log('✅ Editor content set successfully');
              } else {
                console.warn('setContent returned false, retrying...');
                setTimeout(() => setContentWithRetry(retryCount + 1), 300);
              }
            } catch (error) {
              console.error('Error setting content:', error);
              setTimeout(() => setContentWithRetry(retryCount + 1), 300);
            }
          } else {
            console.log('Editor not ready yet, retrying...');
            setTimeout(() => setContentWithRetry(retryCount + 1), 300);
          }
        };
        
        // Start the retry process
        setContentWithRetry();
      }
      
      // Mark as initialized to prevent re-running
      setIsInitialized(true);
      console.log('✅ Form initialized successfully');
    }
  }, [articleData, isEditorReady, admin, isInitialized]); // Add isInitialized to dependencies

  // Add initialization flag check to prevent re-initialization
  useEffect(() => {
    // If no article data after a while, mark as initialized anyway
    if (!articleData && !isInitialized) {
      const timer = setTimeout(() => {
        console.log('No article data, marking as initialized');
        setIsInitialized(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [articleData, isInitialized]);

  // Try to match section with loaded sections
  useEffect(() => {
    if (selectedSection && initialSectionsData?.data?.sections && isInitialized) {
      console.log('Trying to match section with loaded sections');
      
      const matchingSection = initialSectionsData.data.sections.find(
        (section: any) => 
          section.section_name === selectedSection.section_name
      );
      
      if (matchingSection) {
        const sectionOption: SectionOption = {
          id: matchingSection._id,
          label: matchingSection.section_name,
          section_id: matchingSection._id,
          section_name: matchingSection.section_name,
          section_code: matchingSection.section_code || '',
          section_slug: matchingSection.section_slug || '',
        };
        console.log('Found matching section:', sectionOption);
        setSelectedSection(sectionOption);
      }
    }
  }, [initialSectionsData, selectedSection, isInitialized]);

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      const subs = categorySubcategories[category.label as keyof typeof categorySubcategories] || [];
      setSubcategories(subs);
      console.log('Subcategories updated for category:', category.label, subs);
    } else {
      setSubcategories([]);
    }
  }, [category]);

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
    
    // Add label if it has value
    if (label.trim()) {
      formData.append('label', label.trim());
    }
    
    // Add creator
    const creatorName = admin?.name || creator.trim();
    formData.append('creator', creatorName);
    
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
      formData.append('section_name', '');
      formData.append('section_code', '');
      formData.append('section_slug', '');
    }
    
    formData.append('isBreaking', String(isBreaking));
    formData.append('isHeadline', String(isHeadline));
    formData.append('isTopstory', String(isTopstory));
    formData.append('isLive', String(isLive));
    formData.append('source_name', sourceName.trim());
    
    if (admin?.name) {
      formData.append('updatedBy', admin.name.trim());
    }
    
    if (thumbnail) {
      formData.append('image', thumbnail);
    }

    try {
      await updateArticle({
        id: articleId,
        formData: formData
      }).unwrap();
      notify('Article updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanapolitan/articles');
      }, 1500);
      
    } catch (err: any) {
      console.error('Update error:', err);
      
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('title')) backendErrors.title = error;
          else if (error.toLowerCase().includes('description')) backendErrors.description = error;
          else if (error.toLowerCase().includes('category')) backendErrors.category = error;
          else if (error.toLowerCase().includes('content')) backendErrors.content = error;
          else if (error.toLowerCase().includes('section')) {
            if (!backendErrors.content) backendErrors.content = error;
          }
        });
        setErrors(backendErrors);
      }
      
      const errorMessage =
        err?.data?.message ||
        err?.data?.errors?.join(', ') ||
        'Failed to update article. Please try again.';
      notify(errorMessage, 'error');
    }
  };

  const categoryOptions = [
    { id: '', label: 'Select Category' },
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  // Debug function
  const testDataLoading = () => {
    console.log('=== CURRENT STATE ===');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Label:', label);
    console.log('Creator:', creator);
    console.log('Category:', category);
    console.log('Subcategories:', selectedSubcategories);
    console.log('Tags:', tags);
    console.log('isBreaking:', isBreaking);
    console.log('isHeadline:', isHeadline);
    console.log('isTopstory:', isTopstory);
    console.log('isLive:', isLive);
    console.log('Source:', sourceName);
    console.log('Section:', selectedSection);
    console.log('Is Initialized:', isInitialized);
    console.log('Article data:', articleData?.data?.article);
  };

  // Show loading state
  if (isLoadingArticle && !articleData?.data?.article) {
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
  if (articleError) {
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

  const article = articleData?.data?.article;

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit Article
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Editing: <span className="font-semibold">{article?.title || 'Article'}</span>
            </p>
            {admin && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Article updated by: <span className="font-semibold">{admin.name}</span>
              </p>
            )}
          </div>
          
          {/* Debug button */}
          <Button
            type="button"
            onClick={testDataLoading}
            variant="outline"
            size="sm"
          >
            Test Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full space-y-6">
              {/* Add Label field */}
              <div className="space-y-2">
                <label htmlFor="label" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Label (Optional)
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    id="label"
                    type="text"
                    placeholder="Example: State Of The Nation Address"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

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
                Featured Image
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
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Click to upload or change image
                    </p>
                    {currentImageUrl && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Current image will be replaced
                      </p>
                    )}
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
                Article Information
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${article?.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {article?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Views:</span> {article?.views || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Author:</span> {admin?.name || article?.creator || 'Not logged in'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Last Updated:</span> {article?.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

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