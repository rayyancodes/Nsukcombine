// Netlify serverless function — keeps the Gemini API key secret on the server side.
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    console.log('ERROR: GEMINI_API_KEY environment variable is missing');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing GEMINI_API_KEY.' }) };
  }

  try {
    const { systemInstruction, contents } = JSON.parse(event.body);

    // Using gemini-1.5-flash — wider free tier availability than 2.0
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

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
    console.log('Gemini status:', response.status);
    console.log('Gemini response:', JSON.stringify(data));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.log('FUNCTION ERROR:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
