'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { 
  useUpdateSectionMutation, 
  useGetSectionByIdQuery 
} from '@/store/features/ghanapolitan/section/sectionApi';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import { SelectDropdown } from '@/components/ui/inputs/dropdown';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import { selectCurrentAdmin } from '@/store/features/auth/authSlice';
import { Tag, Hash, Palette, Info, Calendar } from 'lucide-react';

const sectionCategories = [
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

const colorOptions = [
  { id: 'blue', label: 'Blue', value: '#3B82F6' },
  { id: 'green', label: 'Green', value: '#10B981' },
  { id: 'red', label: 'Red', value: '#EF4444' },
  { id: 'yellow', label: 'Yellow', value: '#F59E0B' },
  { id: 'purple', label: 'Purple', value: '#8B5CF6' },
  { id: 'pink', label: 'Pink', value: '#EC4899' },
  { id: 'indigo', label: 'Indigo', value: '#6366F1' },
  { id: 'gray', label: 'Gray', value: '#6B7280' },
  { id: 'emerald', label: 'Emerald', value: '#059669' },
  { id: 'cyan', label: 'Cyan', value: '#06B6D4' },
];

const expirationPresets = [
  { id: 'none', label: 'No Expiration', value: null, days: null },
  { id: '7days', label: '7 Days', value: 7, days: 7 },
  { id: '14days', label: '14 Days', value: 14, days: 14 },
  { id: '30days', label: '30 Days', value: 30, days: 30 },
  { id: '90days', label: '90 Days', value: 90, days: 90 },
  { id: '180days', label: '180 Days', value: 180, days: 180 },
  { id: '1year', label: '1 Year', value: 365, days: 365 },
  { id: 'custom', label: 'Custom Date', value: 'custom', days: null },
];

interface FormErrors {
  section_name?: string;
  section_code?: string;
  section_slug?: string;
  expires_at?: string;
}

export default function EditSectionPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = params.id as string;
  const { notify } = useNotify();
  const admin = useSelector(selectCurrentAdmin);

  const { data: sectionData, isLoading: isLoadingSection, error: sectionError, refetch } = 
    useGetSectionByIdQuery(sectionId, { skip: !sectionId });
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation();

  const [sectionName, setSectionName] = useState('');
  const [sectionCode, setSectionCode] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [category, setCategory] = useState<{ id: string; label: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isSectionImportant, setIsSectionImportant] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const [expirationPreset, setExpirationPreset] = useState<{ id: string; label: string; value: number | string | null; days: number | null } | null>(null);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const [sectionImage, setSectionImage] = useState<File | null>(null);
  const [sectionImagePreview, setSectionImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  const [sectionColor, setSectionColor] = useState<string>(colorOptions[0].value);
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState<string>('#000000');
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (sectionData?.data?.section && !isInitialized) {
      const section = sectionData.data.section;
      
      setSectionName(section.section_name || '');
      setSectionCode(section.section_code || '');
      setSectionSlug(section.section_slug || '');
      setSectionDescription(section.section_description || '');
      
      if (section.category) {
        setCategory({ id: section.category, label: section.category });
      }
      
      if (section.tags && Array.isArray(section.tags)) {
        setTags(section.tags);
      }
      
      setDisplayOrder(section.displayOrder || 0);
      setIsSectionImportant(section.isSectionImportant || false);
      setIsActive(section.isActive !== undefined ? section.isActive : true);
      setSectionColor(section.section_color || colorOptions[0].value);
      setBackgroundColor(section.section_background_color || '');
      setMetaTitle(section.meta_title || '');
      setMetaDescription(section.meta_description || '');
      
      if (section.expires_at) {
        const expDate = new Date(section.expires_at);
        setExpirationDate(expDate.toISOString().split('T')[0]);
        
        const now = new Date();
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const matchingPreset = expirationPresets.find(preset => 
          preset.days && Math.abs(preset.days - diffDays) <= 2
        );
        
        if (matchingPreset) {
          setExpirationPreset(matchingPreset);
        } else {
          setExpirationPreset(expirationPresets.find(p => p.id === 'custom') || null);
          setShowCustomDate(true);
        }
      } else {
        setExpirationPreset(expirationPresets[0]); 
      }
      
      if (section.section_image_url) {
        setCurrentImageUrl(section.section_image_url);
        setSectionImagePreview(section.section_image_url);
      }
      
      setIsInitialized(true);
    }
  }, [sectionData, isInitialized]);

  useEffect(() => {
    if (expirationPreset?.id === 'custom') {
      setShowCustomDate(true);
      if (!expirationDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setExpirationDate(tomorrow.toISOString().split('T')[0]);
      }
    } else if (expirationPreset?.days) {
      setShowCustomDate(false);
      const date = new Date();
      date.setDate(date.getDate() + expirationPreset.days);
      setExpirationDate(date.toISOString().split('T')[0]);
    } else if (expirationPreset?.id === 'none') {
      setShowCustomDate(false);
      setExpirationDate('');
    }
  }, [expirationPreset, expirationDate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSectionImage(file);
      setSectionImagePreview(URL.createObjectURL(file));
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

  const handleColorChange = (colorValue: string) => {
    setSectionColor(colorValue);
    setShowCustomColor(false);
  };

  const getExpirationStatus = () => {
    if (!expirationDate) return { status: 'No expiration', color: 'text-gray-500' };
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { status: 'Expired', color: 'text-red-600' };
    if (diffDays <= 7) return { status: 'Expires soon', color: 'text-yellow-600' };
    return { status: `Expires in ${diffDays} days`, color: 'text-green-600' };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!sectionName.trim()) {
      newErrors.section_name = 'Section name is required';
      isValid = false;
    } else if (sectionName.trim().length < 3) {
      newErrors.section_name = 'Section name must be at least 3 characters';
      isValid = false;
    }

    if (!sectionCode.trim()) {
      newErrors.section_code = 'Section code is required';
      isValid = false;
    } else if (sectionCode.trim().length < 2) {
      newErrors.section_code = 'Section code must be at least 2 characters';
      isValid = false;
    }

    if (!sectionSlug.trim()) {
      newErrors.section_slug = 'Section slug is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(sectionSlug)) {
      newErrors.section_slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      isValid = false;
    }

    if (expirationDate) {
      const selectedDate = new Date(expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expires_at = 'Expiration date cannot be in the past';
        isValid = false;
      }
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

    const formData = new FormData();
    
    formData.append('section_name', sectionName.trim());
    formData.append('section_code', sectionCode.trim().toUpperCase());
    formData.append('section_slug', sectionSlug.trim());
    
    if (sectionDescription) {
      formData.append('section_description', sectionDescription.trim());
    }
    
    if (category) {
      formData.append('category', category.label.trim());
    }
    
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    
    formData.append('displayOrder', displayOrder.toString());
    formData.append('isSectionImportant', String(isSectionImportant));
    formData.append('isActive', String(isActive));
    formData.append('section_color', sectionColor);
    
    if (backgroundColor) {
      formData.append('section_background_color', backgroundColor);
    }
    
    if (metaTitle) {
      formData.append('meta_title', metaTitle.trim());
    }
    
    if (metaDescription) {
      formData.append('meta_description', metaDescription.trim());
    }
    
    if (admin?.name) {
      formData.append('updatedBy', admin.name.trim());
    }
    
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      expDate.setHours(23, 59, 59, 999); 
      formData.append('expires_at', expDate.toISOString());
    } else {
      formData.append('expires_at', '');
    }
    
    if (sectionImage) {
      formData.append('image', sectionImage);
    }

    try {
      await updateSection({
        id: sectionId,
        formData: formData
      }).unwrap();
      
      notify('Section updated successfully', 'success');
      
      setTimeout(() => {
        router.push('/ghanapolitan/sections');
      }, 1500);
      
    } catch (err: any) {
      console.error('Update error:', err);
      
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors: FormErrors = {};
        err.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes('section_name')) backendErrors.section_name = error;
          else if (error.toLowerCase().includes('section_code')) backendErrors.section_code = error;
          else if (error.toLowerCase().includes('section_slug')) backendErrors.section_slug = error;
          else if (error.toLowerCase().includes('expires_at') || error.toLowerCase().includes('expiration')) {
            backendErrors.expires_at = error;
          }
        });
        setErrors(backendErrors);
      }
      
      const errorMessage =
        err?.data?.message ||
        err?.data?.errors?.join(', ') ||
        'Failed to update section. Please try again.';
      notify(errorMessage, 'error');
    }
  };

  const categoryOptions = [
    { id: '', label: 'Select Category' },
    ...sectionCategories.map((cat) => ({ id: cat, label: cat })),
  ];

  const expirationStatus = getExpirationStatus();
  const section = sectionData?.data?.section;

  if (isLoadingSection && !sectionData?.data?.section) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader size={40} color="#10B981" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading section...</p>
        </div>
      </div>
    );
  }

  if (sectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Section not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The section you're trying to edit doesn't exist.</p>
          <Button
            onClick={() => router.push('/ghanapolitan/sections')}
            className="mt-4"
          >
            Back to Sections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Edit Section
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Editing: <span className="font-semibold">{section?.section_name || 'Section'}</span>
              </p>
            </div>
            {section && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar size={14} />
                Created: {new Date(section.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
          {admin && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Updated by: <span className="font-semibold">{admin.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="section_name" className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Section Name *
                {sectionName && (
                  <span className="text-xs font-normal text-gray-500">
                    Slug: {sectionSlug}
                  </span>
                )}
              </label>
              <div className="w-full">
                <TextInput
                  id="section_name"
                  type="text"
                  placeholder="Enter section name"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  error={!!errors.section_name}
                  aria-describedby="section_name-error"
                />
              </div>
              {errors.section_name && (
                <p id="section_name-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.section_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="section_code" className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Section Code *
                <Hash size={14} />
              </label>
              <div className="w-full">
                <TextInput
                  id="section_code"
                  type="text"
                  placeholder="e.g., POL, SPO, ENT"
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
                  error={!!errors.section_code}
                  aria-describedby="section_code-error"
                  className="uppercase"
                />
              </div>
              {errors.section_code && (
                <p id="section_code-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.section_code}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="section_slug" className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Section Slug *
            </label>
            <div className="w-full">
              <TextInput
                id="section_slug"
                type="text"
                placeholder="section-slug-name"
                value={sectionSlug}
                onChange={(e) => setSectionSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').trim())}
                error={!!errors.section_slug}
                aria-describedby="section_slug-error"
              />
            </div>
            {errors.section_slug && (
              <p id="section_slug-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.section_slug}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will be used in the URL: /section/{sectionSlug || 'your-slug'}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="section_description" className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Description (Optional)
            </label>
            <div className="w-full">
              <Textarea
                id="section_description"
                placeholder="Brief description of this section"
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Category (Optional)
              </label>
              <div className="w-full">
                <SelectDropdown
                  id="category"
                  options={categoryOptions}
                  placeholder="Select Category"
                  value={category}
                  onChange={setCategory}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="displayOrder" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Display Order
              </label>
              <div className="w-full">
                <TextInput
                  id="displayOrder"
                  type="number"
                  placeholder="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lower numbers appear first
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Calendar size={16} />
                Expiration Date (Optional)
              </label>
              {expirationDate && (
                <span className={`text-sm font-medium ${expirationStatus.color}`}>
                  {expirationStatus.status}
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Section will automatically become inactive after this date
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {expirationPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setExpirationPreset(preset)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      expirationPreset?.id === preset.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {showCustomDate && (
              <div className="space-y-2">
                <label htmlFor="expirationDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Expiration Date
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-full">
                    <TextInput
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      error={!!errors.expires_at}
                      aria-describedby="expires_at-error"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExpirationPreset(expirationPresets[0]);
                      setExpirationDate('');
                    }}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Clear
                  </button>
                </div>
                {errors.expires_at && (
                  <p id="expires_at-error" className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.expires_at}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Section Image (Optional)
            </label>
            <div className="relative flex items-center justify-center h-48 w-full bg-gray-50 dark:bg-neutral-800 border border-[#e0e0e0] dark:border-neutral-700 rounded-lg overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="section_image"
              />
              {sectionImagePreview ? (
                <Image
                  src={sectionImagePreview}
                  alt="Selected Section Image"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Recommended: 1200x400px
                  </p>
                </div>
              )}
            </div>
            {currentImageUrl && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current image will be replaced if you upload a new one
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Palette size={16} />
                Section Color
              </label>
              <button
                type="button"
                onClick={() => setShowCustomColor(!showCustomColor)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {showCustomColor ? 'Choose from palette' : 'Custom color'}
              </button>
            </div>

            {showCustomColor ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-gray-300 dark:border-neutral-600" 
                       style={{ backgroundColor: customColor }}>
                  </div>
                  <TextInput
                    type="text"
                    placeholder="#000000"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSectionColor(e.target.value);
                    }}
                  />
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSectionColor(e.target.value);
                    }}
                    className="w-10 h-10 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    className={`w-10 h-10 rounded-full border-2 ${sectionColor === color.value ? 'border-gray-900 dark:border-white' : 'border-transparent'} hover:scale-105 transition-transform`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Background Color (Optional)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-gray-300 dark:border-neutral-600" 
                     style={{ backgroundColor: backgroundColor || 'transparent' }}>
                  {!backgroundColor && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Info size={18} />
                    </div>
                  )}
                </div>
                <TextInput
                  type="text"
                  placeholder="Leave empty for default"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
                <input
                  type="color"
                  value={backgroundColor || '#ffffff'}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Tag size={16} />
              Tags (Optional)
            </label>
            <div className="w-full">
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

          <div className="space-y-4 p-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              SEO Settings (Optional)
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Meta Title
              </label>
              <div className="w-full">
                <TextInput
                  type="text"
                  placeholder="Auto-generated from section name"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metaTitle.length}/60 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Meta Description
              </label>
              <div className="w-full">
                <Textarea
                  placeholder="Auto-generated from description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metaDescription.length}/155 characters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Section Settings
              </h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSectionImportant}
                  onChange={(e) => setIsSectionImportant(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Mark as Important Section
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Active Section
                </span>
                {expirationDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (Will auto-deactivate after {expirationDate})
                  </span>
                )}
              </label>
            </div>

            <div className="space-y-2 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Section Preview
              </h3>
              <div className="flex items-center gap-3">
                {sectionImagePreview ? (
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img
                      src={sectionImagePreview}
                      alt="Section preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: sectionColor }}>
                    <span className="text-white font-bold text-sm">
                      {sectionCode.substring(0, 2)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {sectionName || 'Section Name'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {sectionDescription ? sectionDescription.substring(0, 50) + '...' : 'No description'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {isSectionImportant && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Important
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Order: #{displayOrder}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                {expirationDate && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${expirationStatus.color.replace('text-', 'bg-').replace('-600', '-100')} ${expirationStatus.color}`}>
                    {expirationStatus.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#e0e0e0] dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/ghanapolitan/sections')}
              className="flex-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !admin || isLoadingSection}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {!admin ? (
                'Please log in to edit sections'
              ) : isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <ClipLoader size={16} color="#fff" />
                  Updating Section...
                </span>
              ) : (
                'Update Section'
              )}
            </Button>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}