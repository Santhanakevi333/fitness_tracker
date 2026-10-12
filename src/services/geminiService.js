// Service for Gemini Multimodal Vision & Voice/Text Parsing with Auto-Discovery & Dynamic Model Switching

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

// Convert File object to Base64
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

// Candidate endpoints to try in order (gemini-2.5-flash is current standard)
const CANDIDATE_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
];

let cachedWorkingEndpoint = null;

// Dynamically discover supported models for the user's API key
async function discoverWorkingEndpoint(apiKey) {
  if (cachedWorkingEndpoint) return cachedWorkingEndpoint;

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const data = await listRes.json();
      const models = data.models || [];
      const generateModels = models
        .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));

      // Preferred order of flash models
      const preferred = [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.5-pro',
        'gemini-1.5-pro'
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
    }
  } catch (e) {
    console.warn('Auto-discovering Gemini models failed, falling back to candidate list:', e);
  }

  return null;
}

// Resilient API executor with automatic model failover & dynamic recommendation extraction
async function executeGeminiRequest(apiKey, requestBody) {
  const discovered = await discoverWorkingEndpoint(apiKey);
  const endpointsToTry = discovered
    ? [discovered, ...CANDIDATE_ENDPOINTS.filter((e) => e !== discovered)]
    : CANDIDATE_ENDPOINTS;

  let lastError = null;

  for (const baseUrl of endpointsToTry) {
    try {
      const url = `${baseUrl}?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const data = await res.json();
        cachedWorkingEndpoint = baseUrl; // Cache the verified working endpoint
        return data;
      }

      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
      lastError = new Error(errMsg);

      // Check if Google returned a direct recommendation: "Please update your code to use models/XXX"
      const recMatch = errMsg.match(/use models\/([a-zA-Z0-9.-]+)/i);
      if (recMatch && recMatch[1]) {
        const recommendedModel = recMatch[1];
        try {
          const recUrl = `https://generativelanguage.googleapis.com/v1beta/models/${recommendedModel}:generateContent?key=${apiKey}`;
          const recRes = await fetch(recUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            cachedWorkingEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${recommendedModel}:generateContent`;
            return recData;
          }
        } catch {
          // continue fallback loop
        }
      }

      // Check for deprecation, not found, or unsupported errors
      const isRecoverableError =
        res.status === 404 ||
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('not supported') ||
        errMsg.toLowerCase().includes('no longer available') ||
        errMsg.toLowerCase().includes('deprecated') ||
        errMsg.toLowerCase().includes('retired');

      if (isRecoverableError) {
        continue; // Try next candidate model
      } else if (res.status === 400 && (errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key in API Setup tab.');
      } else {
        continue;
      }
    } catch (e) {
      lastError = e;
      if (e.message && e.message.includes('Invalid Gemini API Key')) {
        throw e;
      }
    }
  }

  throw lastError || new Error('No compatible Gemini model found. You can use Demo Scan in the meantime.');
}

/**
 * Analyze meal photo using Gemini Vision with automatic model fallback
 */
export async function analyzeMealPhoto({ base64Data, mimeType, apiKey }) {
  const key = apiKey || getStoredApiKey();

  if (!key) {
    // Demo simulation
    await new Promise((r) => setTimeout(r, 1200));
    return {
      isDemo: true,
      mealName: 'Chicken Biryani & Rice Bowl (Demo Scan)',
      foods: [
        { name: 'Chicken Leg & Breast', portion: '200g', calories: 330, protein: 46, carbs: 0, fat: 14, fiber: 0 },
        { name: 'Spiced Biryani Rice', portion: '1.5 cups (220g)', calories: 310, protein: 6, carbs: 62, fat: 4, fiber: 2 },
        { name: 'Cooked Spices & Garnish', portion: '30g', calories: 25, protein: 1, carbs: 4, fat: 0.5, fiber: 1.5 }
      ],
      totalCalories: 665,
      totalProtein: 53,
      totalCarbs: 66,
      totalFat: 18.5,
      totalFiber: 3.5,
      confidence: 'high',
      tips: 'High protein meal with substantial energy from rice! Perfect post-workout meal for muscle synthesis.'
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
 * Parse spoken or typed voice transcript into structured fitness log with fallback
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

  // Steps
  const stepsMatch = lower.match(/(\d+[\d,]*)\s*(steps|step)/);
  if (stepsMatch) {
    result.steps = parseInt(stepsMatch[1].replace(/,/g, ''), 10);
  }

  // Protein
  const proteinMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\s*(?:of\s*)?protein/);
  if (proteinMatch) {
    result.proteinEaten = Math.round(parseFloat(proteinMatch[1]));
  }

  // Calories
  const calMatch = lower.match(/(\d+)\s*(?:calories|kcal|cal)/);
  if (calMatch) {
    result.caloriesEaten = parseInt(calMatch[1], 10);
  }

  // Water
  const waterMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:l|liters?|litres?)\s*(?:of\s*)?water/);
  if (waterMatch) {
    result.water = parseFloat(waterMatch[1]);
  }

  // Sleep
  const sleepMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:of\s*)?sleep/);
  if (sleepMatch) {
    result.sleep = parseFloat(sleepMatch[1]);
  }

  // Weight
  const weightMatch = lower.match(/(?:weight|weigh|weighed)\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:kg|kilos?)?/);
  if (weightMatch) {
    result.weight = parseFloat(weightMatch[1]);
  }

  // Workout / Gym
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
