import React from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, Target, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-50 rounded-full blur-3xl opacity-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-white border border-gray-100 rounded-full px-4 py-1.5 mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-medium text-gray-600">The Ultimate AI Co-Pilot for Hiring</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
        >
          Bridge the gap between <br />
          <span className="text-brand-600 relative">
            Talent and Opportunity
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 358 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 6.5C1.5 6.5 106.5 1.5 178.5 1.5C250.5 1.5 356.5 6.5 356.5 6.5" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed"
        >
          ATSHire AI uses advanced language models to parse resumes, score ATS compatibility, and match candidates with job descriptions with surgical precision.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center space-x-2 group"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
            <span>Watch Demo</span>
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <FeatureCard 
            icon={<FileText className="w-6 h-6" />}
            title="Intelligent Parsing"
            description="Extract data from any PDF or DOCX resume with 99% accuracy using Gemini AI."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="ATS Scoring"
            description="Get instant feedback on formatting, keyword density, and overall ATS compatibility."
          />
          <FeatureCard 
            icon={<Target className="w-6 h-6" />}
            title="JD Matching"
            description="Mathematically compare resumes with job descriptions to find the perfect fit."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-brand-50 w-12 h-12 rounded-2xl flex items-center justify-center text-brand-600 mb-6">
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
