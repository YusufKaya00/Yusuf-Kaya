'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
// html2canvas and jspdf are imported dynamically inside generatePDF to optimize bundle size

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

  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal' | 'simple-text' | 'professional' | 'executive' | 'portfolio' | 'portfolio-text' | 'minimal-noexp'>('classic');

  // Default language is English
  const [language, setLanguage] = useState<'tr' | 'en'>('en');

  // CV section labels (English)
  const labels: Record<'tr' | 'en', any> = {
    tr: {
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
      remove: 'Remove',
      addProject: 'Add Project',
      projectNum: 'Project',
      descriptionLabel: 'Description',
      tagsLabel: 'Tags',
      tagsPlaceholder: 'React, TypeScript, Node.js (comma separated)',
      previewHeader: 'Preview',
      backToProjects: 'Back to Projects',
      downloadPDF: 'Download PDF',
      classicTemplate: 'Classic',
      modernTemplate: 'Modern',
      professionalTemplate: 'Professional',
      executiveTemplate: 'Executive',
      minimalTemplate: 'Minimal',
      simpleTextTemplate: 'Simple Text',
      projectsHeader: 'My Projects',
      projectTitlePlaceholder: 'Project name',
      projectDescPlaceholder: 'Short description of the project',
      addExperience: 'Add Experience',
      addEducation: 'Add Education',
      addSkill: 'Add Skill',
      addLanguage: 'Add Language',
      addLink: 'Add Link',
      linkPlaceholder: 'LinkedIn, Github, etc.',
      experienceHeader: 'Work Experience',
      educationHeader: 'Education',
      personalDetailsHeader: 'Personal Information',
      enterInformationHeader: 'Enter Information',
      aiGenerateHeader: 'Auto-generate with AI',
      aiGenerateLabel: 'Write a few sentences about your experience:',
      aiGeneratePlaceholder: "I'm a software engineer with 5 years of experience, working with React and Node.js...",
      aiGenerateButton: 'Auto-fill with AI',
      aiGeneratingButton: 'Processing...',
      about: 'ABOUT ME',
      profile: 'PROFILE'
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
      remove: 'Remove',
      addProject: 'Add Project',
      projectNum: 'Project',
      descriptionLabel: 'Description',
      tagsLabel: 'Tags',
      tagsPlaceholder: 'React, TypeScript, Node.js (comma separated)',
      previewHeader: 'Preview',
      backToProjects: 'Back to Projects',
      downloadPDF: 'Download PDF',
      classicTemplate: 'Classic',
      modernTemplate: 'Modern',
      professionalTemplate: 'Professional',
      executiveTemplate: 'Executive',
      minimalTemplate: 'Minimal',
      simpleTextTemplate: 'Simple Text',
      projectsHeader: 'My Projects',
      projectTitlePlaceholder: 'Project name',
      projectDescPlaceholder: 'Short description of the project',
      addExperience: 'Add Experience',
      addEducation: 'Add Education',
      addSkill: 'Add Skill',
      addLanguage: 'Add Language',
      addLink: 'Add Link',
      linkPlaceholder: 'LinkedIn, Github, etc.',
      experienceHeader: 'Work Experience',
      educationHeader: 'Education',
      personalDetailsHeader: 'Personal Information',
      enterInformationHeader: 'Enter Information',
      aiGenerateHeader: 'Auto-generate with AI',
      aiGenerateLabel: 'Write a few sentences about your experience:',
      aiGeneratePlaceholder: "I'm a software engineer with 5 years of experience, working with React and Node.js...",
      aiGenerateButton: 'Auto-fill with AI',
      aiGeneratingButton: 'Processing...',
      about: 'ABOUT ME',
      profile: 'PROFILE'
    }
  };

  const getSkillWidth = (level: string) => {
    if (!level) return '70%';
    const lvl = level.toLowerCase().trim();
    if (lvl.includes('ileri') || lvl.includes('advanced') || lvl.includes('expert') || lvl.includes('expert level')) return '90%';
    if (lvl.includes('orta') || lvl.includes('intermediate') || lvl.includes('medium')) return '60%';
    if (lvl.includes('başlangıç') || lvl.includes('beginner') || lvl.includes('novice')) return '30%';
    const matchPercent = lvl.match(/(\d+)\s*%/);
    if (matchPercent) return `${matchPercent[1]}%`;
    const matchNumber = lvl.match(/(\d+)\s*\/\s*10/);
    if (matchNumber) return `${parseInt(matchNumber[1]) * 10}%`;
    return '70%';
  };

  const getLanguageWidth = (level: string) => {
    if (!level) return '50%';
    const lvl = level.toLowerCase().trim();
    if (lvl.includes('anadil') || lvl.includes('native') || lvl.includes('fluent') || lvl.includes('mükemmel') || lvl.includes('ileri') || lvl.includes('advanced') || lvl.includes('c2') || lvl.includes('c1')) return '100%';
    if (lvl.includes('orta') || lvl.includes('intermediate') || lvl.includes('b2') || lvl.includes('b1')) return '60%';
    if (lvl.includes('başlangıç') || lvl.includes('beginner') || lvl.includes('a2') || lvl.includes('a1')) return '40%';
    const matchPercent = lvl.match(/(\d+)\s*%/);
    if (matchPercent) return `${matchPercent[1]}%`;
    return '50%';
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

  // Helper to dynamically shrink spacing and font sizes to fit CV on exactly one page
  const shrinkSpacings = (element: HTMLElement, ratio: number) => {
    const walk = (el: HTMLElement) => {
      const style = el.style;
      
      const spacingKeys = [
        'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
        'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
        'gap', 'rowGap', 'columnGap'
      ];
      spacingKeys.forEach(key => {
        const val = (style as any)[key];
        if (val) {
          const num = parseFloat(val);
          const unit = val.replace(/^[-\d.]+/, '');
          if (!isNaN(num) && num > 0) {
            (style as any)[key] = `${num * ratio}${unit}`;
          }
        }
      });
      
      if (style.fontSize) {
        const val = style.fontSize;
        const num = parseFloat(val);
        const unit = val.replace(/^[-\d.]+/, '');
        if (!isNaN(num)) {
          style.fontSize = `${num * ratio}${unit}`;
        }
      }

      if (style.lineHeight) {
        const val = style.lineHeight;
        const num = parseFloat(val);
        if (!isNaN(num) && num > 1) {
          style.lineHeight = `${Math.max(1, num * ratio)}`;
        }
      }

      // Check classes and override for Tailwind layouts
      const classes = Array.from(el.classList);
      classes.forEach(cls => {
        if (cls.startsWith('p-') || cls.startsWith('py-') || cls.startsWith('px-') || 
            cls.startsWith('m-') || cls.startsWith('my-') || cls.startsWith('mx-') || 
            cls.startsWith('mt-') || cls.startsWith('mb-') || cls.startsWith('gap-') || 
            cls.startsWith('space-y-') || cls.startsWith('text-')) {
          if (cls === 'p-8') style.padding = `${2 * ratio}rem`;
          if (cls === 'p-6') style.padding = `${1.5 * ratio}rem`;
          if (cls === 'p-4') style.padding = `${1 * ratio}rem`;
          if (cls === 'py-4') style.paddingTop = style.paddingBottom = `${1 * ratio}rem`;
          if (cls === 'px-6') style.paddingLeft = style.paddingRight = `${1.5 * ratio}rem`;
          
          if (cls === 'mt-8') style.marginTop = `${2 * ratio}rem`;
          if (cls === 'mb-6') style.marginBottom = `${1.5 * ratio}rem`;
          if (cls === 'mb-4') style.marginBottom = `${1 * ratio}rem`;
          if (cls === 'mb-3') style.marginBottom = `${0.75 * ratio}rem`;
          if (cls === 'mb-2') style.marginBottom = `${0.5 * ratio}rem`;
          if (cls === 'mb-1') style.marginBottom = `${0.25 * ratio}rem`;
          
          if (cls === 'gap-6') style.gap = `${1.5 * ratio}rem`;
          if (cls === 'gap-8') style.gap = `${2 * ratio}rem`;
          
          if (cls === 'text-3xl') style.fontSize = `${1.875 * ratio}rem`;
          if (cls === 'text-2xl') style.fontSize = `${1.5 * ratio}rem`;
          if (cls === 'text-xl') style.fontSize = `${1.25 * ratio}rem`;
          if (cls === 'text-lg') style.fontSize = `${1.125 * ratio}rem`;
          if (cls === 'text-base') style.fontSize = `${1 * ratio}rem`;
          if (cls === 'text-sm') style.fontSize = `${0.875 * ratio}rem`;
          if (cls === 'text-xs') style.fontSize = `${0.75 * ratio}rem`;
        }
      });

      Array.from(el.children).forEach(child => walk(child as HTMLElement));
    };
    walk(element);
  };

  // Generate PDF from the CV container
  const generatePDF = async () => {
    if (cvRef.current) {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const jspdf = (await import('jspdf')).default;
        
        // Create a deep clone of the CV container to modify spacing
        let clonedCv = cvRef.current.cloneNode(true) as HTMLElement;

        // Size it for A4 naturally to measure height
        clonedCv.style.width = '210mm';
        clonedCv.style.minHeight = 'auto';
        clonedCv.style.height = 'auto';
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
          
          /* Font style fixes */
          * {
            text-rendering: geometricPrecision !important;
            -webkit-font-smoothing: antialiased !important;
          }
          
          /* Fix line heights */
          p, div { line-height: 1.4 !important; }
          h1, h2, h3 { line-height: 1.2 !important; }
          
          /* Make full width elements actually full width */
          .w-full { width: 100% !important; }
          
          /* Set correct margins/spacing */
          body { margin: 0 !important; }

          /* Grid fixes for Modern template */
          .grid-cols-12 { 
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          
          .col-span-8 {
            grid-column: span 8 / span 8 !important;
          }
          
          .col-span-4 {
            grid-column: span 4 / span 4 !important;
          }
          
          /* Required styles for Portfolio template */
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
        tempContainer.style.height = 'auto'; // allow natural height measurement
        tempContainer.appendChild(resetStyles);
        tempContainer.appendChild(clonedCv);
        document.body.appendChild(tempContainer);

        try {
          let currentHeight = clonedCv.offsetHeight;
          const maxHeight = 1120; // 297mm height limit in pixels at 96 DPI
          let ratio = 1.0;

          // Shrink loop to fit everything onto exactly one page
          while (currentHeight > maxHeight && ratio >= 0.6) {
            tempContainer.removeChild(clonedCv);
            ratio -= 0.05;

            const freshClone = cvRef.current.cloneNode(true) as HTMLElement;
            freshClone.style.width = '210mm';
            freshClone.style.minHeight = 'auto';
            freshClone.style.height = 'auto';
            freshClone.style.padding = `${10 * ratio}mm`;
            freshClone.style.boxSizing = 'border-box';

            shrinkSpacings(freshClone, ratio);
            tempContainer.appendChild(freshClone);
            clonedCv = freshClone;
            currentHeight = clonedCv.offsetHeight;
          }

          // Once it fits (or reached the threshold limit), expand back to exactly A4 page height
          clonedCv.style.minHeight = '297mm';
          clonedCv.style.height = '297mm';

          const scaleFactor = 2.0;

          // Use html2canvas to capture the exact layout
          const canvas = await html2canvas(clonedCv, {
            scale: scaleFactor,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 210 * 3.779527559, // A4 width in pixels (~793px)
            height: 297 * 3.779527559, // A4 height in pixels (~1122px)
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

                  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.backgroundColor = bgColor;
                  }

                  if (textColor) {
                    el.style.color = textColor;
                  }
                }
              });
            }
          });

          // Create PDF with the canvas
          const imgData = canvas.toDataURL('image/png', 1.0);

          const pdf = new jspdf({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });

          const pdfWidth = 210;
          const pdfHeight = 297;

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
        body: JSON.stringify({ prompt: aiPrompt, language })
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
            <h2 className="text-2xl font-semibold mb-6 text-white">{labels[language].enterInformationHeader}</h2>

            {/* AI Generator */}
            <div className="mb-8 rounded-xl p-5 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-purple-300">{labels[language].aiGenerateHeader}</h3>
              </div>
              <div className="mb-4">
                <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-300 mb-2">
                  {labels[language].aiGenerateLabel}
                </label>
                <textarea
                  id="aiPrompt"
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder={labels[language].aiGeneratePlaceholder}
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
                    {labels[language].aiGeneratingButton}
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {labels[language].aiGenerateButton}
                  </>
                )}
              </motion.button>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">{labels[language].personalDetailsHeader}</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                      {labels[language].fullName}
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
                      {labels[language].position}
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
                      {labels[language].address}
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
                      {labels[language].emailLabel}
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
                      {labels[language].phoneLabel}
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
                  <h3 className="text-xl font-medium text-white">{labels[language].experienceHeader}</h3>
                  <button
                    onClick={() => addItem('experience', { position: '', company: '', period: '', details: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {labels[language].addExperience}
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
                          {labels[language].remove}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          {labels[language].position}
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
                          {labels[language].company}
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
                          {labels[language].period}
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
                        {labels[language].details}
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
                  <h3 className="text-xl font-medium text-white">{labels[language].educationHeader}</h3>
                  <button
                    onClick={() => addItem('education', { degree: '', school: '', period: '', gpa: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {labels[language].addEducation}
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
                          {labels[language].remove}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          {labels[language].degree}
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
                          {labels[language].school}
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
                          {labels[language].period}
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
                          {labels[language].gpa}
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
                  <h3 className="text-xl font-medium text-white">{labels[language].skills}</h3>
                  <button
                    onClick={() => addItem('skills', { category: '', level: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {labels[language].addSkill}
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
                              {labels[language].remove}
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={skill.category}
                          onChange={(e) => handleInputChange(e, 'skills', index, 'category')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder={labels[language].skill}
                        />

                        <input
                          type="text"
                          value={skill.level}
                          onChange={(e) => handleInputChange(e, 'skills', index, 'level')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder={labels[language].level}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">{labels[language].languages}</h3>
                  <button
                    onClick={() => addItem('languages', { name: '', level: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {labels[language].addLanguage}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-3 bg-black/20 flex justify-between items-center">
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                          {formData.languages.length > 1 && (
                            <button
                              onClick={() => removeItem('languages', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              {labels[language].remove}
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) => handleInputChange(e, 'languages', index, 'name')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder={labels[language].language}
                        />

                        <input
                          type="text"
                          value={lang.level}
                          onChange={(e) => handleInputChange(e, 'languages', index, 'level')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder={labels[language].level}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">{labels[language].links}</h3>
                  <button
                    onClick={() => addItem('links', { name: '', url: '' })}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {labels[language].addLink}
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
                              {labels[language].remove}
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => handleInputChange(e, 'links', index, 'name')}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder={labels[language].linkPlaceholder}
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

              {/* Projects Section - Visible when Portfolio template is selected */}
              {(selectedTemplate === 'portfolio' || selectedTemplate === 'portfolio-text' || selectedTemplate === 'minimal-noexp' || selectedTemplate === 'minimal') && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium text-white">{labels[language].projectsHeader}</h3>
                    <button
                      onClick={() => addItem('projects', { name: '', description: '', tags: '' })}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      {labels[language].addProject}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400">{labels[language].projectNum} #{index + 1}</span>
                          {formData.projects.length > 1 && (
                            <button
                              onClick={() => removeItem('projects', index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              {labels[language].remove}
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              {labels[language].projectName}
                            </label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'name')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder={labels[language].projectTitlePlaceholder}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              {labels[language].descriptionLabel}
                            </label>
                            <textarea
                              rows={3}
                              value={project.description}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'description')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder={labels[language].projectDescPlaceholder}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              {labels[language].tagsLabel}
                            </label>
                            <input
                              type="text"
                              value={project.tags}
                              onChange={(e) => handleInputChange(e, 'projects', index, 'tags')}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder={labels[language].tagsPlaceholder}
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
                <h2 className="text-2xl font-semibold text-white">{labels[language].previewHeader}</h2>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTemplate('classic')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'classic'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].classicTemplate}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('modern')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'modern'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].modernTemplate}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('professional')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'professional'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].professionalTemplate}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('executive')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'executive'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].executiveTemplate}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('minimal')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'minimal'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].minimalTemplate}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate('simple-text')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTemplate === 'simple-text'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                      {labels[language].simpleTextTemplate}
                    </button>
                  </div>

                  {/* Language selection removed - defaulting to English */}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2.5 px-5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/25"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {labels[language].downloadPDF}
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
                      <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
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
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{exp.position || labels[language].position}</h3>
                              <div style={{ display: 'table', width: '100%', margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'table-cell', textAlign: 'left' }}>{exp.company || labels[language].company}</div>
                                <div style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap', width: '1%' }}>{exp.period || labels[language].period}</div>
                              </div>
                              <p style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-line', lineHeight: '1.5', margin: '8px 0 0 0' }}>{exp.details || labels[language].details}</p>
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
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{edu.degree || labels[language].degree}</h3>
                              <div style={{ display: 'table', width: '100%', margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'table-cell', textAlign: 'left' }}>{edu.school || labels[language].school}</div>
                                <div style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap', width: '1%' }}>{edu.period || labels[language].period}</div>
                              </div>
                              {edu.gpa && <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>{labels[language].gpa}: {edu.gpa}</p>}
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
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{skill.category || labels[language].skill}</div>
                              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  backgroundColor: '#6366f1',
                                  borderRadius: '3px',
                                  width: getSkillWidth(skill.level)
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
                          {formData.languages.map((lang, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{lang.name || labels[language].language}</div>
                              <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  backgroundColor: '#6366f1',
                                  borderRadius: '3px',
                                  width: getLanguageWidth(lang.level)
                                }}></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Links */}
                        <div>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {labels[language].links}
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

                    {/* Two column layout */}
                    <div style={{ display: 'flex', columnGap: '2rem' }}>
                      {/* Left Column */}
                      <div style={{ flex: 1 }}>
                        {/* Skills */}
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

                        {/* Languages */}
                        {formData.languages.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].languages}</h2>

                            {formData.languages.map((lang, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{lang.name || labels[language].language}</span>
                                <span>{lang.level || labels[language].level}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Projects */}
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

                      {/* Right Column */}
                      <div style={{ flex: 2 }}>
                        {/* Work Experience */}
                        {formData.experience.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].experience}</h2>

                            {formData.experience.map((exp, index) => (
                              <div key={index} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{exp.position || labels[language].position}</div>
                                  <div style={{ fontSize: '10pt' }}>{exp.period || labels[language].period}</div>
                                </div>
                                <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{exp.company || labels[language].company}</div>
                                <div style={{ fontSize: '10pt' }}>{exp.details || labels[language].details}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Education */}
                        {formData.education.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>{labels[language].education}</h2>

                            {formData.education.map((edu, index) => (
                              <div key={index} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.degree || labels[language].degree}</div>
                                  <div style={{ fontSize: '10pt' }}>{edu.period || labels[language].period}</div>
                                </div>
                                <div style={{ fontSize: '10pt', marginBottom: '0.25rem' }}>{edu.school || labels[language].school}</div>
                                {edu.gpa && <div style={{ fontSize: '10pt' }}>{labels[language].gpa}: {edu.gpa}</div>}
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
                      <h1 className="text-3xl font-bold mb-1">{formData.fullName || labels[language].fullName}</h1>
                      <p className="text-xl">{formData.title || labels[language].position}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-8">
                      <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">{labels[language].contact}</h2>
                          <div className="text-sm space-y-2">
                            {formData.email && (
                              <div>
                                <span className="font-bold">{labels[language].emailLabel}:</span> {formData.email}
                              </div>
                            )}
                            {formData.phone && (
                              <div>
                                <span className="font-bold">{labels[language].phoneLabel}:</span> {formData.phone}
                              </div>
                            )}
                            {formData.location && (
                              <div>
                                <span className="font-bold">{labels[language].address}:</span> {formData.location}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">{labels[language].links}</h2>
                          <div className="text-sm space-y-2">
                            {formData.links.map((link, index) => (
                              <div key={index}>
                                <span className="font-bold">{link.name}:</span> {link.url}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">{labels[language].skills}</h2>
                          <div className="text-sm space-y-3">
                            {formData.skills.map((skill, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold">{skill.category || labels[language].skill}</span>
                                  <span>{skill.level || labels[language].level}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: getSkillWidth(skill.level) }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-2">{labels[language].languages}</h2>
                          <div className="text-sm space-y-3">
                            {formData.languages.map((lang, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold">{lang.name || labels[language].language}</span>
                                  <span>{lang.level || labels[language].level}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: getLanguageWidth(lang.level) }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">{labels[language].profile}</h2>
                          <p className="text-sm">
                            {formData.title ? `${formData.fullName || labels[language].fullName} is an experienced professional working as a ${formData.title}.` : 'This section will contain a brief summary of your CV.'}
                          </p>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">{labels[language].experienceHeader}</h2>
                          <div className="space-y-4">
                            {formData.experience.map((exp, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-base">{exp.position || labels[language].position}</h3>
                                    <p className="text-sm text-gray-600">{exp.company || labels[language].company}</p>
                                  </div>
                                  <p className="text-sm text-gray-600">{exp.period || labels[language].period}</p>
                                </div>
                                <p className="text-sm mt-1">{exp.details || labels[language].details}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">{labels[language].educationHeader}</h2>
                          <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-base">{edu.degree || labels[language].degree}</h3>
                                    <p className="text-sm text-gray-600">{edu.school || labels[language].school}</p>
                                  </div>
                                  <p className="text-sm text-gray-600">{edu.period || labels[language].period}</p>
                                </div>
                                {edu.gpa && <p className="text-sm mt-1">{labels[language].gpa}: {edu.gpa}</p>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-purple-800 border-b-2 border-purple-300 pb-1 mb-3">{labels[language].projectsHeader}</h2>
                          <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                              <div key={index}>
                                <h3 className="font-bold text-base">{project.name || labels[language].projectName}</h3>
                                <p className="text-sm mt-1">{project.description || labels[language].projectDesc}</p>
                                {project.tags && (
                                  <p className="text-xs mt-1 text-purple-800">
                                    <span className="font-bold">{labels[language].technologies}:</span> {project.tags}
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
                      <h1 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '0.5rem' }}>{formData.fullName || labels[language].fullName}</h1>
                      <p style={{ fontSize: '12pt', marginBottom: '1rem' }}>{formData.title || labels[language].position}</p>

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
                      <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].about}</h2>
                      <p style={{ fontSize: '10pt', lineHeight: 1.5 }}>
                        {formData.title ? `Professional working as ${formData.title}.` : 'Professional working individual.'}
                      </p>
                    </div>

                    {/* Experience Section */}
                    {formData.experience.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].experience}</h2>

                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{exp.position || labels[language].position}</span>
                                <span style={{ fontSize: '10pt' }}>{exp.period || labels[language].period}</span>
                              </div>
                              <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '0.5rem' }}>{exp.company || labels[language].company}</div>
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.5 }}>{exp.details || labels[language].details}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Eğitim Bölümü */}
                    {formData.education.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].education}</h2>

                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.degree || labels[language].degree}</span>
                              <span style={{ fontSize: '10pt' }}>{edu.period || labels[language].period}</span>
                            </div>
                            <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '0.25rem' }}>{edu.school || labels[language].school}</div>
                            {edu.gpa && <div style={{ fontSize: '10pt' }}>{labels[language].gpa}: {edu.gpa}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projeler Bölümü */}
                    {formData.projects.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].projects}</h2>

                        {formData.projects.map((project, index) => (
                          <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '0.25rem' }}>{project.name || labels[language].projectName}</div>
                            <p style={{ fontSize: '10pt', marginBottom: '0.5rem', lineHeight: 1.5 }}>{project.description || labels[language].projectDesc}</p>

                            {project.tags && (
                              <div style={{ fontSize: '9pt' }}>
                                <span style={{ fontWeight: 'bold' }}>{labels[language].technologies}: </span>
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
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].skills}</h2>

                            {formData.skills.map((skill, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{skill.category || labels[language].skill}</span>
                                <span>{skill.level || labels[language].level}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.languages.length > 0 && (
                          <div>
                            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].languages}</h2>

                            {formData.languages.map((lang, index) => (
                              <div key={index} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{lang.name || labels[language].language}</span>
                                <span>{lang.level || labels[language].level}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* İletişim */}
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>{labels[language].contact}</h2>

                        <div style={{ fontSize: '10pt', lineHeight: 1.8 }}>
                          {formData.location && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>{labels[language].address}: </span>
                              <span>{formData.location}</span>
                            </div>
                          )}

                          {formData.email && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>{labels[language].emailLabel}: </span>
                              <span>{formData.email}</span>
                            </div>
                          )}

                          {formData.phone && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>{labels[language].phoneLabel}: </span>
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
                          {formData.fullName || labels[language].fullName}
                        </h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                          {formData.title || labels[language].position}
                        </p>
                      </div>

                      {/* Contact */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #ffffff', paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                          {labels[language].contact}
                        </h2>
                        {formData.email && <div style={{ fontSize: '12px', marginBottom: '8px', wordBreak: 'break-all' }}>✉️ {formData.email}</div>}
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
                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>{skill.category || labels[language].skill}</div>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                              <div style={{
                                height: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: '2px',
                                width: getSkillWidth(skill.level)
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
                        {formData.languages.map((lang, index) => (
                          <div key={index} style={{ fontSize: '12px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '500' }}>{lang.name || labels[language].language}</span>
                            <span style={{ opacity: 0.8 }}> - {lang.level || labels[language].level}</span>
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
                    <div style={{ width: '65%', padding: '24px', boxSizing: 'border-box' }}>
                      {/* Experience - Using Table layout for reliability */}
                      <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].experience}
                        </h2>
                        {formData.experience.map((exp, index) => (
                          <div key={index} style={{ marginBottom: '16px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{exp.position || labels[language].position}</h3>
                              </div>
                            </div>
                            <div style={{ display: 'table', width: '100%', marginBottom: '8px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontSize: '14px', color: '#1e3a5f', fontWeight: '500' }}>
                                {exp.company || labels[language].company}
                              </div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', width: '1%' }}>
                                {exp.period || labels[language].period}
                              </div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{exp.details || labels[language].details}</p>
                          </div>
                        ))}
                      </div>

                      {/* Education - Using Table layout */}
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: '8px', marginBottom: '16px' }}>
                          {labels[language].education}
                        </h2>
                        {formData.education.map((edu, index) => (
                          <div key={index} style={{ marginBottom: '12px', borderLeft: '3px solid #1e3a5f', paddingLeft: '12px' }}>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{edu.degree || labels[language].degree}</h3>
                              </div>
                            </div>
                            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                              <div style={{ display: 'table-cell', textAlign: 'left', fontSize: '14px', color: '#1e3a5f' }}>
                                {edu.school || labels[language].school}
                              </div>
                              <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', width: '1%' }}>
                                {edu.period || labels[language].period}
                              </div>
                            </div>
                            {edu.gpa && <div style={{ fontSize: '12px', color: '#6b7280' }}>{labels[language].gpa}: {edu.gpa}</div>}
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
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{formData.fullName || labels[language].fullName}</h1>
                        <p style={{ fontSize: '18px', margin: 0, fontStyle: 'italic', color: '#555555' }}>{formData.title || labels[language].position}</p>
                      </div>
                      <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'right', fontSize: '12px', lineHeight: '1.6' }}>
                        <div>{formData.email}</div>
                        <div>{formData.phone}</div>
                        <div>{formData.location}</div>
                        {formData.links.map((link, i) => <div key={i}>{link.url}</div>)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>{labels[language].experienceHeader}</h2>
                      {formData.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'table', width: '100%', marginBottom: '5px' }}>
                            <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>{exp.position || labels[language].position}</div>
                            <div style={{ display: 'table-cell', textAlign: 'right', fontWeight: 'bold' }}>{exp.company || labels[language].company}</div>
                          </div>
                          <div style={{ display: 'table', width: '100%', marginBottom: '10px' }}>
                            <div style={{ display: 'table-cell', fontStyle: 'italic', fontSize: '14px', color: '#666' }}>{exp.period || labels[language].period}</div>
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{exp.details || labels[language].details}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>{labels[language].educationHeader}</h2>
                      {formData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'table', width: '100%' }}>
                            <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '15px' }}>{edu.degree || labels[language].degree}</div>
                            <div style={{ display: 'table-cell', textAlign: 'right' }}>{edu.school || labels[language].school}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginTop: '2px' }}>{edu.period || labels[language].period}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', width: '50%', paddingRight: '20px', verticalAlign: 'top' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>{labels[language].skills}</h2>
                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          {formData.skills.map((s, i) => <span key={i} style={{ display: 'inline-block', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', marginRight: '5px', marginBottom: '5px' }}>{s.category || labels[language].skill}</span>)}
                        </div>
                      </div>
                      <div style={{ display: 'table-cell', width: '50%', paddingLeft: '20px', verticalAlign: 'top' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>{labels[language].languages}</h2>
                        <div style={{ fontSize: '14px' }}>
                          {formData.languages.map((lang, i) => <div key={i} style={{ marginBottom: '5px' }}><strong>{lang.name || labels[language].language}</strong>: {lang.level || labels[language].level}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple Text Template - Requested by User */}
                {selectedTemplate === 'simple-text' && (
                  <div style={{ fontFamily: "'Times New Roman', serif", backgroundColor: '#ffffff', padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#000000' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{formData.fullName || labels[language].fullName}</h1>
                      <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '12px' }}>{formData.title || labels[language].position}</p>
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
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>{labels[language].experienceHeader}</h2>
                      {formData.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{exp.position || labels[language].position}</h3>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>
                            {exp.company || labels[language].company} | {exp.period || labels[language].period}
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{exp.details || labels[language].details}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    {/* Education */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>{labels[language].educationHeader}</h2>
                      {formData.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>{edu.degree || labels[language].degree}</h3>
                          <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>
                            {edu.school || labels[language].school} | {edu.period || labels[language].period}
                          </div>
                          {edu.gpa && <div style={{ fontSize: '14px' }}>{labels[language].gpa}: {edu.gpa}</div>}
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    {/* Skills & Languages */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>{labels[language].skills} & {labels[language].languages}</h2>
                      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                        <strong>{labels[language].skills}: </strong>
                        {formData.skills.map((s, i) => s.category || labels[language].skill).join(', ')}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <strong>{labels[language].languages}: </strong>
                        {formData.languages.map((lang, i) => `${lang.name || labels[language].language} (${lang.level || labels[language].level})`).join(', ')}
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
            href="/portfolio"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {labels[language].backToProjects}
          </Link>
        </div>
      </div>
    </div>
  );
} 