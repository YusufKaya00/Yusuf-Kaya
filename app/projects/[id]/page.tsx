'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ProjectDetail {
    id: string;
    title: string;
    description: string;
    image: string;
    detailPage: string;
    technologies: string[];
    order: number;
    visible: boolean;
    // Detail fields
    longDescription?: string;
    features?: string[];
    gallery?: string[];
    demoUrl?: string;
    githubUrl?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    status?: string;
    statusProgress?: number;
    createdAt?: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data);
                } else if (response.status === 404) {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Failed to load project:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProject();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (notFound || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-6"
                >
                    🔍
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                <p className="text-gray-400 mb-8">The project you're looking for doesn't exist or has been removed.</p>
                <Link
                    href="/#projects"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
                />
            </div>

            <section className="relative z-20 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href="/#projects"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Projects
                        </Link>
                    </motion.div>

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="relative aspect-video rounded-2xl overflow-hidden glass-strong border border-white/10 mb-8">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">
                            {project.title}
                        </h1>
                        <p className="text-xl text-gray-300 mb-6">
                            {project.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {project.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-4 py-2 glass rounded-full text-sm font-medium text-purple-400 border border-purple-500/30"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            {project.buttonUrl && (
                                <a
                                    href={project.buttonUrl.startsWith('http') ? project.buttonUrl : `https://${project.buttonUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    {project.buttonLabel || 'View Project'}
                                </a>
                            )}
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    View Source
                                </a>
                            )}
                        </div>
                    </motion.div>

                    {/* Long Description */}
                    {project.longDescription && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-strong rounded-2xl p-8 border border-white/10 mb-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">About This Project</h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {project.longDescription}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Features */}
                    {project.features && project.features.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-strong rounded-2xl p-8 border border-white/10 mb-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Gallery */}
                    {project.gallery && project.gallery.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-strong rounded-2xl p-8 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.gallery.map((img, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        className="relative aspect-video rounded-xl overflow-hidden border border-white/10"
                                    >
                                        <Image
                                            src={img}
                                            alt={`${project.title} screenshot ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
