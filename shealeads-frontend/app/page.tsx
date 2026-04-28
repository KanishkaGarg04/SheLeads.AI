'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Play, TrendingUp, Leaf, User, Heart } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SheaLeads() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'mentor'>('dashboard');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<any[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [trending, setTrending] = useState<any[]>([]);

  const API_BASE = 'http://localhost:5000';

  // Fetch data with better error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, tipRes] = await Promise.all([
          axios.get(`${API_BASE}/api/trending`),
          axios.get(`${API_BASE}/api/tips`)
        ]);
        setTrending(trendRes.data || []);
        setTips(tipRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Beautiful fallback
        setTrending([
          { name: "Homemade Pickle", demand: 92 },
          { name: "Papad", demand: 88 },
          { name: "Spice Mix", demand: 85 },
          { name: "Embroidery Blouse", demand: 78 },
        ]);
        setTips([
          { text: "Clean and attractive packaging can increase your sales significantly." },
          { text: "Always take clear, well-lit photos for better customer attraction." },
        ]);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE}/api/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setAiResult(res.data);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.error || err.message || "Something went wrong";
      alert(`Error: ${message}\n\nMake sure backend is running on http://localhost:5000`);
    }
    setLoading(false);
  };

  const playVoiceTip = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      speechSynthesis.speak(utterance);
    } else {
      alert("Please use Chrome browser for voice support.");
    }
  };

  // Clean & Beautiful Chart Data
  const demandData = {
    labels: trending.map(t => t.name.length > 15 ? t.name.substring(0, 15) + '..' : t.name),
    datasets: [{
      label: 'Demand Score',
      data: trending.map(t => t.demand || 80),
      backgroundColor: '#f472b6',
      borderColor: '#db2777',
      borderWidth: 2,
      borderRadius: 12,
      barThickness: 45,
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 font-sans">
      {/* Soft Elegant Header */}
      <header className="bg-white shadow-sm border-b border-pink-100 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-4xl shadow-md">
              🌸
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 tracking-tight">SheaLeads AI</h1>
              <p className="text-pink-600 text-sm">Your Smart Micro-Business Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-pink-50 px-5 py-2.5 rounded-full">
            <User className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-gray-700">Hello, Kanishka</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex border-b border-pink-100">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'scanner', label: 'Product Scanner', icon: Camera },
            { id: 'mentor', label: 'Voice Mentor', icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-5 flex items-center justify-center gap-3 text-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-4 border-pink-500 text-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ==================== DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="mt-12 space-y-10">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Today's Dashboard</h2>
              <p className="text-gray-600">Trending products in your area</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
              <h3 className="font-semibold mb-6 flex items-center gap-3 text-xl text-gray-800">
                <TrendingUp className="text-pink-500" /> Demand Trends
              </h3>
              <div className="h-80">
                <Bar 
                  data={demandData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, max: 100, grid: { color: '#fce7f3' } },
                      x: { grid: { color: '#fce7f3' } }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                <h3 className="font-medium text-xl mb-4 flex items-center gap-3 text-gray-800">
                  <Leaf className="text-emerald-500" /> Green Tip
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Use reusable cloth bags for packaging. It's eco-friendly and makes your product look more premium.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                <h3 className="font-medium text-xl mb-4 text-gray-800">Suggested Price Range</h3>
                <p className="text-5xl font-bold text-pink-600">₹50 – ₹800</p>
                <p className="text-gray-500 mt-3">AI will give exact pricing for your product</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SCANNER ==================== */}
        {activeTab === 'scanner' && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-800 mb-3">Product Scanner</h2>
              <p className="text-gray-600">Upload a photo of your product and get a complete business plan</p>
            </div>

            <div className="bg-white border-2 border-dashed border-pink-300 rounded-3xl p-20 text-center hover:border-pink-400 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="upload"
              />
              <label htmlFor="upload" className="cursor-pointer block">
                <Camera className="w-24 h-24 mx-auto text-pink-500 mb-8" />
                <p className="text-2xl font-medium text-gray-700 mb-2">Upload Product Photo</p>
                <p className="text-gray-500">Clear photo • Good lighting • Plain background</p>
              </label>
            </div>

            {selectedImage && (
              <div className="mt-10 flex justify-center">
                <img 
                  src={selectedImage} 
                  alt="preview" 
                  className="rounded-3xl max-h-96 shadow-lg border border-pink-100" 
                />
              </div>
            )}

            {loading && (
              <p className="text-center mt-12 text-xl text-pink-600 font-medium">
                AI is creating your business plan...
              </p>
            )}

            {aiResult && (
              <div className="mt-12 bg-white rounded-3xl p-10 shadow-lg border border-pink-100">
                <div className="flex items-center gap-3 mb-8">
                  <Heart className="text-pink-500" />
                  <h3 className="text-3xl font-bold text-gray-800">Your AI Business Plan</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Product Name</p>
                    <p className="text-2xl font-semibold text-gray-800">{aiResult.productName}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-1">Suggested Selling Price</p>
                    <p className="text-6xl font-bold text-pink-600">₹{aiResult.suggestedPrice}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Instagram Caption</p>
                    <div className="bg-pink-50 p-6 rounded-2xl text-lg leading-relaxed border-l-4 border-pink-500">
                      {aiResult.caption}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Packaging Suggestion</p>
                    <p className="text-gray-700 italic">{aiResult.packagingTip}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-emerald-500" /> Eco-Friendly Tip
                    </p>
                    <p className="text-emerald-600 font-medium">{aiResult.greenSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== VOICE MENTOR ==================== */}
        {activeTab === 'mentor' && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Your Daily Voice Mentor</h2>
            <p className="text-gray-600 mb-12">Listen to practical business tips in Hindi</p>

            {tips.length > 0 && (
              <div className="bg-white rounded-3xl p-16 shadow-lg border border-pink-100">
                <button
                  onClick={() => playVoiceTip(tips[currentTipIndex].text)}
                  className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-xl"
                >
                  <Play className="w-16 h-16" />
                </button>

                <div className="mt-12 min-h-[140px] text-xl leading-relaxed text-gray-700 px-6">
                  "{tips[currentTipIndex].text}"
                </div>

                <div className="flex justify-center gap-6 mt-14">
                  <button 
                    onClick={() => setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)}
                    className="px-8 py-3 border border-pink-200 rounded-full text-sm hover:bg-pink-50 transition"
                  >
                    Previous Tip
                  </button>
                  <button 
                    onClick={() => setCurrentTipIndex((prev) => (prev + 1) % tips.length)}
                    className="px-8 py-3 border border-pink-200 rounded-full text-sm hover:bg-pink-50 transition"
                  >
                    Next Tip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}