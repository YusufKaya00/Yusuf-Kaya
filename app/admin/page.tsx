'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  likes?: string[];
}

export default function AdminPage() {
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [surveyCount, setSurveyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Kimlik doğrulama için
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Giriş fonksiyonu
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'sky' && password === 'bsd') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Geçersiz kullanıcı adı veya şifre!');
    }
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
  };

  // Ziyaretçi sayısını artırma fonksiyonu
  const incrementVisitorCount = () => {
    setTotalVisits(prev => {
      const newCount = prev + 1;
      localStorage.setItem('totalVisits', newCount.toString());
      return newCount;
    });
  };

  useEffect(() => {
    // Verileri localStorage'dan yükleme ve düzenli güncelleme için
    const loadData = () => {
      try {
        // Blog verileri
        const savedPosts = localStorage.getItem('posts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts) as BlogPost[];
          // Tüm beğenileri topla
          const likes = posts.reduce((total: number, post: BlogPost) => total + (post.likes?.length || 0), 0);
          setTotalLikes(likes);
          setBlogCount(posts.length);
        }

        // Fotoğraf verileri
        const savedPhotos = localStorage.getItem('photoSharingPhotos');
        if (savedPhotos) {
          const photos = JSON.parse(savedPhotos);
          // Fotoğraf sayısı
          setPhotoCount(photos.length);
        }

        // Anket verileri
        const savedSurveys = localStorage.getItem('surveySystemSurveys');
        if (savedSurveys) {
          const surveys = JSON.parse(savedSurveys);
          setSurveyCount(surveys.length);
        }

        // Ziyaretçi sayısı
        const visits = localStorage.getItem('totalVisits');
        if (visits) {
          setTotalVisits(parseInt(visits));
        } else {
          // Rastgele bir ziyaretçi sayısı oluştur
          const randomVisits = Math.floor(Math.random() * 500) + 100;
          setTotalVisits(randomVisits);
          localStorage.setItem('totalVisits', randomVisits.toString());
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    // Sayfa yüklendiğinde verileri al
    loadData();

    // Her 5 saniyede bir verileri güncelle
    const intervalId = setInterval(loadData, 5000);

    // Simüle edilmiş ziyaretçi artışı - rastgele aralıklarla
    const simulateVisitors = () => {
      // %70 olasılıkla ziyaretçi sayısını artır
      if (Math.random() < 0.7) {
        incrementVisitorCount();
      }

      // Bir sonraki ziyareti 3-15 saniye arasında rastgele zamanla
      const nextVisitTime = Math.floor(Math.random() * 12000) + 3000;
      setTimeout(simulateVisitors, nextVisitTime);
    };

    // İlk ziyaretçi simülasyonunu başlat
    const initialDelay = Math.floor(Math.random() * 5000) + 2000;
    setTimeout(simulateVisitors, initialDelay);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Beğeni sayısını artıran demo fonksiyon
  const incrementLikes = () => {
    const newLikes = totalLikes + 1;
    setTotalLikes(newLikes);

    // Mevcut blog yazılarını al
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts) as BlogPost[];

      // Rastgele bir yazıya beğeni ekle
      if (posts.length > 0) {
        const randomIndex = Math.floor(Math.random() * posts.length);
        const selectedPost = posts[randomIndex];

        if (!selectedPost.likes) selectedPost.likes = [];
        selectedPost.likes.push(`user-${Date.now()}`);

        // Save updated data
        localStorage.setItem('posts', JSON.stringify(posts));
      }
    }
  };

  // Sayaçların canlı görünmesi için
  useEffect(() => {
    // Rastgele zamanlarda beğeni artışı simülasyonu
    const likesInterval = setInterval(() => {
      if (Math.random() < 0.3) { // %30 olasılıkla beğeni ekle
        incrementLikes();
      }
    }, 8000);

    return () => clearInterval(likesInterval);
  }, [totalLikes]);

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full p-8 bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Admin Panel</h2>
          <p className="text-gray-400 mb-8 text-center">Please enter your login credentials</p>

          {authError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6">
            <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">You can use the necessary tools for site management from here.</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded-lg border border-red-500/30 transition-colors"
          >
            Logout
          </button>
        </motion.div>

        {/* İstatistik Kartları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {/* Ziyaretçi Sayısı */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 shadow-lg border border-blue-800/50 backdrop-blur-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Visitors</p>
                <h3 className="text-white text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-blue-700/50 animate-pulse rounded"></div>
                  ) : (
                    <motion.span
                      key={totalVisits}
                      initial={{ scale: 1.2, color: "#60a5fa" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5 }}
                    >
                      {totalVisits.toLocaleString()}
                    </motion.span>
                  )}
                </h3>
              </div>
              <div className="p-2 bg-blue-800/50 rounded-lg">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-blue-300">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Live Tracking</span>
              </div>
            </div>
          </div>

          {/* Toplam Beğeni */}
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-xl p-6 shadow-lg border border-red-800/50 backdrop-blur-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Total Likes</p>
                <h3 className="text-white text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-red-700/50 animate-pulse rounded"></div>
                  ) : (
                    <motion.span
                      key={totalLikes}
                      initial={{ scale: 1.2, color: "#f87171" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5 }}
                    >
                      {totalLikes.toLocaleString()}
                    </motion.span>
                  )}
                </h3>
              </div>
              <div className="p-2 bg-red-800/50 rounded-lg">
                <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-red-300">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Live Tracking</span>
              </div>
            </div>
          </div>

          {/* Blog Yazıları */}
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 shadow-lg border border-purple-800/50 backdrop-blur-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Blog Posts</p>
                <h3 className="text-white text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-purple-700/50 animate-pulse rounded"></div>
                  ) : (
                    <motion.span
                      key={blogCount}
                      initial={{ scale: 1.2, color: "#c084fc" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5 }}
                    >
                      {blogCount.toLocaleString()}
                    </motion.span>
                  )}
                </h3>
              </div>
              <div className="p-2 bg-purple-800/50 rounded-lg">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/admin/blog" className="flex items-center text-xs text-purple-300 hover:underline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Manage</span>
              </Link>
            </div>
          </div>

          {/* Fotoğraflar */}
          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 rounded-xl p-6 shadow-lg border border-pink-800/50 backdrop-blur-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-pink-300 text-sm font-medium">Photos</p>
                <h3 className="text-white text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-pink-700/50 animate-pulse rounded"></div>
                  ) : (
                    <motion.span
                      key={photoCount}
                      initial={{ scale: 1.2, color: "#f472b6" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5 }}
                    >
                      {photoCount.toLocaleString()}
                    </motion.span>
                  )}
                </h3>
              </div>
              <div className="p-2 bg-pink-800/50 rounded-lg">
                <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/admin/photo-sharing" className="flex items-center text-xs text-pink-300 hover:underline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Manage</span>
              </Link>
            </div>
          </div>

          {/* Anketler */}
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-6 shadow-lg border border-green-800/50 backdrop-blur-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Surveys</p>
                <h3 className="text-white text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-green-700/50 animate-pulse rounded"></div>
                  ) : (
                    <motion.span
                      key={surveyCount}
                      initial={{ scale: 1.2, color: "#6ee7b7" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.5 }}
                    >
                      {surveyCount.toLocaleString()}
                    </motion.span>
                  )}
                </h3>
              </div>
              <div className="p-2 bg-green-800/50 rounded-lg">
                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <Link href="/admin/surveys" className="flex items-center text-xs text-green-300 hover:underline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Manage</span>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Projeler Yönetimi */}
          <Link href="/admin/projects">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm p-8 hover:border-cyan-500 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-20 h-20 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Project Management</h2>
              <p className="text-gray-400 text-center">Add, edit, and manage projects on the homepage.</p>
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-cyan-900/50 text-cyan-400">
                  Image Upload
                </span>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/blog">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm p-8 hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-20 h-20 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Blog Management</h2>
              <p className="text-gray-400 text-center">Add, edit, and manage blog posts. Use AI-powered content creation feature.</p>
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-indigo-900/50 text-indigo-400">
                  Gemini AI Powered
                </span>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/photo-sharing">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm p-8 hover:border-pink-500 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-20 h-20 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Photo Sharing Management</h2>
              <p className="text-gray-400 text-center">Manage user photos, create events, and organize content.</p>
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-pink-900/50 text-pink-400">
                  Event Management
                </span>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/surveys">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm p-8 hover:border-green-500 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Survey Management</h2>
              <p className="text-gray-400 text-center">Edit and delete surveys, analyze user responses, and create reports.</p>
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-400">
                  Data Analytics
                </span>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/cv">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm p-8 hover:border-orange-500 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-20 h-20 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">CV Management</h2>
              <p className="text-gray-400 text-center">Upload and manage your personal CV file.</p>
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-orange-900/50 text-orange-400">
                  File Upload
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
} 