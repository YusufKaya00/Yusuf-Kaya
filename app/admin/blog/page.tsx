'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function BlogSearchParams() {
  const searchParams = useSearchParams();
  return null; // Sadece useSearchParams kullanmak için
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus !== 'true') {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await fetch('/api/blog/posts');

      if (!response.ok) {
        throw new Error('Blog yazıları yüklenemedi');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error: any) {
      console.error('Blog yazıları yüklenirken hata:', error);
      setError(error.message || 'Blog yazıları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!prompt) return;

    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'İçerik üretme hatası');
      }

      if (data.content) {
        setContent(data.content);
      } else {
        throw new Error('İçerik boş döndü');
      }
    } catch (error: any) {
      console.error('İçerik üretilirken hata:', error);
      setError(`İçerik üretilemedi: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const savePost = async () => {
    if (!title || !content) return;

    setSaving(true);
    setError(null);
    console.log('Blog kaydediliyor:', { title, content: content.substring(0, 30) + '...' });

    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: content.substring(0, 150) + '...',
        }),
      });

      console.log('API yanıt durumu:', response.status);

      // Yanıtı JSON olarak parse et
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kaydetme hatası');
      }

      console.log('Blog başarıyla kaydedildi:', data);

      // Başarıyla kaydedildi, blog listesini yenile ve formu temizle
      await fetchPosts();
      setTitle('');
      setContent('');
      setPrompt('');

      // Başarı mesajı göster
      alert('Blog yazısı başarıyla kaydedildi!');
    } catch (error: any) {
      console.error('Blog yazısı kaydedilirken hata:', error);
      setError(`Kayıt hatası: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    try {
      setError(null);
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Silme hatası');
      }

      // Başarıyla silindi, blog listesini yenile
      fetchPosts();
    } catch (error: any) {
      console.error('Blog yazısı silinirken hata:', error);
      setError(`Silme hatası: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={null}>
          <BlogSearchParams />
        </Suspense>

        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Blog Yönetimi</h1>
            <p className="text-gray-400">Blog yazılarını ekleyin, düzenleyin ve yönetin.</p>
          </motion.div>
          <Link href="/admin" className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300">
            Geri Dön
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-2xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm order-2 lg:order-1"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Blog Yazıları</h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-indigo-500 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{post.excerpt}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-800/30 rounded-xl shadow-2xl border border-gray-700 backdrop-blur-sm">
                <svg
                  className="w-16 h-16 text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <p className="text-gray-300 text-lg mb-2">Henüz blog yazısı bulunmuyor.</p>
                <p className="text-gray-500">İlk blog yazınızı ekleyin.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-2xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm order-1 lg:order-2"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Yeni Blog Yazısı</h2>
            <p className="text-gray-400 mb-2">AI destekli içerik üretin veya kendiniz yazın</p>
            <p className="mb-6 text-green-400 text-sm bg-green-900/30 p-2 rounded border border-green-800">
              Yapay Zeka aktif! İçerik oluşturmak için konu veya anahtar kelimeler yazın
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Blog yazısı başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Yapay Zeka Promptu
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="İçerik üretmek için bir konu yazın"
                  />
                  <button
                    onClick={generateContent}
                    disabled={!prompt || generating}
                    className={`px-6 py-2 rounded-lg text-white font-medium ${!prompt || generating
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                      } transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-2 whitespace-nowrap`}
                  >
                    {generating ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Üretiliyor...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>İçerik Üret</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  İçerik
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Blog yazısı içeriği"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={savePost}
                  disabled={!title || !content || saving}
                  className={`px-6 py-3 rounded-lg text-white font-medium ${!title || !content || saving
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    } transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-2`}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 