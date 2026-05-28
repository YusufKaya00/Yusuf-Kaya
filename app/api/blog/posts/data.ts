// Tüm API'lerin paylaşacağı blog yazısı deposu
// Dosya sistemi tabanlı depolama kullanıyor, veritabanı gerektirmez

import fs from 'fs';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes?: string[]; // Beğeni listesi ekledik
}

// JSON dosya yolu - data klasörü proje kök dizininde oluşturulacak
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'blogs.json');

// Dosyadan blog yazılarını okuma fonksiyonu
export function readBlogsFromFile(): BlogPost[] {
  try {
    // Dizin yoksa oluştur
    const dirPath = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Dosya yoksa, örnek blog yazılarıyla oluştur
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initialData = JSON.stringify(initialBlogs, null, 2);
      fs.writeFileSync(DATA_FILE_PATH, initialData);
      return initialBlogs;
    }
    
    // Dosyayı oku ve JSON olarak parse et
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Blog verilerini okuma hatası:', error);
    // Hata durumunda örnek veriler döndür
    return initialBlogs;
  }
}

// Blog yazılarını dosyaya kaydetme fonksiyonu
export function writeBlogsToFile(blogs: BlogPost[]): void {
  try {
    console.log('Dosyaya yazılıyor:', DATA_FILE_PATH);
    
    // Dizin yoksa oluştur
    const dirPath = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      console.log('Dizin oluşturuluyor:', dirPath);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // JSON formatına dönüştür
    const jsonData = JSON.stringify(blogs, null, 2);
    
    // Dosyaya yaz
    fs.writeFileSync(DATA_FILE_PATH, jsonData, 'utf8');
    console.log('Dosyaya yazma başarılı, blog sayısı:', blogs.length);
  } catch (error) {
    console.error('Blog verilerini yazma hatası:', error);
    // Hata durumunda daha açıklayıcı mesaj
    throw new Error(`Blog verilerini dosyaya yazma başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}

// Dosya yoksa başlangıç için örnek blog yazıları
const initialBlogs: BlogPost[] = [
  {
    id: '1',
    title: 'What is DevOps? A Comprehensive Guide to Principles, Practices, and Culture',
    excerpt: "DevOps is a set of practices that combines software development (Dev) and IT operations (Ops) to shorten the systems development life cycle and deliver high-quality software continuously. Let's explore its core concepts...",
    content: `# What is DevOps? A Comprehensive Guide to Principles, Practices, and Culture

DevOps is not just a buzzword; it represents a fundamental shift in how modern software organizations deliver value. By bridging the gap between Software Development (Dev) and IT Operations (Ops), DevOps combines people, processes, and tools to enable the continuous deployment of high-quality software.

In this guide, we will explore the core pillars of DevOps, its practices, and why it has become the gold standard for software engineering teams worldwide.

---

## 🌟 The Core Principles of DevOps

To understand DevOps, we must look at the **CALMS** framework, which defines the mindset of the methodology:

1. **C - Culture**: Fostering collaboration, shared responsibility, and open communication between developers, operations, and business stakeholders.
2. **A - Automation**: Automating repetitive and error-prone tasks (like building, testing, and deployment) to increase efficiency and reliability.
3. **L - Lean**: Minimizing waste, optimizing workflows, and focusing on delivering value to end-users in small, manageable iterations.
4. **M - Measurement**: Tracking key metrics (like deployment frequency, lead time for changes, and mean time to recovery) to drive decisions.
5. **S - Sharing**: Encouraging team members to share knowledge, successes, failures, and resources to promote continuous learning.

---

## 🛠️ Essential DevOps Practices

DevOps relies on a suite of practices that automate and streamline the software development lifecycle (SDLC):

### 1. Continuous Integration (CI) and Continuous Delivery (CD)
* **Continuous Integration**: Developers merge their code changes into a shared repository frequently. Automated builds and test runs verify these changes, catching integration issues early.
* **Continuous Delivery**: Automatically building, testing, and preparing code changes for a release to production. This ensures that the codebase is always in a deployable state.

### 2. Infrastructure as Code (IaC)
Instead of manually configuring servers and networks, IaC allows teams to manage infrastructure using configuration files (e.g., Terraform, Ansible, or CloudFormation). This ensures environments are consistent, reproducible, and version-controlled.

### 3. Microservices Architecture
Breaking down monolithic applications into smaller, decoupled services that communicate via APIs. Each microservice can be developed, tested, deployed, and scaled independently.

### 4. Continuous Monitoring and Logging
DevOps teams monitor application performance, infrastructure health, and user metrics in real-time. Tools like Prometheus, Grafana, and the ELK Stack help identify and fix performance bottlenecks or outages before they affect users.

---

## 🚀 The DevOps Lifecycle

The DevOps lifecycle is typically depicted as an infinite loop, representing continuous improvement:

\`\`\`mermaid
graph LR
    A((Plan)) --> B((Code))
    B --> C((Build))
    C --> D((Test))
    D --> E((Release))
    E --> F((Deploy))
    F --> G((Operate))
    G --> H((Monitor))
    H --> A
\`\`\`

1. **Plan**: Define business value, requirements, and project milestones.
2. **Code**: Write software and review code.
3. **Build**: Compile code and build application packages.
4. **Test**: Run automated security, unit, integration, and performance tests.
5. **Release & Deploy**: Deliver packages to production environments securely.
6. **Operate**: Handle server scaling, configuration management, and updates.
7. **Monitor**: Collect logs, metrics, and user feedback to feed back into the planning phase.

---

## 🏆 Key Benefits of DevOps

Organizations that successfully adopt DevOps see major improvements in their operational and product metrics:

* **Speed**: Release features and bug fixes faster, giving you a competitive edge.
* **Reliability**: Automated testing and CI/CD pipelines reduce production defects and improve system stability.
* **Scalability**: Manage complex or changing systems with reduced risk through automation and IaC.
* **Improved Collaboration**: A shared responsibility culture removes organizational silos and enhances employee engagement.

DevOps is a continuous journey of improvement. By embracing automation, measurement, and a collaborative culture, engineering teams can build resilient software that keeps up with the demands of the modern world.`,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    title: 'Yazılım Testlerinde Temel Yaklaşımlar: Kara Kutu (Black Box) ve Beyaz Kutu (White Box) Testleri',
    excerpt: 'Yazılım geliştirme sürecinin en kritik aşamalarından biri, geliştirilen kodun doğru, güvenli ve performanslı çalıştığını doğrulamaktır. Yazılım kalitesini garanti altına almak için kullanılan yöntemler genellikle iki temel başlık altında toplanır: Kara Kutu (Black Box) ve Beyaz Kutu (White Box) testleri...',
    content: `# Yazılım Testlerinde Temel Yaklaşımlar: Kara Kutu (Black Box) ve Beyaz Kutu (White Box) Testleri

Yazılım geliştirme sürecinin en kritik aşamalarından biri, geliştirilen kodun doğru, güvenli ve performanslı çalıştığını doğrulamaktır. Yazılım kalitesini garanti altına almak için kullanılan yöntemler genellikle iki temel başlık altında toplanır: **Kara Kutu (Black Box)** ve **Beyaz Kutu (White Box)** testleri.

Bu yazıda, bu iki test metodolojisinin ne olduğunu, aralarındaki farkları, kullanılan teknikleri ve hangisinin ne zaman tercih edilmesi gerektiğini inceleyeceğiz.

---

## ⬛ Kara Kutu Testi (Black Box Testing) Nedir?

Kara Kutu testi, yazılımın **iç kod yapısı, mimarisi veya kodlama detayları bilinmeden** yapılan test yöntemidir. Test uzmanı, sistemi dışarıdan bir kullanıcı veya harici bir sistem gözüyle inceler.

### Temel Özellikleri:
*   **Odak Noktası**: Sistemin işlevsel (functional) gereksinimleri karşılayıp karşılamadığıdır. Belirtilen girdilere karşılık beklenen çıktıların alınıp alınmadığı kontrol edilir.
*   **Kod Bilgisi**: Kodlama bilgisi gerektirmez. Test uzmanı kaynak kodları görmez.
*   **Kimler Yapar?**: Genellikle bağımsız yazılım test uzmanları (QA Engineers) veya son kullanıcılar (UAT - User Acceptance Testing) tarafından gerçekleştirilir.

### Kara Kutu Test Teknikleri:
1.  **Sınır Değer Analizi (Boundary Value Analysis)**: Girdi aralıklarının sınır noktalarındaki (örn: minimum, maksimum, limit değerleri) davranışları test etme.
2.  **Eşdeğer Sınıflara Bölme (Equivalence Partitioning)**: Benzer davranışlar sergilemesi beklenen girdi grupları oluşturup, her gruptan en az bir örnek test etme.
3.  **Karar Tablosu Testi (Decision Table Testing)**: Karmaşık iş kuralları ve girdilerin kombinasyonlarına göre sistem çıktılarının doğruluğunu sınama.

---

## ⬜ Beyaz Kutu Testi (White Box Testing) Nedir?

Beyaz Kutu testi (bazen Açık Kutu veya Cam Kutu testi de denir), yazılımın **iç kod yapısının, veri akışının, kontrol döngülerinin ve kod mimarisinin** analiz edildiği test yöntemidir.

### Temel Özellikleri:
*   **Odak Noktası**: Kodun tasarımı, veri yollarının doğruluğu, hata işleme mekanizmaları, bellek sızıntıları ve güvenlik açıklarıdır.
*   **Kod Bilgisi**: Yüksek derecede kodlama ve yazılım mimarisi bilgisi gerektirir. Kaynak koda tam erişim vardır.
*   **Kimler Yapar?**: Genellikle yazılım geliştiriciler (Developers) veya teknik test mühendisleri (SDET - Software Development Engineer in Test) tarafından gerçekleştirilir.

### Beyaz Kutu Test Teknikleri:
1.  **Deyim Kapsamı (Statement Coverage)**: Koddaki her bir satırın/deyiminin en az bir kez çalıştırıldığını doğrular.
2.  **Karar/Dal Kapsamı (Decision/Branch Coverage)**: Koddaki her bir karar noktasının (if/else gibi) hem doğru (true) hem de yanlış (false) dallarının test edilmesini sağlar.
3.  **Yol Kapsamı (Path Coverage)**: Program içindeki tüm olası yürütme yollarının ayrı ayrı test edilmesidir.
4.  **Birim Testi (Unit Testing)**: En küçük kod birimlerinin (fonksiyon, sınıf vb.) yalıtılmış olarak test edilmesidir (örn: JUnit, Jest, PyTest araçlarıyla).

---

## 🔄 Kara Kutu ve Beyaz Kutu Testleri Arasındaki Farklar

| Özellik | Kara Kutu (Black Box) | Beyaz Kutu (White Box) |
| :--- | :--- | :--- |
| **Kod Bilgisi** | Gerekmez (İç yapı görünmez) | Zorunludur (İç yapı şeffaftır) |
| **Kapsam** | Gereksinimler ve Kullanıcı Deneyimi | Kod yapısı, Mantıksal Yollar, Yapısal Tasarım |
| **Test Eden Kişi** | Test Uzmanı (QA) veya Son Kullanıcı | Yazılım Geliştirici (Dev) veya SDET |
| **Test Türleri** | Fonksiyonel Testler, Sistem ve Kabul Testleri | Birim (Unit), Entegrasyon ve Statik Kod Analizi |
| **Başlangıç Zamanı** | Yazılımın arayüzü veya fonksiyonları çalışır olduğunda | Geliştirme aşaması başlar başlamaz (Erken aşamada) |
| **Ana Hedef** | Sistem ne yapmalı? (İşlevsellik) | Sistem bunu nasıl yapıyor? (Güvenilirlik ve Temizlik) |

---

## 🤝 Hangisi Tercih Edilmeli?

Bu iki test yaklaşımı birbirinin rakibi değil, aksine **birbirini tamamlayan** unsurlardır. 

*   Bir uygulamanın birim testleri (Beyaz Kutu) %100 başarıyla geçse bile, modüllerin bir araya geldiğinde kullanıcı gereksinimlerini karşılamaması (Kara Kutu hatası) mümkündür.
*   Benzer şekilde, dışarıdan mükemmel çalışan bir sistemin (Kara Kutu testi başarılı), iç yapısında ciddi bellek sızıntıları veya güvenlik açıkları (Beyaz Kutu hatası) barındırıyor olması olasıdır.

Bu nedenle, yüksek kaliteli bir yazılım ürünü ortaya koymak için geliştirme sürecinde hem geliştiricilerin **Beyaz Kutu** (özellikle Unit ve Entegrasyon testleri) hem de test ekiplerinin **Kara Kutu** (Sistem ve Kabul testleri) yaklaşımlarını dengeli bir şekilde kullanması en doğru yaklaşımdır.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Uygulama başladığında dosyadan blogları oku
export let blogPosts: BlogPost[] = readBlogsFromFile(); 