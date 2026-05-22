import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Çevre değişkenlerini güvenli bir şekilde liste olarak dönüştür
    const envVars = Object.keys(process.env)
      .filter(key => key.includes('QWEN') || key.includes('API') || key.includes('NEXT'))
      .map(key => {
        const value = process.env[key] || '';
        const maskedValue = value.length > 4 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` 
          : '****';
        return `${key}: ${maskedValue} (length: ${value.length})`;
      });
    
    // Keyleri alfabetik sıraya göre sırala
    envVars.sort();
    
    return NextResponse.json({ 
      envVars,
      hasNvidiaNimKey: !!process.env.NVIDIA_NIM_API_KEY,
      nvidiaNimKeyLength: process.env.NVIDIA_NIM_API_KEY?.length || 0,
      hasNvidiaKey: !!process.env.NVIDIA_API_KEY,
      nvidiaKeyLength: process.env.NVIDIA_API_KEY?.length || 0,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
    });
  } catch (error) {
    console.error('Error accessing environment variables:', error);
    return NextResponse.json({ error: 'Error accessing environment variables' }, { status: 500 });
  }
} 