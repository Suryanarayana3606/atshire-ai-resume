import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, FileText, ChevronRight, Wand2, ArrowLeft, CheckCircle2, Lightbulb, Zap, Rocket } from 'lucide-react';
import { ResumeData } from '../types';
import { ai, MODELS } from '../lib/gemini';

interface AISuggestionsProps {
  resumes: ResumeData[];
  onBack: () => void;
}

export default function AISuggestions({ resumes, onBack }: AISuggestionsProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  const getSuggestions = async () => {
    if (!selectedResume) return;

    setLoading(true);
    setError(null);
    try {
      const prompt = `
        Analyze the following resume content and provide highly specific, actionable suggestions for improvement to increase ATS (Applicant Tracking System) score and professional impact.
        
        Return ONLY a JSON object with the following structure:
        {
          "overallStrategy": "One paragraph of high-level strategy",
          "enhancements": [
            { "category": "Summary", "current": "text from resume", "suggestion": "improved professional version", "impact": "Why this is better" },
            { "category": "Experience", "current": "a specific weak bullet point", "suggestion": "stronger bullet point with metrics", "impact": "Why this is better" },
            { "category": "Skills", "current": "existing skills list", "suggestion": "optimized skills keywords", "impact": "Why this is better" }
          ],
          "formattingTips": ["tip 1", "tip 2"],
          "estimatedScoreIncrease": 15
        }

        Resume Content:
        ${selectedResume.textContent}
      `;

      const aiResult = await ai.chat.completions.create({
        model: MODELS.pro,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      let jsonText =
        aiResult.choices[0].message.content?.trim() || "";

      jsonText = jsonText.replace(/```json\n?|\n?```/g, "").trim();
      setSuggestions(JSON.parse(jsonText));
    } catch (err: any) {
      console.error("Suggestions Error:", err);
      setError(
        "AI service temporarily unavailable. Please retry in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-10 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-500 hover:text-brand-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-100">
           <Sparkles className="w-4 h-4 text-brand-600" />
           <span className="text-sm font-bold text-brand-700 uppercase tracking-wider">AI Assistant Activated</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-display font-bold text-xl mb-6">Select a Resume</h3>
            <div className="space-y-3">
              {resumes.map(resume => (
                <button
                  key={resume.id}
                  onClick={() => {
                    setSelectedResumeId(resume.id);
                    setSuggestions(null);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 ${
                    selectedResumeId === resume.id 
                      ? 'border-brand-600 bg-brand-50' 
                      : 'border-gray-50 hover:border-brand-200 bg-gray-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    selectedResumeId === resume.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-gray-900 text-sm truncate">{resume.parsedData.name}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 truncate">{resume.title}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              disabled={loading || !selectedResumeId}
              onClick={getSuggestions}
              className="mt-8 w-full py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              <span>Generate Suggestions</span>
            </button>
          </div>

          <div className="bg-brand-900 rounded-[2rem] p-8 text-white">
            <h4 className="font-display font-bold text-lg mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-brand-300" />
              <span>How it works</span>
            </h4>
            <p className="text-brand-100 text-sm leading-relaxed mb-4">
              Our AI analyzes your content against thousands of high-performing resumes in your industry.
            </p>
            <ul className="space-y-3 text-xs text-brand-200 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Keyword optimization for ATS</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Impact & metrics analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Formatting best practices</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!suggestions && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[2rem] border border-gray-100 border-dashed p-20 text-center"
              >
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-2xl text-gray-900 mb-2">Ready to improve?</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Select a resume and click the button to get personalized AI suggestions.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-8"
                  >
                    <Sparkles className="w-8 h-8 text-brand-600" />
                  </motion.div>
                  <h3 className="font-display font-bold text-2xl text-gray-900 mb-2">Analyzing your expertise...</h3>
                  <p className="text-gray-500">Gemini is finding ways to make your profile stand out.</p>
                </div>
              </motion.div>
            )}

            {suggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-100">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                      <h3 className="font-display font-bold text-3xl mb-2">Optimization Strategy</h3>
                      <p className="text-brand-100 leading-relaxed max-w-xl">{suggestions.overallStrategy}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/20 min-w-[160px]">
                       <div className="text-4xl font-display font-bold text-white mb-1">+{suggestions.estimatedScoreIncrease}%</div>
                       <div className="text-[10px] uppercase font-bold tracking-widest text-brand-100">Est. Score Boost</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <h4 className="font-display font-bold text-2xl text-gray-900 mb-2 px-2">Key Enhancements</h4>
                  {suggestions.enhancements.map((item: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                         <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{item.category}</span>
                         <div className="flex items-center space-x-1 text-green-600 text-[10px] font-bold">
                            <Rocket className="w-3 h-3" />
                            <span>ENHANCED IMPACT</span>
                         </div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Current Version</p>
                            <p className="text-sm text-gray-500 italic">"{item.current}"</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-brand-600">Suggested Improvement</p>
                            <p className="text-sm text-gray-900 font-bold bg-brand-50/50 p-3 rounded-xl border border-brand-100">"{item.suggestion}"</p>
                            <p className="text-xs text-brand-700 font-medium flex items-start space-x-2 pt-2">
                               <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                               <span>{item.impact}</span>
                            </p>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100">
                   <h4 className="font-display font-bold text-2xl text-gray-900 mb-6">Expert Formatting Tips</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestions.formattingTips.map((tip: string, i: number) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="bg-brand-600 w-2 h-2 rounded-full shrink-0" />
                           <span className="text-sm font-semibold text-gray-700">{tip}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
