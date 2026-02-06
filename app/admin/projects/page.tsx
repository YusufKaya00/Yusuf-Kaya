'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    detailPage: string;
    technologies: string[];
    order: number;
    visible: boolean;
    // Detail page fields
    longDescription?: string;
    features?: string[];
    buttonLabel?: string;
    buttonUrl?: string;
    githubUrl?: string;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        detailPage: '',
        technologies: '',
        visible: true,
        // Detail page fields
        longDescription: '',
        features: '',
        buttonLabel: '',
        buttonUrl: '',
        githubUrl: ''
    });

    // Auth kontrolü
    useEffect(() => {
        const authStatus = sessionStorage.getItem('adminAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
            fetchProjects();
        } else {
            window.location.href = '/admin';
        }
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, image: data.url }));
                setMessage({ type: 'success', text: 'Image uploaded!' });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploading(false);
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t),
                    features: formData.features.split('\n').map(f => f.trim()).filter(f => f)
                })
            });

            if (response.ok) {
                const newProject = await response.json();
                setProjects(prev => [...prev, newProject]);
                setShowAddModal(false);
                resetForm();
                setMessage({ type: 'success', text: 'Project added successfully!' });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add project' });
        }
    };

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        try {
            const response = await fetch(`/api/projects/${editingProject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t)
                })
            });

            if (response.ok) {
                const updatedProject = await response.json();
                setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                setShowEditModal(false);
                setEditingProject(null);
                resetForm();
                setMessage({ type: 'success', text: 'Project updated!' });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update project' });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setProjects(prev => prev.filter(p => p.id !== id));
                setMessage({ type: 'success', text: 'Project deleted!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to delete project' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete project' });
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            image: project.image,
            detailPage: project.detailPage,
            technologies: project.technologies.join(', '),
            visible: project.visible,
            longDescription: project.longDescription || '',
            features: project.features?.join('\n') || '',
            buttonLabel: project.buttonLabel || '',
            buttonUrl: project.buttonUrl || '',
            githubUrl: project.githubUrl || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: '',
            detailPage: '',
            technologies: '',
            visible: true,
            longDescription: '',
            features: '',
            buttonLabel: '',
            buttonUrl: '',
            githubUrl: ''
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <div>
                        <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Admin Panel
                        </Link>
                        <h1 className="text-4xl font-bold text-white mb-2">Project Management</h1>
                        <p className="text-gray-400">Manage projects on the homepage</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Project
                    </button>
                </motion.div>

                {/* Message */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-900/50 border border-green-700 text-green-300'
                                : 'bg-red-900/50 border border-red-700 text-red-300'
                                }`}
                        >
                            {message.text}
                            <button
                                onClick={() => setMessage({ type: '', text: '' })}
                                className="float-right"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-indigo-500 transition-all"
                            >
                                <div className="relative aspect-video">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {!project.visible && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                                            Hidden
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {project.technologies.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                                                +{project.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(project)}
                                            className="flex-1 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-sm transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg text-sm transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {(showAddModal || showEditModal) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                            onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingProject(null); }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    {showAddModal ? 'Add New Project' : 'Edit Project'}
                                </h2>

                                <form onSubmit={showAddModal ? handleAddProject : handleEditProject} className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Project Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Project Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                                placeholder="/projects/..."
                                                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {uploading ? '...' : 'Upload'}
                                            </button>
                                        </div>
                                        {formData.image && (
                                            <div className="mt-2 relative aspect-video w-full max-w-xs rounded-lg overflow-hidden">
                                                <Image src={formData.image} alt="Preview" fill className="object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Detail Page */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Detail Page URL (auto-generated from ID)</label>
                                        <input
                                            type="text"
                                            value={formData.detailPage}
                                            onChange={e => setFormData(prev => ({ ...prev, detailPage: e.target.value }))}
                                            placeholder="/projects/project-id or external URL"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Technologies */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Technologies (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.technologies}
                                            onChange={e => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                                            placeholder="React, Node.js, Python"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Visibility */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="visible"
                                            checked={formData.visible}
                                            onChange={e => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="visible" className="text-gray-300">Show on homepage</label>
                                    </div>

                                    {/* Detail Page Section Header */}
                                    <div className="border-t border-gray-600 pt-4 mt-4">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Detail Page Content
                                        </h3>
                                    </div>

                                    {/* Long Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Long Description</label>
                                        <textarea
                                            value={formData.longDescription}
                                            onChange={e => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                                            placeholder="Detailed project description for the detail page..."
                                            rows={4}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Features (one per line)</label>
                                        <textarea
                                            value={formData.features}
                                            onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                                            placeholder="Real-time data processing&#10;User authentication&#10;Cloud deployment"
                                            rows={4}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Button Label */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Button Label</label>
                                        <input
                                            type="text"
                                            value={formData.buttonLabel}
                                            onChange={e => setFormData(prev => ({ ...prev, buttonLabel: e.target.value }))}
                                            placeholder="e.g., View Live Demo, Visit Website, Try It Now"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Button URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Button URL</label>
                                        <input
                                            type="text"
                                            value={formData.buttonUrl}
                                            onChange={e => setFormData(prev => ({ ...prev, buttonUrl: e.target.value }))}
                                            placeholder="https://example.com or example.com"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* GitHub URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">GitHub URL (optional)</label>
                                        <input
                                            type="text"
                                            value={formData.githubUrl}
                                            onChange={e => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                                            placeholder="https://github.com/username/repo"
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingProject(null); }}
                                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all"
                                        >
                                            {showAddModal ? 'Add' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
