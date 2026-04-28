'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Play, TrendingUp, Leaf, User, Heart, Upload, BarChart3 } from 'lucide-react';
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
        setTrending([
          { name: "घर का अचार", demand: 92 },
          { name: "पापड़", demand: 88 },
          { name: "मसाले मिक्स", demand: 85 },
          { name: "हैंड ब्लाउज", demand: 79 },
          { name: "हैंडमेड साबुन", demand: 82 },
          { name: "मोमबत्ती", demand: 76 },
          { name: "हैंडीक्राफ्ट", demand: 71 },
          { name: "अचार का सेट", demand: 89 },
        ]);
        setTips([
          { text: "साफ और आकर्षक पैकिंग से आपकी बिक्री कई गुना बढ़ सकती है।" },
          { text: "क्लियर और ब्राइट फोटो ग्राहकों को सबसे ज्यादा आकर्षित करती है।" },
          { text: "हाइजीन बनाए रखना आपके बिजनेस का सबसे बड़ा सेलिंग पॉइंट है।" },
          { text: "छोटे पैकेट में प्रोडक्ट बेचने से ज्यादा ग्राहक आते हैं।" },
          { text: "रीयूजेबल कपड़े की थैलियों का इस्तेमाल करें।" },
          { text: "लोकल WhatsApp ग्रुप में नियमित पोस्ट करें।" },
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
        timeout: 45000,
      });
      setAiResult(res.data);
    } catch (err) {
      alert('AI प्रोसेसिंग में समस्या हुई। कृपया दोबारा कोशिश करें।');
    }
    setLoading(false);
  };

  const playVoiceTip = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.92;
      speechSynthesis.speak(utterance);
    } else {
      alert('Chrome ब्राउज़र में वॉइस बेहतर काम करती है।');
    }
  };

  const demandData = {
    labels: trending.map(t => t.name.length > 12 ? t.name.substring(0,12)+'..' : t.name),
    datasets: [{
      label: 'डिमांड स्कोर',
      data: trending.map(t => t.demand),
      backgroundColor: ['#ec4899', '#a855f7', '#f43f5e', '#eab308', '#22c55e', '#06b6d4', '#f97316', '#8b5cf6'],
      borderColor: '#fff',
      borderWidth: 2,
      borderRadius: 12,
      barThickness: 45,
    }]
  };

  const navItems = [
    { id: 'dashboard', label: 'डैशबोर्ड', icon: BarChart3 },
    { id: 'scanner', label: 'प्रोडक्ट स्कैनर', icon: Camera },
    { id: 'mentor', label: 'वॉइस मेंटर', icon: Play },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg">
            🌸
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              शी लीड्स AI
            </h1>
            <p className="text-sm text-pink-600">उद्यमियों का AI साथी</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-pink-100 text-pink-700 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-6 h-6" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">नमस्ते, कनिष्का जी 👋</h2>
            <p className="text-gray-600">आज आपके क्षेत्र में कई अच्छे अवसर हैं</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 text-pink-700 px-6 py-2.5 rounded-full text-sm font-medium">
              भिलाई, छत्तीसगढ़
            </div>
          </div>
        </header>

        <div className="p-10">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { title: "ट्रेंडिंग प्रोडक्ट्स", value: "8", icon: "🔥" },
              { title: "संभावित मुनाफा", value: "₹12,450", icon: "💰" },
              { title: "AI सुझाव", value: "6", icon: "✨" },
              { title: "डिमांड ग्रोथ", value: "+24%", icon: "📈" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow hover:shadow-xl transition-all">
                <div className="text-4xl mb-3">{kpi.icon}</div>
                <div className="text-4xl font-bold text-gray-900">{kpi.value}</div>
                <p className="text-gray-600 mt-1">{kpi.title}</p>
              </div>
            ))}
          </div>

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="bg-white rounded-3xl p-10 shadow-xl">
                <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                  <TrendingUp className="text-pink-600" /> ट्रेंडिंग प्रोडक्ट्स
                </h3>
                <div className="h-[460px]">
                  <Bar data={demandData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, max: 100, grid: { color: '#f3e8ff' } },
                      x: { grid: { color: '#f3e8ff' }, ticks: { font: { size: 14 } } }
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* SCANNER */}
          {activeTab === 'scanner' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-10">प्रोडक्ट स्कैनर</h2>

              <div className="bg-white border-2 border-dashed border-pink-400 rounded-3xl p-20 text-center hover:border-pink-600 transition">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload" />
                <label htmlFor="upload" className="cursor-pointer">
                  <Upload className="w-28 h-28 mx-auto text-pink-500 mb-6" />
                  <p className="text-3xl font-bold text-gray-800">फोटो अपलोड करें</p>
                  <p className="text-gray-600 mt-3">अपनी प्रोडक्ट की साफ फोटो चुनें</p>
                </label>
              </div>

              {selectedImage && (
                <div className="mt-12 flex justify-center">
                  <img src={selectedImage} className="rounded-3xl shadow-2xl max-h-96" alt="preview" />
                </div>
              )}

              {loading && <p className="text-center mt-16 text-2xl text-pink-600">AI बिजनेस प्लान तैयार कर रहा है...</p>}

              {aiResult && (
                <div className="mt-16 space-y-8">
                  <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-10">
                    <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                      <Heart className="text-pink-500" /> आपका AI बिजनेस प्लान
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/10 p-6 rounded-2xl">
                        <p className="text-pink-400">प्रोडक्ट</p>
                        <p className="text-2xl font-bold mt-2">{aiResult.productName}</p>
                      </div>
                      <div className="bg-white/10 p-6 rounded-2xl">
                        <p className="text-pink-400">मूल्य</p>
                        <p className="text-5xl font-bold text-emerald-400">₹{aiResult.suggestedPrice}</p>
                      </div>
                    </div>

                    <div className="mt-8 bg-white/10 p-8 rounded-2xl">
                      <p className="text-pink-400 mb-3">Instagram कैप्शन</p>
                      <p className="text-lg">{aiResult.caption}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-white/10 p-6 rounded-2xl">
                        <p className="text-pink-400">पैकेजिंग</p>
                        <p className="mt-3">{aiResult.packagingTip}</p>
                      </div>
                      <div className="bg-white/10 p-6 rounded-2xl">
                        <p className="text-pink-400">ग्रीन सुझाव</p>
                        <p className="mt-3 text-emerald-400">{aiResult.greenSuggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VOICE MENTOR */}
          {activeTab === 'mentor' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">वॉइस मेंटर</h2>
              <p className="text-center text-gray-600 mb-12">हर दिन नई बिजनेस टिप हिंदी में सुनें</p>

              <div className="bg-gradient-to-br from-purple-950 to-pink-950 text-white rounded-3xl p-16 shadow-2xl">
                <button
                  onClick={() => playVoiceTip(tips[currentTipIndex]?.text || "")}
                  className="w-40 h-40 mx-auto bg-white text-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl"
                >
                  <Play className="w-24 h-24" />
                </button>

                <div className="mt-16 text-2xl leading-relaxed min-h-[160px] px-8">
                  "{tips[currentTipIndex]?.text || "टिप लोड हो रही है..."}"
                </div>

                <div className="flex justify-center gap-8 mt-16">
                  <button 
                    onClick={() => setCurrentTipIndex((p) => (p - 1 + tips.length) % tips.length)}
                    className="px-10 py-4 bg-white/20 hover:bg-white/30 rounded-full text-lg transition"
                  >
                    पिछली टिप
                  </button>
                  <button 
                    onClick={() => setCurrentTipIndex((p) => (p + 1) % tips.length)}
                    className="px-10 py-4 bg-white/20 hover:bg-white/30 rounded-full text-lg transition"
                  >
                    अगली टिप
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}