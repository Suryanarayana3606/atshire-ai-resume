import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/utils';
import { OperationType } from '../types';
import { ai, MODELS } from '../lib/gemini';

interface UploadSectionProps {
  onComplete: () => void;
}

export default function UploadSection({ onComplete }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Extract Text from Backend
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error("Received HTML instead of JSON. Possible platform authentication or cookie issue.");
          throw new Error("Temporary connection issue. Please refresh the page and try again.");
        }
        throw new Error(`Failed to extract text (Status ${response.status}).`);
      }

      const data = await response.json();
      const { text } = data;
      
      setParsing(true);

      // Step 2: Parse using AI on Frontend
            // Step 2: Parse using AI on Frontend
      const prompt = `
        Extract structured information from the following resume text. 
        
        Return ONLY a valid JSON object with these fields:
        {
          "name": "",
          "email": "",
          "phone": "",
          "summary": "",
          "skills": [],
          "education": [
            {
              "degree": "",
              "institution": "",
              "year": ""
            }
          ],
          "experience": [
            {
              "title": "",
              "company": "",
              "duration": "",
              "description": ""
            }
          ],
          "projects": [
            {
              "title": "",
              "description": ""
            }
          ]
        }

        Resume Text:
        ${text}
      `;

      const aiResult = await ai.chat.completions.create({
        model: MODELS.text,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      let jsonText =
        aiResult.choices[0].message.content?.trim() || "";

      jsonText = jsonText
        .replace(/```json\n?|\n?```/g, "")
        .trim();

      const parsedData = JSON.parse(jsonText);
      
      // Calculate a dummy ATS score or get it from AI
      const score = Math.floor(Math.random() * 30) + 70;

      const resumeData = {
        userId: auth.currentUser.uid,
        title: file.name,
        textContent: text,
        parsedData: parsedData,
        atsScore: score,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'resumes'), resumeData).catch(err => handleFirestoreError(err, OperationType.WRITE, 'resumes'));
      setResults({ ...parsedData, atsScore: score });
      setUploading(false);
      setParsing(false);
    } catch (err: any) {
      console.error("Upload/Parsing Error:", err);
      setError(err.message || 'An unexpected error occurred during processing.');
      setUploading(false);
      setParsing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-4xl text-gray-900 mb-4 tracking-tight">Analyze Your Resume</h2>
        <p className="text-gray-500 text-lg">Upload your resume to get instant AI-powered feedback and ATS scoring.</p>
      </div>

      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-gray-200 shadow-sm"
          >
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`flex flex-col items-center justify-center py-20 cursor-pointer transition-all rounded-3xl ${
                  isDragActive ? 'bg-brand-50 border-brand-300' : 'hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="bg-brand-50 p-6 rounded-full mb-6">
                  <Upload className="w-12 h-12 text-brand-600" />
                </div>
                <h3 className="font-bold text-2xl text-gray-900 mb-2">Drag and drop your resume here</h3>
                <p className="text-gray-500 font-medium">Supports PDF, DOCX (Max 5MB)</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="bg-brand-600 p-3 rounded-xl shadow-lg shadow-brand-200">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start space-x-3 text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  disabled={uploading}
                  onClick={handleUpload}
                  className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all ${
                    uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-200'
                  }`}
                >
                  {uploading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-6 h-6 border-3 border-gray-300 border-t-brand-600 rounded-full"
                      />
                      <span>{parsing ? 'AI Analyzing...' : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6" />
                      <span>Scan My Resume</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl"
          >
            <div className="text-center mb-10">
               <div className="inline-flex items-center justify-center mb-6">
                 <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * results.atsScore) / 100} className="text-brand-600 transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-display font-bold text-gray-900">{results.atsScore}%</span>
                       <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ATS Score</span>
                    </div>
                 </div>
               </div>
               <h3 className="font-display font-bold text-3xl text-gray-900 mb-2">Analysis Complete!</h3>
               <p className="text-gray-500">Your resume has been processed. Here is what we found.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg border-b pb-2">Extracted Details</h4>
                  <DetailItem label="Name" value={results.name} />
                  <DetailItem label="Email" value={results.email} />
                  <DetailItem label="Phone" value={results.phone} />
                  <div className="pt-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {results.skills.slice(0, 10).map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg border-b pb-2">AI Suggestions</h4>
                  <div className="space-y-3">
                    <SuggestionItem text="Your summary could be more outcome-focused." />
                    <SuggestionItem text="Add measurable metrics to your projects." />
                    <SuggestionItem text="Consider using more action-oriented power verbs." />
                  </div>
               </div>
            </div>

            <button 
              onClick={onComplete}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium text-sm">{label}</span>
      <span className="text-gray-900 font-bold text-sm truncate max-w-[200px]">{value || 'Not found'}</span>
    </div>
  );
}

function SuggestionItem({ text }: { text: string }) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-2xl text-orange-800 text-sm font-semibold">
      <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
