'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Survey, Question, Answer, QuestionType } from '../types';

interface SurveyRespondProps {
  survey: Survey;
  onSubmit: (answers: Answer[]) => void;
  onCancel: () => void;
}

export default function SurveyRespond({ survey, onSubmit, onCancel }: SurveyRespondProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<'oneByOne' | 'all'>('all');

  // Her soruyu doldurma durumunu izle
  useEffect(() => {
    if (mode === 'oneByOne') {
      setProgress(((currentQuestionIndex + 1) / survey.questions.length) * 100);
    } else {
      const answeredRequired = survey.questions.filter(q => q.required).every(q =>
        answers.some(a => a.questionId === q.id && isAnswerValid(a.value))
      );

      const answeredCount = survey.questions.filter(q =>
        answers.some(a => a.questionId === q.id && isAnswerValid(a.value))
      ).length;

      setProgress((answeredCount / survey.questions.length) * 100);
    }
  }, [answers, currentQuestionIndex, survey.questions, mode]);

  // Cevap geçerli mi kontrolü
  const isAnswerValid = (value: string | number | string[]): boolean => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== undefined && value !== null;
  };

  // Cevabı kaydet
  const handleAnswer = (questionId: string, value: string | number | string[]) => {
    const questionIndex = survey.questions.findIndex(q => q.id === questionId);

    // Önceki cevabı sil
    const updatedAnswers = answers.filter(a => a.questionId !== questionId);

    // Yeni cevabı ekle
    updatedAnswers.push({ questionId, value });
    setAnswers(updatedAnswers);

    // Hatayı temizle
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }

    // Tek tek modunda ise ve geçerli bir cevap ise, bir sonraki soruya geç
    if (mode === 'oneByOne' &&
      isAnswerValid(value) &&
      currentQuestionIndex < survey.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  // Anketi gönder
  const handleSubmit = () => {
    // Formun doğruluğunu kontrol et
    const newErrors: Record<string, string> = {};

    survey.questions.forEach(question => {
      if (question.required) {
        const answer = answers.find(a => a.questionId === question.id);

        if (!answer || !isAnswerValid(answer.value)) {
          newErrors[question.id] = 'This question is required';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Tek tek modunda, ilk hataya atla
      if (mode === 'oneByOne') {
        const firstErrorIndex = survey.questions.findIndex(q => newErrors[q.id]);
        if (firstErrorIndex >= 0) {
          setCurrentQuestionIndex(firstErrorIndex);
        }
      }

      return;
    }

    // Gönderimi başlat
    setIsSubmitting(true);

    // Gönderim işlemi (gerçek uygulamada bir API çağrısı olabilir)
    setTimeout(() => {
      onSubmit(answers);
      setIsSubmitting(false);
    }, 1000);
  };

  // Mod değiştirme
  const toggleMode = () => {
    setMode(mode === 'oneByOne' ? 'all' : 'oneByOne');
  };

  // Önceki/sonraki soru
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
      {/* Anket başlık */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-semibold mb-2">{survey.title}</h1>
        <p className="text-indigo-100">{survey.description}</p>
      </div>

      {/* İlerleme çubuğu */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-1 bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mod değiştirme düğmesi */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          type="button"
          onClick={toggleMode}
          className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md"
        >
          {mode === 'oneByOne' ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Show All Questions
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show One by One
            </>
          )}
        </button>
      </div>

      {/* Anket ana içeriği */}
      <div className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {mode === 'oneByOne' ? (
            // Tek tek soru gösterimi
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Question {currentQuestionIndex + 1} / {survey.questions.length}
              </div>
              {renderQuestion(survey.questions[currentQuestionIndex])}

              {/* Navigasyon butonları */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 flex items-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {currentQuestionIndex === survey.questions.length - 1 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Submit Survey
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNextQuestion}
                    className="px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
                  >
                    Next
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // Tüm soruları aynı anda gösterme
            <div className="space-y-8">
              {survey.questions.map((question) => (
                <div key={question.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  {renderQuestion(question)}
                </div>
              ))}

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Submit Survey
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Geri butonları */}
      <div className="bg-gray-50 dark:bg-gray-750 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Exit Surveys
        </button>
      </div>
    </div>
  );

  // Soru tiplerine göre bileşen oluşturma
  function renderQuestion(question: Question) {
    const answer = answers.find(a => a.questionId === question.id);
    const errorMessage = errors[question.id];

    return (
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="flex-grow">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        </div>

        <div className="mt-2">
          {question.type === QuestionType.MultipleChoice && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`question_${question.id}_option_${index}`}
                    name={`question_${question.id}`}
                    value={option}
                    checked={answer?.value === option}
                    onChange={() => handleAnswer(question.id, option)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label
                    htmlFor={`question_${question.id}_option_${index}`}
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {question.type === QuestionType.ShortAnswer && (
            <textarea
              id={`question_${question.id}`}
              rows={3}
              value={answer?.value as string || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errorMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                }`}
              placeholder="Type your answer here..."
            />
          )}

          {question.type === QuestionType.Rating && (
            <div className="flex flex-wrap gap-2">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswer(question.id, option)}
                  className={`w-10 h-10 rounded-md text-sm font-medium ${answer?.value === option
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
} 