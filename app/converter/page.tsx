'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
      } else {
        setError('Please upload PDF files only.');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Conversion successful! Downloading file...');
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              PDF to Word Converter
            </h1>
            <p className="text-gray-400">
              Easily convert your PDF files to Word format
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <label className="w-full max-w-lg flex flex-col items-center px-4 py-6 bg-gray-700 rounded-lg shadow-lg tracking-wide border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors duration-300">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="mt-2 text-base text-gray-300">
                  {file ? file.name : 'Select your PDF file'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="text-red-400 text-center text-sm">{error}</div>
            )}

            {success && (
              <div className="text-green-400 text-center text-sm">{success}</div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={!file || converting}
                className={`px-8 py-3 rounded-lg text-white font-medium ${!file || converting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  } transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center space-x-2`}
              >
                {converting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span>Converting...</span>
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <span>Convert</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Supported format: PDF → DOCX</p>
            <p className="mt-1">Maximum file size: 10MB</p>
            <div className="mt-4 bg-indigo-900/20 rounded-lg p-4 text-indigo-300 border border-indigo-800">
              <p className="font-medium">Cloud-Based Conversion</p>
              <p className="mt-1 text-xs">Your file is securely converted through our cloud API. No installation required.</p>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-xs text-gray-500">Your files are deleted from our servers after processing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 