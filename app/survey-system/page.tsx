'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Survey, Submission, QuestionType } from './types/index';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import SurveyRespond from './components/SurveyRespond';
import SurveyResults from './components/SurveyResults';
import Link from 'next/link';

// Sayfa özellikleri
type PageView = 'list' | 'create' | 'respond' | 'results';

// LocalStorage işlemleri için ayrı bir bileşen
function LocalStorageHandler({
  setSurveysCallback,
  setSubmissionsCallback,
  setLoadingCallback
}: {
  setSurveysCallback: (surveys: Survey[]) => void,
  setSubmissionsCallback: (submissions: Submission[]) => void,
  setLoadingCallback: (loading: boolean) => void
}) {
  useEffect(() => {
    const savedSurveys = localStorage.getItem('surveySystemSurveys');
    const savedSubmissions = localStorage.getItem('surveySystemSubmissions');

    if (savedSurveys) {
      try {
        const parsedSurveys = JSON.parse(savedSurveys);
        setSurveysCallback(parsedSurveys);
      } catch (error) {
        console.error('Surveys parsing error:', error);
      }
    } else {
      // Örnek bir anket oluştur
      const exampleSurvey: Survey = {
        id: '1',
        title: 'Kullanıcı Deneyimi Anketi',
        description: 'Web sitemizin kullanıcı deneyimini değerlendirmek için kısa bir anket',
        questions: [
          {
            id: '1',
            text: 'Web sitemizi ne sıklıkla ziyaret ediyorsunuz?',
            type: QuestionType.MultipleChoice,
            options: ['Haftada birkaç kez', 'Haftada bir', 'Ayda bir', 'Yılda birkaç kez', 'İlk kez'],
            required: true
          },
          {
            id: '2',
            text: 'Sitemizin kullanımı ne kadar kolay?',
            type: QuestionType.Rating,
            options: ['1', '2', '3', '4', '5'],
            required: true
          },
          {
            id: '3',
            text: 'Sitemizde en beğendiğiniz özellik nedir?',
            type: QuestionType.ShortAnswer,
            required: false
          }
        ],
        createdAt: new Date().toISOString(),
        isPublished: true,
        shareableLink: 'ornek-anket'
      };

      setSurveysCallback([exampleSurvey]);
      localStorage.setItem('surveySystemSurveys', JSON.stringify([exampleSurvey]));
    }

    if (savedSubmissions) {
      try {
        const parsedSubmissions = JSON.parse(savedSubmissions);
        setSubmissionsCallback(parsedSubmissions);
      } catch (error) {
        console.error('Submissions parsing error:', error);
      }
    } else {
      // Örnek cevaplar oluştur
      const exampleSubmissions: Submission[] = [
        {
          id: '1',
          surveyId: '1',
          answers: [
            { questionId: '1', value: 'Haftada bir' },
            { questionId: '2', value: 4 },
            { questionId: '3', value: 'Sade ve kullanışlı arayüz tasarımı' }
          ],
          submittedAt: new Date().toISOString()
        },
        {
          id: '2',
          surveyId: '1',
          answers: [
            { questionId: '1', value: 'Ayda bir' },
            { questionId: '2', value: 3 },
            { questionId: '3', value: 'İçerik kalitesi ve güncelliği' }
          ],
          submittedAt: new Date().toISOString()
        }
      ];

      setSubmissionsCallback(exampleSubmissions);
      localStorage.setItem('surveySystemSubmissions', JSON.stringify(exampleSubmissions));
    }

    setLoadingCallback(false);
  }, [setSurveysCallback, setSubmissionsCallback, setLoadingCallback]);

  return null;
}

export default function SurveySystem() {
  // State yönetimi
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Anket oluşturma
  const handleCreateSurvey = (survey: Survey) => {
    // ID ve oluşturma zamanı ekle
    const newSurvey = {
      ...survey,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      shareableLink: encodeURIComponent(survey.title.toLowerCase().replace(/\s+/g, '-'))
    };

    const updatedSurveys = [...surveys, newSurvey];
    setSurveys(updatedSurveys);
    localStorage.setItem('surveySystemSurveys', JSON.stringify(updatedSurveys));

    // Listeye geri dön
    setCurrentView('list');
  };

  // Anket güncelleme
  const handleUpdateSurvey = (survey: Survey) => {
    const updatedSurveys = surveys.map(s =>
      s.id === survey.id ? survey : s
    );

    setSurveys(updatedSurveys);
    localStorage.setItem('surveySystemSurveys', JSON.stringify(updatedSurveys));

    // Listeye geri dön
    setCurrentView('list');
  };

  // Anket silme
  const handleDeleteSurvey = (surveyId: string) => {
    const updatedSurveys = surveys.filter(s => s.id !== surveyId);
    setSurveys(updatedSurveys);
    localStorage.setItem('surveySystemSurveys', JSON.stringify(updatedSurveys));

    // İlgili cevapları da sil
    const updatedSubmissions = submissions.filter(s => s.surveyId !== surveyId);
    setSubmissions(updatedSubmissions);
    localStorage.setItem('surveySystemSubmissions', JSON.stringify(updatedSubmissions));
  };

  // Cevap gönderme
  const handleSubmitResponse = (submission: Submission) => {
    const newSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);
    localStorage.setItem('surveySystemSubmissions', JSON.stringify(updatedSubmissions));

    // Listeye geri dön
    setCurrentView('list');
  };

  // Sayfa navigasyonu
  const navigateTo = (view: PageView, survey: Survey | null = null) => {
    setCurrentSurvey(survey);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={null}>
          <LocalStorageHandler
            setSurveysCallback={setSurveys}
            setSubmissionsCallback={setSubmissions}
            setLoadingCallback={setIsLoading}
          />
        </Suspense>

        {/* Üst Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            Online Survey and Form System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create surveys, participate, and analyze results with charts. All data is stored in your browser.
          </p>
        </motion.div>

        {/* Üst Menü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8 p-4 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => navigateTo('list')}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
              }`}
          >
            Surveys
          </button>

          <button
            onClick={() => navigateTo('create')}
            className={`px-4 py-2 rounded-md transition-colors ${currentView === 'create'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
              }`}
          >
            Create New Survey
          </button>
        </motion.div>

        {/* Yükleniyor */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Ana İçerik */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'list' && (
                <SurveyList
                  surveys={surveys}
                  onCreateNew={() => navigateTo('create')}
                  onRespond={(survey: Survey) => navigateTo('respond', survey)}
                  onViewResults={(survey: Survey) => navigateTo('results', survey)}
                />
              )}

              {currentView === 'create' && (
                <SurveyForm
                  survey={currentSurvey}
                  onSave={currentSurvey ? handleUpdateSurvey : handleCreateSurvey}
                  onCancel={() => navigateTo('list')}
                />
              )}

              {currentView === 'respond' && currentSurvey && (
                <SurveyRespond
                  survey={currentSurvey}
                  onSubmit={(answers) => {
                    handleSubmitResponse({
                      id: '',
                      surveyId: currentSurvey.id,
                      answers,
                      submittedAt: ''
                    });
                  }}
                  onCancel={() => navigateTo('list')}
                />
              )}

              {currentView === 'results' && currentSurvey && (
                <SurveyResults
                  survey={currentSurvey}
                  submissions={submissions.filter(s => s.surveyId === currentSurvey.id)}
                  onBack={() => navigateTo('list')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Geri Git Butonu */}
        <div className="mt-12 text-center">
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Note: You can use the <Link href="/admin/surveys" className="text-indigo-500 hover:text-indigo-400">Admin Panel</Link> to edit or delete surveys.
          </div>
          <a
            href="/portfolio"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
} 