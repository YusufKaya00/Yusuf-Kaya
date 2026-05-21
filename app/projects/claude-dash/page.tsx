'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import ImageModal from '@/components/ImageModal';

export default function ClaudeDashProject() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const images = [
    {
      src: '/projects/claude-dash/dashboard.png',
      alt: 'ClaudeDash Main Dashboard',
      description: 'Main Control Panel'
    },
    {
      src: '/projects/claude-dash/agents.png',
      alt: 'Agent Management Interface',
      description: 'Agent Management'
    },
    {
      src: '/projects/claude-dash/hooks.png',
      alt: 'System Hooks Configuration',
      description: 'Automated Hook System'
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
        />
      </div>

      <section className="relative z-20 py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">AI Management Platform</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              Tnega ClaudeDash
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Multi-Agent Control Plane & Dashboard for AI Agents Management
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative aspect-video mb-16 rounded-2xl overflow-hidden shadow-2xl glass-strong border border-white/10"
          >
            <img
              src="/projects/claude-dash/dashboard.png"
              alt="ClaudeDash Interface"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Main Content */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 space-y-8"
            >
              <div className="glass-strong rounded-2xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold gradient-text mb-6">About the Project</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Tnega is a centralized <strong>Management, Monitoring, and Control Plane</strong> system developed for AI agents (Antigravity Core, Claude Code, Codex Engine) and other custom models. It provides a unified interface to manage, configure, and monitor multiple AI agents from a single dashboard.
                  </p>
                  <p>
                    The system features an automated Git and file hook engine that monitors code changes and triggers agent-based code reviews. All agent configurations, skills, and control plane data are globally stored in <code>~/.gemini/antigravity/</code> directory for seamless integration across different editors.
                  </p>
                  <p>
                    With real-time WebSocket communication, terminal integration, and comprehensive system telemetry, ClaudeDash offers a complete solution for managing AI-powered development workflows.
                  </p>
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Key Features
                </h3>
                <ul className="space-y-3 text-gray-300">
                  {[
                    'Centralized AI Agent Management - Configure and monitor multiple agents',
                    'Global Configuration Storage - All settings stored in ~/.gemini/antigravity/',
                    'Automated Git Hook Engine - Pre-commit and pre-push code review triggers',
                    'File Change Monitoring - Debounced file system watcher with agent triggers',
                    'Agent-Based Code Review - Automatic git diff analysis by selected agents',
                    'Real-time System Telemetry - CPU, RAM usage, and active agent monitoring',
                    'MCP Integration - Centralized tool management for AI agents',
                    'WebSocket Communication - Live updates and terminal integration',
                    'Multi-Agent Support - Antigravity Core, Claude Code, Codex Engine'
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="glass-strong rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Automated Hook System
                </h3>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    The hook system automatically installs Git hooks (<code>.git/hooks/pre-commit</code> and <code>.git/hooks/pre-push</code>) when the server starts. You can configure hooks to trigger on:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>git.push</strong> - Before pushing to remote</li>
                    <li><strong>git.commit</strong> - Before committing changes</li>
                    <li><strong>file.change</strong> - On file system changes (debounced)</li>
                  </ul>
                  <p>
                    When triggered, the system automatically captures <code>git diff</code> and sends it to the selected agent (Antigravity, Claude Code, or Codex) with your custom review prompt. Results are displayed in real-time on the dashboard activity feed.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Technologies */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">Next.js 16</span>
                  <span className="px-3 py-1 glass border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-medium">React 19</span>
                  <span className="px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full text-xs font-medium">TypeScript</span>
                  <span className="px-3 py-1 glass border border-green-500/30 text-green-400 rounded-full text-xs font-medium">Node.js</span>
                  <span className="px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-medium">Express</span>
                  <span className="px-3 py-1 glass border border-pink-500/30 text-pink-400 rounded-full text-xs font-medium">WebSocket</span>
                  <span className="px-3 py-1 glass border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-medium">Tailwind CSS</span>
                  <span className="px-3 py-1 glass border border-red-500/30 text-red-400 rounded-full text-xs font-medium">Framer Motion</span>
                </div>
              </div>

              {/* Status */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Status</h3>
                <div className="glass rounded-xl p-4 border border-blue-500/30">
                  <p className="text-blue-300 font-medium mb-2">Active Development</p>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Core features implemented</p>
                </div>
              </div>

              {/* Architecture */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Architecture</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Frontend: Next.js with Server Components</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Backend: Express + WebSocket Server</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Storage: File-based configuration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Real-time: WebSocket communication</span>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Resources</h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-indigo-500/30 hover:bg-indigo-500/10 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">GitHub Repository</span>
                    <svg className="w-4 h-4 ml-auto text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">Documentation</span>
                    <svg className="w-4 h-4 ml-auto text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gallery */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 cursor-pointer"
                onClick={() => handleImageClick(image.src)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Click to enlarge
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 glass border-t border-white/10">
                  <p className="text-sm text-gray-300">{image.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Link
              href="/portfolio"
              className="btn-shine inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Other Projects</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Enlarged Project Image"
      />
    </div>
  );
}
