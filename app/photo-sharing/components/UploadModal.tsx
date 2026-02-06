'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo, User, Event } from '../types';
import NewUserModal from './NewUserModal';

interface UploadModalProps {
  currentUser: User | null;
  selectedEvent: Event | null;
  onClose: () => void;
  onUpload: (photo: Photo) => void;
  onCreateUser?: (user: User) => void;
}

export default function UploadModal({ currentUser, selectedEvent, onClose, onUpload, onCreateUser }: UploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fotoğraf seçme işlemi
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB.');
      return;
    }

    // Only image files
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError(null);

    // Önizleme URL'si oluştur
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Etiket ekleme
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    // Etiketleri boşluklara göre ayır ve ekle
    const newTags = tagInput
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(tag => tag.trim() !== '' && !tags.includes(tag.trim()));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };

  // Etiket silme
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Fotoğraf yükleme işlemi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Please log in first or create a new profile.');
      return;
    }

    if (!selectedEvent) {
      setError('Please select an event.');
      return;
    }

    if (!previewUrl) {
      setError('Please select a photo.');
      return;
    }

    if (!description.trim()) {
      setError('Please add a description.');
      return;
    }

    setIsLoading(true);

    // Gerçek bir API kullanmak yerine doğrudan LocalStorage'a kaydettiğimiz için kısa bir gecikme ekliyoruz
    setTimeout(() => {
      // Yeni fotoğraf objesi oluştur
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: previewUrl,
        description: description.trim(),
        userId: currentUser.id,
        eventId: selectedEvent.id,
        tags: tags.length > 0 ? tags : ['genel'],
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      onUpload(newPhoto);
      setIsLoading(false);
    }, 1000);
  };

  // Enter tuşuyla etiket ekleme
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Yeni kullanıcı oluşturma işlemi
  const handleCreateUser = (user: User) => {
    if (onCreateUser) {
      onCreateUser(user);
      setShowNewUserModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <AnimatePresence>
        {showNewUserModal && (
          <NewUserModal
            onClose={() => setShowNewUserModal(false)}
            onSave={handleCreateUser}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Photo</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Etkinlik Bilgisi */}
          {selectedEvent && (
            <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedEvent.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedEvent.description} - {new Date(selectedEvent.date).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Aktif Kullanıcı Bilgisi ve Yeni Kullanıcı Oluşturma */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {currentUser ? (
                  <>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        will be shared as
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">No user selected</p>
                )}
              </div>

              {onCreateUser && (
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Profile
                </button>
              )}
            </div>

            {!currentUser && onCreateUser && (
              <div className="mt-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-3">
                <p className="text-sm text-pink-800 dark:text-pink-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You can personalize by creating a profile before sharing photos.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Fotoğraf Seçimi ve Önizleme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo
              </label>

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg mx-auto border dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 dark:hover:border-pink-500 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Click or drag to upload a photo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF (max. 5MB)</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Açıklama */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter a description for your photo..."
              ></textarea>
            </div>

            {/* Etiketler */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-pink-700 dark:text-pink-300 hover:text-pink-900 dark:hover:text-pink-100"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Tags (you can add multiple by separating with spaces)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Gönder Butonu */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !previewUrl || !description || !currentUser || !selectedEvent}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading || !previewUrl || !description || !currentUser || !selectedEvent
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  'Upload Photo'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 