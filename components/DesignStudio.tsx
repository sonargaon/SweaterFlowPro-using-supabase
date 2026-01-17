
import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Sparkles, Loader2, Download, RefreshCw, Palette, Layers, Box } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const DesignStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [styleType, setStyleType] = useState('Cable Knit');

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `A high-quality product catalog photo of a ${styleType} sweater, ${prompt}. Flat lay, professional lighting, manufacturing sample style.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error("Design generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const stylePresets = ['Cable Knit', 'Ribbed Finish', 'Fair Isle Pattern', 'Argyle Print', 'Jacquard Weave', 'Waffle Knit'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="absolute right-0 top-0 p-8 opacity-5"><Wand2 size={200} /></div>
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><Sparkles size={24} /></div>
            <h2 className="text-3xl font-black uppercase tracking-tight">AI Design Studio</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Visualize style iterations and custom buyer requirements instantly. 
            Generate manufacturing previews for R&D and Sales approval.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {stylePresets.map(s => (
              <button 
                key={s} 
                onClick={() => setStyleType(s)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${styleType === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative group">
            <input 
              type="text"
              placeholder="Describe sweater details (e.g. olive green with wooden buttons)..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <><RefreshCw size={14} /> Render Design</>}
            </button>
          </div>
        </div>

        <div className="w-full md:w-80 h-80 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative flex items-center justify-center shadow-inner group">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="AI Design" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a href={generatedImage} download="sweater-design.png" className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform"><Download size={20}/></a>
                <button onClick={() => setGeneratedImage(null)} className="p-3 bg-rose-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><RefreshCw size={20}/></button>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <ImageIcon size={32} className="text-slate-700" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Canvas Ready</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Palette size={20}/></div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Dyeing Precision</h4>
              <p className="text-sm font-bold text-slate-800">Visual Color Matching</p>
              <p className="text-xs text-slate-500 mt-1">Sync visual previews with your master color database.</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Layers size={20}/></div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Knit Texture</h4>
              <p className="text-sm font-bold text-slate-800">Gage Visualization</p>
              <p className="text-xs text-slate-500 mt-1">Simulate knitting patterns before machine programming.</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Box size={20}/></div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Sales Approval</h4>
              <p className="text-sm font-bold text-slate-800">Rapid Prototyping</p>
              <p className="text-xs text-slate-500 mt-1">Reduce sampling costs by getting digital sign-off.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
