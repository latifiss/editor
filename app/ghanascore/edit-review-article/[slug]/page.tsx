'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useUpdateReviewMutation, useGetReviewByIdQuery } from '@/store/features/ghweb/review/reviewAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import TiptapEditor, { type TiptapEditorRef } from '@/components/tiptap-editor';
import { loadInitialContent } from '@/components/tiptap-editor/helpers/tiptap';

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { ssr: false });

export default function EditReviewArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const reviewId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { data: review, isLoading: isReviewLoading, error } = useGetReviewByIdQuery(reviewId as string, {
    skip: !reviewId,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [creator, setCreator] = useState('');
  const [venue, setVenue] = useState('');
  const [rating, setRating] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (review && !initialLoadComplete.current) {
      setTitle(review.title || '');
      setDescription(review.description || '');
      setLabel(review.label || '');
      setCreator(review.creator || '');
      setVenue(review.venue || '');
      setRating(review.rating?.toString() || '');

      let parsedTags: string[] = [];
      if (review.tags) {
        if (Array.isArray(review.tags)) {
          parsedTags = review.tags.map(String);
        } else if (typeof review.tags === 'string') {
          try {
            const tempTags = JSON.parse(review.tags);
            parsedTags = Array.isArray(tempTags) ? tempTags.map(String) : [String(tempTags)];
          } catch (e) {
            parsedTags = [String(review.tags)];
          }
        }
      }
      setTags(parsedTags);

      setEditorContent(review.content || '');

      if (review.image_url) {
        setThumbnailPreview(review.image_url);
      }

      initialLoadComplete.current = true;
    }
  }, [review]);

  useEffect(() => {
    if (initialLoadComplete.current && editorRef.current && editorContent) {
      const editor = editorRef.current;
      if (editor) {
        loadInitialContent(editor, editorContent);
      }
    }
  }, [editorContent, initialLoadComplete.current]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reviewId) return;

    const editor = editorRef.current;
    if (!editor) {
      notify('Editor not loaded', 'error');
      return;
    }

    const htmlContent = editor.getHTML();

    if (!title.trim()) {
      notify('Title is required', 'error');
      return;
    }

    if (!description.trim()) {
      notify('Description is required', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('label', label?.trim() || '');
    payload.append('description', description.trim());
    payload.append('content', htmlContent);
    payload.append('venue', venue?.trim() || '');
    payload.append('rating', rating?.trim() || '');
    payload.append('creator', creator?.trim() || '');

    tags.forEach((tag) => {
      payload.append('tags', tag.trim());
    });

    if (thumbnail) {
      payload.append('image_url', thumbnail);
    } else if (review?.image_url && thumbnailPreview === review.image_url) {
      payload.append('image_url', review.image_url);
    }

    try {
      await updateReview({ slug: reviewId, formData: payload }).unwrap();
      router.push('/ghweb/reviews');
      notify('Review article updated successfully', 'success');
    } catch (err: any) {
      console.error('Failed to update review:', err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.messages?.[0] ||
        'Failed to update review';
      notify(errorMessage, 'error');
    }
  };

  if (isReviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#00C850" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 dark:text-red-400">Error loading review</p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Update review article
              </h2>
            </div>

            <div className="w-full space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Title
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    placeholder="Enter article title or heading"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Creator */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Creator
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="John Doe"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Label
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="Example: State Of The Nation Address"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Venue
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="The National Theatre"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Description
                </label>
                <div className="w-full [&>div]:!w-full">
                  <Textarea
                    placeholder="Describe the article"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Content
                </label>
                <div className="w-full">
                  <TiptapEditorDynamic
                    ref={editorRef}
                    output="html"
                    minHeight={320}
                    maxHeight={640}
                    content={editorContent}
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
            {/* Thumbnail */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Article thumbnail
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
                  />
                ) : (
                  <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tap to upload
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Tags
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
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Rating
              </label>
              <div className="w-full [&>div]:!w-full">
                <TextInput
                  type="number"
                  placeholder="Example: 4.3"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full mt-4"
              loading={isUpdating}
            >
              {isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <ClipLoader size={16} color="#fff" />
                  Updating...
                </span>
              ) : (
                'Update Review'
              )}
            </Button>
          </div>
        </form>
      </div>
      <NotificationContainer position="bottom" />
    </div>
  );
}

