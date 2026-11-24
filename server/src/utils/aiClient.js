const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// shortcut: free OpenRouter models share a rate-limited pool and 429 often; fall back across a few.
// Upgrade: switch to a paid/BYOK model once traffic justifies it.
const FALLBACK_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3.5-lightning:free',
  'liquid/lfm-3-1.7b:free',
];

async function callOpenRouter(apiKey, model, message) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful customer support assistant. Keep answers concise.' },
          { role: 'user', content: message },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('OpenRouter error: request timed out');
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

export async function getAiReply(message) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return "AI is not configured yet (missing OPENROUTER_API_KEY). Please add your key to continue.";
  }

  const models = [process.env.OPENROUTER_MODEL, ...FALLBACK_MODELS].filter(Boolean);
  const tried = new Set();
  let lastError;

  for (const model of models) {
    if (tried.has(model)) continue;
    tried.add(model);
    try {
      return await callOpenRouter(apiKey, model, message);
    } catch (err) {
      lastError = err;
      if (!/OpenRouter error 429/.test(err.message)) throw err;
    }
  }

  throw lastError;
}
