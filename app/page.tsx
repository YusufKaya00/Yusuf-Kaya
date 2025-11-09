'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';

// Performance: Fotoğraf listesini component dışına al (her render'da yeniden oluşturulmasın)
const BACKGROUND_IMAGES = [
  '/car.jpg',
  '/car3.jpg',
  '/car4.jpg',
  '/car5.jpg',
  '/car6.jpg',
  '/car7.jpg',
  '/car8.jpg',
  '/car9.jpg',
  '/car10.jpg',
  '/car11.jpg',
  '/car12.jpg',
] as const;

// Performance: Skills array'ini component dışına al
const SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS'] as const;

export default function Home() {
  // Dönen fotoğraflar için state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');
  const [displayImage, setDisplayImage] = useState('/car.jpg');
  const [nextImage, setNextImage] = useState('/car3.jpg');
  // Sadece görünür resimleri yükle (lazy loading için)
  const [loadedImages, setLoadedImages] = useState([0]);
  const [animationsInitialized, setAnimationsInitialized] = useState(false);

  // Sayfanın tamamı yüklendiğinde ve DOM hazır olduğunda animasyonları başlat
  useEffect(() => {
    // Component mount olduğunda
    setAnimationsInitialized(true);
    
    // Sadece ilk iki resmi önden yükle
    const currentIdx = currentImageIndex;
    const nextIdx = (currentImageIndex + 1) % BACKGROUND_IMAGES.length;
    
    if (!loadedImages.includes(currentIdx)) {
      setLoadedImages(prev => [...prev, currentIdx]);
    }
    
    if (!loadedImages.includes(nextIdx)) {
      setLoadedImages(prev => [...prev, nextIdx]);
    }
    
    return () => {
      // Component unmount olduğunda
      setAnimationsInitialized(false);
    };
  }, []);

  // Performance: Fotoğraf değiştirme fonksiyonunu useCallback ile optimize et
  const changeImage = useCallback(() => {
    // Önce fade-out başlat
    setFadeState('fade-out');
    
    // 500ms sonra resmi değiştir ve fade-in başlat
    setTimeout(() => {
      const nextIndex = (currentImageIndex + 1) % BACKGROUND_IMAGES.length;
      
      // Sonraki resmi önceden yükle - sadece bir sonraki
      if (!loadedImages.includes(nextIndex)) {
        setLoadedImages(prev => [...prev, nextIndex]);
      }
      
      // Bir sonraki resmin indeksini hesapla (sonraki değişimde kullanılacak)
      const nextNextIndex = (nextIndex + 1) % BACKGROUND_IMAGES.length;
      
      // Sonraki değişimde kullanılacak resmi de ekleyelim
      if (!loadedImages.includes(nextNextIndex)) {
        setLoadedImages(prev => [...prev, nextNextIndex]);
      }
      
      setCurrentImageIndex(nextIndex);
      setDisplayImage(BACKGROUND_IMAGES[nextIndex]);
      setNextImage(BACKGROUND_IMAGES[nextNextIndex]);
      setFadeState('fade-in');
    }, 500); 
  }, [currentImageIndex, loadedImages]);
  
  // Fotoğraflar arasında otomatik geçiş - animasyonların başlatılmasından sonra
  useEffect(() => {
    if (!animationsInitialized) return;
    
    // Sayfa ilk yüklenirken fade efektini doğru şekilde ayarla
    setFadeState('fade-in');
    
    const interval = setInterval(() => {
      changeImage();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentImageIndex, loadedImages, animationsInitialized, changeImage]);

  // Sayfa yüklendiğinde localStorage'dan scroll hedefini kontrol et
  useEffect(() => {
    const scrollTarget = localStorage.getItem('scrollTo');
    if (scrollTarget) {
      localStorage.removeItem('scrollTo'); // Önce temizle
      
      // requestAnimationFrame ile daha smooth scroll
      requestAnimationFrame(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          const offset = 80; // navbar height
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  // Performance: handleSubmit fonksiyonunu useCallback ile optimize et
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setFormStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setFormStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Bir hata oluştu'
      });
    }
  }, [formData]);

  // Performance: handleChange fonksiyonunu useCallback ile optimize et
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Arka plan fotoğrafları */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div 
          className={`absolute inset-0 w-full h-full z-5 transition-opacity duration-1000 ${fadeState === 'fade-in' ? 'opacity-100' : 'opacity-0'}`}
          style={{ willChange: 'opacity' }} // Daha iyi performans için
        >
          <Image
            src={displayImage}
            alt="Background"
            fill
            quality={70} // Kaliteyi biraz düşürdüm
            priority={true}
            className="object-cover object-center"
          />
        </div>
        
        {/* Sadece bir sonraki resmi önceden yükle, görünmez resim elementlerini kaldırdım */}
        <div className="hidden">
          <Image 
            src={nextImage}
            alt="Preload"
            width={1}
            height={1}
            priority={false}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-20 min-h-screen flex items-center overflow-hidden">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl"
          />
          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-indigo-500/20 blur-xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center relative z-10"
        >
          {/* Title with 3D Holographic Neon Effect */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6 relative"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4 relative inline-block perspective-1000">
              {/* 3D Shadow Layers */}
              <span className="absolute inset-0 text-purple-600/40 blur-sm" style={{ transform: 'translate(-2px, -2px)' }}>
                YUSUF KAYA
              </span>
              <span className="absolute inset-0 text-pink-600/40 blur-sm" style={{ transform: 'translate(2px, 2px)' }}>
                YUSUF KAYA
              </span>
              
              {/* Main Text with Holographic Effect */}
              <motion.span 
                className="relative bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-2xl"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
                style={{
                  backgroundSize: '200% 200%',
                  textShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)',
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
                }}
              >
                YUSUF KAYA
              </motion.span>

              {/* Animated Neon Glow */}
              <motion.div
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-8 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 blur-3xl -z-10 rounded-full"
              />
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-12"
          >
            <p className="text-2xl md:text-4xl text-gray-300 font-light tracking-wide">
              <span className="text-white font-medium">Software Developer</span>
              <span className="text-purple-400"> • </span>
              <span className="text-gray-400">Full Stack Engineer</span>
            </p>
          </motion.div>

          {/* Skills badges */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {SKILLS.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="px-4 py-2 glass rounded-full text-sm font-medium text-white border border-white/20 glow-hover cursor-pointer"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-shine px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Projelerimi Gör
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.a>
            
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl glass border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              İletişime Geç
            </motion.a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-gray-400"
            >
              <span className="text-sm">Scroll</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Projeler Section */}
      <section id="projects" className="relative z-20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">Portfolio</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              Projelerim
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Üzerinde çalıştığım ve geliştirdiğim projelerden bazıları
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IDA - Akıllı Veri Analiz Arayüzü */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 card-hover"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/projects/ida/ida.jpg"
                  alt="IDA Interface"
                  width={800}
                  height={450}
                  loading="lazy"
                  quality={85}
                  className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    IDA - Interface
                  </h3>
                  <p className="text-gray-300 text-sm">Yer kontrol istasyonu arayüzü</p>
                  <Link 
                    href="/projects/ida-interface"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                  >
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
              </div>
            </motion.div>

            {/* IHA Interface */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 card-hover"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/projects/iha-interface/ihainter2.png"
                  alt="IHA Interface"
                  width={800}
                  height={450}
                  loading="lazy"
                  quality={85}
                  className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    IHA Interface
                  </h3>
                  <p className="text-gray-300 text-sm">İnsansız Hava Aracı Otomasyonu</p>
                  <Link 
                    href="/projects/iha-interface"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                  >
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
              </div>
            </motion.div>

            {/* Air Defence Interface */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 card-hover"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/projects/air-defence/air-defence.png"
                  alt="Air Defence Interface"
                  width={800}
                  height={450}
                  loading="lazy"
                  quality={85}
                  className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    Air Defence Interface
                  </h3>
                  <p className="text-gray-300 text-sm">Hava Savunma Sistemi Arayüzü</p>
                  <Link 
                    href="/projects/air-defence"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                  >
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
              </div>
            </motion.div>

            {/* IHA Simulation */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 card-hover"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/projects/iha-simulation/iha1.jpg"
                  alt="IHA Simulation"
                  width={800}
                  height={450}
                  loading="lazy"
                  quality={85}
                  className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    IHA Simulation
                  </h3>
                  <p className="text-gray-300 text-sm">İHA Simülasyon Sistemi</p>
                  <Link 
                    href="/projects/iha-simulation"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                  >
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
              </div>
            </motion.div>

            {/* Cloud Photo Resize */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-purple-500/50 transition-all duration-500 card-hover"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/projects/cloud/cloud-resize.png"
                  alt="Cloud Photo Resize"
                  width={800}
                  height={450}
                  loading="lazy"
                  quality={85}
                  className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    Cloud Photo Resize
                  </h3>
                  <p className="text-gray-300 text-sm">AWS Bulut Tabanlı Görüntü İşleme</p>
                  <Link 
                    href="/projects/cloud-resize"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30 transition-all duration-300 group/btn"
                  >
                    <span>Detayları Gör</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/portfolio"
                className="btn-shine inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300"
              >
                <span>Tüm Projeleri Gör</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hakkımda Section */}
      <section id="about" className="relative z-20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">About Me</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              Hakkımda
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Teknoloji ve yenilik tutkusuyla dolu bir yazılım geliştiricisi
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden glass-strong border border-white/10 group-hover:border-purple-500/50 transition-all duration-500">
                <Image
                  src="/info.jpg"
                  alt="Yusuf Kaya"
                  fill
                  loading="lazy"
                  quality={85}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              {/* Decorative elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl"
              />
            </motion.div>
            
            {/* About Content */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="glass-strong rounded-2xl p-8 border border-white/10">
                <h3 className="text-3xl font-bold gradient-text mb-4">Yusuf Kaya</h3>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Kişisel dökümantasyon ve proje vitrini amaçlı kullandığım site.
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Geliştirdiğim projeler, öğrendiğim teknolojiler ve deneyimlerimi paylaşmak için.
                  </p>
                </div>
                
                {/* Social Links */}
                <div className="mt-8 flex gap-4">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/YusufKaya00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass border border-white/10 text-white hover:border-purple-500/50 hover:text-purple-400 transition-all duration-300 group"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://linkedin.com/in/yusuf-kaya-2a2a48285"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass border border-white/10 text-white hover:border-purple-500/50 hover:text-purple-400 transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://twitter.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass border border-white/10 text-white hover:border-purple-500/50 hover:text-purple-400 transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* İletişim Section */}
      <section id="contact" className="relative z-20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
            >
              <span className="text-purple-400 text-sm font-medium">Get in Touch</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black gradient-text mb-4">
              İletişim
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Bir projeniz mi var? Birlikte çalışalım!
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6 glass-strong rounded-2xl p-8 shadow-2xl border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="group"
                >
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-500/30"
                    placeholder="Adınız ve Soyadınız"
                    required
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="group"
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">E-posta</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-500/30"
                    placeholder="E-posta adresiniz"
                    required
                  />
                </motion.div>
              </div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group"
              >
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">Konu</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-500/30"
                  placeholder="Mesajınızın konusu"
                  required
                />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group"
              >
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">Mesaj</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none group-hover:border-purple-500/30"
                  placeholder="Mesajınız"
                  required
                ></textarea>
              </motion.div>
              
              {formStatus.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl glass border border-red-500/30 bg-red-500/10"
                >
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formStatus.error}
                  </p>
                </motion.div>
              )}
              
              {formStatus.success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl glass border border-green-500/30 bg-green-500/10"
                >
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mesajınız başarıyla gönderildi!
                  </p>
                </motion.div>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
              >
                <motion.button
                  type="submit"
                  disabled={formStatus.loading}
                  whileHover={{ scale: formStatus.loading ? 1 : 1.05 }}
                  whileTap={{ scale: formStatus.loading ? 1 : 0.95 }}
                  className={`btn-shine px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 ${
                    formStatus.loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {formStatus.loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        Mesaj Gönder
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">yusufkaya380908@gmail.com</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Telefon</p>
                      <p className="text-white font-medium">+90 553 583 6306</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-12 mt-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-400"
            >
              © {new Date().getFullYear()} <span className="gradient-text font-semibold">Yusuf Kaya</span>. Tüm hakları saklıdır.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex gap-4"
            >
              <a href="https://github.com/YusufKaya00" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                GitHub
              </a>
              <span className="text-gray-600">•</span>
              <a href="https://linkedin.com/in/yusuf-kaya-2a2a48285" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                LinkedIn
              </a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
