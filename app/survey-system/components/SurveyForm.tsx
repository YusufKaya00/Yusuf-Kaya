'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Survey, Question, QuestionType } from '../types';

interface SurveyFormProps {
  survey: Survey | null;
  onSave: (survey: Survey) => void;
  onCancel: () => void;
}

export default function SurveyForm({ survey, onSave, onCancel }: SurveyFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState<'info' | 'questions'>('info');

  // Mevcut anket verilerini yükleme
  useEffect(() => {
    if (survey) {
      setTitle(survey.title);
      setDescription(survey.description);
      setQuestions(survey.questions);
      setIsPublished(survey.isPublished);
    } else {
      // Yeni anket için varsayılanlar
      setTitle('');
      setDescription('');
      setQuestions([]);
      setIsPublished(false);
    }
  }, [survey]);

  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Survey title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Survey description is required';
    }

    if (questions.length === 0) {
      newErrors.questions = 'You must add at least one question';
    }

    // Soru bazlı doğrulama
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question_${index}_text`] = 'Question text is required';
      }

      if (question.type === QuestionType.MultipleChoice && (!question.options || question.options.length < 2)) {
        newErrors[`question_${index}_options`] = 'At least two options are required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Anket kaydetme
  const handleSave = () => {
    if (!validateForm()) {
      // Formda hatalar varsa, sorular sekmesine git
      if (Object.keys(errors).some(key => key.startsWith('question_'))) {
        setCurrentTab('questions');
      }
      return;
    }

    const updatedSurvey: Survey = {
      id: survey?.id || '',
      title,
      description,
      questions,
      createdAt: survey?.createdAt || new Date().toISOString(),
      isPublished,
      shareableLink: survey?.shareableLink
    };

    onSave(updatedSurvey);
  };

  // Yeni soru ekleme
  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type,
      required: true,
      options: type !== QuestionType.ShortAnswer ? ['', ''] : undefined
    };

    setQuestions([...questions, newQuestion]);

    // Hatayı temizle
    if (errors.questions) {
      const { questions: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  // Soru silme
  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));

    // İlgili hataları temizle
    const newErrors = { ...errors };
    Object.keys(newErrors)
      .filter(key => key.startsWith(`question_${questions.findIndex(q => q.id === questionId)}`))
      .forEach(key => delete newErrors[key]);

    setErrors(newErrors);
  };

  // Soru düzenleme
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);

    // Hataları temizle
    if (errors[`question_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`question_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  // Seçenek düzenleme
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options || [];
    const newOptions = [...currentOptions];
    newOptions[optionIndex] = value;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: newOptions
    };

    setQuestions(updatedQuestions);

    // Hataları temizle
    if (errors[`question_${questionIndex}_options`] && newOptions.filter(Boolean).length >= 2) {
      const newErrors = { ...errors };
      delete newErrors[`question_${questionIndex}_options`];
      setErrors(newErrors);
    }
  };

  // Seçenek ekleme
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options || [];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: [...currentOptions, '']
    };

    setQuestions(updatedQuestions);
  };

  // Seçenek silme
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options || [];

    // En az iki seçenek olmalı
    if (currentOptions.length <= 2) {
      return;
    }

    const newOptions = [...currentOptions];
    newOptions.splice(optionIndex, 1);

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: newOptions
    };

    setQuestions(updatedQuestions);
  };

  // Soruları yeniden sıralama
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];

    setQuestions(updatedQuestions);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Form başlık */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {survey ? 'Edit Survey' : 'Create New Survey'}
        </h2>
      </div>

      {/* Sekme menüsü */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setCurrentTab('info')}
            className={`px-4 py-3 text-sm font-medium ${currentTab === 'info'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Survey Information
          </button>
          <button
            onClick={() => setCurrentTab('questions')}
            className={`px-4 py-3 text-sm font-medium ${currentTab === 'questions'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Questions {questions.length > 0 ? `(${questions.length})` : ''}
          </button>
        </nav>
      </div>

      {/* Form içeriği */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentTab === 'info' ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                {/* Anket başlığı */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Survey Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) {
                        const { title, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    placeholder="Enter survey title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Anket açıklaması */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Survey Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) {
                        const { description, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    placeholder="Explain the purpose and scope of the survey"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Yayınlama durumu */}
                <div className="flex items-center mt-4">
                  <input
                    id="isPublished"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Publish survey (make it available immediately)
                  </label>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('questions')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next: Add Questions
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Soru ekleme bölümü */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Survey Questions</h3>

                {errors.questions && (
                  <p className="mb-4 text-sm text-red-500 p-2 bg-red-50 dark:bg-red-900/30 rounded-md">
                    {errors.questions}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addQuestion(QuestionType.MultipleChoice)}
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    Multiple Choice
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.ShortAnswer)}
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Short Answer
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.Rating)}
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Rating
                  </button>
                </div>
              </div>

              {/* Soru listesi */}
              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No questions</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Select a question type from the buttons above to create a survey
                    </p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 dark:text-gray-200">Question {index + 1}</span>
                          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                            {question.type === QuestionType.MultipleChoice
                              ? 'Multiple Choice'
                              : question.type === QuestionType.ShortAnswer
                                ? 'Short Answer'
                                : 'Rating'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === questions.length - 1}
                            className={`p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${index === questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Soru metni */}
                      <div className="mb-4">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${errors[`question_${index}_text`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                            }`}
                          placeholder="Question text"
                        />
                        {errors[`question_${index}_text`] && (
                          <p className="mt-1 text-sm text-red-500">{errors[`question_${index}_text`]}</p>
                        )}
                      </div>

                      {/* Soru seçenekleri - Çoktan seçmeli veya Derecelendirme için */}
                      {(question.type === QuestionType.MultipleChoice || question.type === QuestionType.Rating) && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Options
                            {errors[`question_${index}_options`] && (
                              <span className="ml-2 text-sm text-red-500">{errors[`question_${index}_options`]}</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <div className="flex-grow">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                                    placeholder={question.type === QuestionType.Rating ? `Rating ${optionIndex + 1}` : `Option ${optionIndex + 1}`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="text-gray-500 hover:text-red-500"
                                  disabled={question.options?.length <= 2}
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Option
                          </button>
                        </div>
                      )}

                      {/* Gerekli mi? */}
                      <div className="flex items-center mt-2">
                        <input
                          id={`question_${index}_required`}
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`question_${index}_required`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          This question is required
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentTab('info')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back: Survey Information
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form butonları */}
        <div className="flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {survey ? 'Update Survey' : 'Create Survey'}
          </button>
        </div>
      </div>
    </div>
  );
} 