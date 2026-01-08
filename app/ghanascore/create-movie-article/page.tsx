'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCreateMovieMutation } from '@/store/features/ghweb/movie/movieAPI';
import { useNotify } from '@/hooks/useNotify';
import { NotificationContainer } from '@/components/notificationContainer';
import { Textarea } from '@/components/ui/inputs/textarea';
import { TextInput } from '@/components/ui/inputs/textInput';
import { SelectDropdown } from '@/components/ui/inputs/dropdown';
import Button from '@/components/ui/buttons/button';
import { ClipLoader } from 'react-spinners';
import TiptapEditor, { type TiptapEditorRef } from '@/components/tiptap-editor';

const TiptapEditorDynamic = dynamic(() => Promise.resolve(TiptapEditor), { ssr: false });

// Movie Genres - you can replace this with an API call or move to a constants file
const movieGenres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'Western',
  'Biography',
  'Family',
  'History',
  'Musical',
  'Sport',
  'War',
  'Nollywood',
  'Ghanaian',
  'African',
  'Bollywood',
  'Hollywood',
];

export default function CreateMovieArticlePage() {
  const router = useRouter();
  const { notify } = useNotify();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [createMovie, { isLoading }] = useCreateMovieMutation();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [creator, setCreator] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [genre, setGenre] = useState<{ id: string; label: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Streaming platform states
  const [isNetflix, setIsNetflix] = useState(false);
  const [netflixUrl, setNetflixUrl] = useState('');
  const [isPrimeVideo, setIsPrimeVideo] = useState(false);
  const [primeVideoUrl, setPrimeVideoUrl] = useState('');
  const [isShowmax, setIsShowmax] = useState(false);
  const [showmaxUrl, setShowmaxUrl] = useState('');
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isIrokotv, setIsIrokotv] = useState(false);
  const [irokotvUrl, setIrokotvUrl] = useState('');

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

    const editor = editorRef.current;
    if (!editor) {
      notify('Editor not loaded', 'error');
      return;
    }

    const textContent = editor.getText().trim();
    const htmlContent = editor.getHTML();

    if (!textContent) {
      notify('Article content cannot be empty', 'error');
      return;
    }

    if (!title.trim()) {
      notify('Title is required', 'error');
      return;
    }

    if (!description.trim()) {
      notify('Description is required', 'error');
      return;
    }

    if (!genre) {
      notify('Movie category is required', 'error');
      return;
    }

    if (!author.trim()) {
      notify('Movie authors is required', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('label', label?.trim() || '');
    payload.append('description', description.trim());
    payload.append('content', htmlContent);
    payload.append('category', genre.label.trim());
    payload.append('creator', creator?.trim() || '');
    payload.append('author', author.trim());
    payload.append('rating', rating?.trim() || '');
    payload.append('releaseYear', releaseYear?.trim() || '');

    tags.forEach((tag) => {
      payload.append('tags', tag.trim());
    });

    payload.append('isNetflix', String(isNetflix));
    payload.append('netflixUrl', isNetflix ? netflixUrl.trim() : '');
    payload.append('isPrimeVideo', String(isPrimeVideo));
    payload.append('primeVideoUrl', isPrimeVideo ? primeVideoUrl.trim() : '');
    payload.append('isShowmax', String(isShowmax));
    payload.append('showmaxUrl', isShowmax ? showmaxUrl.trim() : '');
    payload.append('isYouTube', String(isYouTube));
    payload.append('youtubeUrl', isYouTube ? youtubeUrl.trim() : '');
    payload.append('isIrokotv', String(isIrokotv));
    payload.append('irokotvUrl', isIrokotv ? irokotvUrl.trim() : '');
    payload.append('published_at', new Date().toISOString());

    if (thumbnail) {
      payload.append('image_url', thumbnail);
    }

    try {
      await createMovie(payload).unwrap();
      router.push('/ghweb/movies');
      notify('Movie article created successfully', 'success');
    } catch (err: any) {
      console.error('Failed to submit movie', err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.messages?.[0] ||
        'Failed to submit movie';
      notify(errorMessage, 'error');
    }
  };

  const genreOptions = [
    { id: '', label: 'Select Category' },
    ...movieGenres.map((genre) => ({ id: genre, label: genre })),
  ];

  return (
    <div className="flex items-start justify-center min-h-screen my-5 p-4 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-900 border border-[#e0e0e0] dark:border-neutral-800 rounded-lg shadow-lg p-4 md:p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="flex flex-col items-center w-full bg-transparent border border-[#e0e0e0] dark:border-neutral-800 rounded-lg p-4 md:p-6">
            <div className="w-full mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Write a movie article
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

              {/* Label */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Label
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="Example: Blockbuster Movie"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

              {/* Year Released */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Year Released
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="Example: 2025"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                  />
                </div>
              </div>

              {/* Movie Authors */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Movie authors
                </label>
                <div className="w-full [&>div]:!w-full">
                  <TextInput
                    type="text"
                    placeholder="Director and cast"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Article Creator */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Article Creator
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

            {/* Movie Category */}
            <div className="w-full space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Movie Category
              </label>
              <div className="w-full [&>div]:!w-full">
                <SelectDropdown
                  options={genreOptions}
                  placeholder="Select Category"
                  value={genre}
                  onChange={(option) => setGenre(option)}
                />
              </div>
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

            {/* Streaming Platforms */}
            <div className="w-full space-y-4">
              {/* Netflix */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is on Netflix?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNetflix}
                      onChange={(e) => setIsNetflix(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Is available on Netflix?
                    </span>
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="Netflix URL"
                      value={netflixUrl}
                      onChange={(e) => setNetflixUrl(e.target.value)}
                      disabled={!isNetflix}
                    />
                  </div>
                </div>
              </div>

              {/* Prime Video */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is on Prime Video?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrimeVideo}
                      onChange={(e) => setIsPrimeVideo(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Is available on Prime Video?
                    </span>
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="Prime Video URL"
                      value={primeVideoUrl}
                      onChange={(e) => setPrimeVideoUrl(e.target.value)}
                      disabled={!isPrimeVideo}
                    />
                  </div>
                </div>
              </div>

              {/* Showmax */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is on Showmax?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isShowmax}
                      onChange={(e) => setIsShowmax(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Is available on Showmax?
                    </span>
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="Showmax URL"
                      value={showmaxUrl}
                      onChange={(e) => setShowmaxUrl(e.target.value)}
                      disabled={!isShowmax}
                    />
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is on YouTube?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isYouTube}
                      onChange={(e) => setIsYouTube(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Is available on YouTube?
                    </span>
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="YouTube URL"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={!isYouTube}
                    />
                  </div>
                </div>
              </div>

              {/* Irokotv */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Is on Irokotv?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIrokotv}
                      onChange={(e) => setIsIrokotv(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Is available on Irokotv?
                    </span>
                  </label>
                  <div className="w-full [&>div]:!w-full">
                    <TextInput
                      type="text"
                      placeholder="Irokotv URL"
                      value={irokotvUrl}
                      onChange={(e) => setIrokotvUrl(e.target.value)}
                      disabled={!isIrokotv}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4"
              loading={isLoading}
            >
              {isLoading ? (
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

