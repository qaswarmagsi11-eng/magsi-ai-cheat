import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Wand2,
  FileText,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { STUDIO_GENERATORS } from '../data/generators';
import { StudioGenerator } from '../types';
import { IconResolver } from './IconResolver';

const STYLES = [
  'Photorealistic',
  'Cinematic',
  '3D Render',
  'Anime / Digital Art',
  'Cyberpunk Neon',
  'Watercolor Painting',
  'Minimalist Vector',
  'Vintage Sepia',
];

const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1', desc: 'Avatar / Post' },
  { label: '16:9 Landscape', value: '16:9', desc: 'YouTube / Banner' },
  { label: '9:16 Portrait', value: '9:16', desc: 'Status / Story' },
  { label: '4:3 Standard', value: '4:3', desc: 'Classic' },
];

export const MagsiStudio: React.FC = () => {
  const [selectedGenerator, setSelectedGenerator] = useState<StudioGenerator>(STUDIO_GENERATORS[0]);
  const [prompt, setPrompt] = useState(selectedGenerator.samplePrompts[0]);
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [selectedAspect, setSelectedAspect] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<{
    type: 'image' | 'text';
    content: string;
    prompt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // When changing generator, update default prompt & aspect
  const handleSelectGenerator = (gen: StudioGenerator) => {
    setSelectedGenerator(gen);
    setPrompt(gen.samplePrompts[0]);
    if (gen.defaultAspectRatio) setSelectedAspect(gen.defaultAspectRatio);
    if (gen.defaultStyle) setSelectedStyle(gen.defaultStyle);
    setGeneratedOutput(null);
  };

  // Generate Action
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      if (selectedGenerator.type === 'image') {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            style: selectedStyle,
            aspectRatio: selectedAspect,
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setGeneratedOutput({
            type: 'image',
            content: data.imageUrl,
            prompt,
          });
        }
      } else {
        // Text generator
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', text: `Please generate the following ${selectedGenerator.title} prompt:\n${prompt}` }],
            systemInstruction: `You are MAGSI Studio's specialized creative generator for: ${selectedGenerator.title}. Provide brilliant, polished, ready-to-use output with high stylistic caliber.`,
          }),
        });
        const data = await res.json();
        setGeneratedOutput({
          type: 'text',
          content: data.text || 'Generated content is ready.',
          prompt,
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (generatedOutput?.content) {
      navigator.clipboard.writeText(generatedOutput.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedOutput || generatedOutput.type !== 'image') return;
    const a = document.createElement('a');
    a.href = generatedOutput.content;
    a.download = `MAGSI-Studio-${selectedGenerator.id}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-[#E9EDEF] overflow-hidden select-none">
      {/* Header */}
      <header className="p-4 md:p-6 bg-[#111B21] border-b border-[#202C33] shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white">MAGSI Studio</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30">
                15 AI Generators
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#8696A0] mt-1">
              Create AI images, YouTube thumbnails, stories, screenplays, stickers, posters, and business assets.
            </p>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Selector & Config (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Generator Selection Carousel / Dropdown */}
            <div className="bg-[#111B21] p-4 rounded-2xl border border-[#202C33] space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">
                Choose Creativity Tool
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar p-1">
                {STUDIO_GENERATORS.map((gen) => {
                  const isSelected = selectedGenerator.id === gen.id;
                  return (
                    <button
                      key={gen.id}
                      onClick={() => handleSelectGenerator(gen)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition border text-xs font-medium ${
                        isSelected
                          ? 'bg-[#00A884] text-white border-[#00A884] shadow-sm'
                          : 'bg-[#202C33] text-[#AEBAC1] border-[#2A3942] hover:bg-[#2A3942] hover:text-white'
                      }`}
                    >
                      <IconResolver name={gen.iconName} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{gen.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-[#202C33]/60 border border-[#2A3942] text-xs">
                <p className="font-semibold text-white">{selectedGenerator.title}</p>
                <p className="text-[#8696A0] mt-0.5 leading-relaxed">{selectedGenerator.description}</p>
              </div>
            </div>

            {/* Prompt Formulation */}
            <div className="bg-[#111B21] p-4 rounded-2xl border border-[#202C33] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">
                  Creative Prompt
                </label>
                <button
                  onClick={() => {
                    const samples = selectedGenerator.samplePrompts;
                    const next = samples[(samples.indexOf(prompt) + 1) % samples.length];
                    setPrompt(next);
                  }}
                  className="text-xs text-[#00A884] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Wand2 className="w-3 h-3" /> Sample Prompt
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                rows={3}
                className="w-full bg-[#202C33] border border-[#2A3942] rounded-xl p-3 text-sm text-[#E9EDEF] outline-none focus:border-[#00A884] resize-none placeholder-[#8696A0]"
              />

              {/* Sample Prompt Pills */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#8696A0] block">Inspiration:</span>
                <div className="flex flex-col gap-1">
                  {selectedGenerator.samplePrompts.map((sp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(sp)}
                      className="text-left text-xs text-[#AEBAC1] hover:text-[#00A884] truncate p-1.5 rounded-lg hover:bg-[#202C33] transition"
                    >
                      • {sp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Options if Image Generator */}
            {selectedGenerator.type === 'image' && (
              <div className="bg-[#111B21] p-4 rounded-2xl border border-[#202C33] space-y-3">
                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8696A0] block mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setSelectedAspect(ar.value)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          selectedAspect === ar.value
                            ? 'bg-[#00A884]/20 border-[#00A884] text-[#00A884] font-bold'
                            : 'bg-[#202C33] border-[#2A3942] text-[#AEBAC1] hover:text-white'
                        }`}
                      >
                        <p>{ar.label}</p>
                        <p className="text-[10px] text-[#8696A0]">{ar.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8696A0] block mb-2">
                    Artistic Style
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStyle(st)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                          selectedStyle === st
                            ? 'bg-[#00A884] border-[#00A884] text-white font-semibold'
                            : 'bg-[#202C33] border-[#2A3942] text-[#AEBAC1] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                isGenerating || !prompt.trim()
                  ? 'bg-[#202C33] text-[#8696A0] cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 hover:opacity-95 text-white shadow-emerald-900/40 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Creation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate in MAGSI Studio</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output Showcase & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-1 bg-[#111B21] p-5 rounded-3xl border border-[#202C33] flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#202C33]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Studio Output Canvas
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202C33] text-[#00A884] border border-[#2A3942]">
                      {selectedGenerator.title}
                    </span>
                  </div>

                  {generatedOutput && (
                    <div className="flex items-center gap-2">
                      {generatedOutput.type === 'text' ? (
                        <button
                          onClick={handleCopyText}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#00A884] transition"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleDownloadImage}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#009170] text-xs font-semibold text-white transition shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Image</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Rendering */}
                <div className="mt-5">
                  {isGenerating ? (
                    <div className="py-24 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white animate-pulse shadow-xl shadow-emerald-500/20">
                        <Sparkles className="w-8 h-8 animate-spin" />
                      </div>
                      <p className="font-bold text-white text-base">
                        Generating with MAGSI AI Creative Engine...
                      </p>
                      <p className="text-xs text-[#8696A0] max-w-sm mx-auto">
                        Applying style enhancements, compositional alignment, and high-resolution rendering.
                      </p>
                    </div>
                  ) : generatedOutput ? (
                    generatedOutput.type === 'image' ? (
                      <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden border border-[#2A3942] bg-black/40 shadow-2xl flex items-center justify-center">
                          <img
                            src={generatedOutput.content}
                            alt="MAGSI Output"
                            className="max-h-[500px] w-auto object-contain rounded-2xl"
                          />
                        </div>
                        <p className="text-xs text-[#8696A0] italic">
                          Prompt: "{generatedOutput.prompt}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#182229] border border-[#26353E] text-sm leading-relaxed whitespace-pre-wrap max-h-[520px] overflow-y-auto">
                        {generatedOutput.content}
                      </div>
                    )
                  ) : (
                    <div className="py-24 text-center space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#202C33] flex items-center justify-center text-[#8696A0]">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-white text-base">Studio Canvas Empty</p>
                      <p className="text-xs text-[#8696A0] max-w-xs mx-auto">
                        Select a creativity generator on the left, formulate your prompt, and tap Generate.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-[#202C33] flex items-center justify-between text-[11px] text-[#8696A0]">
                <span>Aspect ratio: {selectedAspect} • Style: {selectedStyle}</span>
                <span>Supports PNG Download & Copy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
