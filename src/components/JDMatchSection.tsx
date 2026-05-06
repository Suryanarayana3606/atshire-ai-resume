import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, FileText, ChevronRight, CheckCircle2, AlertCircle, Wand2, Sparkles, Layout } from 'lucide-react';
import { ResumeData, JobDescription, JobMatchResult, OperationType } from '../types';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/utils';
import { ai, MODELS } from '../lib/gemini';

interface JDMatchSectionProps {
  resumes: ResumeData[];
  jds: JobDescription[];
  onComplete: () => void;
}

export default function JDMatchSection({ resumes, jds, onComplete }: JDMatchSectionProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jdText, setJdText] = useState<string>('');
  const [jdTitle, setJdTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!selectedResumeId || !jdText || !jdTitle || !auth.currentUser) return;

    setLoading(true);
    setError(null);

    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (!selectedResume) return;

    try {
      const prompt = `
        Compare the following Resume and Job Description.
        Return ONLY a JSON object with:
        - matchScore (integer 0-100)
        - missingKeywords (array of strings)
        - suggestions (array of strings)
        - breakdown (object with scores for skills, experience, and education)

        Resume:
        ${selectedResume.textContent}

        Job Description:
        ${jdText}
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

      jsonText = jsonText
        .replace(/```json\n?|\n?```/g, "")
        .trim();

      const matchData = JSON.parse(jsonText);
      
      // Save JD
      const jdDoc = await addDoc(collection(db, 'jobDescriptions'), {
        userId: auth.currentUser.uid,
        title: jdTitle,
        content: jdText,
        extractedKeywords: matchData.missingKeywords, 
        createdAt: new Date().toISOString()
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'jobDescriptions'));

      if (!jdDoc) throw new Error('Failed to save job description to Firestore');

      // Save Match Result
      const saveMatchData = {
        resumeId: selectedResumeId,
        jdId: jdDoc.id,
        ...matchData,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'jobMatches'), saveMatchData).catch(err => handleFirestoreError(err, OperationType.WRITE, 'jobMatches'));

      setMatchResult(matchData);
      setLoading(false);
    } catch (err: any) {
      console.error("Matching Error:", err);
      setError(err.message || 'Failed to perform analysis.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-4xl text-gray-900 mb-4 tracking-tight">JD Matching Engine</h2>
        <p className="text-gray-500 text-lg">Compare any resume with a specific job description to find gaps and overlaps.</p>
      </div>

      {!matchResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-2xl mb-6 flex items-center space-x-3">
                <FileText className="w-6 h-6 text-brand-600" />
                <span>1. Select Resume</span>
              </h3>
              <div className="space-y-3">
                {resumes.map(resume => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResumeId(resume.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all group ${
                      selectedResumeId === resume.id 
                        ? 'border-brand-600 bg-brand-50' 
                        : 'border-gray-50 hover:border-brand-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
                          selectedResumeId === resume.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{resume.parsedData.name}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400">{resume.title}</p>
                        </div>
                      </div>
                      {selectedResumeId === resume.id && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                    </div>
                  </button>
                ))}
                {resumes.length === 0 && (
                  <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl last:border-0 italic">No resumes found. Please upload one first.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
               <h3 className="font-display font-bold text-2xl mb-6 flex items-center space-x-3">
                <Target className="w-6 h-6 text-orange-600" />
                <span>2. Job Information</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jdTitle}
                    onChange={(e) => setJdTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    rows={8}
                    placeholder="Paste the job description text here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start space-x-3 text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  disabled={loading || !selectedResumeId || !jdText || !jdTitle}
                  onClick={handleMatch}
                  className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all ${
                    loading || !selectedResumeId || !jdText || !jdTitle
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-100'
                  }`}
                >
                  {loading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-3 border-gray-300 border-t-orange-600 rounded-full"
                      />
                      <span>AI Matching...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-6 h-6" />
                      <span>Start Matching</span>
                    </>
                  )}
                </button>
              </div>
             </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-8 mb-8 gap-6">
            <div className="flex items-center space-x-4">
               <div className="bg-orange-100 p-4 rounded-2xl">
                 <Target className="w-8 h-8 text-orange-600" />
               </div>
               <div>
                 <h3 className="font-display font-bold text-3xl text-gray-900">{matchResult.matchScore}% Match</h3>
                 <p className="text-gray-500 font-medium">{jdTitle}</p>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ScoreBadge label="Skills" score={matchResult.breakdown.skills} />
              <ScoreBadge label="Exp" score={matchResult.breakdown.experience} />
              <ScoreBadge label="Edu" score={matchResult.breakdown.education} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
             <div>
               <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 <span>Missing Keywords/Skills</span>
               </h4>
               <div className="flex flex-wrap gap-2">
                 {matchResult.missingKeywords.map((k: string, i: number) => (
                   <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">{k}</span>
                 ))}
                 {matchResult.missingKeywords.length === 0 && <p className="text-gray-400 italic text-sm">None! You are a great match.</p>}
               </div>
             </div>
             <div>
               <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                 <Sparkles className="w-5 h-5 text-orange-500" />
                 <span>Strategic Suggestions</span>
               </h4>
               <ul className="space-y-3">
                 {matchResult.suggestions.map((s: string, i: number) => (
                   <li key={i} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-2xl text-sm font-semibold text-gray-700 border border-gray-100">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                      <span>{s}</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          <button 
            onClick={() => setMatchResult(null)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
          >
            <ChevronRight className="w-5 h-5" />
            <span>New Comparison</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</span>
      <span className="text-lg font-display font-bold text-gray-900">{score}%</span>
    </div>
  );
}
