import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    hasApiKey: Boolean(aiClient),
    appName: 'MAGSI AI',
    version: '1.0.0',
    model: 'gemini-3.8-flash',
  });
});

// Real-time Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.8-flash',
      imageBase64,
      imageMimeType = 'image/jpeg',
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!aiClient) {
      // Graceful smart demo fallback if API key is not yet configured in Secrets
      const lastUserMsg = messages[messages.length - 1]?.text || 'Hello';
      const fallbackReply = generateFallbackResponse(lastUserMsg, systemInstruction);
      return res.json({ text: fallbackReply, isFallback: true });
    }

    // Prepare contents
    const contents: any[] = [];

    // History items
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLatest = i === messages.length - 1;

      if (isLatest && imageBase64) {
        // Multimodal input with image attached
        const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [
            {
              inlineData: {
                mimeType: imageMimeType,
                data: cleanBase64,
              },
            },
            {
              text: msg.text || 'Please examine this image and provide a thorough, helpful answer.',
            },
          ],
        });
      } else {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }],
        });
      }
    }

    const response = await aiClient.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemInstruction || 'You are an intelligent, friendly AI assistant in MAGSI AI messaging platform.',
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I've processed your message.";
    return res.json({ text: replyText, isFallback: false });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Return informative error or graceful message
    const lastUserMsg = req.body?.messages?.[req.body.messages.length - 1]?.text || 'Hello';
    const fallback = generateFallbackResponse(lastUserMsg, req.body?.systemInstruction);
    return res.json({
      text: fallback,
      isFallback: true,
      errorNotice: error.message || 'Gemini service notice: Using local intelligent assistant.',
    });
  }
});

// Image Generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, style = 'Realistic', aspectRatio = '1:1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const enhancedPrompt = `${prompt}, styled as ${style}, ultra high quality, clean composition, 8k resolution aesthetics`;

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            return res.json({ imageUrl, prompt: enhancedPrompt, isFallback: false });
          }
        }
      } catch (genError: any) {
        console.warn('Image generation model notice, generating artistic vector fallback:', genError?.message);
      }
    }

    // Artistic SVG / DataURL placeholder if image gen model requires paid key or key unset
    const fallbackImage = generateStyledSvgImage(prompt, style, aspectRatio);
    return res.json({ imageUrl: fallbackImage, prompt: enhancedPrompt, isFallback: true });
  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    const fallbackImage = generateStyledSvgImage(req.body?.prompt || 'MAGSI AI Art', 'Modern', '1:1');
    return res.json({ imageUrl: fallbackImage, prompt: req.body?.prompt, isFallback: true });
  }
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: text.slice(0, 300) }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice as any },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
          });
        }
      } catch (ttsErr: any) {
        console.warn('TTS API notice, using client Web Speech API fallback:', ttsErr?.message);
      }
    }

    return res.json({ audioBase64: null, useWebSpeech: true });
  } catch (err: any) {
    return res.json({ audioBase64: null, useWebSpeech: true });
  }
});

// Intelligent fallback generator for offline / initial demo mode
function generateFallbackResponse(query: string, instruction?: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('math') || lower.includes('+') || lower.includes('=') || lower.includes('solve')) {
    return `### 📐 Step-by-Step Solution:\n\n1. **Identify Given Values:** Analyzing the mathematical expression in your query.\n2. **Formula & Operations:** Applying arithmetic and algebraic simplification rules.\n3. **Calculation:** Working through each operational order carefully.\n4. **Final Result:** Verified and structured step-by-step for clear study.\n\n*Feel free to attach a textbook snapshot or handwritten equation for full visual analysis!*`;
  }

  if (lower.includes('islam') || lower.includes('quran') || lower.includes('hadith')) {
    return `Assalamu Alaikum wa Rahmatullah.\n\nIslamic knowledge emphasizes seeking truth through authenticated sources (Quran, Sahih Hadith, and scholarly consensus).\n\nKey reflection on your inquiry:\n- **Principle:** Seeking knowledge with humility and patience is deeply encouraged.\n- **Application:** Always cross-reference references with authentic classical commentaries (Tafsir and Hadith explanations).\n\nIf you have a specific Surah, ayah, or Hadith topic you'd like to explore, please share!`;
  }

  if (lower.includes('sindhi') || lower.includes('magsi') || lower.includes('baloch') || lower.includes('culture')) {
    return `سلام ۽ آڌرڀاءُ! (Greetings and welcome!)\n\nThe Magsi heritage is steeped in rich traditions of hospitality, courage, and poetry across Sindh and Balochistan. From classical Sindhi and Balochi folk literature to modern cultural contributions, it reflects deep honor and community solidarity.\n\nتوهان ڇا ڄاڻڻ چاهيو ٿا؟ (What would you like to explore further about history, poetry, or language?)`;
  }

  if (lower.includes('urdu') || lower.includes('shairi') || lower.includes('poetry')) {
    return `خوش آمدید! آپ کے سوال یا گفتگو کے حوالے سے:\n\nعلم و ادب اور تخلیق کا سفر ہمیشہ نئے افکار کو جنم دیتا ہے۔ چاہے اردو زبان و بیان ہو، شاعری یا مضامین نگاری، میں آپ کی رہنمائی کے لیے ہمہ وقت حاضر ہوں۔\n\nفرمائیے، آگے کیا تحریر کرنا پسند کریں گے؟`;
  }

  if (lower.includes('business') || lower.includes('market') || lower.includes('startup') || lower.includes('idea')) {
    return `### 🚀 Strategic Business Blueprint:\n\n1. **Value Proposition:** Solve a high-friction problem for a well-defined niche audience.\n2. **Go-To-Market (GTM):** Leverage direct digital channels, community trust, and viral distribution.\n3. **Monetization:** Recurring subscriptions or high-margin tiered offerings with low customer acquisition cost.\n4. **Execution Priority:** Build an MVP, gather feedback within 48 hours, and iterate rapidly.`;
  }

  return `Hello! I'm here to assist you inside **MAGSI AI**.\n\nWhether you need in-depth explanations, code solutions, step-by-step problem solving, creative storytelling, or image analysis, I'm ready to help. How can we proceed?`;
}

// Generates an attractive stylized SVG data URL when image gen is in demo/fallback mode
function generateStyledSvgImage(prompt: string, style: string, aspectRatio: string): string {
  let width = 800;
  let height = 800;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 800;
    height = 600;
  }

  const cleanPrompt = prompt.replace(/[<>&"]/g, ' ').slice(0, 70);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00A884"/>
        <stop offset="50%" stop-color="#0E3A2F"/>
        <stop offset="100%" stop-color="#0B141A"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="${width / 2}" cy="${height / 2 - 30}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="#25D366" stroke-width="3" stroke-dasharray="8 6" opacity="0.6"/>
    <circle cx="${width / 2}" cy="${height / 2 - 30}" r="${Math.min(width, height) * 0.16}" fill="rgba(0,168,132,0.2)" stroke="#25D366" stroke-width="2"/>
    <text x="${width / 2}" y="${height / 2 - 20}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" filter="url(#glow)">MAGSI STUDIO</text>
    <text x="${width / 2}" y="${height / 2 + 16}" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#25D366" text-anchor="middle" letter-spacing="3">${style.toUpperCase()} • ${aspectRatio}</text>
    <rect x="${width * 0.1}" y="${height - 90}" width="${width * 0.8}" height="56" rx="16" fill="rgba(11,20,26,0.85)" stroke="rgba(0,168,132,0.4)" stroke-width="1.5"/>
    <text x="${width / 2}" y="${height - 56}" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#E9EDEF" text-anchor="middle">"${cleanPrompt}..."</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Mounting Vite in development or serving dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAGSI AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
