'use client';

import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

function SearchParamsHandler({ setLayoutKeyCallback }: { setLayoutKeyCallback: (key: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleHashChange = () => {
      setLayoutKeyCallback(`${pathname}${window.location.hash}`);
    };

    setLayoutKeyCallback(`${pathname}${window.location.hash}`);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, searchParams, setLayoutKeyCallback]);

  return null;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [layoutKey, setLayoutKey] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll progress bar - daha smooth ayarlar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Performance: Throttle scroll handler with requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          setShowScrollTop(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };

    // İlk durumu ayarla
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { href: '/portfolio', label: 'TOOLS' },
    { href: '/blog', label: 'BLOG' },
    { href: '/cv', label: 'MY CV' },
    { href: '/#about', label: 'ABOUT', scrollTo: 'about' },
    { href: '/#contact', label: 'CONTACT', scrollTo: 'contact' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (link.scrollTo && pathname === '/') {
      // Ana sayfadaysak direkt scroll - instant scroll için kasma yok
      const element = document.getElementById(link.scrollTo);
      if (element) {
        const offset = 80; // navbar height
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else if (link.scrollTo) {
      // Başka sayfadaysak ana sayfaya git ve sonra scroll
      localStorage.setItem('scrollTo', link.scrollTo);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler setLayoutKeyCallback={setLayoutKey} />
      </Suspense>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled
          ? 'glass-strong shadow-2xl border-b border-white/10'
          : 'bg-gradient-to-r from-gray-900/30 to-gray-800/30 backdrop-blur-md border-b border-gray-700/20'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                  <span className="text-white font-bold text-lg">YK</span>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </motion.div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (link.scrollTo && pathname === '/') {
                        e.preventDefault();
                        handleNavClick(link);
                      } else if (link.scrollTo) {
                        // Başka sayfadaysak localStorage'a kaydet ve ana sayfaya git
                        handleNavClick(link);
                      }
                    }}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${pathname === link.href || (link.scrollTo && pathname === '/')
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {pathname === link.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass text-white hover:bg-white/10 transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden glass-strong border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (link.scrollTo && pathname === '/') {
                          e.preventDefault();
                          handleNavClick(link);
                        } else if (link.scrollTo) {
                          // Başka sayfadaysak localStorage'a kaydet ve ana sayfaya git
                          handleNavClick(link);
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === link.href
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Page Content - Optimized faster transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={layoutKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="pt-16"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
} 