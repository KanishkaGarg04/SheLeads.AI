const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://she-leads-33mq3oine-kanishkagarg04s-projects.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Gemini Setup - Using Lite model to avoid high demand
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite"     // ← Lighter & more available model
});

// Test Route
app.get('/', (req, res) => {
  res.send('✅ SheaLeads AI Backend is running!');
});

// Trending
app.get('/api/trending', (req, res) => {
  res.json([
    { name: "Homemade Pickle", demand: 92 },
    { name: "Papad", demand: 88 },
    { name: "Spice Mix", demand: 85 },
    { name: "Embroidery Blouse", demand: 78 }
  ]);
});

// Tips
app.get('/api/tips', (req, res) => {
  res.json([
    { text: "Clean and attractive packaging can increase your sales significantly." },
    { text: "Always take clear, well-lit photos for better customer attraction." },
    { text: "Hygiene is your biggest selling point." }
  ]);
});

// AI Scan Endpoint
app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'image/jpeg',
      },
    };

    const prompt = `You are an expert business mentor for Indian women micro-entrepreneurs.

Analyze the product photo and return **ONLY** valid JSON:

{
  "productName": "Clear product name",
  "suggestedPrice": number (realistic INR for local market),
  "caption": "Engaging Instagram caption in simple Hindi + English with emojis",
  "packagingTip": "Practical low-cost packaging tip with hygiene focus",
  "greenSuggestion": "One simple eco-friendly or hygienic tip"
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    let jsonStr = responseText.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(jsonStr);

    res.json(aiResult);

  } catch (error) {
    console.error('AI Scan Error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      suggestion: 'The AI is busy. Please try again in a few seconds.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SheaLeads Backend running on http://localhost:${PORT}`);
  console.log('Model: gemini-2.5-flash-lite');
});