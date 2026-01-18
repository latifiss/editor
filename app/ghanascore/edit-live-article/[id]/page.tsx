'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { categorySubcategories } from '@/categorySubcategories';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { LiveArticleContent } from '@/store/features/ghanascore/articleTypes';
import { v4 as uuidv4 } from 'uuid';

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

  const { data: articleData, isLoading: isLoadingArticle, error: articleError } = 
    useGetArticleByIdQuery(articleId, { skip: !articleId });
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

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
  const [isLive] = useState(true);
  const [hasLivescore, setHasLivescore] = useState(false);
  const [livescoreTag, setLivescoreTag] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasErrorBeenHandled, setHasErrorBeenHandled] = useState(false);

  const [liveUpdates, setLiveUpdates] = useState<LiveUpdateForm[]>([]);
  const [newUpdate, setNewUpdate] = useState<Omit<LiveUpdateForm, 'id' | 'content_published_at'>>({
    content_title: '',
    content_description: '',
    content_detail: '',
    isKey: false,
  });
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (articleData && articleData.data && !isInitialized) {
      const article = articleData.data;
      
      setTitle(article.title || '');
      setDescription(article.description || '');
      setLabel(article.label || '');
      
      const creatorName = article.creator || admin?.name || '';
      setCreator(creatorName);
      
      if (article.category) {
        setCategory({ id: article.category, label: article.category });
      }
      
      if (article.subcategory && Array.isArray(article.subcategory) && article.subcategory.length > 0) {
        const subcat = article.subcategory[0];
        setSelectedSubcategory({ id: subcat, label: subcat });
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
      setIsLive(true);
      setHasLivescore(!!article.hasLivescore);
      
      if (article.hasLivescore && article.livescoreTag) {
        setLivescoreTag(article.livescoreTag);
      } else {
        setLivescoreTag('');
      }
      
      if (article.image_url) {
        setCurrentImageUrl(article.image_url);
        setThumbnailPreview(article.image_url);
      }
      
      let parsedContent: LiveArticleContent[] = [];
      
      try {
        if (article.content) {
          if (Array.isArray(article.content)) {
            parsedContent = article.content;
          } else if (typeof article.content === 'string') {
            const trimmedContent = article.content.trim();
            if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
              parsedContent = JSON.parse(trimmedContent);
            } else if (trimmedContent.startsWith('{')) {
              parsedContent = [JSON.parse(trimmedContent)];
            } else {
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
      
      if (article.keyEvents && Array.isArray(article.keyEvents)) {
        parsedContent = [...parsedContent, ...article.keyEvents];
      }
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
    }
  }, [articleData, admin, isInitialized]);

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
    if (articleError && !hasErrorBeenHandled && articleId) {
      notify('Failed to load article. Please try again.', 'error');
      setHasErrorBeenHandled(true);
      
      setTimeout(() => {
        router.push('/ghanascore/articles');
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
    
    setNewUpdate({
      content_title: '',
      content_description: '',
      content_detail: '',
      isKey: false,
    });
    setUpdateImage(null);
    setUpdateImagePreview(null);
    
    notify('Update added successfully', 'success');
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

    if (!creator.trim()) {
      newErrors.creator = 'Creator is required';
      isValid = false;
    } else if (creator.trim().length < 2) {
      newErrors.creator = 'Creator name must be at least 2 characters';
      isValid = false;
    }

    if (liveUpdates.length === 0) {
      notify('At least one live update is required', 'error');
      isValid = false;
    }

    if (hasLivescore && !livescoreTag.trim()) {
      newErrors.livescoreTag = 'Livescore tag is required when "Has Livescore" is checked';
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

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('description', description.trim());
    payload.append('category', category!.label.trim());
    
    payload.append('content', JSON.stringify(liveContent));
    
    const keyEvents = liveContent.filter(update => update.isKey);
    if (keyEvents.length > 0) {
      payload.append('keyEvents', JSON.stringify(keyEvents));
    }
    
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

    payload.append('isBreaking', String(isBreaking));
    payload.append('isHeadline', String(isHeadline));
    payload.append('isTopstory', String(isTopstory));
    payload.append('isLive', 'true');
    
    payload.append('hasLivescore', String(hasLivescore));
    if (hasLivescore && livescoreTag.trim()) {
      payload.append('livescoreTag', livescoreTag.trim());
    }
    
    payload.append('published_at', new Date().toISOString());

    if (thumbnail) {
      payload.append('image', thumbnail);
    }

    try {
      await updateArticle({
        id: articleId,
        formData: payload
      }).unwrap();
      
      notify('Live article updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanascore/articles');
      }, 1500);
      
    } catch (err: any) {
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
          else if (error.toLowerCase().includes('creator')) backendErrors.creator = error;
          else if (error.toLowerCase().includes('livescore')) backendErrors.livescoreTag = error;
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

  if (isLoadingArticle && !articleData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading live article...</p>
        </div>
      </div>
    );
  }

  if (articleError && hasErrorBeenHandled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Live article not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The live article you're trying to edit doesn't exist.</p>
          <Link href="/ghanascore/articles">
            <Button className="mt-4">
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Live Article
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Editing live article: <span className="font-semibold">{title || 'Article'}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
              LIVE ARTICLE
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {liveUpdates.length} update{liveUpdates.length !== 1 ? 's' : ''} • Real-time updates enabled
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Live Updates ({liveUpdates.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={() => {
                      document.getElementById('add-update-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Add New Update
                  </Button>
                </div>

                {liveUpdates.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No updates yet. Add your first update below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveUpdates.map((update, index) => (
                      <div 
                        key={update.id} 
                        className={`p-4 border rounded-lg ${
                          update.isKey 
                            ? 'border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' 
                            : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Update {index + 1}
                              </span>
                              {update.isKey && (
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                                  Key Event
                                </span>
                              )}
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(update.content_published_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">
                              {update.content_title}
                            </h4>
                            {update.content_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {update.content_description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              type="button"
                              onClick={() => handleMoveUpdate(update.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveUpdate(update.id, 'down')}
                              disabled={index === liveUpdates.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveUpdate(update.id)}
                              className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Remove update"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div dangerouslySetInnerHTML={{ __html: update.content_detail }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div id="add-update-form" className="space-y-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Add New Update</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Update Title *
                    </label>
                    <TextInput
                      type="text"
                      placeholder="e.g., 'GOAL!', 'Red Card', 'Half-time Update'"
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
                    <Textarea
                      placeholder="Full details of this update..."
                      value={newUpdate.content_detail}
                      onChange={(e) => setNewUpdate({...newUpdate, content_detail: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUpdate.isKey}
                        onChange={(e) => setNewUpdate({...newUpdate, isKey: e.target.checked})}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="w-full"
                    disabled={!newUpdate.content_title.trim() || !newUpdate.content_detail.trim()}
                  >
                    Add Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6 space-y-6">
            <div className="w-full space-y-2">
              <label htmlFor="title" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article Title *
              </label>
              <div className="w-full [&>div]:!w-full">
                <Textarea
                  id="title"
                  placeholder="Main article title (e.g., 'Live: Manchester United vs Chelsea')"
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

            <div className="w-full space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article Description *
              </label>
              <div className="w-full [&>div]:!w-full">
                <Textarea
                  id="description"
                  placeholder="Overall description of the live event"
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
                  onChange={handleCategoryChange}
                  error={!!errors.category}
                />
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="w-full space-y-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLivescore}
                  onChange={(e) => setHasLivescore(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Has Livescore Integration?
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
                      placeholder="Enter livescore identifier"
                      value={livescoreTag}
                      onChange={handleLivescoreTagChange}
                      error={!!errors.livescoreTag}
                    />
                  </div>
                  {errors.livescoreTag && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.livescoreTag}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="w-full space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
              </div>
            </div>

            <div className="w-full">
              <Button
                type="submit"
                disabled={isUpdating || !admin || isLoadingArticle || liveUpdates.length === 0}
                className="w-full"
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
                This will save all updates and keep the article in live mode
              </p>
            </div>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}