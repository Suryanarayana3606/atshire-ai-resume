import React from 'react';
import { Sparkles, Menu, X, User as UserIcon, LogOut, Layout, Upload, Target } from 'lucide-react';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

export default function Navbar({ user, onLogin, onLogout, currentPage, setCurrentPage }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setCurrentPage(user ? 'dashboard' : 'home')}
          >
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 tracking-tight">ATSHire AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <NavLink 
                  active={currentPage === 'dashboard'} 
                  onClick={() => setCurrentPage('dashboard')}
                  icon={<Layout className="w-4 h-4" />}
                  label="Dashboard"
                />
                <NavLink 
                  active={currentPage === 'upload'} 
                  onClick={() => setCurrentPage('upload')}
                  icon={<Upload className="w-4 h-4" />}
                  label="Analyze Resume"
                />
                <NavLink 
                  active={currentPage === 'jd-match'} 
                  onClick={() => setCurrentPage('jd-match')}
                  icon={<Target className="w-4 h-4" />}
                  label="JD Match"
                />
                <NavLink 
                  active={currentPage === 'suggestions'} 
                  onClick={() => setCurrentPage('suggestions')}
                  icon={<Sparkles className="w-4 h-4" />}
                  label="AI Assistant"
                />
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition-all shadow-md shadow-brand-200"
              >
                Sign In with Google
              </button>
            )}
          </div>

          <div className="md:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
        active ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
        />
      )}
    </button>
  );
}
