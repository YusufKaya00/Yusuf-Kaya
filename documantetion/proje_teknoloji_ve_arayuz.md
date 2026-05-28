# Proje Teknolojik Altyapı ve Arayüz Dokümantasyonu

Bu doküman, **Yusuf Kaya Portfolio & Blog** projesinin genel mimarisini, kullanılan teknolojileri (Tech Stack), dosya yapısını ve kullanıcı arayüzü (UI) bileşenlerini detaylandırmaktadır.

---

## 🛠️ Teknolojik Altyapı (Technology Stack)

Proje, modern ve performansı yüksek bir web deneyimi sunmak amacıyla güncel kütüphane ve teknolojilerle inşa edilmiştir.

### 1. Ana Çatı (Framework & Core)
*   **Next.js 15.2.8 (App Router)**: Sunucu taraflı render (SSR), istemci taraflı render (CSR) ve API rotalarını bir arada barındıran full-stack React framework'ü.
*   **React 19.0.0**: En yeni özellikleri ve performans optimizasyonlarını barındıran kullanıcı arayüzü kütüphanesi.
*   **TypeScript**: Kod kalitesini artırmak ve tip güvenliği sağlamak için kullanılan JavaScript üst kümesi.

### 2. Stil ve Görsel Tasarım (CSS & Styling)
*   **Tailwind CSS v4.0.0**: Yardımcı sınıflar (utility-first) ile hızlı, duyarlı (responsive) ve modern arayüz tasarımı.
*   **PostCSS 4**: Stil dosyalarının derlenmesi ve optimize edilmesi için.

### 3. Animasyon ve Kullanıcı Deneyimi (UX & Animation)
*   **Framer Motion 12.5.0**: Akıcı sayfa geçişleri, hover efektleri ve mikro animasyonlar oluşturmak için.

### 4. Yapay Zeka Entegrasyonları (AI Hub)
Proje, AI tabanlı zeki özellikler sağlamak için yüksek performanslı dil modellerini barındıran **NVIDIA NIM API (NVIDIA API Catalog)** entegrasyonunu kullanmaktadır:
*   **Kullanılan Model**: `meta/llama-3.3-70b-instruct`
*   **Entegre Edilen Araçlar**:
    *   **AI CV Oluşturucu**: Kullanıcı girdilerine göre profesyonel İngilizce CV taslakları hazırlar.
    *   **AI Kod İnceleme**: Girilen kodların kalite, güvenlik, performans, temiz kod ve okunabilirlik yönünden analiz edilmesini sağlar.
    *   **AI Blog Yazarı**: Belirtilen konu başlıklarında otomatik Türkçe blog içeriği üretir.
*   *Not: API anahtarı olmadığında veya istek zaman aşımına uğradığında otomatik olarak devreye giren gelişmiş yerel simülasyon (fallback) mekanizmaları bulunmaktadır.*

### 5. Veri İşleme ve Raporlama (Data & Document Utilities)
*   **Chart.js & React-Chartjs-2**: Proje takibi ve anket sonuçlarını görselleştirmek için etkileşimli grafikler.
*   **html2canvas & jsPDF**: CV oluşturucudan elde edilen CV'leri istemci tarafında PDF dosyasına dönüştürüp indirmek için.
*   **XLSX (SheetJS)**: Excel dosyalarını okuma, yazma ve veri formatı dönüştürme işlemleri için.
*   **React-DatePicker**: Tarih seçimi gerektiren formlar için özelleştirilmiş takvim bileşeni.
*   **Moment.js**: Tarih ve saat formatlama işlemleri için.
*   **React Markdown & React Syntax Highlighter**: Blog yazılarında markdown formatını görselleştirmek ve kod inceleme aracında kod bloklarını renklendirmek için.

### 6. İletişim ve E-Posta (Communication)
*   **Nodemailer 7.0.3**: İletişim formundan gönderilen mesajların e-posta olarak iletilmesi için backend tarafında kullanılan SMTP kütüphanesi.

### 7. Veri Saklama Modeli (Data Storage)
*   Proje, karmaşık bir veritabanı (örn. PostgreSQL veya MongoDB) yerine **Dosya Sistemi Tabanlı JSON Depolama** kullanmaktadır.
*   Blog yazıları `/data/blogs.json` dosyasında, projeler ise `/data/projects.json` dosyasında saklanır. API rotaları doğrudan bu dosyalara okuma/yazma (CRUD) işlemlerini gerçekleştirir.

---

## 📂 Proje Dizin Yapısı (Project Folder Structure)

Uygulamanın dosya yapısı, Next.js App Router standartlarına uygun olarak tasarlanmıştır:

```text
portfolio-blog/
├── app/                           # Next.js App Router Sayfaları ve API'ler
│   ├── api/                       # Backend API Endpointleri
│   │   ├── blog/                  # Blog CRUD ve AI Yazma API'leri
│   │   ├── code-analysis/         # AI Kod İnceleme API'si (NVIDIA NIM)
│   │   ├── contact/               # E-posta Gönderim API'si (Nodemailer)
│   │   ├── convert/               # Dosya Dönüştürücü API'si
│   │   ├── cv-ai-generator/       # AI CV İçerik Önerici API'si
│   │   ├── upload/                # Genel Dosya Yükleme API'si
│   │   └── upload-cv/             # CV PDF Yükleme API'si
│   ├── about/                     # /about - Hakkımda Sayfası
│   ├── admin/                     # /admin - Admin Yönetim Paneli
│   ├── blog/                      # /blog - Blog Listesi, Detay ve Yeni Yazı Sayfaları
│   ├── code-review/               # /code-review - AI Kod Analiz Ekranı
│   ├── contact/                   # /contact - İletişim Sayfası
│   ├── convert/                   # /convert - Belge Dönüştürme Ekranı 1
│   ├── converter/                 # /converter - Belge Dönüştürme Ekranı 2
│   ├── cv/                        # /cv - Mevcut CV Görüntüleme Ekranı
│   ├── cv-generator/              # /cv-generator - İnteraktif CV Oluşturma Robotu
│   ├── photo-sharing/             # /photo-sharing - Fotoğraf Paylaşım Platformu
│   ├── portfolio/                 # /portfolio - Portfolyo / Proje Vitrini
│   ├── project-tracker/           # /project-tracker - Gantt Şemalı Proje Takip Sistemi
│   ├── survey-system/             # /survey-system - Anket Oluşturma ve Sonuç Analiz Sistemi
│   ├── layout.tsx                 # Ana Sayfa Şablonu
│   ├── globals.css                # Global CSS Kuralları
│   └── page.tsx                   # Ana Sayfa (Hero, Resim Galerisi, İletişim Formu)
├── components/                    # Genel Paylaşılan UI Bileşenleri (Örn: ImageModal.tsx)
├── data/                          # Veri Deposu (blogs.json, projects.json)
├── documantetion/                 # Proje Görsel ve Şemaları (Gantt, Grafik, İş Akışı vb.)
├── public/                        # Statik Dosyalar (Resimler, Yüklenen PDF'ler vb.)
├── package.json                   # Proje Bağımlılıkları ve Scriptleri
├── tailwind.config.mjs            # Tailwind Konfigürasyonu (v4 ile entegre)
└── tsconfig.json                  # TypeScript Konfigürasyonu
```

---

## 🖥️ Arayüz ve Araçlar (Features & UI Modules)

Proje, kişisel tanıtım amacının ötesinde zengin bir araç kutusu (SaaS benzeri) olarak kurgulanmıştır:

### 1. Ana Sayfa & Portfolyo (`/` & `/portfolio`)
*   **Arayüz**: Dinamik arka plan görselleriyle zenginleştirilmiş giriş ekranı, kariyer özeti ve projelerin kategorize edilmiş listesi.
*   **Etkileşim**: Framer Motion tabanlı yumuşak kart geçişleri, animasyonlu yükleme göstergeleri ve doğrudan SMTP üzerinden çalışan iletişim formu.

### 2. Akıllı Blog Platformu (`/blog`)
*   **Arayüz**: Markdown formatındaki blog yazılarını şık bir şekilde okuma deneyimi sunar.
*   **AI Desteği**: `/blog/new` sayfasında kullanıcı sadece bir konu girerek NVIDIA NIM API aracılığıyla dakikalar içinde Türkçe bir makale taslağı hazırlatabilir.
*   **Depolama**: Eklenen tüm yazılar `/data/blogs.json` dosyasına yazılır.

### 3. Akıllı CV Oluşturucu (`/cv-generator`)
*   **Arayüz**: Kişisel bilgiler, deneyimler, eğitimler, diller ve projeler için dinamik olarak doldurulabilen çok adımlı form yapısı.
*   **AI Desteği**: NVIDIA NIM ile entegre çalışarak kullanıcının girdiği kısa bilgileri profesyonel ve kurumsal İngilizce ifadelere dönüştürür.
*   **Çıktı**: Hazırlanan CV'yi tarayıcı üzerinde görsel olarak derler ve tek tıklamayla PDF formatında bilgisayara indirilmesini sağlar.

### 4. AI Kod İnceleme Asistanı (`/code-review`)
*   **Arayüz**: Kullanıcının kodunu yapıştırabileceği ve programlama dilini seçebileceği zengin bir editör arayüzü.
*   **Özellikler**: Kod Kalitesi, Güvenlik Açıkları, Performans, Temiz Kod ve Okunabilirlik olmak üzere 5 farklı kategoride derinlemesine AI analizi sunar. Analiz sonuçları şık grafikler ve Markdown formatında raporlanır.

### 5. Proje ve Görev Takipçisi (`/project-tracker`)
*   **Arayüz**: Takım üyeleri ekleme, yeni projeler tanımlama ve bu projelere bağlı alt görevler (Task) oluşturma ekranı.
*   **Özellikler**: Proje zaman çizelgelerini görselleştirmek için interaktif **Gantt Şeması** (Gantt Chart) görünümü sunar.

### 6. Anket Yönetim Sistemi (`/survey-system`)
*   **Arayüz**: Çoktan seçmeli veya açık uçlu sorulardan oluşan anket tasarlama, bu anketleri yanıtlama ve toplanan verilerin dağılımını (pasta/çubuk grafikleriyle) izleme paneli.

### 7. Fotoğraf Paylaşım Platformu (`/photo-sharing`)
*   **Arayüz**: Kullanıcıların profil oluşturabildiği, etiketler (tag cloud) ile fotoğraflar yükleyebildiği ve fotoğraflara beğeni/yorum ekleyebildiği mini sosyal ağ arayüzü.

### 8. Belge Dönüştürme Araçları (`/convert` & `/converter`)
*   **Arayüz**: PDF dosyalarını DOCX (Word) formatına veya çeşitli veri formatlarını birbirine dönüştürmek için tasarlanmış sürükle-bırak dosya yükleme arayüzü.

---

## 🚀 Kurulum ve Başlatma

Projeyi yerel makinenizde çalıştırmak için:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Çevre değişkenlerini ayarlayın (.env.local oluşturarak aşağıdaki değişkenleri tanımlayın)
# NVIDIA_NIM_API_KEY="nvapi-..."
# EMAIL_USER="your-email@gmail.com"
# EMAIL_PASS="your-app-password"

# 3. Geliştirme sunucusunu başlatın
npm run dev
```
