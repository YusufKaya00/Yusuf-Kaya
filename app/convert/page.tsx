'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Veri tipleri
type SheetDataItem = Record<string, string | number>;

// ChartJS kayıt işlemleri
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function FiratConvert() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetData, setSheetData] = useState<SheetDataItem[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [numericalColumns, setNumericalColumns] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const chartRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze' | 'visualize'>('upload');

  // Dosya işleme fonksiyonu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      processFile(files[0]);
    }
  };

  // Excel/CSV dosyasını işleme
  const processFile = (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as SheetDataItem[];

        if (jsonData.length > 0) {
          setSheetData(jsonData);

          // Sütunları ve sayısal sütunları belirle
          const cols = Object.keys(jsonData[0] as Record<string, any>);
          setColumns(cols);

          const numCols = cols.filter(col => {
            const value = jsonData[0][col];
            return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
          });
          setNumericalColumns(numCols);

          if (numCols.length > 0) {
            setSelectedColumn(numCols[0]);
            calculateStats(jsonData, numCols[0]);
          }

          setStep('analyze');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('An error occurred while processing the file. Please check the file format.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // İstatistik hesaplama
  const calculateStats = (data: SheetDataItem[], column: string) => {
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));

    if (values.length === 0) {
      setStats(null);
      return;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];

    setStats({
      count: values.length,
      sum,
      average: avg,
      median,
      max,
      min
    });

    setStep('visualize');
  };

  // Sütun seçimi değiştiğinde
  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const column = e.target.value;
    setSelectedColumn(column);
    if (sheetData) {
      calculateStats(sheetData, column);
    }
  };

  // Grafik tipi değiştiğinde
  const handleChartTypeChange = (type: 'bar' | 'pie') => {
    setChartType(type);
  };

  // Renk fonksiyonu test fonksiyonu - oklab hatalarını yakalamak için
  const testColorFunction = (colorStr: string): string => {
    if (!colorStr) return '#FFFFFF';

    // oklab veya lab veya diğer modern renk fonksiyonlarını kontrol et
    if (
      colorStr.includes('oklab') ||
      colorStr.includes('lab(') ||
      colorStr.includes('lch(') ||
      colorStr.includes('color(')
    ) {
      // Güvenli hex renk kodu ile değiştir
      return colorStr.includes('rgba') ? 'rgba(255, 255, 255, 0.8)' : '#FFFFFF';
    }

    return colorStr;
  };

  // Grafik verilerini hazırla
  const prepareChartData = () => {
    if (!sheetData || !selectedColumn) return null;

    // Benzersiz kategorileri bul (en fazla 10 tane)
    let categories: any[] = [];
    let values: number[] = [];

    // Eğer sayısal veriyse, aralıklara bölme
    if (numericalColumns.includes(selectedColumn)) {
      const numValues = sheetData.map(row => Number(row[selectedColumn])).filter(val => !isNaN(val));
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);
      const range = max - min;
      const intervalCount = Math.min(10, Math.ceil(range));
      const intervalSize = range / intervalCount;

      // Veri aralıklarını oluştur
      const intervals = Array.from({ length: intervalCount }, (_, i) => {
        const start = min + i * intervalSize;
        const end = min + (i + 1) * intervalSize;
        return {
          label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
          start,
          end
        };
      });

      // Değerleri aralıklara göre gruplandır
      intervals.forEach(interval => {
        const count = numValues.filter(val => val >= interval.start && val < interval.end).length;
        categories.push(interval.label);
        values.push(count);
      });
    }
    // Metin veya kategorik veriyse, her benzersiz değer için bir grup oluştur
    else {
      const valueCounts: Record<string, number> = {};

      sheetData.forEach(row => {
        const value = String(row[selectedColumn]);
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });

      // En fazla 10 kategori göster
      const topCategories = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      categories = topCategories.map(([category]) => category);
      values = topCategories.map(([_, count]) => count);
    }

    const colors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 199, 199, 0.6)',
    ];

    return {
      labels: categories,
      datasets: [
        {
          label: selectedColumn,
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  // Grafik ayarları
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#FFFFFF'
        }
      },
      title: {
        display: true,
        text: `${selectedColumn} Analizi`,
        color: '#FFFFFF',
        font: {
          size: 16
        }
      },
    },
    scales: chartType === 'bar' ? {
      y: {
        ticks: { color: '#FFFFFF' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#FFFFFF' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    } : undefined
  };

  // PDF olarak indirme
  const exportToPDF = async () => {
    if (!chartRef.current) return;

    try {
      // HTML elementini doğrudan PDF'e çevirmek yerine 
      // önce canvas olarak render edeceğiz
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = '#FFFFFF';
      tempContainer.style.width = '800px'; // Sabit genişlik
      tempContainer.style.height = '600px'; // Sabit yükseklik

      // Grafik elementinin bir kopyasını oluştur
      const chartClone = chartRef.current.cloneNode(true) as HTMLElement;
      chartClone.style.backgroundColor = '#FFFFFF';

      // Renk sorunlarını önlemek için
      const allElements = chartClone.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // oklab renk formatlarını temizle
          if (el.style.color && el.style.color.includes('oklab')) {
            el.style.color = '#333333';  // Güvenli bir renk
          }
          if (el.style.backgroundColor && el.style.backgroundColor.includes('oklab')) {
            el.style.backgroundColor = 'transparent';
          }

          // Tüm renkleri standart hex renklerine çevir
          if (el.style.color) {
            try {
              const tempDiv = document.createElement('div');
              tempDiv.style.color = el.style.color;
              document.body.appendChild(tempDiv);
              const computedColor = window.getComputedStyle(tempDiv).color;
              el.style.color = computedColor;
              document.body.removeChild(tempDiv);
            } catch (e) {
              el.style.color = '#333333';
            }
          }
        }
      });

      tempContainer.appendChild(chartClone);
      document.body.appendChild(tempContainer);

      try {
        // Canvas render ayarları
        const canvas = await html2canvas(chartClone, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: (doc) => {
            // Oklab hatasını önleyen ek işlem
            Array.from(doc.querySelectorAll('*')).forEach(el => {
              const element = el as HTMLElement;
              try {
                if (element.style) {
                  // Oklab formatlarıyla ilgili tüm renk atamalarını temizle
                  if (element.style.color &&
                    (element.style.color.includes('oklab') ||
                      element.style.color.includes('lab(') ||
                      element.style.color.includes('lch('))) {
                    element.style.color = '#333333';
                  }

                  if (element.style.backgroundColor &&
                    (element.style.backgroundColor.includes('oklab') ||
                      element.style.backgroundColor.includes('lab(') ||
                      element.style.backgroundColor.includes('lch('))) {
                    element.style.backgroundColor = 'transparent';
                  }

                  if (element.style.borderColor &&
                    (element.style.borderColor.includes('oklab') ||
                      element.style.borderColor.includes('lab(') ||
                      element.style.borderColor.includes('lch('))) {
                    element.style.borderColor = '#CCCCCC';
                  }
                }
              } catch (e) {
                console.warn('Style manipulation error:', e);
              }
            });
          }
        });

        const imageData = canvas.toDataURL('image/png');

        // PDF oluştur
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        // PDF'e resim ekle
        const pdfWidth = 297;  // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
        pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Türkçe meta bilgi ekle
        pdf.setProperties({
          title: 'Firat Convert - Veri Analiz Raporu',
          subject: `${selectedColumn} Analizi`,
          author: 'Firat Convert',
          keywords: 'veri, analiz, rapor',
          creator: 'Firat Convert'
        });

        // Yazı ekle - ASCII karakter kullanımı
        pdf.setFontSize(14);
        pdf.text('Firat Convert - Veri Analiz Raporu', 10, 10);
        pdf.setFontSize(12);
        pdf.text(`Dosya: ${file?.name || 'Bilinmeyen'}`, 10, 20);
        pdf.text(`Tarih: ${new Date().toLocaleDateString('en-US')}`, 10, 25);
        pdf.text(`Analiz Edilen Sutun: ${selectedColumn}`, 10, 35);

        // İstatistikleri ekle
        if (stats) {
          pdf.setFontSize(12);
          pdf.text('Istatistikler:', 10, 45);
          pdf.text(`Veri Sayisi: ${stats.count}`, 15, 55);
          pdf.text(`Toplam: ${stats.sum.toFixed(2)}`, 15, 60);
          pdf.text(`Ortalama: ${stats.average.toFixed(2)}`, 15, 65);
          pdf.text(`Medyan: ${stats.median.toFixed(2)}`, 15, 70);
          pdf.text(`Maksimum: ${stats.max.toFixed(2)}`, 15, 75);
          pdf.text(`Minimum: ${stats.min.toFixed(2)}`, 15, 80);
        }

        // PDF dosyasını indir
        pdf.save(`firat-convert-${selectedColumn}-rapor.pdf`);
      } finally {
        // Geçici container'ı temizle
        if (tempContainer.parentNode) {
          tempContainer.parentNode.removeChild(tempContainer);
        }
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('An error occurred while creating the PDF. Please update your browser or try a different one.');
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-10" />
      </div>

      <div className="relative z-20 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Firat Convert
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Automatic Reporting and Data Visualization from Excel/CSV Files
            </motion.p>
          </div>

          {/* Ana içerik alanı */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700"
          >
            {/* Adımlar */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-teal-500' : (step === 'analyze' || step === 'visualize') ? 'bg-teal-700' : 'bg-gray-700'}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm text-gray-300">Upload</span>
                </div>

                <div className={`flex-1 h-0.5 ${step === 'upload' ? 'bg-gray-700' : 'bg-teal-600'}`}></div>

                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 'analyze' ? 'bg-teal-500' : step === 'visualize' ? 'bg-teal-700' : 'bg-gray-700'}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm text-gray-300">Analyze</span>
                </div>

                <div className={`flex-1 h-0.5 ${step === 'visualize' ? 'bg-teal-600' : 'bg-gray-700'}`}></div>

                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 'visualize' ? 'bg-teal-500' : 'bg-gray-700'}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm text-gray-300">Visualize</span>
                </div>
              </div>
            </div>

            {/* Dosya Yükleme Bölümü */}
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                  Excel or CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-teal-500 hover:text-teal-400">
                        <span>Upload File</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".xlsx,.xls,.csv"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      XLSX, XLS or CSV files
                    </p>
                    {file && (
                      <p className="text-sm text-teal-400 mt-2">
                        Uploaded: {file.name}
                      </p>
                    )}
                    {isAnalyzing && (
                      <p className="text-sm text-yellow-400 mt-2">
                        Processing file...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Analiz ve Görselleştirme Bölümü */}
            {step !== 'upload' && sheetData && (
              <div>
                {/* Sütun Seçimi */}
                <div className="mb-8 max-w-md mx-auto">
                  <label htmlFor="column-select" className="block text-sm font-medium text-gray-300 mb-2">
                    Column to Analyze
                  </label>
                  <select
                    id="column-select"
                    className="block w-full py-2 px-3 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-white"
                    value={selectedColumn}
                    onChange={handleColumnChange}
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>
                        {col} {numericalColumns.includes(col) ? '(Numerical)' : '(Text)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* İstatistikler */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Data Count</h3>
                      <p className="text-2xl font-bold text-white">{stats.count}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Average</h3>
                      <p className="text-2xl font-bold text-white">{stats.average.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Total</h3>
                      <p className="text-2xl font-bold text-white">{stats.sum.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Median</h3>
                      <p className="text-2xl font-bold text-white">{stats.median.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Maximum</h3>
                      <p className="text-2xl font-bold text-white">{stats.max.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Minimum</h3>
                      <p className="text-2xl font-bold text-white">{stats.min.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Grafik Kontrolleri */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-md" role="group">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg 
                        ${chartType === 'bar'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      onClick={() => handleChartTypeChange('bar')}
                    >
                      Bar Chart
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg 
                        ${chartType === 'pie'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      onClick={() => handleChartTypeChange('pie')}
                    >
                      Pie Chart
                    </button>
                  </div>
                </div>

                {/* Grafik */}
                <div className="max-w-5xl mx-auto p-4 bg-gray-800/50 rounded-lg" ref={chartRef}>
                  <div className="h-[400px] flex items-center justify-center">
                    {prepareChartData() ? (
                      chartType === 'bar' ? (
                        <Bar data={prepareChartData()!} options={chartOptions} />
                      ) : (
                        <Pie data={prepareChartData()!} options={chartOptions} />
                      )
                    ) : (
                      <p className="text-gray-400">Could not create chart. Please select a valid column.</p>
                    )}
                  </div>
                </div>

                {/* PDF İndirme Butonu */}
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={exportToPDF}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download as PDF
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Geri Git Butonu */}
          <div className="mt-12 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center text-teal-500 hover:text-teal-400"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 