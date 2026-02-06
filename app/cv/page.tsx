import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export default function CVPage() {
    const cvPath = path.join(process.cwd(), 'public', 'uploads', 'cv.pdf');

    // Check if CV file exists
    if (fs.existsSync(cvPath)) {
        // If exists, redirect to the file (this will open the PDF in browser)
        redirect('/uploads/cv.pdf');
    }

    // If not exists, show information
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">CV Not Available</h1>
                <p className="text-gray-600 mb-8">
                    The CV file has not been uploaded yet. Please try again later.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium"
                    >
                        Return to Home
                    </Link>
                    <Link
                        href="/cv-generator"
                        className="block w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors font-medium"
                    >
                        Create Your Own CV
                    </Link>
                </div>
            </div>
        </div>
    );
}
