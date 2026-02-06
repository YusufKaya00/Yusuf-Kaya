'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Survey } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface SurveyListProps {
  surveys: Survey[];
  onCreateNew: () => void;
  onRespond: (survey: Survey) => void;
  onViewResults: (survey: Survey) => void;
}

export default function SurveyList({
  surveys,
  onCreateNew,
  onRespond,
  onViewResults,
}: SurveyListProps) {
  const [expandedSurvey, setExpandedSurvey] = useState<string | null>(null);

  // Anket kartını genişlet/daralt
  const toggleExpand = (surveyId: string) => {
    setExpandedSurvey(expandedSurvey === surveyId ? null : surveyId);
  };

  // Soru sayısını ve türlerini özetleme
  const getSurveyStats = (survey: Survey) => {
    const questionTypes = survey.questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions: survey.questions.length,
      types: questionTypes,
    };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Boş durum */}
      {surveys.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center"
        >
          <div className="text-indigo-500 mx-auto mb-4">
            <svg className="w-16 h-16 mx-auto opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No surveys yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first survey.</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Survey
          </button>
        </motion.div>
      )}

      {/* Anket listesi */}
      {surveys.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6"
          >
            {surveys.map((survey) => {
              const stats = getSurveyStats(survey);
              const isExpanded = expandedSurvey === survey.id;

              return (
                <motion.div
                  key={survey.id}
                  layoutId={`survey-${survey.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl border border-transparent hover:border-indigo-500/30 transition-all duration-300"
                >
                  {/* Anket başlığı */}
                  <div
                    onClick={() => toggleExpand(survey.id)}
                    className="p-4 cursor-pointer flex justify-between items-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {survey.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(survey.createdAt), { addSuffix: true, locale: enUS })} • {stats.totalQuestions} questions
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`rounded-full w-3.5 h-3.5 ${survey.isPublished ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 mr-2">
                        {survey.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Anket detayları */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4"
                    >
                      <div className="border-t border-gray-200 dark:border-gray-700 my-3 pt-3">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{survey.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {Object.entries(stats.types).map(([type, count]) => (
                            <span key={type} className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                              {count}x {type === 'multipleChoice' ? 'Multiple Choice' : type === 'shortAnswer' ? 'Short Answer' : 'Rating'}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => onRespond(survey)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Take Survey
                          </button>
                          <button
                            onClick={() => onViewResults(survey)}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View Results
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Yeni anket oluştur butonu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Survey
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
} 