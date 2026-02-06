'use client';

import { useState, useEffect } from 'react';
import { Survey, Submission, Question, QuestionType, AnalysisResult } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface SurveyResultsProps {
  survey: Survey;
  submissions: Submission[];
  onBack: () => void;
}

export default function SurveyResults({ survey, submissions, onBack }: SurveyResultsProps) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual'>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Analiz sonuçlarını hesapla
  useEffect(() => {
    if (!submissions.length) return;

    const results: AnalysisResult[] = survey.questions.map(question => {
      const answers = submissions
        .flatMap(s => s.answers.filter(a => a.questionId === question.id));

      switch (question.type) {
        case QuestionType.MultipleChoice: {
          // Seçeneklere göre sayıları hesapla
          const optionCounts: Record<string, number> = {};
          question.options?.forEach(option => {
            optionCounts[option] = 0;
          });

          answers.forEach(answer => {
            if (typeof answer.value === 'string' && optionCounts[answer.value] !== undefined) {
              optionCounts[answer.value]++;
            }
          });

          return {
            questionId: question.id,
            questionText: question.text,
            questionType: question.type,
            data: {
              labels: Object.keys(optionCounts),
              values: Object.values(optionCounts)
            }
          };
        }
        case QuestionType.Rating: {
          // Derecelendirmelerin sayısını hesapla
          const ratingCounts: Record<string, number> = {};
          question.options?.forEach(option => {
            ratingCounts[option] = 0;
          });

          answers.forEach(answer => {
            if (typeof answer.value === 'string' && ratingCounts[answer.value] !== undefined) {
              ratingCounts[answer.value]++;
            }
          });

          return {
            questionId: question.id,
            questionText: question.text,
            questionType: question.type,
            data: {
              labels: Object.keys(ratingCounts),
              values: Object.values(ratingCounts)
            }
          };
        }
        case QuestionType.ShortAnswer: {
          // Kısa yanıtlar için metin listesi
          return {
            questionId: question.id,
            questionText: question.text,
            questionType: question.type,
            data: {
              labels: [],
              values: [],
              textResponses: answers.map(a => a.value as string).filter(Boolean)
            }
          };
        }
        default:
          return {
            questionId: question.id,
            questionText: question.text,
            questionType: question.type,
            data: {
              labels: [],
              values: []
            }
          };
      }
    });

    setAnalysisResults(results);
  }, [survey, submissions]);

  // Hesaplanan değerlerin renk tonlaması
  const getColorForIndex = (index: number) => {
    const baseColors = [
      'rgba(79, 70, 229, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(244, 114, 182, 0.8)',
      'rgba(20, 184, 166, 0.8)'
    ];
    return baseColors[index % baseColors.length];
  };

  // Gösterge rengi
  const getLegendColor = (value: number, max: number) => {
    if (max === 0) return 'rgba(209, 213, 219, 0.8)';
    const percentage = value / max;

    if (percentage > 0.7) return 'rgba(79, 70, 229, 0.8)';
    if (percentage > 0.4) return 'rgba(139, 92, 246, 0.8)';
    if (percentage > 0.1) return 'rgba(244, 114, 182, 0.8)';
    return 'rgba(209, 213, 219, 0.8)';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{survey.title} - Results</h1>
            <p className="text-purple-100 text-sm md:text-base">
              Total {submissions.length} people participated in the survey
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-1.5 text-sm text-white border border-white/40 rounded-md hover:bg-white/10"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Go Back
          </button>
        </div>
      </div>

      {/* Tab Menü */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'individual'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Individual Responses ({submissions.length})
          </button>
        </nav>
      </div>

      {/* Ana İçerik */}
      <div className="p-6">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {analysisResults.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No data</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No one has participated in this survey yet
                </p>
              </div>
            ) : (
              analysisResults.map((result, index) => (
                <div key={result.questionId} className="bg-gray-50 dark:bg-gray-750 rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {index + 1}. {result.questionText}
                  </h3>

                  {result.questionType === QuestionType.ShortAnswer ? (
                    // Kısa yanıt sonuçları
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {result.data.textResponses?.length ? (
                        result.data.textResponses.map((response: string, i: number) => (
                          <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300">{response}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No responses for this question</p>
                      )}
                    </div>
                  ) : (
                    // Çoktan seçmeli veya derecelendirme sonuçları
                    <div>
                      <div className="space-y-3">
                        {result.data.labels.map((label, i) => {
                          const max = Math.max(...result.data.values);
                          const value = result.data.values[i];
                          const percentage = max === 0 ? 0 : Math.round((value / submissions.length) * 100);

                          return (
                            <div key={i} className="relative">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {value} responses ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                                <div
                                  className="h-2.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: getColorForIndex(i),
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Grafiği canvas ile çizmek yerine DOM element olarak gösteriyoruz */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center h-40 max-h-40">
                          <div className="flex items-end h-full space-x-4 w-full max-w-lg">
                            {result.data.labels.map((label, i) => {
                              const max = Math.max(...result.data.values);
                              const value = result.data.values[i];
                              const height = max === 0 ? 0 : Math.max(10, (value / max) * 100);

                              return (
                                <div key={i} className="flex flex-col items-center flex-1">
                                  <div
                                    className="w-full rounded-t transition-all duration-500"
                                    style={{
                                      height: `${height}%`,
                                      backgroundColor: getColorForIndex(i),
                                      minHeight: value > 0 ? '10px' : '0'
                                    }}
                                  ></div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
                                    {label}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {submissions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No participation</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No one has participated in this survey yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cevap listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {submissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`
                        p-4 rounded-lg cursor-pointer transition-all
                        ${selectedSubmission?.id === submission.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
                          : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                        border shadow-sm
                      `}
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          #{index + 1}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {format(new Date(submission.submittedAt), 'PPp', { locale: enUS })}
                        </span>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Response Details</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {submission.answers.length} questions answered
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seçili cevap detayları */}
                {selectedSubmission && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4 flex justify-between items-center">
                      <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100">
                        Response Detail
                      </h4>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {format(new Date(selectedSubmission.submittedAt), 'PPp', { locale: enUS })}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {survey.questions.map((question, qIndex) => {
                        const answer = selectedSubmission.answers.find(a => a.questionId === question.id);

                        return (
                          <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                            <div className="flex items-start">
                              <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                                {qIndex + 1}.
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {question.text}
                                </p>

                                {answer ? (
                                  <div className="mt-1">
                                    {question.type === QuestionType.ShortAnswer ? (
                                      <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-750 rounded">
                                        {answer.value as string}
                                      </p>
                                    ) : question.type === QuestionType.Rating ? (
                                      <div className="flex items-center">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-md text-white font-medium"
                                          style={{ backgroundColor: getColorForIndex(parseInt(answer.value as string) - 1 || 0) }}>
                                          {answer.value}
                                        </span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                                          / {question.options?.length || 5}
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                                        {answer.value as string}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                                    Not answered
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 