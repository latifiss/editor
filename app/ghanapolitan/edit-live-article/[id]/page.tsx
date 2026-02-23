'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
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
import { LiveArticleContent } from '@/store/features/ghanapolitan/articles/articleTypes';
import { v4 as uuidv4 } from 'uuid';
import { Clock, AlertCircle, Flag, Key, ArrowUp, ArrowDown, X, Plus } from 'lucide-react';

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { ssr: false });

// Categories for Ghanapolitan
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

// Subcategories mapping
const categorySubcategories: Record<string, string[]> = {
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

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
}

interface LiveUpdateForm {
  id: string;
  content_title: string;
  content_description: string;
  content_detail: string;
  isKey: boolean;
  content_image_url?: string;
  content_published_at: string;
}

export default function EditLiveArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { notify } = useNotify();
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
  const [isLive, setIsLive] = useState(true); // Always true for live articles
  const [sourceName, setSourceName] = useState('Ghanapolitan');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasErrorBeenHandled, setHasErrorBeenHandled] = useState(false);

  // Live updates state
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdateForm[]>([]);
  const [newUpdate, setNewUpdate] = useState<Omit<LiveUpdateForm, 'id' | 'content_published_at'>>({
    content_title: '',
    content_description: '',
    content_detail: '',
    isKey: false,
  });
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null);
  const [updateEditorRef] = useState(() => React.createRef<TiptapEditorRef>());

  // Pre-fill form with article data when loaded
  useEffect(() => {
    console.log('=== Loading Live Article Data ===');
    
    if (articleData?.data && !isInitialized) {
      const article = articleData.data;
      
      console.log('✅ Live Article loaded successfully:', {
        title: article.title,
        isLive: article.isLive,
        contentType: typeof article.content,
        contentIsArray: Array.isArray(article.content)
      });
      
      // Set basic fields
      setTitle(article.title || '');
      setDescription(article.description || '');
      
      if (article.category) {
        setCategory({ id: article.category, label: article.category });
      }
      
      if (article.subcategory && Array.isArray(article.subcategory) && article.subcategory.length > 0) {
        setSelectedSubcategories(article.subcategory);
      }
      
      if (article.tags) {
        if (Array.isArray(article.tags)) {
          setTags(article.tags);
        } else if (typeof article.tags === 'string') {
          const tagArray = article.tags.split(',').map(t => t.trim()).filter(t => t);
          setTags(tagArray);
        }
      }
      
      setIsBreaking(!!article.isBreaking);
      setIsHeadline(!!article.isHeadline);
      setIsTopstory(!!article.isTopstory);
      setIsLive(true); // Force live for live article editor
      
      if (article.source_name) {
        setSourceName(article.source_name);
      }
      
      if (article.image_url) {
        setCurrentImageUrl(article.image_url);
        setThumbnailPreview(article.image_url);
      }
      
      // Handle live article content
      let parsedContent: LiveArticleContent[] = [];
      
      try {
        if (article.content) {
          if (Array.isArray(article.content)) {
            // Already an array (LiveArticleContent[])
            parsedContent = article.content;
          } else if (typeof article.content === 'string') {
            // Try to parse as JSON string
            const trimmedContent = article.content.trim();
            if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
              parsedContent = JSON.parse(trimmedContent);
            } else if (trimmedContent.startsWith('{')) {
              // Single object wrapped in array
              parsedContent = [JSON.parse(trimmedContent)];
            } else {
              // Regular string content - convert to live update
              parsedContent = [{
                content_title: article.title || 'Initial Update',
                content_description: article.description || '',
                content_detail: article.content,
                isKey: true,
                content_published_at: article.published_at || new Date().toISOString(),
              }];
            }
          }
        }
      } catch (error) {
        console.error('Error parsing content:', error);
        // Fallback: Convert string content to live update
        if (typeof article.content === 'string') {
          parsedContent = [{
            content_title: article.title || 'Initial Update',
            content_description: article.description || '',
            content_detail: article.content,
            isKey: true,
            content_published_at: article.published_at || new Date().toISOString(),
          }];
        }
      }
      
      // Convert to LiveUpdateForm with unique IDs
      const updates: LiveUpdateForm[] = parsedContent.map((content: any, index) => ({
        id: uuidv4(),
        content_title: content.content_title || `Update ${index + 1}`,
        content_description: content.content_description || '',
        content_detail: content.content_detail || content.content || '',
        isKey: content.isKey || false,
        content_image_url: content.content_image_url,
        content_published_at: content.content_published_at || content.published_at || new Date().toISOString(),
      }));
      
      setLiveUpdates(updates);
      setIsInitialized(true);
      console.log(`✅ Live Article form initialized successfully with ${updates.length} updates`);
    }
  }, [articleData, isInitialized]);

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
      notify('Failed to load live article. Please try again.', 'error');
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

  // Live update handlers
  const handleAddUpdate = () => {
    if (!newUpdate.content_title.trim() || !newUpdate.content_detail.trim()) {
      notify('Please provide a title and content for the update', 'error');
      return;
    }

    const newLiveUpdate: LiveUpdateForm = {
      id: uuidv4(),
      ...newUpdate,
      content_published_at: new Date().toISOString(),
    };

    setLiveUpdates([...liveUpdates, newLiveUpdate]);
    
    // Reset form
    setNewUpdate({
      content_title: '',
      content_description: '',
      content_detail: '',
      isKey: false,
    });
    setUpdateImage(null);
    setUpdateImagePreview(null);
    
    notify('Live update added successfully', 'success');
  };

  const handleRemoveUpdate = (id: string) => {
    setLiveUpdates(liveUpdates.filter(update => update.id !== id));
  };

  const handleMoveUpdate = (id: string, direction: 'up' | 'down') => {
    const index = liveUpdates.findIndex(update => update.id === id);
    if (index === -1) return;

    const newUpdates = [...liveUpdates];
    if (direction === 'up' && index > 0) {
      [newUpdates[index], newUpdates[index - 1]] = [newUpdates[index - 1], newUpdates[index]];
    } else if (direction === 'down' && index < newUpdates.length - 1) {
      [newUpdates[index], newUpdates[index + 1]] = [newUpdates[index + 1], newUpdates[index]];
    }
    setLiveUpdates(newUpdates);
  };

  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpdateImage(file);
      setUpdateImagePreview(URL.createObjectURL(file));
    }
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

    if (liveUpdates.length === 0) {
      notify('At least one live update is required', 'error');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const prepareLiveContent = (): LiveArticleContent[] => {
    return liveUpdates.map(update => ({
      content_title: update.content_title,
      content_description: update.content_description,
      content_detail: update.content_detail,
      isKey: update.isKey,
      content_published_at: update.content_published_at,
    }));
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
      return;
    }

    const liveContent = prepareLiveContent();
    console.log('Live content prepared:', liveContent);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category!.label.trim());
    
    // Send JSON string for LiveArticleContent array
    formData.append('content', JSON.stringify(liveContent));
    
    // Also send keyEvents separately if needed
    const keyEvents = liveContent.filter(update => update.isKey);
    if (keyEvents.length > 0) {
      formData.append('keyEvents', JSON.stringify(keyEvents));
    }
    
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
    formData.append('isLive', 'true'); // Always true for live articles
    formData.append('source_name', sourceName.trim());
    
    // Use admin name as creator
    if (admin?.name) {
      formData.append('creator', admin.name.trim());
    }
    
    if (thumbnail) {
      formData.append('image', thumbnail);
    }

    // Debug the payload
    console.log('Submitting Live Article FormData:');
    for (const [key, value] of formData.entries()) {
      if (key === 'content') {
        console.log(`${key}:`, typeof value, 'length:', value.toString().length);
      } else {
        console.log(`${key}:`, value);
      }
    }

    try {
      const result = await updateArticle({
        id: articleId,
        formData: formData
      }).unwrap();
      
      console.log('✅ Live article update successful:', result);
      
      notify('Live article updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanapolitan/articles');
      }, 1500);
      
    } catch (err: any) {
      console.error('🚨 Update error:', err);
      
      let errorMessage = 'Failed to update live article. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors.join(', ');
        
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('title')) backendErrors.title = error;
          else if (error.toLowerCase().includes('description')) backendErrors.description = error;
          else if (error.toLowerCase().includes('category')) backendErrors.category = error;
        });
        setErrors(backendErrors);
      }
      
      notify(errorMessage, 'error');
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
          <ClipLoader size={40} color="#059669" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading live article...</p>
        </div>
      </div>
    );
  }

  // Show error state if article not found
  if (articleError && hasErrorBeenHandled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Live article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The live article you're trying to edit doesn't exist.</p>
          <Button
            onClick={() => router.push('/ghanapolitan/articles')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Live Article
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Editing live article: <span className="font-semibold">{title || 'Article'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium rounded-full">
              <Clock size={14} />
              LIVE COVERAGE
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {liveUpdates.length} update{liveUpdates.length !== 1 ? 's' : ''} • Real-time reporting
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          {/* Left Column - Live Updates */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full space-y-6">
              {/* Live Updates List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Clock size={18} />
                    Live Updates ({liveUpdates.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={() => {
                      document.getElementById('add-update-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add New Update
                  </Button>
                </div>

                {liveUpdates.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No live updates yet. Add your first update below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveUpdates.map((update, index) => (
                      <div 
                        key={update.id} 
                        className={`p-4 border rounded-lg relative ${
                          update.isKey 
                            ? 'border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20' 
                            : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800'
                        }`}
                      >
                        {update.isKey && (
                          <div className="absolute -top-2 -left-2">
                            <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded">
                                <Clock size={10} />
                                Update {index + 1}
                              </span>
                              {update.isKey && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded">
                                  <Flag size={10} />
                                  Key Event
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(update.content_published_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {update.content_title}
                            </h4>
                            
                            {update.content_description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {update.content_description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-3">
                            <button
                              type="button"
                              onClick={() => handleMoveUpdate(update.id, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveUpdate(update.id, 'down')}
                              disabled={index === liveUpdates.length - 1}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveUpdate(update.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Remove update"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {update.content_detail && (
                          <div className="mt-3 p-3 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg">
                            <div className="prose prose-sm max-w-none dark:prose-invert" 
                                 dangerouslySetInnerHTML={{ __html: update.content_detail }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Update Form */}
              <div id="add-update-form" className="space-y-4 p-4 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Plus size={18} />
                  Add New Live Update
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Update Title *
                    </label>
                    <TextInput
                      type="text"
                      placeholder="e.g., 'Breaking Development', 'New Information', 'Update'"
                      value={newUpdate.content_title}
                      onChange={(e) => setNewUpdate({...newUpdate, content_title: e.target.value})}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Brief Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Brief summary of this update"
                      value={newUpdate.content_description}
                      onChange={(e) => setNewUpdate({...newUpdate, content_description: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Update Content *
                    </label>
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                      <TiptapEditorDynamic
                        ref={updateEditorRef}
                        output="html"
                        minHeight={200}
                        placeholder={{
                          paragraph: "Type the detailed content for this live update...",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (updateEditorRef.current) {
                          const content = updateEditorRef.current.getHTML();
                          setNewUpdate({...newUpdate, content_detail: content});
                        }
                      }}
                      className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      Save content from editor
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUpdate.isKey}
                        onChange={(e) => setNewUpdate({...newUpdate, isKey: e.target.checked})}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Key size={14} />
                        Mark as Key Event
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Update Image (Optional)
                    </label>
                    <div className="relative flex items-center justify-center h-[120px] w-full bg-gray-50 dark:bg-neutral-800 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpdateImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {updateImagePreview ? (
                        <Image
                          src={updateImagePreview}
                          alt="Update Image Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tap to upload image for this update
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddUpdate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!newUpdate.content_title.trim() || !newUpdate.content_detail.trim()}
                  >
                    <Plus size={16} />
                    Add Live Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Article Metadata */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            {/* Article Title */}
            <div className="w-full space-y-2">
              <label htmlFor="title" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Live Article Title *
              </label>
              <div className="w-full [&>div]:!w-full">
                <Textarea
                  id="title"
                  placeholder="Main article title (e.g., 'Live: Breaking News Coverage')"
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

            {/* Description */}
            <div className="w-full space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article Description *
              </label>
              <div className="w-full [&>div]:!w-full">
                <Textarea
                  id="description"
                  placeholder="Overall description of the live coverage"
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

            {/* Source Name */}
            <div className="w-full space-y-2">
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
                    value={`${title.substring(0, 60)}${title.length > 60 ? '...' : ''} | Ghanapolitan Live`}
                    disabled
                    className="bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-generated: Title + " | Ghanapolitan Live"
                </p>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Featured Image (Optional)
              </label>
              <div className="relative flex items-center justify-center h-[180px] w-full bg-gray-50 dark:bg-neutral-800 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden">
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
                    alt="Featured Image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Upload featured image
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="w-full space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Category *
              </label>
              <div className="w-full [&>div]:!w-full">
                <SelectDropdown
                  id="category"
                  options={categoryOptions}
                  placeholder="Select Category"
                  value={category}
                  onChange={setCategory}
                  error={!!errors.category}
                />
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
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
                  disabled
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Live Article <span className="text-xs text-gray-500">(always on for live articles)</span>
                </span>
              </label>
            </div>

            {/* Author Info */}
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

            {/* Article Details */}
            <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Live Article Details
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Updates Count:</span> {liveUpdates.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Key Events:</span> {liveUpdates.filter(u => u.isKey).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Created:</span> {articleData?.data?.createdAt ? new Date(articleData.data.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Last Published:</span> {articleData?.data?.published_at ? new Date(articleData.data.published_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="w-full">
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingArticle || liveUpdates.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClipLoader size={16} color="#fff" />
                    Updating Live Article...
                  </span>
                ) : (
                  'Update Live Article'
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                This will save all live updates and keep the article in live mode
              </p>
            </div>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}