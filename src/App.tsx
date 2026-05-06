import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { handleFirestoreError } from './lib/utils';
import { OperationType } from './types';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import { Layout, Upload, FileText, BarChart3, Target, Info, LogOut, Search, User as UserIcon, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResumeData, UserProfile, JobDescription, JobMatchResult } from './types';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';
import JDMatchSection from './components/JDMatchSection';
import AISuggestions from './components/AISuggestions';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'upload' | 'jd-match' | 'suggestions'>('home');
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [jds, setJds] = useState<JobDescription[]>([]);

  useEffect(() => {
    // Safety timeout to prevent infinite loading if Firebase hangs
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId);
      setUser(user);
      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(profileRef).catch(err => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));
          if (snap && snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              fullName: user.displayName || 'AI User',
              email: user.email || '',
              role: 'candidate',
              createdAt: new Date().toISOString(),
            };
            await setDoc(profileRef, newProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
            setUserProfile(newProfile);
          }
          fetchUserData(user.uid);
          setCurrentPage('dashboard');
        } catch (error) {
          console.error("Error setting up user profile:", error);
        }
      } else {
        setUserProfile(null);
        setCurrentPage('home');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Run only once on mount

  const fetchUserData = async (userId: string) => {
    try {
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const resumesSnap = await getDocs(resumesQuery).catch(err => handleFirestoreError(err, OperationType.GET, 'resumes'));
      if (resumesSnap) {
        setResumes(resumesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ResumeData)));
      }

      const jdsQuery = query(
        collection(db, 'jobDescriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const jdsSnap = await getDocs(jdsQuery).catch(err => handleFirestoreError(err, OperationType.GET, 'jobDescriptions'));
      if (jdsSnap) {
        setJds(jdsSnap.docs.map(d => ({ id: d.id, ...d.data() } as JobDescription)));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <Hero onGetStarted={user ? () => setCurrentPage('dashboard') : handleLogin} />
          )}

          {currentPage === 'dashboard' && user && (
            <Dashboard 
              resumes={resumes} 
              jds={jds} 
              onUpload={() => setCurrentPage('upload')}
              onJDMatch={() => setCurrentPage('jd-match')}
              onTrySuggestions={() => setCurrentPage('suggestions')}
            />
          )}

          {currentPage === 'suggestions' && user && (
            <AISuggestions 
              resumes={resumes} 
              onBack={() => setCurrentPage('dashboard')}
            />
          )}

          {currentPage === 'upload' && user && (
            <UploadSection onComplete={() => {
              fetchUserData(user.uid);
              setCurrentPage('dashboard');
            }} />
          )}

          {currentPage === 'jd-match' && user && (
            <JDMatchSection resumes={resumes} jds={jds} onComplete={() => {
              fetchUserData(user.uid);
            }} />
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span className="font-display font-bold text-gray-900 tracking-tight">ATSHire AI</span>
          </div>
          <p>© 2026 ATSHire AI. Built for the future of work.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
