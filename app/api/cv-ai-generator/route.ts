import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// NVIDIA API anahtarı (NVIDIA API Catalog için)
const NVIDIA_API_KEY = process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY || '';
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
  return key && key.length >= 20;
}

// NVIDIA API ile içerik oluşturma (meta/llama-3.3-70b-instruct)
async function generateWithNvidia(prompt: string) {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: 'Sen profesyonel bir özgeçmiş oluşturucusun. Kullanıcının verdiği bilgilere göre JSON formatında CV hazırlayacaksın.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Hatası: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Debug environment variables
    console.log('Environment variables:');
    console.log('NVIDIA_API_KEY length:', NVIDIA_API_KEY.length);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('NVIDIA') || key.includes('OPENROUTER') || key.includes('API')));

    if (!isValidAPIKey(NVIDIA_API_KEY)) {
      throw new Error('Geçerli NVIDIA API anahtarı bulunamadı');
    }

    const openai = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: NVIDIA_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
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