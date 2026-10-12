// Service for Gemini Multimodal Vision & Voice/Text Parsing with Fast Auth Error Detection & Auto-Recovery

const STORAGE_KEY = 'fit_tracker_gemini_api_key';

export function getStoredApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
}

export function storeApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
      cachedWorkingEndpoint = null;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      cachedWorkingEndpoint = null;
    }
  } catch (e) {
    console.error('Failed to store API key:', e);
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const mimeType = file.type || 'image/jpeg';
      const base64Data = result.split(',')[1];
      resolve({ base64Data, mimeType, dataUrl: result });
    };
    reader.onerror = (error) => reject(error);
  });
}

function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Top candidate endpoints
const CANDIDATE_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
];

let cachedWorkingEndpoint = null;

// Dynamically discover supported models for the user's API key
async function discoverWorkingEndpoint(apiKey) {
  if (cachedWorkingEndpoint) return cachedWorkingEndpoint;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: {
        'x-goog-api-key': apiKey
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (listRes.ok) {
      const data = await listRes.json();
      const models = data.models || [];
      const generateModels = models
        .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));

      const preferred = [
        'gemini-2.5-flash',
        'gemini-3.8-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest'
      ];

      for (const p of preferred) {
        if (generateModels.includes(p)) {
          cachedWorkingEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${p}:generateContent`;
          return cachedWorkingEndpoint;
        }
      }

      if (generateModels.length > 0) {
        cachedWorkingEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${generateModels[0]}:generateContent`;
        return cachedWorkingEndpoint;
      }
    } else {
      const err = await listRes.json().catch(() => ({}));
      const reason = err?.error?.details?.[0]?.reason || err?.error?.message || '';
      if (
        listRes.status === 401 ||
        reason.includes('API_KEY_SERVICE_BLOCKED') ||
        reason.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')
      ) {
        throw new Error('API_KEY_BLOCKED: Google Generative Language API is blocked or not enabled for this project. Please create an API key in a NEW project on Google AI Studio.');
      }
    }
  } catch (e) {
    if (e.message && e.message.includes('API_KEY_BLOCKED')) {
      throw e;
    }
    // Network or timeout, fallback to candidate list
  }

  return null;
}

// Resilient API executor with fast auth abort and recommendation auto-detect
async function executeGeminiRequest(apiKey, requestBody) {
  // Check discovered endpoint
  let endpointsToTry = CANDIDATE_ENDPOINTS;
  try {
    const discovered = await discoverWorkingEndpoint(apiKey);
    if (discovered) {
      endpointsToTry = [discovered, ...CANDIDATE_ENDPOINTS.filter((e) => e !== discovered)];
    }
  } catch (authErr) {
    throw authErr;
  }

  let lastError = null;

  for (const baseUrl of endpointsToTry) {
    try {
      const url = `${baseUrl}?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        cachedWorkingEndpoint = baseUrl;
        return data;
      }

      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
      const errReason = errJson?.error?.details?.[0]?.reason || '';
      lastError = new Error(errMsg);

      // Check for blocked API key or auth mismatch - FAIL FAST!
      if (
        res.status === 401 ||
        errReason.includes('API_KEY_SERVICE_BLOCKED') ||
        errReason.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
        errMsg.includes('API_KEY_SERVICE_BLOCKED') ||
        errMsg.includes('invalid authentication credentials')
      ) {
        throw new Error('API Key Error: Generative Language API is not enabled for this project. Please generate a key in a NEW project on aistudio.google.com (or tap "Try Demo Scan" below).');
      }

      // Check if Google returned a direct recommendation: "Please update your code to use models/XXX"
      const recMatch = errMsg.match(/use models\/([a-zA-Z0-9.-]+)/i);
      if (recMatch && recMatch[1]) {
        const recommendedModel = recMatch[1];
        try {
          const recUrl = `https://generativelanguage.googleapis.com/v1beta/models/${recommendedModel}:generateContent?key=${apiKey}`;
          const recRes = await fetch(recUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            cachedWorkingEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${recommendedModel}:generateContent`;
            return recData;
          }
        } catch {
          // continue
        }
      }

      // If it's a 404 or deprecated model, continue trying next candidate
      if (
        res.status === 404 ||
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('not supported') ||
        errMsg.toLowerCase().includes('no longer available')
      ) {
        continue;
      }

      // Other 400 errors (e.g. invalid key string)
      if (res.status === 400 && (errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key in API Setup tab.');
      }
    } catch (e) {
      lastError = e;
      if (
        e.message &&
        (e.message.includes('API Key Error') || e.message.includes('API_KEY_BLOCKED') || e.message.includes('Invalid Gemini API Key'))
      ) {
        throw e;
      }
    }
  }

  throw lastError || new Error('Could not connect to Gemini model. Please check internet or use Demo Scan.');
}

/**
 * Analyze meal photo using Gemini Vision with intelligent Chicken Biryani / meal demo fallback
 */
export async function analyzeMealPhoto({ base64Data, mimeType, apiKey }) {
  const key = apiKey || getStoredApiKey();

  if (!key) {
    // Instant smart demo scan tailored to user's meal
    await new Promise((r) => setTimeout(r, 800));
    return {
      isDemo: true,
      mealName: 'Chicken Biryani & Rice Bowl (Photo Analysis)',
      foods: [
        { name: 'Chicken Leg & Thigh (Cooked)', portion: '220g', calories: 345, protein: 48, carbs: 0, fat: 16, fiber: 0 },
        { name: 'Spiced Biryani Basmati Rice', portion: '1.5 cups (210g)', calories: 310, protein: 6, carbs: 64, fat: 4, fiber: 2 },
        { name: 'Caramelized Onion & Aromatics', portion: '35g', calories: 35, protein: 1, carbs: 5, fat: 1, fiber: 1 }
      ],
      totalCalories: 690,
      totalProtein: 55,
      totalCarbs: 69,
      totalFat: 21,
      totalFiber: 3,
      confidence: 'high',
      tips: 'Outstanding muscle recovery meal! Provides ~55g high-quality protein and clean complex carbs to replenish glycogen stores.'
    };
  }

  const prompt = `You are an elite sports nutritionist and computer vision nutrition analyzer.
Analyze this meal photo with maximum precision.
Identify each food item on the plate (e.g. rice, chicken, vegetables, curry, bread).
Estimate standard portion sizes in grams or cups based on visible proportions.
Calculate calories, protein (g), carbs (g), fat (g), and dietary fiber (g) for each food item.
Compute total calories and total macros.

Return ONLY a raw JSON object (no markdown, no backticks, no explanations) with this exact schema:
{
  "mealName": "Descriptive title of meal (e.g. Chicken Biryani / Rice Bowl)",
  "foods": [
    {
      "name": "Food item name",
      "portion": "e.g. 150g or 1 cup",
      "calories": 240,
      "protein": 42,
      "carbs": 0,
      "fat": 5,
      "fiber": 0
    }
  ],
  "totalCalories": 540,
  "totalProtein": 56,
  "totalCarbs": 60,
  "totalFat": 8,
  "totalFiber": 5,
  "confidence": "high",
  "tips": "Actionable 1-2 sentence fitness/nutrition insight for this meal"
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const data = await executeGeminiRequest(key, requestBody);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('No response generated by Gemini model.');

  const cleaned = cleanJsonString(rawText);
  return JSON.parse(cleaned);
}

/**
 * Parse spoken or typed voice transcript into structured fitness log
 */
export async function parseVoiceTranscript({ transcript, apiKey }) {
  const key = apiKey || getStoredApiKey();

  if (!key) {
    await new Promise((r) => setTimeout(r, 600));
    return fallbackHeuristicParser(transcript);
  }

  const prompt = `You are a fitness log assistant.
Parse this voice transcript of a person talking about their daily fitness, food, or workout:
"${transcript}"

Extract all stated or implied values:
- caloriesEaten (number): total calories eaten or added (e.g. "ate 1800 calories" -> 1800, "had a 500 calorie shake" -> 500)
- proteinEaten (number): grams of protein (e.g. "120g protein" -> 120)
- water (number): water intake in Liters (e.g. "drank 3.5 liters" -> 3.5, "3 bottles of 1 liter" -> 3.0)
- steps (number): step count (e.g. "walked 9500 steps" -> 9500)
- workout (string): name or description of workout (e.g. "Legs and abs", "Chest and triceps")
- gym (boolean): true if they worked out / went to gym, false if they said rest day / nil
- sleep (number): hours of sleep (e.g. "slept 8 hours" -> 8.0)
- weight (number): bodyweight in kg (e.g. "weighed 65.2 kg" -> 65.2)
- notes (string): brief summary or meal details

Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "caloriesEaten": number | null,
  "proteinEaten": number | null,
  "water": number | null,
  "steps": number | null,
  "workout": string | null,
  "gym": boolean | null,
  "sleep": number | null,
  "weight": number | null,
  "notes": string | null,
  "summary": "1 sentence friendly summary of what was logged"
}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  try {
    const data = await executeGeminiRequest(key, requestBody);
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No response generated by Gemini model.');

    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Gemini voice parse failed, using offline fallback:', err);
    return fallbackHeuristicParser(transcript);
  }
}

// Fallback regex / keyword parser when offline or without API key
function fallbackHeuristicParser(text) {
  const lower = text.toLowerCase();
  const result = {
    caloriesEaten: null,
    proteinEaten: null,
    water: null,
    steps: null,
    workout: null,
    gym: null,
    sleep: null,
    weight: null,
    notes: text,
    summary: 'Recognized with smart offline parser'
  };

  const stepsMatch = lower.match(/(\d+[\d,]*)\s*(steps|step)/);
  if (stepsMatch) {
    result.steps = parseInt(stepsMatch[1].replace(/,/g, ''), 10);
  }

  const proteinMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?protein/);
  if (proteinMatch) {
    result.proteinEaten = Math.round(parseFloat(proteinMatch[1]));
  }

  const calMatch = lower.match(/(\d+)\s*(?:calories|kcal|cal)/);
  if (calMatch) {
    result.caloriesEaten = parseInt(calMatch[1], 10);
  }

  const waterMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:l|liters?|litres?)\s*(?:of\s*)?water/);
  if (waterMatch) {
    result.water = parseFloat(waterMatch[1]);
  }

  const sleepMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:of\s*)?sleep/);
  if (sleepMatch) {
    result.sleep = parseFloat(sleepMatch[1]);
  }

  const weightMatch = lower.match(/(?:weight|weigh|weighed)\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:kg|kilos?)?/);
  if (weightMatch) {
    result.weight = parseFloat(weightMatch[1]);
  }

  if (lower.includes('chest') || lower.includes('tricep')) {
    result.workout = 'Chest and Triceps';
    result.gym = true;
  } else if (lower.includes('back') || lower.includes('bicep') || lower.includes('lat')) {
    result.workout = 'Back and Biceps';
    result.gym = true;
  } else if (lower.includes('leg') || lower.includes('squat')) {
    result.workout = 'Legs & Lower Body';
    result.gym = true;
  } else if (lower.includes('shoulder')) {
    result.workout = 'Shoulders';
    result.gym = true;
  } else if (lower.includes('rest') || lower.includes('off day') || lower.includes('no gym')) {
    result.workout = 'Nil';
    result.gym = false;
  }

  return result;
}
