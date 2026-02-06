'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import ImageModal from '@/components/ImageModal';

export default function IhaInterfaceProject() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const images = [
    {
      src: '/projects/iha-interface/ihainter.png',
      alt: 'UAV Interface Image 1',
      description: 'Main Control Interface'
    },
    {
      src: '/projects/iha-interface/ihainter2.png',
      alt: 'UAV Interface Image 2',
      description: 'Telemetry Data'
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
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
              className="inline-block px-4 py-2 rounded-full glass border border-cyan-500/30 mb-4"
            >
              <span className="text-cyan-400 text-sm font-medium">UAV Control System</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              IHA Interface
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              UAV automation interface integrated with Mission Planner
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative aspect-video mb-16 rounded-2xl overflow-hidden shadow-2xl glass-strong border border-white/10"
          >
            <video
              className="w-full h-full object-cover"
              controls
              poster="/projects/iha-interface/ihainter2.png"
            >
              <source src="/videos/ihainter1.mkv" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
                    The UAV control interface is an advanced automation system fully integrated with Mission Planner. It provides real-time data transmission, automatic mission planning, and telemetry analysis features.
                  </p>
                  <p>
                    The system communicates via the MAVLink protocol to process flight data, provides waypoint navigation, and gives critical alerts for safe flight operations.
                  </p>
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Features
                </h3>
                <ul className="space-y-3 text-gray-300">
                  {[
                    'Real-time data communication via MAVLink protocol',
                    'Automatic mission planning and execution',
                    'GPS waypoint navigation',
                    'Telemetry data visualization',
                    'Video stream integration',
                    'Emergency management system',
                    'Multi-UAV control support'
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
                  <span className="px-3 py-1 glass border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-medium">Python</span>
                  <span className="px-3 py-1 glass border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">Qt/PyQt</span>
                  <span className="px-3 py-1 glass border border-green-500/30 text-green-400 rounded-full text-xs font-medium">MAVLink</span>
                  <span className="px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full text-xs font-medium">Mission Planner</span>
                  <span className="px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full text-xs font-medium">OpenCV</span>
                  <span className="px-3 py-1 glass border border-red-500/30 text-red-400 rounded-full text-xs font-medium">Serial Communication</span>
                </div>
              </div>

              {/* Status */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Status</h3>
                <div className="glass rounded-xl p-4 border border-green-500/30">
                  <p className="text-green-300 font-medium mb-2">In Active Use</p>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Running in production</p>
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
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">GitHub Repo</span>
                    <svg className="w-4 h-4 ml-auto text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-red-500/30 hover:bg-red-500/10 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">Demo Video</span>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
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
