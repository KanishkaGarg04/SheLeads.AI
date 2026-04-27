const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer for image upload (store in memory for Gemini)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Basic schemas (Phase 1)
const userSchema = new mongoose.Schema({
  name: String,
  phone: String, // Common for Indian users
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  productName: String,
  suggestedPrice: Number,
  caption: String,
  packagingTip: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Test route
app.get('/', (req, res) => {
  res.send('SheaLeads AI Backend is running! 🚀');
});

// Phase 2: AI Product Scan Endpoint
app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const imageBuffer = req.file.buffer;
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `You are an expert business mentor for women micro-entrepreneurs in India (tailoring, food, handicrafts, etc.).
Analyze this product photo and respond in JSON format only:

{
  "productName": "Clear name in English and Hindi if possible",
  "suggestedPrice": number (in INR, realistic for local Indian market like street or small shop),
  "caption": "Engaging Instagram caption in simple Hindi + English mix, with emojis, suitable for rural/semi-urban women sellers",
  "packagingTip": "Practical, low-cost packaging idea using local materials, focus on hygiene and eco-friendly",
  "greenSuggestion": "One simple eco-friendly or hygienic improvement tip"
}

Keep suggestions practical for small-scale sellers in India.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean and parse JSON (Gemini sometimes adds extra text)
    let jsonStr = responseText.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(jsonStr);

    // Save to DB (optional for PoC)
    // const newProduct = new Product(aiResult);
    // await newProduct.save();

    res.json(aiResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI processing failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});