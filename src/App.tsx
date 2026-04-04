/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Upload, 
  Image as ImageIcon, 
  Search, 
  Heart, 
  MessageCircle, 
  Lightbulb, 
  Loader2,
  X,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  PenTool,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ANALYSIS_INSTRUCTION = `Görsel analiz ve değerler eğitimi uzmanısın. Görseli şu 10 kök değer (Adalet, Dostluk, Dürüstlük, Öz Denetim, Sabır, Saygı, Sevgi, Sorumluluk, Vatanseverlik, Yardımseverlik) üzerinden analiz et:
1. GÖRSEL ÖZETİ: Karakterleri ve olayı kısaca anlat.
2. DEĞER TESPİTİ: Hangi değerlerin olduğunu veya eksik olduğunu belirt.
3. GERİ BİLDİRİM: Değerin önemini veya eksikliğinin etkisini kısa ve net açıkla.
4. SORU: Düşündürücü bir soru sor.
Dilin samimi, net ve kısa olsun. Markdown kullan.`;

const DRAWING_ADVICE_INSTRUCTION = `Değerler eğitimi rehberisin. Seçilen değerlere uygun kısa bir karikatür fikri ver:
1. SENARYO: Karakterler ve olay ne olsun?
2. MESAJ: Hangi mesaj verilmeli?
3. İPUCU: Çizim için küçük bir tavsiye.
Samimi, yaratıcı ve çok kısa yaz. Markdown kullan.`;

const ROOT_VALUES = [
  "Adalet", "Dostluk", "Dürüstlük", "Öz Denetim", "Sabır", 
  "Saygı", "Sevgi", "Sorumluluk", "Vatanseverlik", "Yardımseverlik"
];

export default function App() {
  // Left Side States
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Right Side States
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [drawingAdvice, setDrawingAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis(null);
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleValue = (val: string) => {
    setSelectedValues(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "Bu görseli 10 kök değer çerçevesinde kısaca analiz et." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ]
        },
        config: { systemInstruction: ANALYSIS_INSTRUCTION }
      });
      setAnalysis(response.text || "Analiz yapılamadı.");
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setAnalysisError(err.message || "Bir hata oluştu. API anahtarınızı kontrol edin.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const generateDrawingAdvice = async () => {
    if (selectedValues.length === 0) return;
    setIsAdviceLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Değerler: ${selectedValues.join(', ')}. Kısa bir çizim fikri ver.`,
        config: { systemInstruction: DRAWING_ADVICE_INSTRUCTION }
      });
      setDrawingAdvice(response.text || "Tavsiye oluşturulamadı.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdviceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#4A4A4A] font-sans selection:bg-orange-100">
      <header className="bg-white border-b border-orange-100 py-6 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Sparkles className="text-orange-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Değerler Atölyesi
              </h1>
              <p className="text-sm text-gray-500 font-medium">Analiz ve Çizim Rehberi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-0 bg-white rounded-[40px] shadow-2xl border border-orange-100 overflow-hidden min-h-[600px]">
          
          {/* LEFT SIDE: ANALYSIS */}
          <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-orange-100 p-2.5 rounded-2xl">
                <Search className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Görsel Analizi</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Uzman Yorumu</p>
              </div>
            </div>

            <div className="flex-grow space-y-6">
              {!image ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[300px]">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} id="analysis-upload" />
                  <label htmlFor="analysis-upload" className="flex flex-col items-center justify-center w-full h-full border-3 border-dashed border-orange-100 rounded-[32px] bg-orange-50/30 hover:bg-orange-50 transition-all cursor-pointer group">
                    <Upload className="w-12 h-12 text-orange-300 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-600 font-bold text-center px-4">Analiz için görsel yükle</p>
                  </label>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group rounded-3xl overflow-hidden border-4 border-orange-50 shadow-inner">
                    <button onClick={clearImage} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10">
                      <X className="w-4 h-4" />
                    </button>
                    <img src={image} alt="Preview" className="w-full h-auto max-h-[300px] object-contain bg-gray-50" />
                  </div>
                  
                  {!analysis && !isAnalysisLoading && (
                    <button onClick={analyzeImage} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" />
                      Analiz Et
                    </button>
                  )}

                  <AnimatePresence mode="wait">
                    {isAnalysisLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                        <p className="text-orange-600 font-medium">İnceleniyor...</p>
                      </motion.div>
                    )}
                    {analysis && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 prose prose-orange prose-sm max-w-none">
                        <Markdown>{analysis}</Markdown>
                      </motion.div>
                    )}
                    {analysisError && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center border border-red-100">
                        {analysisError}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="hidden lg:block w-px bg-orange-100 self-stretch my-10" />

          {/* RIGHT SIDE: DRAWING ADVICE */}
          <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col bg-blue-50/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-100 p-2.5 rounded-2xl">
                <PenTool className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Çizim Fikri Al</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kendi Karikatürün</p>
              </div>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <Info className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Değerleri Seç</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ROOT_VALUES.map((val) => (
                    <button
                      key={val}
                      onClick={() => toggleValue(val)}
                      className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${
                        selectedValues.includes(val)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-blue-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedValues.includes(val) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                      }`}>
                        {selectedValues.includes(val) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] font-bold">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateDrawingAdvice}
                disabled={selectedValues.length === 0 || isAdviceLoading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  selectedValues.length === 0 || isAdviceLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                }`}
              >
                {isAdviceLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Fikir Oluştur
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <AnimatePresence mode="wait">
                {drawingAdvice && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm prose prose-blue prose-sm max-w-none">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 border-b border-blue-50 pb-2">
                      <Lightbulb className="w-5 h-5" />
                      <span className="font-bold">Senaryo Önerisi</span>
                    </div>
                    <Markdown>{drawingAdvice}</Markdown>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="text-gray-400 text-xs font-medium">
          Değerler Atölyesi &copy; 2026
        </p>
      </footer>
    </div>
  );
}
