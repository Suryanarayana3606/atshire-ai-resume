import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  TrendingUp, 
  Users, 
  Clock, 
  MoreVertical,
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react';
import { ResumeData, JobDescription } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  resumes: ResumeData[];
  jds: JobDescription[];
  onUpload: () => void;
  onJDMatch: () => void;
  onTrySuggestions: () => void;
}

export default function Dashboard({ resumes, jds, onUpload, onJDMatch, onTrySuggestions }: DashboardProps) {
  const averageScore = resumes.length > 0 
    ? Math.round(resumes.reduce((acc, curr) => acc + curr.atsScore, 0) / resumes.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Track and manage your candidates and resumes in one place.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onJDMatch}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <Target className="w-5 h-5 text-brand-600" />
            <span>JD Matcher</span>
          </button>
          <button 
            onClick={onUpload}
            className="flex items-center space-x-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
          >
            <Plus className="w-5 h-5" />
            <span>Analyze Resume</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatsCard 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          label="Avg. ATS Score"
          value={`${averageScore}%`}
          subValue="+5% from last month"
          color="green"
        />
        <StatsCard 
          icon={<FileText className="w-6 h-6 text-brand-600" />}
          label="Total Resumes"
          value={resumes.length.toString()}
          subValue="Across 4 categories"
          color="brand"
        />
        <StatsCard 
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          label="Recent Activity"
          value={resumes.length > 0 ? "Active" : "None"}
          subValue={resumes[0] ? `Last: ${formatDistanceToNow(new Date(resumes[0].createdAt))} ago` : "No uploads yet"}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-display font-bold text-xl text-gray-900">Recent Analyzed Resumes</h2>
              <button className="text-brand-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {resumes.length > 0 ? resumes.map((resume) => (
                <div key={resume.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center group cursor-pointer">
                  <div className="bg-brand-50 p-3 rounded-2xl mr-4 group-hover:bg-brand-100 transition-colors">
                    <FileText className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 mb-0.5">{resume.title || resume.parsedData.name}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{resume.parsedData.email}</p>
                  </div>
                  <div className="mr-8 text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-900 mb-0.5">
                      {formatDistanceToNow(new Date(resume.createdAt))} ago
                    </div>
                    <div className="text-xs text-gray-400">Date Uploaded</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`text-lg font-display font-bold ${
                        resume.atsScore > 80 ? 'text-green-600' : 'text-orange-500'
                      }`}>
                        {resume.atsScore}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">ATS</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No resumes yet</h3>
                  <p className="text-gray-500 mb-8">Upload your first resume to get an ATS breakdown.</p>
                  <button 
                    onClick={onUpload}
                    className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-all"
                  >
                    Analyze First Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
             <Sparkles className="w-10 h-10 text-brand-300 mb-6" />
             <h3 className="font-display font-bold text-2xl mb-3">AI Resume Assistant</h3>
             <p className="text-brand-100 text-sm mb-6 leading-relaxed">
               Get specialized suggestions for improving your resumes. Enhance your profile to get past any ATS filter effortlessly.
             </p>
             <button 
               onClick={onTrySuggestions}
               className="w-full bg-white text-brand-900 py-3 rounded-2xl font-bold hover:bg-brand-50 transition-all shadow-lg flex items-center justify-center space-x-2"
             >
               <span>Try Suggestions</span>
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <h3 className="font-display font-bold text-lg text-gray-900 mb-4 flex items-center justify-between">
                <span>Recent Jobs matched</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-widest font-bold">{jds.length} total</span>
             </h3>
             <div className="space-y-4">
               {jds.slice(0, 3).map(jd => (
                 <div key={jd.id} className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                    <div className="bg-orange-50 p-2 rounded-xl">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{jd.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        {formatDistanceToNow(new Date(jd.createdAt))} ago
                      </p>
                    </div>
                 </div>
               ))}
               {jds.length === 0 && (
                 <p className="text-sm text-gray-400 text-center p-4">No jobs added yet.</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, subValue, color }: { icon: React.ReactNode; label: string; value: string; subValue: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color === 'brand' ? 'brand-50' : color + '-50'}`}>
          {icon}
        </div>
        <MoreVertical className="w-5 h-5 text-gray-300" />
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline space-x-2">
        <h3 className="font-display text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <p className="text-xs text-gray-400 mt-2 font-medium">{subValue}</p>
    </div>
  );
}
