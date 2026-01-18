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
  'Politics': ['Government', 'Elections', 'Policy', 'International Relations', 'Local Government'],
  'Business': ['Economy', 'Finance', 'Startups', 'Agriculture', 'Trade', 'Investment'],
  'Culture': ['Tradition', 'Festivals', 'Language', 'Customs', 'Heritage'],
  'Lifestyle': ['Family', 'Relationships', 'Wellness', 'Home', 'Personal Development'],
  'Entertainment': ['Movies', 'Music', 'Celebrities', 'Events', 'TV', 'Radio'],
  'Technology': ['Innovation', 'Digital', 'Mobile', 'Internet', 'Startups'],
  'Health': ['Healthcare', 'Fitness', 'Mental Health', 'Nutrition', 'Medical'],
  'Education': ['Schools', 'Universities', 'Research', 'E-Learning', 'Scholarships'],
  'Sports': ['Football', 'Athletics', 'Boxing', 'Basketball', 'Local Sports'],
  'Travel': ['Destinations', 'Tourism', 'Hotels', 'Adventure', 'Local Travel'],
  'Food': ['Recipes', 'Restaurants', 'Local Cuisine', 'Drinks', 'Food Culture'],
  'Fashion': ['Designers', 'Trends', 'Traditional Wear', 'Modern Fashion', 'Accessories'],
  'Arts': ['Visual Arts', 'Performing Arts', 'Literature', 'Crafts', 'Design'],
  'History': ['Ancient History', 'Colonial Era', 'Independence', 'Historical Figures'],
  'Environment': ['Conservation', 'Climate', 'Wildlife', 'Sustainability', 'Agriculture'],
  'Opinion': ['Editorial', 'Commentary', 'Analysis', 'Perspective']
};

interface FormErrors {
  title?: string;
  description?: string;
  creator?: string;
  category?: string;
  content?: string;
}

interface ContentImage {
  file?: File;
  url: string;
  caption: string;
  alt_text: string;
  preview: string;
  order: number;
  isNew?: boolean;
}

interface GraphicFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  subcategory?: string[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  creator: string;
  slug?: string;
  published_at?: string;
}

interface GraphicFiles {
  featured_image?: File;
  content_images?: Array<{
    file: File;
    caption: string;
    alt_text: string;
  }>;
}

const createGraphicFormData = (data: GraphicFormData, files: GraphicFiles, existingGraphic?: any): FormData => {
  const formData = new FormData();
  
  formData.append('title', data.title.trim());
  formData.append('description', data.description.trim());
  formData.append('content', data.content);
  formData.append('category', data.category.trim());
  formData.append('creator', data.creator.trim());
  
  if (data.subcategory && data.subcategory.length > 0) {
    formData.append('subcategory', JSON.stringify(data.subcategory));
  } else if (existingGraphic?.subcategory) {
    formData.append('subcategory', JSON.stringify(existingGraphic.subcategory));
  }
  
  if (data.tags && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  } else if (existingGraphic?.tags) {
    formData.append('tags', JSON.stringify(existingGraphic.tags));
  }
  
  if (data.meta_title) {
    formData.append('meta_title', data.meta_title.trim());
  } else if (existingGraphic?.meta_title) {
    formData.append('meta_title', existingGraphic.meta_title);
  }
  
  if (data.meta_description) {
    formData.append('meta_description', data.meta_description.trim());
  } else if (existingGraphic?.meta_description) {
    formData.append('meta_description', existingGraphic.meta_description);
  }
  
  if (data.slug) {
    formData.append('slug', data.slug.trim());
  } else if (existingGraphic?.slug) {
    formData.append('slug', existingGraphic.slug);
  }
  
  if (data.published_at) {
    formData.append('published_at', data.published_at);
  } else if (existingGraphic?.published_at) {
    formData.append('published_at', existingGraphic.published_at);
  } else {
    formData.append('published_at', new Date().toISOString());
  }
  
  if (files.featured_image) {
    formData.append('featured_image', files.featured_image);
  }
  
  const existingImages = existingGraphic?.content_images?.filter((img: any) => 
    !files.content_images?.some((newImg: any) => newImg.url === img.url)
  ) || [];
  
  if (existingImages.length > 0) {
    formData.append('content_images', JSON.stringify(existingImages.map((img: any) => ({
      url: img.url,
      caption: img.caption || '',
      alt_text: img.alt_text || '',
      order: img.order || 0
    }))));
  }
  
  if (files.content_images && files.content_images.length > 0) {
    files.content_images.forEach((img, index) => {
      formData.append('content_images', img.file);
      formData.append(`content_images[${existingImages.length + index}][caption]`, img.caption || '');
      formData.append(`content_images[${existingImages.length + index}][alt_text]`, img.alt_text || '');
    });
  }
  
  return formData;
};

export default function EditGraphicPage() {
  const router = useRouter();
  const params = useParams();
  const graphicId = params.id as string;
  const { notify } = useNotify();
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
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState<string | null>(null);
  const [contentImages, setContentImages] = useState<ContentImage[]>([]);
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
        setCurrentFeaturedImageUrl(graphic.featured_image_url);
        setFeaturedImagePreview(graphic.featured_image_url);
      }
      
      if (graphic.content_images && Array.isArray(graphic.content_images)) {
        const formattedContentImages: ContentImage[] = graphic.content_images.map((img: any, index: number) => ({
          url: img.url || '',
          caption: img.caption || '',
          alt_text: img.alt_text || '',
          preview: img.url || '',
          order: img.order || index,
          isNew: false
        }));
        setContentImages(formattedContentImages);
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

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setFeaturedImage(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
      setCurrentFeaturedImageUrl(null);
    }
  };

  const handleContentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      const newContentImages: ContentImage[] = files.map((file, index) => ({
        file,
        url: '',
        caption: '',
        alt_text: '',
        preview: URL.createObjectURL(file),
        order: contentImages.length + index,
        isNew: true
      }));
      
      setContentImages([...contentImages, ...newContentImages]);
    }
  };

  const handleContentImageUpdate = (index: number, field: keyof ContentImage, value: string) => {
    const updatedImages = [...contentImages];
    if (field === 'caption' || field === 'alt_text') {
      updatedImages[index] = { ...updatedImages[index], [field]: value };
    }
    setContentImages(updatedImages);
  };

  const removeContentImage = (index: number) => {
    const updatedImages = [...contentImages];
    
    if (updatedImages[index].isNew) {
      URL.revokeObjectURL(updatedImages[index].preview);
    }
    
    updatedImages.splice(index, 1);
    
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    setContentImages(updatedImages);
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
      newErrors.content = 'Graphic content is required';
      isValid = false;
    } else if (editor.getText().trim().length < 50) {
      newErrors.content = 'Graphic content must be at least 50 characters';
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

    const graphicFormData: GraphicFormData = {
      title: title.trim(),
      description: description.trim(),
      content: htmlContent,
      category: category!.label.trim(),
      creator: admin?.name || creator.trim(),
      tags: tags,
      published_at: new Date().toISOString()
    };

    if (selectedSubcategory) {
      graphicFormData.subcategory = [selectedSubcategory.label.trim()];
    }

    const graphicFiles: GraphicFiles = {
      featured_image: featuredImage || undefined,
      content_images: contentImages
        .filter(img => img.isNew && img.file)
        .map(img => ({
          file: img.file!,
          caption: img.caption,
          alt_text: img.alt_text
        }))
    };

    const formData = createGraphicFormData(graphicFormData, graphicFiles, graphicData?.data);

    try {
      await updateGraphic({
        id: graphicId,
        formData: formData
      }).unwrap();
      
      notify('Graphic updated successfully', 'success');
      
      contentImages.forEach(img => {
        if (img.isNew) {
          URL.revokeObjectURL(img.preview);
        }
      });
      
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
                  Tip: You can add images directly in the editor or upload content images in the sidebar.
                </p>
              </div>

              {contentImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Content Images ({contentImages.length})
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      {contentImages.filter(img => img.isNew).length} new
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentImages.map((img, index) => (
                      <div key={index} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3">
                        <div className="relative h-40 w-full mb-3">
                          <Image
                            src={img.preview}
                            alt={img.alt_text || `Content image ${index + 1}`}
                            fill
                            className="object-cover rounded"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeContentImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            ×
                          </button>
                          {img.isNew && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <TextInput
                            type="text"
                            placeholder="Caption (optional)"
                            value={img.caption}
                            onChange={(e) => handleContentImageUpdate(index, 'caption', e.target.value)}
                            className="text-sm"
                          />
                          <TextInput
                            type="text"
                            placeholder="Alt text (optional)"
                            value={img.alt_text}
                            onChange={(e) => handleContentImageUpdate(index, 'alt_text', e.target.value)}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Order: {img.order + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  onChange={handleFeaturedImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="featured-image"
                />
                {featuredImagePreview || currentFeaturedImageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={featuredImagePreview || currentFeaturedImageUrl || ''}
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
              {currentFeaturedImageUrl && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current image will be replaced if you upload a new one
                </p>
              )}
            </div>

            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Add more content images (Optional)
              </label>
              <div className="relative flex items-center justify-center h-32 w-full bg-gray-50 dark:bg-neutral-800 border-2 border-dashed border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleContentImageChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="content-images"
                />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Click to upload more images
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Multiple images allowed
                  </p>
                </div>
              </div>
              {contentImages.filter(img => img.isNew).length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {contentImages.filter(img => img.isNew).length} new image(s) added
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