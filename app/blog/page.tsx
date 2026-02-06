'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
}

// localStorage işlemlerini ayrı bir bileşene taşıyoruz
function LocalStorageHandler({ setUserIdCallback }: { setUserIdCallback: (userId: string) => void }) {
  useEffect(() => {
    // Geçici kullanıcı ID'si oluştur
    const storedUserId = localStorage.getItem('blogUserId');
    if (storedUserId) {
      setUserIdCallback(storedUserId);
    } else {
      const newUserId = Date.now().toString();
      localStorage.setItem('blogUserId', newUserId);
      setUserIdCallback(newUserId);
    }
  }, [setUserIdCallback]);

  return null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await fetch('/api/blog/posts');

      if (!response.ok) {
        throw new Error('Failed to load blog posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error: any) {
      console.error('Error loading blog posts:', error);
      setError(error.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likes?.includes(userId) ?? false;
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(`/api/blog/posts/${postId}/likes`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Like operation failed');
      }

      // Client-side state güncellemesi
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const currentLikes = post.likes || [];
          return {
            ...post,
            likes: isLiked
              ? currentLikes.filter(id => id !== userId)
              : [...currentLikes, userId]
          };
        }
        return post;
      });

      setPosts(updatedPosts);
    } catch (error: any) {
      console.error('Error during like operation:', error);
      setError('Like operation failed: ' + error.message);
    }
  };

  const isPostLiked = (post: BlogPost) => {
    return post.likes?.includes(userId || '') ?? false;
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={null}>
            <LocalStorageHandler setUserIdCallback={(id) => setUserId(id)} />
          </Suspense>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 mt-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">Blog Posts</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              Blog Posts
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Articles about software development, technology, and my projects
            </p>
          </motion.div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-strong rounded-2xl shadow-2xl overflow-hidden hover:shadow-purple-500/30 transition-all duration-500 border border-white/10 hover:border-purple-500/50"
                >
                  <Link href={`/blog/${post.id}`}>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 mb-4">{post.excerpt}</p>
                      <div className="text-sm text-gray-500">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="glass p-4 flex justify-between items-center border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-1 group"
                      >
                        <svg
                          className={`w-5 h-5 transition-colors ${isPostLiked(post) ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'
                            }`}
                          fill={isPostLiked(post) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span className={`text-sm ${isPostLiked(post) ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'}`}>
                          {post.likes?.length || 0}
                        </span>
                      </button>
                    </div>
                    <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 transition-all duration-300 text-sm group/btn">
                      <span>Read More</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 glass-strong rounded-2xl shadow-2xl border border-white/10"
            >
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
              <p className="text-gray-300 text-lg mb-2">No blog posts yet.</p>
              <p className="text-gray-500 mb-6">You can add blog posts from the Admin Panel.</p>
              <Link
                href="/admin/blog"
                className="btn-shine px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 inline-flex items-center gap-2"
              >
                <span>Go to Admin Panel</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 