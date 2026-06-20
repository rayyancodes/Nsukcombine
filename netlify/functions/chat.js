// Netlify serverless function — keeps the Gemini API key secret on the server side.
// The browser never sees this key. It is read from an environment variable
// that you set in the Netlify dashboard (Site settings → Environment variables).

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing GEMINI_API_KEY. Set it in Netlify environment variables.' })
    };
  }

  try {
    const { systemInstruction, contents } = JSON.parse(event.body);

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
