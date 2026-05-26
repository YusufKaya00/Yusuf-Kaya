'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Portfolio() {
  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-transparent" />
        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
        />
      </div>

      <section className="relative z-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">Developer Tools</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              Tools & Utilities
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Web applications and tools I've developed
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Proje Takip ve Gantt Diyagramı */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Project Tracking & Gantt</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  User-friendly interface for project and task management, team assignment and Gantt visualization.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-green-500/30 text-green-400 rounded-full text-xs font-medium">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-medium">
                    Framer Motion
                  </span>
                </div>
                <Link
                  href="/project-tracker"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Application</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* CV Generator Projesi */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-teal-500/30 to-blue-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">CV Generator</h3>
                <p className="text-gray-300 mb-4">
                  Text-based CV creation tool, can auto-generate CVs with AI integration.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-green-500/30 text-green-400 rounded-full text-xs font-medium">
                    Next.js
                  </span>
                  <span className="px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-medium">
                    AI Integration
                  </span>
                </div>
                <Link
                  href="/cv-generator"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Application</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* PDF to Word Converter */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">PDF to Word Converter</h3>
                <p className="text-gray-300 mb-4">
                  Modern web application that easily converts PDF files to Word format with cloud technology.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    Next.js
                  </span>
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 glass border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-medium">
                    Cloud API
                  </span>
                </div>
                <Link
                  href="/converter"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Converter</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Fırat Convert - Excel/CSV Raporlama */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-teal-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Fırat Convert</h3>
                <p className="text-gray-300 mb-4">
                  Automatic reporting and data visualization system from Excel/CSV files.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-medium">
                    Chart.js
                  </span>
                  <span className="px-3 py-1 glass border border-green-500/30 text-green-400 rounded-full text-xs font-medium">
                    jsPDF
                  </span>
                </div>
                <Link
                  href="/convert"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Data Converter</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Kod Analiz Aracı */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.5 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Code Analysis Tool</h3>
                <p className="text-gray-300 mb-4">
                  AI-powered code analysis, security vulnerability detection and improvement suggestions tool.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full text-xs font-medium">
                    AI Analysis
                  </span>
                  <span className="px-3 py-1 glass border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-medium">
                    Syntax Highlight
                  </span>
                </div>
                <Link
                  href="/code-review"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Analyze Code</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Fotoğraf Paylaşım ve Etiketleme Uygulaması */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.6 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Photo Sharing App</h3>
                <p className="text-gray-300 mb-4">
                  Social media style app where users can upload and tag photos, comment and like.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full text-xs font-medium">
                    NextJS
                  </span>
                  <span className="px-3 py-1 glass border border-pink-500/30 text-pink-400 rounded-full text-xs font-medium">
                    Tailwind CSS
                  </span>
                </div>
                <Link
                  href="/photo-sharing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Application</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Çevrimiçi Anket ve Form Hazırlama Sistemi */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.7 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-600/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Survey & Form System</h3>
                <p className="text-gray-300 mb-4">
                  Interactive application for creating surveys, collecting responses and visualizing results with charts.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    React
                  </span>
                  <span className="px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full text-xs font-medium">
                    Chart.js
                  </span>
                  <span className="px-3 py-1 glass border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-medium">
                    Tailwind CSS
                  </span>
                </div>
                <Link
                  href="/survey-system"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                >
                  <span className="text-sm">Use Application</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 