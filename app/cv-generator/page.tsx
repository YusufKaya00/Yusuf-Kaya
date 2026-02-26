'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import OpenAI from 'openai';

// Form veri tipleri
type Experience = {
  position: string;
  company: string;
  period: string;
  details: string;
};

type Education = {
  degree: string;
  school: string;
  period: string;
  gpa: string;
};

type Skill = {
  category: string;
  level: string;
};

type Language = {
  name: string;
  level: string;
};

type Link = {
  name: string;
  url: string;
};

type Project = {
  name: string;
  description: string;
  tags: string;
};

type FormData = {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  links: Link[];
  projects: Project[];
};

export default function CVGenerator() {
  // State for user inputs
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    experience: [{ position: '', company: '', period: '', details: '' }],
    education: [{ degree: '', school: '', period: '', gpa: '' }],
    skills: [{ category: '', level: '' }],
    languages: [{ name: '', level: '' }],
    links: [{ name: '', url: '' }],
    projects: [{ name: '', description: '', tags: '' }]
  });

  // Şablon seçimi için state
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal' | 'simple-text' | 'professional' | 'executive' | 'portfolio' | 'portfolio-text' | 'minimal-noexp'>('classic');

  // Dil seçimi için state (TR veya EN)
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  // CV section labels for both languages
  const labels: Record<'tr' | 'en', any> = {
    tr: {
      experience: 'İŞ DENEYİMİ',
      education: 'EĞİTİM',
      skills: 'BECERİLER',
      languages: 'DİLLER',
      projects: 'PROJELER',
      links: 'BAĞLANTILAR',
      contact: 'İLETİŞİM',
      gpa: 'Not Ortalaması',
      position: 'Pozisyon',
      company: 'Şirket',
      period: 'Dönem',
      details: 'Detaylar...',
      degree: 'Derece',
      school: 'Okul',
      skill: 'Beceri',
      level: 'Seviye',
      language: 'Dil',
      fullName: 'Ad Soyad',
      address: 'Adres',
      phoneLabel: 'Telefon',
      emailLabel: 'E-posta',
      technologies: 'Teknolojiler',
      projectName: 'Proje Adı',
      projectDesc: 'Proje açıklaması',
    },
    en: {
      experience: 'WORK EXPERIENCE',
      education: 'EDUCATION',
      skills: 'SKILLS',
      languages: 'LANGUAGES',
      projects: 'PROJECTS',
      links: 'LINKS',
      contact: 'CONTACT',
      gpa: 'GPA',
      position: 'Position',
      company: 'Company',
      period: 'Period',
      details: 'Details...',
      degree: 'Degree',
      school: 'School',
      skill: 'Skill',
      level: 'Level',
      language: 'Language',
      fullName: 'Full Name',
      address: 'Address',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      technologies: 'Technologies',
      projectName: 'Project Name',
      projectDesc: 'Project description',
    }
  };

  // ... (existing code)



  // State for AI prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the CV container for PDF generation
  const cvRef = useRef<HTMLDivElement>(null);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: keyof FormData,
    index?: number,
    field?: string
  ) => {
    const { name, value } = e.target;

    if (section && index !== undefined && field) {
      // For nested objects like experience, education, skills
      setFormData(prev => {
        const updatedSection = [...prev[section] as any[]];
        updatedSection[index] = {
          ...updatedSection[index],
          [field]: value
        };
        return { ...prev, [section]: updatedSection };
      });
    } else {
      // For top-level fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add new item to a section array
  const addItem = (section: keyof FormData, template: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), template]
    }));
  };

  // Remove an item from a section array
  const removeItem = (section: keyof FormData, index: number) => {
    const sectionArray = formData[section] as any[];
    if (sectionArray.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i: number) => i !== index)
    }));
  };

  // Generate PDF from the CV container
  const generatePDF = async () => {
    if (cvRef.current) {
      try {
        // Create a deep clone of the CV container to modify it without affecting the UI
        const clonedCv = cvRef.current.cloneNode(true) as HTMLElement;

        // Boyutunu A4 kağıdına uygun ayarla
        clonedCv.style.width = '210mm';
        clonedCv.style.minHeight = '297mm';
        clonedCv.style.padding = '10mm';
        clonedCv.style.boxSizing = 'border-box';

        // Apply a style reset to remove Tailwind's oklch colors
        const resetStyles = document.createElement('style');
        resetStyles.textContent = `
          /* Basic reset for PDF generation */
          * {
            font-family: 'Arial', sans-serif !important;
          }
          
          /* Replace common color classes with hex values */
          .bg-indigo-600, [class*="bg-indigo"] { background-color: #4f46e5 !important; }
          .text-indigo-600, [class*="text-indigo"] { color: #4f46e5 !important; }
          .border-indigo-600, [class*="border-indigo"] { border-color: #4f46e5 !important; }
          
          .bg-blue-600, [class*="bg-blue"] { background-color: #2563eb !important; }
          .text-blue-600, [class*="text-blue"] { color: #2563eb !important; }
          .border-blue-600, [class*="border-blue"] { border-color: #2563eb !important; }
          
          .bg-purple-600, [class*="bg-purple"] { background-color: #9333ea !important; }
          .text-purple-600, [class*="text-purple"] { color: #9333ea !important; }
          .border-purple-600, [class*="border-purple"] { border-color: #9333ea !important; }
          
          .bg-gray-900, [class*="bg-gray"] { background-color: #111827 !important; }
          .text-gray-900, [class*="text-gray"] { color: #111827 !important; }
          .border-gray-900, [class*="border-gray"] { border-color: #111827 !important; }
          
          .bg-white { background-color: #ffffff !important; }
          .text-white { color: #ffffff !important; }
          
          .bg-black { background-color: #000000 !important; }
          .text-black { color: #000000 !important; }
          
          /* Adjust font sizes for better visibility */
          h1 { font-size: 24pt !important; font-weight: bold !important; }
          h2 { font-size: 18pt !important; font-weight: bold !important; }
          h3 { font-size: 14pt !important; font-weight: bold !important; }
          
          /* Adjust layout for full page */
          .p-8 { padding: 10mm !important; }
          
          /* Ensure content fills the page */
          .min-h-\\[297mm\\] {
            min-height: 277mm !important; /* 297mm - 20mm for padding */
          }
          
          /* Font style fixes */
          * {
            text-rendering: geometricPrecision !important;
            -webkit-font-smoothing: antialiased !important;
          }
          
          /* Fix line heights */
          p, div { line-height: 1.5 !important; }
          h1, h2, h3 { line-height: 1.3 !important; }
          
          /* Make full width elements actually full width */
          .w-full { width: 100% !important; }
          

          
          /* Set correct margins/spacing */
          body { margin: 0 !important; }
          
          /* Optimize spacing */
          .mb-1, .my-1, .m-1 { margin-bottom: 0.25rem !important; }
          .mb-2, .my-2, .m-2 { margin-bottom: 0.5rem !important; }
          .mb-3, .my-3, .m-3 { margin-bottom: 0.75rem !important; }
          .mb-4, .my-4, .m-4 { margin-bottom: 1rem !important; }
          
          .mt-1, .my-1, .m-1 { margin-top: 0.25rem !important; }
          .mt-2, .my-2, .m-2 { margin-top: 0.5rem !important; }
          .mt-3, .my-3, .m-3 { margin-top: 0.75rem !important; }
          .mt-4, .my-4, .m-4 { margin-top: 1rem !important; }

          /* Modern şablon için grid düzeltmeleri */
          .grid-cols-12 { 
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          
          .gap-8 {
            gap: 2rem !important;
          }
          
          .col-span-8 {
            grid-column: span 8 / span 8 !important;
          }
          
          .col-span-4 {
            grid-column: span 4 / span 4 !important;
          }
          
          /* Portfolio şablonu için gerekli stiller */
          .portfolio-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          
          .portfolio-item {
            border: 1px solid #e5e7eb !important;
            border-radius: 0.5rem !important;
            padding: 1rem !important;
            margin-bottom: 1rem !important;
          }
          
          .portfolio-title {
            font-weight: bold !important;
            font-size: 14pt !important;
            margin-bottom: 0.5rem !important;
          }
          
          .tag {
            display: inline-block !important;
            background-color: #f3f4f6 !important;
            color: #4b5563 !important;
            padding: 0.25rem 0.5rem !important;
            border-radius: 9999px !important;
            font-size: 8pt !important;
            margin-right: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }
        `;

        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm'; // A4 width
        tempContainer.style.height = '297mm'; // A4 height
        tempContainer.appendChild(resetStyles);
        tempContainer.appendChild(clonedCv);
        document.body.appendChild(tempContainer);

        try {
          // Daha yüksek kalite için ölçek faktörünü artır (Bellek optimizasyonu için 2.5 -> 2.0 düşürüldü)
          const scaleFactor = 2.0; // Yüksek kalite için yeterli ve daha güvenli

          // Use html2canvas with specific settings to bypass color function issues
          const canvas = await html2canvas(clonedCv, {
            scale: scaleFactor,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false, // Disable logging
            width: 210 * 3.779527559, // A4 genişliği piksel (mm to px)
            height: 297 * 3.779527559, // A4 yüksekliği piksel (mm to px)
            windowWidth: 210 * 3.779527559,
            windowHeight: 297 * 3.779527559,
            onclone: (doc) => {
              // Force all elements to use standard colors
              const allElements = doc.querySelectorAll('*');
              allElements.forEach(el => {
                if (el instanceof HTMLElement) {
                  const computedStyle = getComputedStyle(el);
                  const bgColor = computedStyle.backgroundColor;
                  const textColor = computedStyle.color;

                  // Apply computed colors directly as inline styles
                  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.backgroundColor = bgColor;
                  }

                  if (textColor) {
                    el.style.color = textColor;
                  }

                  // CV içeriğinde boşlukları optimize et
                  if (el.tagName === 'DIV' && el.classList.contains('mb-6')) {
                    el.style.marginBottom = '12px';
                  }

                  // Optimize heading sizes
                  if (el.tagName === 'H1') {
                    el.style.fontSize = '24pt';
                    el.style.fontWeight = 'bold';
                  } else if (el.tagName === 'H2') {
                    el.style.fontSize = '18pt';
                    el.style.fontWeight = 'bold';
                  } else if (el.tagName === 'H3') {
                    el.style.fontSize = '14pt';
                    el.style.fontWeight = 'bold';
                  }
                }
              });

              // CV container'ını düzenle
              const pdfContainer = doc.querySelector('[ref="cvRef"]');
              if (pdfContainer && pdfContainer instanceof HTMLElement) {
                pdfContainer.style.width = '190mm'; // A4 - margins
                pdfContainer.style.minHeight = '277mm'; // A4 - margins
                pdfContainer.style.padding = '10mm';
                pdfContainer.style.backgroundColor = '#ffffff';
                pdfContainer.style.overflow = 'visible';
                pdfContainer.style.boxSizing = 'border-box';
              }
            }
          });

          // Create PDF with the canvas
          const imgData = canvas.toDataURL('image/png', 1.0); // Tam kalite

          // PDF oluştur
          const pdf = new jspdf({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });

          // A4 boyutu (mm olarak)
          const pdfWidth = 210;
          const pdfHeight = 297;

          // PDF'in tam boyutuna ayarla
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

          // Download the PDF
          pdf.save(`${formData.fullName || 'cv'}.pdf`);
        } finally {
          // Always clean up the temporary container
          if (tempContainer && tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
          }
        }
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('An error occurred while creating the PDF. Please check the browser console.');
      }
    }
  };

  // Generate CV using AI (OpenRouter - Mistral Devstral)
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/cv-ai-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      if (data.cv) {
        setFormData(data.cv);
      } else {
        throw new Error('CV data not found in response');
      }
    } catch (error) {
      console.error('AI CV generation failed:', error);
      alert('An error occurred while creating the CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-black z-0" />

      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-indigo-500/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block px-4 py-2 rounded-full backdrop-blur-md bg-white/5 border border-purple-500/30 mb-4"
          >
            <span className="text-purple-400 text-sm font-medium">CV Generator</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 mb-4">
            CV Generator
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create your professional CV easily with AI-powered tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 shadow-2xl border border-white/10"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white">Enter Information</h2>

            {/* AI Generator */}
            <div className="mb-8 rounded-xl p-5 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-purple-300">Auto-generate with AI</h3>
              </div>
              <div className="mb-4">
                <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Write a few sentences about your experience:
                </label>
                <textarea
                  id="aiPrompt"
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="I'm a software engineer with 5 years of experience, working with React and Node.js..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateWithAI}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Auto-fill with AI
                  </>
                )}
              </motion.button>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">Personal Information</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Istanbul, Turkey"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="john@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Work Experience</h3>
                  <button
                    onClick={() => addItem('experience', { position: '', company: '', period: '', details: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Experience
                  </button>
                </div>

                {formData.experience.map((exp, index) => (
                  <div key={index} className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                      {formData.experience.length > 1 && (
                        <button
                          onClick={() => removeItem('experience', index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleInputChange(e, 'experience', index, 'position')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleInputChange(e, 'experience', index, 'company')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Period
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleInputChange(e, 'experience', index, 'period')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="Oct 2019 - Present"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Details
                      </label>
                      <textarea
                        rows={3}
                        value={exp.details}
                        onChange={(e) => handleInputChange(e, 'experience', index, 'details')}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Your responsibilities and achievements in this position..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Education</h3>
                  <button
                    onClick={() => addItem('education', { degree: '', school: '', period: '', gpa: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Education
                  </button>
                </div>

                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                      {formData.education.length > 1 && (
                        <button
                          onClick={() => removeItem('education', index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Kaldır
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleInputChange(e, 'education', index, 'degree')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          School
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleInputChange(e, 'education', index, 'school')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Dönem
                        </label>
                        <input
                          type="text"
                          value={edu.period}
                          onChange={(e) => handleInputChange(e, 'education', index, 'period')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="2015 - 2019"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          GPA
                        </label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => handleInputChange(e, 'education', index, 'gpa')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="3.8/4.0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Skills</h3>
                  <button
                    onClick={() => addItem('skills', { category: '', level: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Skill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-3 bg-black/20 flex justify-between items-center">
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                          {formData.skills.length > 1 && (
                            <button
                              onClick={() => removeItem('skills', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={skill.category}
                          onChange={(e) => handleInputChange(e, 'skills', index, 'category')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="Skill name"
                        />

                        <input
                          type="text"
                          value={skill.level}
                          onChange={(e) => handleInputChange(e, 'skills', index, 'level')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="Experienced, Beginner, etc."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Languages</h3>
                  <button
                    onClick={() => addItem('languages', { name: '', level: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Language
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.languages.map((language, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-3 bg-black/20 flex justify-between items-center">
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                          {formData.languages.length > 1 && (
                            <button
                              onClick={() => removeItem('languages', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={language.name}
                          onChange={(e) => handleInputChange(e, 'languages', index, 'name')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="English, Turkish, etc."
                        />

                        <input
                          type="text"
                          value={language.level}
                          onChange={(e) => handleInputChange(e, 'languages', index, 'level')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="Fluent, Intermediate, Beginner"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Links</h3>
                  <button
                    onClick={() => addItem('links', { name: '', url: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Link
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.links.map((link, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-3 bg-black/20 flex justify-between items-center">
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                          {formData.links.length > 1 && (
                            <button
                              onClick={() => removeItem('links', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => handleInputChange(e, 'links', index, 'name')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="LinkedIn, Github, vb."
                        />

                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleInputChange(e, 'links', index, 'url')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projeler Bölümü - Portfolio şablonu seçildiğinde görünür */}
              {(selectedTemplate === 'portfolio' || selectedTemplate === 'portfolio-text' || selectedTemplate === 'minimal-noexp' || selectedTemplate === 'minimal') && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium text-white">Projelerim</h3>
                    <button
                      onClick={() => addItem('projects', { name: '', description: '', tags: '' })}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Proje Ekle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">Proje #{index + 1}</span>
                          {formData.projects.length > 1 && (
                            <button
                              onClick={() => removeItem('projects', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Kaldır
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Proje Adı
                            </label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'name')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder="Projenin adı"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Açıklama
                            </label>
                            <textarea
                              rows={3}
                              value={project.description}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'description')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder="Proje hakkında kısa açıklama"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Etiketler
                            </label>
                            <input
                              type="text"
                              value={project.tags}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'tags')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder="React, TypeScript, Node.js (virgülle ayırın)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* CV Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col"
          >
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 shadow-2xl border border-white/10 mb-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-white">Önizleme</h2>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTemplate('classic')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'classic'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Klasik
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('modern')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'modern'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('professional')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'professional'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Profesyonel
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('executive')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'executive'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Yönetici
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('minimal')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'minimal'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Minimal
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('simple-text')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'simple-text'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      Sade Metin
                    </button>
                  </div>

                  {/* Language Toggle */}
                  <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => setLanguage('tr')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'tr'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      🇹🇷 TR
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      🇬🇧 EN
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2.5 px-5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/25"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF İndir
                  </motion.button>
                </div>
              </div>

              <div
                ref={cvRef}
                className="bg-white text-black font-serif p-8 rounded-md shadow-lg min-h-[297mm] max-w-[210mm] mx-auto overflow-hidden"
                style={{ maxHeight: '80vh', overflowY: 'auto' }}
              >
                {selectedTemplate === 'classic' && (
                  <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', color: '#000000', backgroundColor: '#ffffff' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px' }}>
                      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px', margin: 0 }}>
                        {formData.fullName || labels[language].fullName}
                      </h1>
                      <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '12px', margin: '8px 0' }}>
                        {formData.title || labels[language].position}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                        {formData.location && <span>📍 {formData.location}</span>}
                        {formData.email && <span>✉️ {formData.email}</span>}
                        {formData.phone && <span>📞 {formData.phone}</span>}
                        {formData.links.map((link, index) => (
                          <span key={index}>🔗 {link.name}: {link.url}</span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '16px' }}>
                        {labels[language].experience}
                      </h2>
                      {formData.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>{exp.position || labels[language].position}</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{exp.period || labels[language].period}</span>
                          </div>
                          <div style={{ fontSize: '15px', color: '#374151', marginBottom: '4px' }}>{exp.company || labels[language].company}</div>
                          <div style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                            {exp.details || labels[language].details}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Education */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '16px' }}>
                        {labels[language].education}
                      </h2>
                      {formData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>{edu.degree || labels[language].degree}</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{edu.period || labels[language].period}</span>
                          </div>
                          <div style={{ fontSize: '15px', color: '#374151' }}>{edu.school || labels[language].school}</div>
                          {edu.gpa && <div style={{ fontSize: '14px', color: '#6b7280' }}>{labels[language].gpa}: {edu.gpa}</div>}
                        </div>
                      ))}
                    </div>

                    {/* Skills & Languages */}
                    <div style={{ display: 'flex', gap: '32px' }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].skills}
                        </h2>
                        {formData.skills.map((skill, index) => (
                          <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <span style={{ fontWeight: '500', color: '#1f2937' }}>{skill.category || labels[language].skill}</span>
                            <span style={{ color: '#6b7280' }}> - {skill.level || labels[language].level}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].languages}
                        </h2>
                        {formData.languages.map((lang, index) => (
                          <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                            <span style={{ fontWeight: '500', color: '#1f2937' }}>{lang.name || labels[language].language}</span>
                            <span style={{ color: '#6b7280' }}> - {lang.level || labels[language].level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'modern' && (
                  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
                    {/* Header with gradient */}
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff', padding: '32px' }}>
                      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
                        {formData.fullName || labels[language].fullName}
                      </h1>
                      <p style={{ fontSize: '20px', marginBottom: '16px', margin: '8px 0 16px 0', opacity: 0.9 }}>
                        {formData.title || labels[language].position}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px' }}>
                        {formData.location && <span>📍 {formData.location}</span>}
                        {formData.email && <span>✉️ {formData.email}</span>}
                        {formData.phone && <span>📞 {formData.phone}</span>}
                      </div>
                    </div>

                    {/* Two column layout */}
                    <div style={{ display: 'flex', padding: '24px' }}>
                      {/* Main content */}
                      <div style={{ flex: 2, paddingRight: '24px' }}>
                        {/* Experience */}
                        <div style={{ marginBottom: '24px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {labels[language].experience}
                          </h2>
                          {formData.experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{exp.position || 'Pozisyon'}</h3>
                              <div style={{ display: 'table', width: '100%', margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'table-cell', textAlign: 'left' }}>{exp.company || 'Şirket'}</div>
                                <div style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap', width: '1%' }}>{exp.period || 'Dönem'}</div>
                              </div>
                              <p style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-line', lineHeight: '1.5', margin: '8px 0 0 0' }}>{exp.details || 'Detaylar...'}</p>
                            </div>
                          ))}
                        </div>

                        {/* Education */}
                        <div style={{ marginBottom: '24px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {labels[language].education}
                          </h2>
                          {formData.education.map((edu, index) => (
                            <div key={index} style={{ marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{edu.degree || 'Derece'}</h3>
                              <div style={{ display: 'table', width: '100%', margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'table-cell', textAlign: 'left' }}>{edu.school || 'Okul'}</div>
                                <div style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap', width: '1%' }}>{edu.period || 'Dönem'}</div>
                              </div>
                              {edu.gpa && <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>Not: {edu.gpa}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sidebar */}
                      <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
                        {/* Skills */}
                        <div style={{ marginBottom: '24px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {labels[language].skills}
                          </h2>
                          {formData.skills.map((skill, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{skill.category || 'Beceri'}</div>
                              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  backgroundColor: '#6366f1',
                                  borderRadius: '3px',
                                  width: skill.level === 'İleri' ? '90%' : skill.level === 'Orta' ? '60%' : skill.level === 'Başlangıç' ? '30%' : '70%'
                                }}></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Languages */}
                        <div style={{ marginBottom: '24px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {labels[language].languages}
                          </h2>
                          {formData.languages.map((language, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{language.name || 'Dil'}</div>
                              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  backgroundColor: '#6366f1',
                                  borderRadius: '3px',
                                  width: language.level === 'Anadil' ? '100%' : language.level === 'İleri' ? '90%' : language.level === 'Orta' ? '60%' : '40%'
                                }}></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Links */}
                        <div>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            Bağlantılar
                          </h2>
                          {formData.links.map((link, index) => (
                            <div key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                              <span style={{ fontWeight: '500', color: '#1f2937' }}>{link.name}: </span>
                              <span style={{ color: '#6366f1', wordBreak: 'break-all' }}>{link.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'minimal' && (
                  <div className="p-8 font-serif">
                    <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                      <h1 style={{ fontSize: '18pt', marginBottom: '0.5rem', fontWeight: 'bold' }}>{formData.fullName || 'AD SOYAD'}</h1>
                      <p style={{ fontSize: '12pt', marginBottom: '0.5rem' }}>{formData.title || labels[language].position}</p>

                      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        {formData.location && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>Adres: {formData.location}</div>}
                        {formData.email && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>E-posta: {formData.email}</div>}
                        {formData.phone && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>Telefon: {formData.phone}</div>}

                        {formData.links.map((link, index) => (
                          <div key={index} style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>
                            {link.name}: {link.url}
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr style={{ margin: '1rem 0', borderTop: '1px solid #ddd' }} />

                    {/* İş Deneyimi Bölümü */}
                    {formData.experience.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].experience}</h2>

                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'table', width: '100%' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontWeight: 'bold', fontSize: '11pt' }}>{exp.position || 'Pozisyon'}</div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '10pt', whiteSpace: 'nowrap', width: '1%' }}>{exp.period || 'Dönem'}</div>
                            </div>
                            <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{exp.company || 'Şirket'}</div>
                            <div style={{ fontSize: '10pt' }}>{exp.details || 'Detaylar'}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Eğitim Bölümü */}
                    {formData.education.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].education}</h2>

                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'table', width: '100%' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontWeight: 'bold', fontSize: '11pt' }}>{edu.degree || 'Derece'}</div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '10pt', whiteSpace: 'nowrap', width: '1%' }}>{edu.period || 'Dönem'}</div>
                            </div>
                            <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{edu.school || 'Okul'}</div>
                            {edu.gpa && <div style={{ fontSize: '10pt' }}>GPA: {edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Beceriler ve Diller Bölümü (Yan yana) */}
                    <div style={{ display: 'flex', columnGap: '2rem' }}>
                      {/* Beceriler */}
                      {formData.skills.length > 0 && (
                        <div style={{ flex: 1 }}>
                          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].skills}</h2>

                          {formData.skills.map((skill, index) => (
                            <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span>{skill.category || 'Beceri'}</span>
                              <span>{skill.level || 'Seviye'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Diller */}
                      {formData.languages.length > 0 && (
                        <div style={{ flex: 1 }}>
                          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].languages}</h2>

                          {formData.languages.map((language, index) => (
                            <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span>{language.name || 'Dil'}</span>
                              <span>{language.level || 'Seviye'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Template - Clean with sidebar */}
                {selectedTemplate === 'professional' && (
                  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', display: 'flex' }}>
                    {/* Left Sidebar */}
                    <div style={{ width: '35%', backgroundColor: '#1e3a5f', color: '#ffffff', padding: '24px' }}>
                      {/* Profile */}
                      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ffffff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', color: '#1e3a5f', fontWeight: 'bold' }}>
                            {formData.fullName?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                          {formData.fullName || 'Ad Soyad'}
                        </h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                          {formData.title || 'Pozisyon'}
                        </p>
                      </div>

                      {/* Contact */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          {labels[language].contact}
                        </h2>
                        {formData.email && <div style={{ fontSize: '12px', marginBottom: '8px' }}>✉️ {formData.email}</div>}
                        {formData.phone && <div style={{ fontSize: '12px', marginBottom: '8px' }}>📞 {formData.phone}</div>}
                        {formData.location && <div style={{ fontSize: '12px', marginBottom: '8px' }}>📍 {formData.location}</div>}
                      </div>

                      {/* Skills */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          {labels[language].skills}
                        </h2>
                        {formData.skills.map((skill, index) => (
                          <div key={index} style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>{skill.category}</div>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                              <div style={{
                                height: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: '2px',
                                width: skill.level === 'İleri' ? '90%' : skill.level === 'Orta' ? '60%' : '40%'
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Languages */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          {labels[language].languages}
                        </h2>
                        {formData.languages.map((language, index) => (
                          <div key={index} style={{ fontSize: '12px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '500' }}>{language.name}</span>
                            <span style={{ opacity: 0.8 }}> - {language.level}</span>
                          </div>
                        ))}
                      </div>

                      {/* Links */}
                      {formData.links.length > 0 && (
                        <div>
                          <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                            {labels[language].links}
                          </h2>
                          {formData.links.map((link, index) => (
                            <div key={index} style={{ fontSize: '11px', marginBottom: '6px', wordBreak: 'break-all' }}>
                              {link.name}: {link.url}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div style={{ flex: 1, padding: '24px' }}>
                      {/* Experience */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].experience}
                        </h2>
                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '16px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{exp.position}</h3>
                            <div style={{ fontSize: '14px', color: '#1e3a5f', fontWeight: '500', margin: '4px 0' }}>{exp.company}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{exp.period}</div>
                            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{exp.details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].education}
                        </h2>
                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '12px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{edu.degree}</h3>
                            <div style={{ fontSize: '14px', color: '#1e3a5f', margin: '4px 0' }}>{edu.school}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{edu.period}</div>
                            {edu.gpa && <div style={{ fontSize: '12px', color: '#6b7280' }}>Not: {edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Template - Elegant for senior positions */}
                {selectedTemplate === 'executive' && (
                  <div style={{ fontFamily: 'Georgia, serif', backgroundColor: '#ffffff' }}>
                    {/* Elegant Header */}
                    <div style={{ backgroundColor: '#1a1a2e', color: '#ffffff', padding: '40px 32px', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '36px', fontWeight: 'normal', letterSpacing: '4px', margin: 0, marginBottom: '8px', textTransform: 'uppercase' }}>
                        {formData.fullName || labels[language].fullName}
                      </h1>
                      <div style={{ width: '60px', height: '2px', backgroundColor: '#c9a227', margin: '16px auto' }}></div>
                      <p style={{ fontSize: '18px', letterSpacing: '2px', margin: 0, color: '#c9a227', textTransform: 'uppercase' }}>
                        {formData.title || labels[language].position}
                      </p>
                    </div>

                    {/* Contact Bar */}
                    <div style={{ backgroundColor: '#f8f8f8', padding: '16px 32px', display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '13px', color: '#4a4a4a', borderBottom: '1px solid #e0e0e0' }}>
                      {formData.email && <span>✉ {formData.email}</span>}
                      {formData.phone && <span>☎ {formData.phone}</span>}
                      {formData.location && <span>⌂ {formData.location}</span>}
                    </div>

                    {/* Main Content */}
                    <div style={{ padding: '32px' }}>
                      {/* Experience */}
                      <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#1a1a2e', borderBottom: '1px solid #c9a227', paddingBottom: '8px', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                          {labels[language].experience}
                        </h2>
                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>{exp.position}</h3>
                              <span style={{ fontSize: '13px', color: '#666666', fontStyle: 'italic' }}>{exp.period}</span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#c9a227', fontWeight: '500', margin: '4px 0 8px 0' }}>{exp.company}</div>
                            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{exp.details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Two Columns */}
                      <div style={{ display: 'flex', gap: '40px' }}>
                        {/* Education */}
                        <div style={{ flex: 1 }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#1a1a2e', borderBottom: '1px solid #c9a227', paddingBottom: '8px', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {labels[language].education}
                          </h2>
                          {formData.education.map((edu, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>{edu.degree}</div>
                              <div style={{ fontSize: '13px', color: '#666666' }}>{edu.school}</div>
                              <div style={{ fontSize: '12px', color: '#888888', fontStyle: 'italic' }}>{edu.period}</div>
                            </div>
                          ))}
                        </div>

                        {/* Skills & Languages */}
                        <div style={{ flex: 1 }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#1a1a2e', borderBottom: '1px solid #c9a227', paddingBottom: '8px', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {labels[language].skills}
                          </h2>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {formData.skills.map((skill, index) => (
                              <span key={index} style={{ fontSize: '12px', padding: '4px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', color: '#1a1a2e' }}>
                                {skill.category}
                              </span>
                            ))}
                          </div>

                          <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#1a1a2e', borderBottom: '1px solid #c9a227', paddingBottom: '8px', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {labels[language].languages}
                          </h2>
                          {formData.languages.map((language, index) => (
                            <div key={index} style={{ fontSize: '13px', marginBottom: '6px', color: '#4a4a4a' }}>
                              <span style={{ fontWeight: '500' }}>{language.name}</span> — {language.level}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'minimal' && (
                  <div className="p-8 font-serif">
                    <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                      <h1 style={{ fontSize: '18pt', marginBottom: '0.5rem', fontWeight: 'bold' }}>{formData.fullName || labels[language].fullName}</h1>
                      <p style={{ fontSize: '12pt', marginBottom: '0.5rem' }}>{formData.title || labels[language].position}</p>

                      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        {formData.location && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{labels[language].address}: {formData.location}</div>}
                        {formData.email && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{labels[language].emailLabel}: {formData.email}</div>}
                        {formData.phone && <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{labels[language].phoneLabel}: {formData.phone}</div>}

                        {formData.links.map((link, index) => (
                          <div key={index} style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>
                            {link.name}: {link.url}
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr style={{ margin: '1rem 0', borderTop: '1px solid #ddd' }} />

                    {/* İki sütunlu düzen */}
                    <div style={{ display: 'flex', columnGap: '2rem' }}>
                      {/* Sol Sütun */}
                      <div style={{ flex: 1 }}>
                        {/* Beceriler */}
                        {formData.skills.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].skills}</h2>

                            {formData.skills.map((skill, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{skill.category || labels[language].skill}</span>
                                <span>{skill.level || labels[language].level}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Diller */}
                        {formData.languages.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].languages}</h2>

                            {formData.languages.map((language, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{language.name || labels[language].language}</span>
                                <span>{language.level || labels[language].level}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Projeler */}
                        {formData.projects.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].projects}</h2>

                            {formData.projects.map((project, index) => (
                              <div key={index} style={{ marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{project.name || labels[language].projectName}</div>
                                <p style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{project.description || labels[language].projectDesc}</p>

                                {project.tags && (
                                  <div style={{ fontSize: '9pt' }}>
                                    <span style={{ fontStyle: 'italic' }}>{labels[language].technologies}: </span>
                                    {project.tags}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sağ Sütun */}
                      <div style={{ flex: 2 }}>
                        {/* İş Deneyimi */}
                        {formData.experience.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].experience}</h2>

                            {formData.experience.map((exp, index) => (
                              <div key={index} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{exp.position || 'Pozisyon'}</div>
                                  <div style={{ fontSize: '10pt' }}>{exp.period || 'Dönem'}</div>
                                </div>
                                <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{exp.company || 'Şirket'}</div>
                                <div style={{ fontSize: '10pt' }}>{exp.details || 'Detaylar'}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Eğitim */}
                        {formData.education.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].education}</h2>

                            {formData.education.map((edu, index) => (
                              <div key={index} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.degree || 'Derece'}</div>
                                  <div style={{ fontSize: '10pt' }}>{edu.period || 'Dönem'}</div>
                                </div>
                                <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{edu.school || 'Okul'}</div>
                                {edu.gpa && <div style={{ fontSize: '10pt' }}>GPA: {edu.gpa}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'portfolio' && (
                  <div className="p-8 bg-white">
                    <div className="bg-purple-600 py-4 px-6 text-white text-center">
                      <h1 className="text-3xl font-bold mb-1">{formData.fullName || 'AD SOYAD'}</h1>
                      <p className="text-xl">{formData.title || 'Pozisyon'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-8">
                      <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">İLETİŞİM</h2>
                          <div className="text-sm space-y-2">
                            {formData.email && (
                              <div>
                                <span className="font-bold">Email:</span> {formData.email}
                              </div>
                            )}
                            {formData.phone && (
                              <div>
                                <span className="font-bold">Telefon:</span> {formData.phone}
                              </div>
                            )}
                            {formData.location && (
                              <div>
                                <span className="font-bold">Adres:</span> {formData.location}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">BAĞLANTILAR</h2>
                          <div className="text-sm space-y-2">
                            {formData.links.map((link, index) => (
                              <div key={index}>
                                <span className="font-bold">{link.name}:</span> {link.url}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">YETENEKLER</h2>
                          <div className="text-sm space-y-3">
                            {formData.skills.map((skill, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold">{skill.category || 'Beceri'}</span>
                                  <span>{skill.level || 'Seviye'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${parseInt(skill.level) * 10 || 50}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">DİLLER</h2>
                          <div className="text-sm space-y-3">
                            {formData.languages.map((language, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold">{language.name || 'Dil'}</span>
                                  <span>{language.level || 'Seviye'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${parseInt(language.level) * 10 || 50}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">PROFİL</h2>
                          <p className="text-sm">
                            {formData.title ? `${formData.fullName} ${formData.title} pozisyonunda çalışan deneyimli bir profesyonel.` : 'Bu alan CV\'nizin kısa bir özetini içerecektir.'}
                          </p>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">ÇALIŞMA DENEYİMİ</h2>
                          <div className="space-y-4">
                            {formData.experience.map((exp, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-base">{exp.position || 'Pozisyon'}</h3>
                                    <p className="text-sm text-gray-600">{exp.company || 'Şirket'}</p>
                                  </div>
                                  <p className="text-sm text-gray-600">{exp.period || 'Dönem'}</p>
                                </div>
                                <p className="text-sm mt-1">{exp.details || 'İş detayları'}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">EĞİTİM</h2>
                          <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-base">{edu.degree || 'Derece'}</h3>
                                    <p className="text-sm text-gray-600">{edu.school || 'Okul'}</p>
                                  </div>
                                  <p className="text-sm text-gray-600">{edu.period || 'Dönem'}</p>
                                </div>
                                {edu.gpa && <p className="text-sm mt-1">GPA: {edu.gpa}</p>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">PROJELER</h2>
                          <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                              <div key={index}>
                                <h3 className="font-bold text-base">{project.name || 'Proje Adı'}</h3>
                                <p className="text-sm mt-1">{project.description || 'Proje açıklaması'}</p>
                                {project.tags && (
                                  <p className="text-xs mt-1 text-purple-800">
                                    <span className="font-bold">Teknolojiler:</span> {project.tags}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'portfolio-text' && (
                  <div className="p-8 font-serif">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <h1 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '0.5rem' }}>{formData.fullName || 'AD SOYAD'}</h1>
                      <p style={{ fontSize: '12pt', marginBottom: '1rem' }}>{formData.title || 'Pozisyon'}</p>

                      <div style={{ fontSize: '10pt' }}>
                        {formData.location && <span style={{ marginRight: '1rem' }}>{formData.location}</span>}
                        {formData.email && <span style={{ marginRight: '1rem' }}>{formData.email}</span>}
                        {formData.phone && <span>{formData.phone}</span>}
                      </div>

                      {formData.links.length > 0 && (
                        <div style={{ fontSize: '10pt', marginTop: '0.5rem' }}>
                          {formData.links.map((link, index) => (
                            <span key={index} style={{ marginRight: '1rem' }}>
                              {link.name}: {link.url}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>HAKKIMDA</h2>
                      <p style={{ fontSize: '10pt', lineHeight: 1.5 }}>
                        {formData.title ? `${formData.title} pozisyonunda çalışan profesyonel.` : 'Profesyonel olarak çalışan birey.'}
                      </p>
                    </div>

                    {/* Deneyim Bölümü */}
                    {formData.experience.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>DENEYİM</h2>

                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{exp.position || 'Pozisyon'}</span>
                                <span style={{ fontSize: '10pt' }}>{exp.period || 'Dönem'}</span>
                              </div>
                              <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '0.5rem' }}>{exp.company || 'Şirket'}</div>
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.5 }}>{exp.details || 'Detaylar'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Eğitim Bölümü */}
                    {formData.education.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>EĞİTİM</h2>

                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.degree || 'Derece'}</span>
                              <span style={{ fontSize: '10pt' }}>{edu.period || 'Dönem'}</span>
                            </div>
                            <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '0.25rem' }}>{edu.school || 'Okul'}</div>
                            {edu.gpa && <div style={{ fontSize: '10pt' }}>GPA: {edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projeler Bölümü */}
                    {formData.projects.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>PROJELER</h2>

                        {formData.projects.map((project, index) => (
                          <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '0.25rem' }}>{project.name || 'Proje Adı'}</div>
                            <p style={{ fontSize: '10pt', marginBottom: '0.5rem', lineHeight: 1.5 }}>{project.description || 'Proje açıklaması'}</p>

                            {project.tags && (
                              <div style={{ fontSize: '9pt' }}>
                                <span style={{ fontWeight: 'bold' }}>Teknolojiler: </span>
                                {project.tags}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* İki sütunlu düzen (Beceriler ve Diller & İletişim) */}
                    <div style={{ display: 'flex', columnGap: '2rem' }}>
                      {/* Beceriler ve Diller */}
                      <div style={{ flex: 1 }}>
                        {formData.skills.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>BECERİLER</h2>

                            {formData.skills.map((skill, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{skill.category || 'Beceri'}</span>
                                <span>{skill.level || 'Seviye'}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.languages.length > 0 && (
                          <div>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>DİLLER</h2>

                            {formData.languages.map((language, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{language.name || 'Dil'}</span>
                                <span>{language.level || 'Seviye'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* İletişim */}
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>İLETİŞİM</h2>

                        <div style={{ fontSize: '10pt', lineHeight: 1.8 }}>
                          {formData.location && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>Adres: </span>
                              <span>{formData.location}</span>
                            </div>
                          )}

                          {formData.email && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>E-posta: </span>
                              <span>{formData.email}</span>
                            </div>
                          )}

                          {formData.phone && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>Telefon: </span>
                              <span>{formData.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate === 'professional' && (
                  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', display: 'flex', width: '100%' }}>
                    {/* Left Sidebar */}
                    <div style={{ width: '35%', backgroundColor: '#1e3a5f', color: '#ffffff', padding: '24px', boxSizing: 'border-box' }}>
                      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ffffff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f', fontSize: '32px', fontWeight: 'bold' }}>
                          {formData.fullName?.charAt(0) || 'A'}
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                          {formData.fullName || 'Ad Soyad'}
                        </h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                          {formData.title || 'Pozisyon'}
                        </p>
                      </div>

                      {/* Contact */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          İletişim
                        </h2>
                        {formData.email && <div style={{ fontSize: '12px', marginBottom: '8px', wordBreak: 'break-all' }}>✉️ {formData.email}</div>}
                        {formData.phone && <div style={{ fontSize: '12px', marginBottom: '8px' }}>📞 {formData.phone}</div>}
                        {formData.location && <div style={{ fontSize: '12px', marginBottom: '8px' }}>📍 {formData.location}</div>}
                      </div>

                      {/* Skills */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          Beceriler
                        </h2>
                        {formData.skills.map((skill, index) => (
                          <div key={index} style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>{skill.category}</div>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                              <div style={{
                                height: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: '2px',
                                width: skill.level === 'İleri' ? '90%' : skill.level === 'Orta' ? '60%' : '40%'
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Languages */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          Diller
                        </h2>
                        {formData.languages.map((language, index) => (
                          <div key={index} style={{ fontSize: '12px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '500' }}>{language.name}</span>
                            <span style={{ opacity: 0.8 }}> - {language.level}</span>
                          </div>
                        ))}
                      </div>

                      {/* Links */}
                      {formData.links.length > 0 && (
                        <div>
                          <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                            Bağlantılar
                          </h2>
                          {formData.links.map((link, index) => (
                            <div key={index} style={{ fontSize: '11px', marginBottom: '6px', wordBreak: 'break-all' }}>
                              {link.name}: {link.url}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div style={{ width: '65%', padding: '24px', boxSizing: 'border-box' }}>
                      {/* Experience - Using Table layout for reliability */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          İŞ DENEYİMİ
                        </h2>
                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '16px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{exp.position}</h3>
                              </div>
                            </div>
                            <div style={{ display: 'table', width: '100%', marginBottom: '8px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontSize: '14px', color: '#1e3a5f', fontWeight: '500' }}>
                                {exp.company}
                              </div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', width: '1%' }}>
                                {exp.period}
                              </div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{exp.details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Education - Using Table layout */}
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          EĞİTİM
                        </h2>
                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '12px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{edu.degree}</h3>
                              </div>
                            </div>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontSize: '14px', color: '#1e3a5f' }}>
                                {edu.school}
                              </div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', width: '1%' }}>
                                {edu.period}
                              </div>
                            </div>
                            {edu.gpa && <div style={{ fontSize: '12px', color: '#6b7280' }}>Not: {edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Template */}
                {selectedTemplate === 'executive' && (
                  <div style={{ fontFamily: "'Georgia', serif", backgroundColor: '#ffffff', padding: '40px', color: '#333333' }}>
                    <div style={{ borderBottom: '2px solid #000000', paddingBottom: '20px', marginBottom: '30px', display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{formData.fullName || 'Ad Soyad'}</h1>
                        <p style={{ fontSize: '18px', margin: 0, fontStyle: 'italic', color: '#555555' }}>{formData.title || 'Yönetici Pozisyonu'}</p>
                      </div>
                      <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'right', fontSize: '12px', lineHeight: '1.6' }}>
                        <div>{formData.email}</div>
                        <div>{formData.phone}</div>
                        <div>{formData.location}</div>
                        {formData.links.map((link, i) => <div key={i}>{link.url}</div>)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>Profesyonel Deneyim</h2>
                      {formData.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'table', width: '100%', marginBottom: '5px' }}>
                            <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>{exp.position}</div>
                            <div style={{ display: 'table-cell', textAlign: 'right', fontWeight: 'bold' }}>{exp.company}</div>
                          </div>
                          <div style={{ display: 'table', width: '100%', marginBottom: '10px' }}>
                            <div style={{ display: 'table-cell', fontStyle: 'italic', fontSize: '14px', color: '#666' }}>{exp.period}</div>
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{exp.details}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>Eğitim</h2>
                      {formData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'table', width: '100%' }}>
                            <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '15px' }}>{edu.degree}</div>
                            <div style={{ display: 'table-cell', textAlign: 'right' }}>{edu.school}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginTop: '2px' }}>{edu.period}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', width: '50%', paddingRight: '20px', verticalAlign: 'top' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>Yetkinlikler</h2>
                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          {formData.skills.map((s, i) => <span key={i} style={{ display: 'inline-block', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', marginRight: '5px', marginBottom: '5px' }}>{s.category}</span>)}
                        </div>
                      </div>
                      <div style={{ display: 'table-cell', width: '50%', paddingLeft: '20px', verticalAlign: 'top' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>Diller</h2>
                        <div style={{ fontSize: '14px' }}>
                          {formData.languages.map((l, i) => <div key={i} style={{ marginBottom: '5px' }}><strong>{l.name}</strong>: {l.level}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple Text Template - Requested by User */}
                {selectedTemplate === 'simple-text' && (
                  <div style={{ fontFamily: "'Times New Roman', serif", backgroundColor: '#ffffff', padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#000000' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{formData.fullName || 'AD SOYAD'}</h1>
                      <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '12px' }}>{formData.title || 'Pozisyon'}</p>
                      <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {formData.email && <span>{formData.email}</span>}
                        {formData.phone && <span>{formData.phone}</span>}
                        {formData.location && <span>{formData.location}</span>}
                      </div>
                      <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                        {formData.links.map((link, index) => (
                          <span key={index}>{link.name}: {link.url}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #000', margin: '20px 0' }}></div>

                    {/* Experience */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>İş Deneyimi</h2>
                      {formData.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{exp.position}</h3>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>
                            {exp.company} | {exp.period}
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{exp.details}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    {/* Education */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>Eğitim</h2>
                      {formData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{edu.degree}</h3>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>
                            {edu.school} | {edu.period}
                          </div>
                          {edu.gpa && <div style={{ fontSize: '14px' }}>Not: {edu.gpa}</div>}
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    {/* Skills & Languages */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>Yetenekler & Diller</h2>
                      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                        <strong>Yetenekler: </strong>
                        {formData.skills.map((s, i) => s.category).join(', ')}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>Diller: </strong>
                        {formData.languages.map((l, i) => `${l.name} (${l.level})`).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/projects"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Tüm Projelere Dön
          </Link>
        </div>
      </div>
    </div>
  );
} 