'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoCard from './components/PhotoCard';
import UploadModal from './components/UploadModal';
import TagCloud from './components/TagCloud';
import { Photo, Comment, User, Tag, Event } from './types';

export default function PhotoSharing() {
  // State yönetimi
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LocalStorage'dan verileri yükleme
  useEffect(() => {
    const savedPhotos = localStorage.getItem('photoSharingPhotos');
    const savedUsers = localStorage.getItem('photoSharingUsers');
    const savedCurrentUser = localStorage.getItem('photoSharingCurrentUser');
    const savedEvents = localStorage.getItem('photoSharingEvents');

    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    } else {
      // Örnek fotoğraflar
      const examplePhotos: Photo[] = [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
          description: 'A beautiful landscape photo',
          userId: '1',
          eventId: '1',
          tags: ['manzara', 'doğa', 'huzur'],
          likes: ['2', '3'],
          comments: [
            { id: '1', photoId: '1', userId: '2', text: 'Harika bir fotoğraf!', createdAt: new Date().toISOString() },
            { id: '2', photoId: '1', userId: '3', text: 'Nerede çekildi?', createdAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
          description: 'City life',
          userId: '2',
          eventId: '1',
          tags: ['şehir', 'mimari', 'modern'],
          likes: ['1'],
          comments: [
            { id: '3', photoId: '2', userId: '1', text: 'Çok iyi bir kompozisyon', createdAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      setPhotos(examplePhotos);
      localStorage.setItem('photoSharingPhotos', JSON.stringify(examplePhotos));
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Örnek kullanıcılar
      const exampleUsers: User[] = [
        { id: '1', name: 'Ahmet', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Ayşe', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: '3', name: 'Mehmet', avatar: 'https://i.pravatar.cc/150?img=3' }
      ];
      setUsers(exampleUsers);
      localStorage.setItem('photoSharingUsers', JSON.stringify(exampleUsers));
    }

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Örnek etkinlikler
      const exampleEvents: Event[] = [
        {
          id: '1',
          name: 'Proje Tanıtımı',
          description: 'Yeni projelerin tanıtımı için etkinlik',
          date: '2025-06-15',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Teknik Seminer',
          description: 'Yazılım geliştirme hakkında teknik seminer',
          date: '2025-07-20',
          createdAt: new Date().toISOString()
        }
      ];
      setEvents(exampleEvents);
      localStorage.setItem('photoSharingEvents', JSON.stringify(exampleEvents));
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    } else {
      // Varsayılan olarak ilk kullanıcıyı seç
      const defaultUser = { id: '1', name: 'Ahmet', avatar: 'https://i.pravatar.cc/150?img=1' };
      setCurrentUser(defaultUser);
      localStorage.setItem('photoSharingCurrentUser', JSON.stringify(defaultUser));
    }
  }, []);

  // Fotoğrafları filtreleme
  useEffect(() => {
    if (!selectedEvent) {
      setFilteredPhotos([]);
      return;
    }

    let filtered = photos.filter(photo => photo.eventId === selectedEvent.id);

    if (selectedTag) {
      filtered = filtered.filter(photo => photo.tags.includes(selectedTag));
    }

    setFilteredPhotos(filtered);
  }, [photos, selectedEvent, selectedTag]);

  // Tüm etiketleri toplama
  useEffect(() => {
    if (!selectedEvent) {
      setAllTags([]);
      return;
    }

    const tagsMap = new Map<string, number>();

    photos
      .filter(photo => photo.eventId === selectedEvent.id)
      .forEach(photo => {
        photo.tags.forEach(tag => {
          const count = tagsMap.get(tag) || 0;
          tagsMap.set(tag, count + 1);
        });
      });

    const tagsList: Tag[] = Array.from(tagsMap.entries()).map(([name, count]) => ({
      id: name,
      name,
      count
    }));

    setAllTags(tagsList);
  }, [photos, selectedEvent]);

  // Fotoğraf yükleme
  const handlePhotoUpload = (newPhoto: Photo) => {
    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    localStorage.setItem('photoSharingPhotos', JSON.stringify(updatedPhotos));
    setIsUploadModalOpen(false);
  };

  // Kullanıcı değiştirme
  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      localStorage.setItem('photoSharingCurrentUser', JSON.stringify(selectedUser));
    }
  };

  // Yeni kullanıcı oluşturma
  const handleCreateUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('photoSharingUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('photoSharingCurrentUser', JSON.stringify(newUser));
  };

  // Beğeni ekleme/kaldırma
  const handleLike = (photoId: string) => {
    if (!currentUser) return;

    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const isLiked = photo.likes.includes(currentUser.id);
        return {
          ...photo,
          likes: isLiked
            ? photo.likes.filter(id => id !== currentUser.id)
            : [...photo.likes, currentUser.id]
        };
      }
      return photo;
    });

    setPhotos(updatedPhotos);
    localStorage.setItem('photoSharingPhotos', JSON.stringify(updatedPhotos));
  };

  // Yorum ekleme
  const handleComment = (photoId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      photoId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString()
    };

    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          comments: [...photo.comments, newComment]
        };
      }
      return photo;
    });

    setPhotos(updatedPhotos);
    localStorage.setItem('photoSharingPhotos', JSON.stringify(updatedPhotos));
  };

  // Fotoğraf indirme
  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">Photo Sharing App</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Select an event to share, tag, and interact with photos.</p>

          {/* Etkinlik Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {events.map(event => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                className={`p-4 rounded-lg shadow-md cursor-pointer 
                  ${selectedEvent?.id === event.id
                    ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-500'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                  } transition-all duration-200`}
              >
                <div className="flex items-start">
                  <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1">{event.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{event.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(event.date).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 rounded-full">
                    {photos.filter(p => p.eventId === event.id).length} photos
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {!selectedEvent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-2xl mx-auto"
          >
            <svg className="w-16 h-16 mx-auto text-pink-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Please select an event</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You must select an event from above to view and share photos.
            </p>
            <p className="text-sm text-pink-600 dark:text-pink-400">
              Each event contains different photos and content.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sol Panel - Kullanıcı ve Etiket Bulutu */}
            <div className="lg:w-1/4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Selected Event</h2>
                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-100 dark:border-pink-800">
                  <h3 className="font-bold text-pink-600 dark:text-pink-400 mb-1">{selectedEvent.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedEvent.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">Date: {new Date(selectedEvent.date).toLocaleDateString('en-US')}</p>
                  <div className="text-xs text-right">
                    <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full">
                      {filteredPhotos.length} photos
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">User</h2>
                <div className="flex items-center mb-4">
                  {currentUser && (
                    <>
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-full mr-3 border-2 border-pink-200 dark:border-pink-800"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{currentUser.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active User</p>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Switch User
                  </label>
                  <select
                    value={currentUser?.id || ''}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white mb-2"
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    disabled={!currentUser || !selectedEvent}
                    className={`w-full px-4 py-2 mt-2 rounded-lg ${!currentUser || !selectedEvent
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                      } text-white font-medium transition-colors`}
                  >
                    Share Photo
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tags</h2>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <TagCloud tags={allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
              </motion.div>
            </div>

            {/* Ana İçerik - Fotoğraf Listesi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:w-3/4"
            >
              {filteredPhotos.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    No photos yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTag
                      ? `No photos found with "${selectedTag}" tag.`
                      : 'No photos have been shared for this event yet.'}
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    disabled={!currentUser}
                    className={`px-4 py-2 rounded-lg ${!currentUser
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                      } text-white font-medium transition-colors`}
                  >
                    Share First Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      currentUser={currentUser}
                      users={users}
                      onLike={handleLike}
                      onComment={handleComment}
                      onDownload={() => handleDownload(photo)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {isUploadModalOpen && (
            <UploadModal
              currentUser={currentUser}
              selectedEvent={selectedEvent}
              onClose={() => setIsUploadModalOpen(false)}
              onUpload={handlePhotoUpload}
              onCreateUser={handleCreateUser}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 