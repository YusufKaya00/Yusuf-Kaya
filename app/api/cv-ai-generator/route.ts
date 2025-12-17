import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenRouter API anahtarı (Mistral Devstral için)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const TIMEOUT_DURATION = 30000; // 30 saniye

// Zaman aşımı kontrolü için Promise
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('İstek zaman aşımına uğradı.'));
    }, ms);
  });
};

// API anahtarının geçerli olup olmadığını kontrol eden fonksiyon
function isValidAPIKey(key: string) {
  return key && key.length >= 30 && key.startsWith('sk-or-');
}

// OpenRouter API ile içerik oluşturma (Mistral Devstral)
async function generateWithOpenRouter(prompt: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://yusuf-kaya.onrender.com',
      'X-Title': 'Yusuf Kaya Portfolio'
    },
    body: JSON.stringify({
      model: 'mistralai/devstral-2512:free',
      messages: [
        { role: 'system', content: 'Sen profesyonel bir özgeçmiş oluşturucusun. Kullanıcının verdiği bilgilere göre JSON formatında CV hazırlayacaksın.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter API Hatası: ${errorData.error?.message || 'Bilinmeyen hata'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Debug environment variables
    console.log('Environment variables:');
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length || 0);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('API')));

    // API anahtarını kontrol et
    // NOT: Bu sadece bir test içindir - gerçek uygulamalarda API anahtarlarını kodda saklamayın!
    // Test ettikten sonra kaldırın ve sadece çevre değişkeniyle çalışın
    const apiKey = process.env.OPENROUTER_API_KEY || '';

    // Gerçek API anahtarı kontrolü
    if (apiKey === 'YOUR_TEST_API_KEY_HERE') {
      console.log('⚠️ Using test API key - replace with your actual key');
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "CV Generator",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "mistralai/devstral-2512:free",
      messages: [
        {
          role: "system",
          content: `Sen bir CV oluşturma asistanısın. Kullanıcının girdiği deneyim bilgilerine göre profesyonel bir CV oluşturmalısın. 
          Yanıtını aşağıdaki JSON formatında vermelisin:
          {
            "fullName": "Ad Soyad",
            "title": "Pozisyon",
            "location": "Konum",
            "email": "E-posta",
            "phone": "Telefon",
            "experience": [{"position": "Pozisyon", "company": "Şirket", "period": "Dönem", "details": "Detaylar"}],
            "education": [{"degree": "Derece", "school": "Okul", "period": "Dönem", "gpa": "Not"}],
            "skills": [{"category": "Beceri", "level": "Seviye"}],
            "languages": [{"name": "Dil", "level": "Seviye"}],
            "links": [{"name": "Platform", "url": "URL"}],
            "projects": [{"name": "Proje Adı", "description": "Açıklama", "tags": "Etiketler"}]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error('AI yanıtı boş geldi');
    }

    // AI bazen markdown code block içinde JSON döndürüyor, bunu temizle
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    // Regex ile ilk geçerli JSON objesini bulmaya çalış
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

    let cvData;
    if (jsonMatch) {
      try {
        cvData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('JSON parse error from regex match:', e);
        // Regex başarısız olursa, temizlenmiş yanıtı doğrudan parse etmeyi dene
        cvData = JSON.parse(cleanedResponse);
      }
    } else {
      // Regex eşleşmezse, temizlenmiş yanıtı doğrudan parse etmeyi dene
      cvData = JSON.parse(cleanedResponse);
    }

    return NextResponse.json({ cv: cvData });
  } catch (error) {
    console.error('AI CV generation failed:', error);
    return NextResponse.json(
      { error: 'CV oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 