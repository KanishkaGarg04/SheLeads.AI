'use client';

import { useState } from 'react';
import axios from 'axios';
import { Camera, Play, TrendingUp, User } from 'lucide-react';
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
  const [tip, setTip] = useState("आज का टिप: अपने प्रोडक्ट की पैकिंग में लोकल सामग्री इस्तेमाल करें, इससे लागत कम और पर्यावरण अनुकूल रहेगा!");

  // Mock demand data for Dashboard
  const demandData = {
    labels: ['Achar', 'Saree', 'Papad', 'Handicraft', 'Spices'],
    datasets: [{
      label: 'Trending Demand (Last 7 days)',
      data: [85, 65, 92, 45, 78],
      backgroundColor: '#10b981',
    }]
  };

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
      const res = await axios.post('http://localhost:5000/api/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiResult(res.data);
    } catch (err) {
      alert('Error connecting to backend. Make sure backend is running!');
      console.error(err);
    }
    setLoading(false);
  };

  const playVoiceTip = () => {
    // Simple browser TTS (Hindi support is good in Chrome)
    const utterance = new SpeechSynthesisUtterance(tip);
    utterance.lang = 'hi-IN';
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">🌿</div>
            <h1 className="text-2xl font-bold">SheaLeads AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <span>नमस्ते, Kanishka!</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="flex border-b mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'scanner', label: 'Scanner', icon: Camera },
            { id: 'mentor', label: 'Voice Mentor', icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-all ${activeTab === tab.id
                  ? 'border-b-4 border-emerald-600 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">आज का डैशबोर्ड</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">Suggested Price Range: ₹80 - ₹250</div>
              <div className="bg-white p-6 rounded-2xl shadow">Today's Tip: Use reusable cloth bags</div>
              <div className="bg-white p-6 rounded-2xl shadow">Trending: Achar & Papad</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-medium mb-4">Demand Trends (Mock Data)</h3>
              <Bar data={demandData} options={{ responsive: true }} />
            </div>
          </div>
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Product Scanner</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center bg-white">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                <p className="text-lg font-medium">Tap to upload product photo</p>
                <p className="text-sm text-gray-500 mt-2">Supported: JPG, PNG (Max 5MB)</p>
              </label>
            </div>

            {selectedImage && (
              <div className="mt-6">
                <img src={selectedImage} alt="preview" className="rounded-2xl mx-auto max-h-80 object-contain" />
              </div>
            )}

            {loading && <p className="text-center mt-6 text-emerald-600">AI is analyzing your product...</p>}

            {aiResult && (
              <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6">AI Business Game Plan</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="text-2xl font-semibold">{aiResult.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Suggested Selling Price</p>
                    <p className="text-4xl font-bold text-emerald-600">₹{aiResult.suggestedPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instagram Caption</p>
                    <p className="bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">{aiResult.caption}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Packaging Tip</p>
                    <p className="italic">{aiResult.packagingTip}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Green Suggestion</p>
                    <p className="text-emerald-700">{aiResult.greenSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mentor Tab */}
        {activeTab === 'mentor' && (
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8">Your Daily Voice Mentor</h2>
            <div className="bg-emerald-50 rounded-3xl p-12">
              <button
                onClick={playVoiceTip}
                className="w-24 h-24 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all active:scale-95"
              >
                <Play className="w-12 h-12" />
              </button>
              <p className="mt-8 text-lg leading-relaxed text-gray-700">{tip}</p>
              <p className="text-xs text-gray-500 mt-10">Voice in Hindi (Browser TTS)</p>
            </div>

            <p className="mt-12 text-sm text-gray-500">
              Tip changes daily. In future versions we will use real TTS API + regional languages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}