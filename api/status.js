// Vercel serverless function for /api/status
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });
config();

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const apiKeyLength = process.env.OPENAI_API_KEY?.length || 0;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  res.json({
    mode: hasApiKey ? 'real-ai' : 'mock',
    model: hasApiKey ? model : null,
    apiKeyConfigured: hasApiKey,
    apiKeyLength: hasApiKey ? apiKeyLength : 0,
    apiKeyPreview: hasApiKey
      ? `${process.env.OPENAI_API_KEY?.substring(0, 7)}...${process.env.OPENAI_API_KEY?.substring(apiKeyLength - 4)}`
      : null,
  });
}

module.exports = handler;

