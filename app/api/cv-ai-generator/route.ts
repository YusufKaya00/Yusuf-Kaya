import { NextResponse } from 'next/server';

// NVIDIA API key (for NVIDIA API Catalog)
const NVIDIA_API_KEY = process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY || '';
const TIMEOUT_DURATION = 30000; // 30 seconds

// Timeout control Promise
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out.'));
    }, ms);
  });
};

// Check if the API key is valid
function isValidAPIKey(key: string) {
  return key && key.length >= 20;
}

export async function POST(request: Request) {
  try {
    const { prompt, language = 'en' } = await request.json();

    // Debug environment variables
    console.log('Environment variables:');
    console.log('NVIDIA_API_KEY length:', NVIDIA_API_KEY ? NVIDIA_API_KEY.length : 0);

    if (!isValidAPIKey(NVIDIA_API_KEY)) {
      throw new Error('Valid NVIDIA API key not found');
    }

    const systemPrompt = `You are a CV generation assistant. You must create a professional CV based on the experience details provided by the user.
      You must reply in the following JSON format:
      {
        "fullName": "Full Name",
        "title": "Position",
        "location": "Location",
        "email": "Email",
        "phone": "Phone",
        "experience": [{"position": "Position", "company": "Company", "period": "Period", "details": "Details"}],
        "education": [{"degree": "Degree", "school": "School", "period": "Period", "gpa": "GPA"}],
        "skills": [{"category": "Skill", "level": "Level"}],
        "languages": [{"name": "Language", "level": "Level"}],
        "links": [{"name": "Platform", "url": "URL"}],
        "projects": [{"name": "Project Name", "description": "Description", "tags": "Tags"}]
      }
      All text content (especially positions, details, degrees, descriptions) MUST be written in English.
      IMPORTANT: Return ONLY valid JSON, no additional text or explanation.`;

    const response = await Promise.race([
      fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      }),
      timeoutPromise(TIMEOUT_DURATION)
    ]) as Response;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    if (!aiResponse) {
      throw new Error('AI response was empty');
    }

    // AI sometimes returns JSON inside markdown code blocks, clean it up
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

    // Try to find the first valid JSON object using regex
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

    let cvData;
    if (jsonMatch) {
      try {
        cvData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('JSON parse error from regex match:', e);
        // If regex match fails, try parsing the cleaned response directly
        cvData = JSON.parse(cleanedResponse);
      }
    } else {
      // If no regex match, try parsing the cleaned response directly
      cvData = JSON.parse(cleanedResponse);
    }

    return NextResponse.json({ cv: cvData });
  } catch (error) {
    console.error('AI CV generation failed:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the CV' },
      { status: 500 }
    );
  }
}