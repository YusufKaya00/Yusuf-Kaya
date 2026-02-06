'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminCVPage() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-cv', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setMessage('CV successfully uploaded!');
                setFile(null);
            } else {
                setMessage('Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <div>
                        <Link href="/admin" className="text-orange-400 hover:text-orange-300 flex items-center mb-2">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white">CV Management</h1>
                        <p className="text-gray-400 mt-1">Upload your latest CV (PDF format)</p>
                    </div>
                </motion.div>

                {/* Upload Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 shadow-xl"
                >
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-12 hover:border-orange-500 transition-colors">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>

                            <label htmlFor="cv-upload" className="cursor-pointer">
                                <span className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                                    Select PDF File
                                </span>
                                <input
                                    id="cv-upload"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <p className="text-gray-400 mt-4 text-sm">
                                {file ? `Selected: ${file.name}` : 'Supported format: PDF'}
                            </p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${!file || uploading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-orange-500/20'
                                }`}
                        >
                            {uploading ? 'Uploading...' : 'Upload CV'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
