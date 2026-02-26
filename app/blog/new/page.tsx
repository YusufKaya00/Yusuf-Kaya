'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-white text-xl">Yükleniyor...</div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function NewBlogPostPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewBlogPost />
    </Suspense>
  );
}

// The actual blog post component
function NewBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kaydetme hatası');
      }

      // Başarıyla kaydedildi, blog sayfasına yönlendir
      router.push('/blog');
    } catch (error: any) {
      console.error('Blog yazısı kaydedilirken hata:', error);
      setError(`Kayıt hatası: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Yeni Blog Yazısı</h1>
            <p className="text-gray-400">
              Yapay Zeka (AI) ile içerik üretebilir veya kendiniz yazabilirsiniz
            </p>
            <p className="mt-2 text-green-400 text-sm bg-green-900/30 p-2 rounded border border-green-800">
              Yapay Zeka aktif! İçerik oluşturmak için konu veya anahtar kelimeler yazın
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

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
                  placeholder="İçerik üretmek için bir konu yazın (örn: teknoloji, blog, yazılım)"
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

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => router.push('/blog')}
                className="px-6 py-2 rounded-lg text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 transition-all duration-300"
              >
                İptal
              </button>
              <button
                onClick={savePost}
                disabled={!title || !content || saving}
                className={`px-6 py-2 rounded-lg text-white font-medium ${!title || !content || saving
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
  );
} 