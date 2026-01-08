'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { 
  useUpdateArticleMutation, 
  useGetArticleByIdQuery 
} from '@/store/features/ghanascore/article/articleAPI';
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
  livescoreTag?: string;
  content?: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const admin = useSelector(selectCurrentAdmin);

  // Use article API
  const { data: articleData, isLoading: isLoadingArticle, error: articleError, refetch } = 
    useGetArticleByIdQuery(articleId, { skip: !articleId });
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Form state
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
  const [isBreaking, setIsBreaking] = useState(false);
  const [isHeadline, setIsHeadline] = useState(false);
  const [isTopstory, setIsTopstory] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [hasLivescore, setHasLivescore] = useState(false);
  const [livescoreTag, setLivescoreTag] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasErrorBeenHandled, setHasErrorBeenHandled] = useState(false);

  // Editor ready state
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Add this useEffect to check editor ref
  useEffect(() => {
    const checkEditorRef = () => {
      if (editorRef.current) {
        console.log('Editor ref methods:', Object.keys(editorRef.current));
        console.log('setContent exists:', typeof editorRef.current.setContent === 'function');
        setIsEditorReady(true);
      }
    };
    
    // Check immediately
    checkEditorRef();
    
    // Keep checking every 500ms for 5 seconds
    const interval = setInterval(checkEditorRef, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Update your editor content useEffect to wait for editor ready
  useEffect(() => {
    if (articleData?.data?.content && editorRef.current && isEditorReady) {
      console.log('Attempting to set content...');
      
      // Try different approaches
      const setContentWithRetry = (retryCount = 0) => {
        if (retryCount > 3) {
          console.error('Failed to set content after 3 retries');
          return;
        }
        
        try {
          // Try the ref method
          if (typeof editorRef.current?.setContent === 'function') {
            const success = editorRef.current.setContent(articleData.data.content);
            if (success) {
              console.log('✅ Content set via ref');
            } else {
              console.warn('setContent returned false, retrying...');
              setTimeout(() => setContentWithRetry(retryCount + 1), 300);
            }
          } else {
            console.error('setContent is not a function on editorRef');
            
            // Alternative: Try to access editor directly
            if (editorRef.current && (editorRef.current as any).editor) {
              const editor = (editorRef.current as any).editor;
              editor.commands.setContent(articleData.data.content);
              console.log('✅ Content set via direct editor access');
            }
          }
        } catch (error) {
          console.error(`Error setting content (attempt ${retryCount + 1}):`, error);
          setTimeout(() => setContentWithRetry(retryCount + 1), 300);
        }
      };
      
      setContentWithRetry();
    }
  }, [articleData, isEditorReady]);

  // Update creator when admin data is available
  useEffect(() => {
    if (admin?.name && !creator) {
      setCreator(admin.name);
    }
  }, [admin, creator]);

  // Pre-fill form with article data when loaded
  useEffect(() => {
    console.log('=== Loading Article Data ===');
    console.log('articleData:', articleData);
    console.log('isInitialized:', isInitialized);
    console.log('hasErrorBeenHandled:', hasErrorBeenHandled);
    
    // Check if we have the article data
    if (articleData && articleData.data && !isInitialized) {
      const article = articleData.data;
      
      console.log('✅ Article loaded successfully:', {
        title: article.title,
        category: article.category,
        tags: article.tags,
        contentExists: !!article.content,
        contentLength: article.content?.length || 0,
        hasLivescore: article.hasLivescore,
        livescoreTag: article.livescoreTag
      });
      
      // 1. Set basic text fields
      setTitle(article.title || '');
      setDescription(article.description || '');
      setLabel(article.label || '');
      
      // 2. Set creator - use article creator or admin name
      const creatorName = article.creator || admin?.name || '';
      setCreator(creatorName);
      
      // 3. Set category (MOST IMPORTANT - check this)
      if (article.category) {
        console.log('Setting category:', article.category);
        setCategory({ id: article.category, label: article.category });
      } else {
        console.warn('⚠️ No category found in article');
      }
      
      // 4. Set subcategory
      if (article.subcategory && Array.isArray(article.subcategory)) {
        if (article.subcategory.length > 0) {
          const subcat = article.subcategory[0];
          console.log('Setting subcategory:', subcat);
          setSelectedSubcategory({ id: subcat, label: subcat });
        }
      }
      
      // 5. Set tags
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
      
      // 6. Set boolean flags - IMPORTANT FIX: Handle livescoreTag properly
      console.log('Setting boolean flags:', {
        isBreaking: article.isBreaking,
        isHeadline: article.isHeadline,
        isTopstory: article.isTopstory,
        isLive: article.isLive,
        hasLivescore: article.hasLivescore,
        livescoreTag: article.livescoreTag
      });
      
      setIsBreaking(!!article.isBreaking);
      setIsHeadline(!!article.isHeadline);
      setIsTopstory(!!article.isTopstory);
      setIsLive(!!article.isLive);
      setHasLivescore(!!article.hasLivescore);
      
      // Only set livescoreTag if hasLivescore is true
      if (article.hasLivescore && article.livescoreTag) {
        setLivescoreTag(article.livescoreTag);
      } else {
        setLivescoreTag(''); // Clear it when hasLivescore is false
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
        
        // Small delay to ensure editor is initialized
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
        }, 500); // Increased delay for editor initialization
      } else {
        console.warn('⚠️ No content found or content is not a string');
      }
      
      // Mark as initialized
      setIsInitialized(true);
      console.log('✅ Form initialized successfully');
      
    } else if (articleData && !isInitialized) {
      // Log what we received
      console.log('❌ Article data structure issue:', {
        hasData: !!articleData,
        hasDataData: !!articleData?.data,
        fullData: articleData
      });
    }
  }, [articleData, admin, isInitialized]);

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
        router.push('/ghanascore/articles');
      }, 2000);
    }
  }, [articleError, hasErrorBeenHandled, articleId, router]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setCurrentImageUrl(null); // Clear current URL when new file is selected
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

    // Validate title
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
      isValid = false;
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      isValid = false;
    }

    // Validate category
    if (!category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    // Validate creator
    if (!creator.trim()) {
      newErrors.creator = 'Creator is required';
      isValid = false;
    } else if (creator.trim().length < 2) {
      newErrors.creator = 'Creator name must be at least 2 characters';
      isValid = false;
    }

    // Validate content
    const editor = editorRef.current;
    if (!editor || !editor.getText().trim()) {
      newErrors.content = 'Article content is required';
      isValid = false;
    } else if (editor.getText().trim().length < 50) {
      newErrors.content = 'Article content must be at least 50 characters';
      isValid = false;
    }

    // Validate livescore tag if hasLivescore is checked
    if (hasLivescore && !livescoreTag.trim()) {
      newErrors.livescoreTag = 'Livescore tag is required when "Has Livescore" is checked';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const debugFormData = (formData: FormData) => {
  console.log('🔍 DEBUG FormData Contents:');
  console.log('=== ALL ENTRIES ===');
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
        isBooleanString: value === 'true' || value === 'false',
        isEmptyString: value === ''
      };
    }
  }
  
  console.table(entries);
  
  // Special check for livescore
  console.log('=== LIVESCORE DEBUG ===');
  const hasLivescoreValue = formData.get('hasLivescore');
  const livescoreTagValue = formData.get('livescoreTag');
  console.log('hasLivescore:', {
    raw: hasLivescoreValue,
    type: typeof hasLivescoreValue,
    stringValue: String(hasLivescoreValue),
    isTrue: hasLivescoreValue === 'true',
    isFalse: hasLivescoreValue === 'false',
    isEmpty: hasLivescoreValue === '' || hasLivescoreValue === null
  });
  console.log('livescoreTag:', {
    raw: livescoreTagValue,
    type: typeof livescoreTagValue,
    stringValue: String(livescoreTagValue),
    isEmpty: livescoreTagValue === '' || livescoreTagValue === null
  });
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Clear previous errors
  setErrors({});

  // Validate form
  if (!validateForm()) {
    // Scroll to first error
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
  
  // Add subcategory if selected
  if (selectedSubcategory) {
    payload.append('subcategory', selectedSubcategory.label.trim());
  }
  
  // Use admin name as creator (with fallback to input value)
  const creatorName = admin?.name || creator.trim();
  payload.append('creator', creatorName);
  
  // Only add label if it has a value
  if (label.trim()) {
    payload.append('label', label.trim());
  }

  // Add tags as comma-separated string
  if (tags.length > 0) {
    payload.append('tags', tags.join(','));
  }

  payload.append('isBreaking', String(isBreaking));
  payload.append('isHeadline', String(isHeadline));
  payload.append('isTopstory', String(isTopstory));
  payload.append('isLive', String(isLive));
  
  // IMPORTANT: Send hasLivescore correctly
  // The issue might be that the backend is not parsing 'false' string correctly
  console.log('🎯 Current state values:');
  console.log('hasLivescore (state):', hasLivescore, 'type:', typeof hasLivescore);
  console.log('livescoreTag (state):', livescoreTag, 'type:', typeof livescoreTag);
  
  // Try different approaches - we'll test which one works
  const approach = 1; // Change this to test different approaches
  
  switch (approach) {
    case 1:
      // Approach 1: Send as boolean strings
      payload.append('hasLivescore', String(hasLivescore));
      if (hasLivescore && livescoreTag.trim()) {
        payload.append('livescoreTag', livescoreTag.trim());
      }
      console.log('Using Approach 1: Send hasLivescore as string');
      break;
      
    case 2:
      // Approach 2: Only send hasLivescore when true
      if (hasLivescore) {
        payload.append('hasLivescore', 'true');
        if (livescoreTag.trim()) {
          payload.append('livescoreTag', livescoreTag.trim());
        }
      }
      console.log('Using Approach 2: Only send when true');
      break;
      
    case 3:
      // Approach 3: Send both always
      payload.append('hasLivescore', String(hasLivescore));
      payload.append('livescoreTag', livescoreTag.trim() || '');
      console.log('Using Approach 3: Always send both');
      break;
      
    case 4:
      // Approach 4: Try with actual boolean (may not work with FormData)
      payload.append('hasLivescore', String(hasLivescore));
      if (hasLivescore) {
        payload.append('livescoreTag', livescoreTag.trim());
      } else {
        // Try not sending livescoreTag at all
        // Don't append it
      }
      console.log('Using Approach 4: Only send livescoreTag when hasLivescore is true');
      break;
  }
  
  payload.append('published_at', new Date().toISOString());
  payload.append('content', htmlContent);

  if (thumbnail) {
    payload.append('image', thumbnail);
  }

  // Debug the FormData
  debugFormData(payload);

  try {
    const result = await updateArticle({
      id: articleId,
      formData: payload
    }).unwrap();
    
    console.log('✅ Update successful:', result);
    
    notify('Article updated successfully', 'success');
    
    // Navigate to articles list after successful update
    setTimeout(() => {
      router.push('/ghanascore/articles');
    }, 1500);
    
  } catch (err: any) {
    console.error('🚨 FULL ERROR DETAILS:', {
      error: err,
      data: err?.data,
      message: err?.message,
      status: err?.status,
      statusText: err?.statusText,
      // Try to get the response text if available
      responseText: err?.originalError?.response?.text || 'No response text'
    });
    
    // Log the exact error message
    if (err?.data?.message) {
      console.log('📝 Error message:', err.data.message);
    }
    if (err?.data?.errors) {
      console.log('📝 Error details:', err.data.errors);
    }
    
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
        else if (error.toLowerCase().includes('creator')) backendErrors.creator = error;
        else if (error.toLowerCase().includes('livescore')) backendErrors.livescoreTag = error;
        else if (error.toLowerCase().includes('content')) backendErrors.content = error;
      });
      setErrors(backendErrors);
    }
    
    notify(errorMessage, 'error');
  }
};

  // Handle input changes with error clearing
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

  const handleLivescoreTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLivescoreTag(e.target.value);
    if (errors.livescoreTag) {
      setErrors(prev => ({ ...prev, livescoreTag: undefined }));
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

  // Add this function
  const testEditorRef = () => {
    console.log('=== Testing Editor Ref ===');
    console.log('editorRef.current:', editorRef.current);
    console.log('Type of editorRef.current:', typeof editorRef.current);
    
    if (editorRef.current) {
      console.log('Available methods:', Object.keys(editorRef.current));
      console.log('setContent is function:', typeof editorRef.current.setContent === 'function');
      console.log('getHTML is function:', typeof editorRef.current.getHTML === 'function');
      
      // Try to call methods
      if (typeof editorRef.current.getHTML === 'function') {
        console.log('Current HTML:', editorRef.current.getHTML());
      }
    } else {
      console.log('editorRef.current is null or undefined');
    }
  };
  
  // Temporary test function - remove after testing
  const testDataLoading = () => {
    console.log('=== MANUAL TEST ===');
    console.log('Current state:');
    console.log('- Title:', title);
    console.log('- Description:', description);
    console.log('- Category:', category);
    console.log('- Tags:', tags);
    console.log('- isBreaking:', isBreaking);
    console.log('- isHeadline:', isHeadline);
    console.log('- isTopstory:', isTopstory);
    console.log('- isLive:', isLive);
    console.log('- hasLivescore:', hasLivescore);
    console.log('- livescoreTag:', livescoreTag);
    
    console.log('From articleData:', {
      title: articleData?.data?.title,
      category: articleData?.data?.category,
      tags: articleData?.data?.tags,
      hasLivescore: articleData?.data?.hasLivescore,
      livescoreTag: articleData?.data?.livescoreTag
    });
  };

  const testSetContent = () => {
    if (editorRef.current && articleData?.data?.content) {
      const content = articleData.data.content;
      console.log('Testing content:', content);
      
      // Method 1: Direct set
      editorRef.current.setContent(content);
      
      // Method 2: Decode first
      const txt = document.createElement('textarea');
      txt.innerHTML = content;
      console.log('Decoded:', txt.value);
      editorRef.current.setContent(txt.value);
    }
  };

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
            onClick={() => router.push('/ghanascore/articles')}
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
        <div className="flex justify-between mb-4">
          <div>
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
          
          {/* Debug buttons - remove after testing */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={testDataLoading}
              variant="outline"
              size="sm"
            >
              Test Data Load
            </Button>
            <Button
              type="button"
              onClick={testSetContent}
              variant="outline"
              size="sm"
            >
              Test Editor
            </Button>
          </div>
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
                    placeholder="Enter article title or heading"
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

              {/* Label */}
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

              {/* Creator - Hidden but still sent in form */}
              <div className="hidden">
                <input
                  type="hidden"
                  name="creator"
                  value={admin?.name || creator}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description *
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    id="description"
                    placeholder="Describe the article"
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

              {/* Content */}
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

          {/* Right Column - Sidebar */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            <Button
              type="button"
              onClick={testEditorRef}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Test Editor Ref
            </Button>

            {/* Thumbnail */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article thumbnail (Optional)
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
                    unoptimized // For blob URLs
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
                Article category *
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

            {/* Subcategory */}
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

            {/* Livescore Section */}
            <div className="w-full space-y-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLivescore}
                  onChange={(e) => setHasLivescore(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Has Livescore?
                </span>
              </label>
              
              {hasLivescore && (
                <div className="space-y-2 ml-6">
                  <label htmlFor="livescoreTag" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Livescore Tag *
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      id="livescoreTag"
                      type="text"
                      placeholder="Enter livescore tag (e.g., match-id, team-names)"
                      value={livescoreTag}
                      onChange={handleLivescoreTagChange}
                      error={!!errors.livescoreTag}
                      aria-describedby="livescoreTag-error"
                    />
                  </div>
                  {errors.livescoreTag && (
                    <p id="livescoreTag-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.livescoreTag}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="w-full space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is Breaking News?
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHeadline}
                  onChange={(e) => setIsHeadline(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is Headline?
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
                  Is Top Story?
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is Live Article?
                </span>
              </label>
            </div>

            {/* Author Information */}
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

            {/* Buttons */}
            <div className="flex gap-3 w-full mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/ghanascore/articles')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingArticle}
                className="flex-1"
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