import React from 'react';
import { useCampus } from '../context/CampusContext';
import { BrandLogo } from './BrandLogo';
import { 
  Presentation, 
  RotateCcw, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  Mail, 
  MapPin,
  ClipboardList,
  Coins,
  Sun,
  Moon
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    setActiveTab, 
    setIsPresentationMode, 
    setPresentationStep, 
    setIsResetConfirmOpen,
    setIsListItemModalOpen,
    setIsWalletModalOpen,
    theme,
    toggleTheme,
    loopCoinsBalance
  } = useCampus();

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startPresentation = () => {
    setIsPresentationMode(true);
    setPresentationStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#153225] dark:bg-[#08120E] text-white pt-14 pb-10 border-t border-[#1F4231] dark:border-emerald-950 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-emerald-900/80">
          
          {/* Brand Info & Vision (Col 4) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-2 rounded-2xl w-fit mb-4">
              <BrandLogo size="md" showTagline />
            </div>
            <p className="text-xs sm:text-sm text-[#FAF8F5]/80 leading-relaxed mb-6">
              CampusLoop 2.0 is an enhanced peer-to-peer campus circular economy platform featuring a marketplace feed, reverse Wanted Board, peer price bargaining, interactive campus mapping, and virtual LoopCoins rewards.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FAF8F5]/70">
              <MapPin className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Campus Pilot Demonstration Concept (BCA Assignment)</span>
            </div>
          </div>

          {/* Quick Navigation (Col 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/75">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  Marketplace Feed
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('wanted')} className="hover:text-white transition-colors cursor-pointer font-semibold text-amber-300">
                  Wanted Board (Requests)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('map')} className="hover:text-white transition-colors cursor-pointer">
                  Campus Map View
                </button>
              </li>
              <li>
                <button onClick={() => setIsListItemModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  + List an Item
                </button>
              </li>
            </ul>
          </div>

          {/* Business & Strategy (Col 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5] mb-3">
              Features & Controls
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/75">
              <li>
                <button onClick={() => setIsWalletModalOpen(true)} className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <span>🪙 LoopCoins Wallet ({loopCoinsBalance})</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('business-model')} className="hover:text-white transition-colors cursor-pointer">
                  4-Stage Monetization Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('safety')} className="hover:text-white transition-colors cursor-pointer">
                  Trust & Campus Safety Protocol
                </button>
              </li>
              <li>
                <button onClick={startPresentation} className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Launch Presentation Tour</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsResetConfirmOpen(true)} className="text-red-300 hover:text-red-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Seed Demo Data</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coursework Context (Col 3) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5] mb-3">
              Coursework Context
            </h4>
            <p className="text-xs text-[#FAF8F5]/70 leading-relaxed mb-3">
              Submitted for 1st Year BCA Management Assignment on "Sustainable Campus Circular Business Models".
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#FAF8F5]/80 space-y-2">
              <div className="flex items-center justify-between">
                <span>Theme Mode:</span>
                <button
                  onClick={toggleTheme}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1"
                >
                  {theme === 'light' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-300" />}
                  <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                <Mail className="w-3 h-3 text-emerald-400" />
                campusloop.demo@college.edu (Concept)
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F5]/60">
          <div className="text-center md:text-left">
            <p className="font-medium">
              © {new Date().getFullYear()} CampusLoop 2.0 • Interactive Concept Demonstration.
            </p>
            <p className="text-[11px] text-[#FAF8F5]/50 mt-0.5">
              Sample data for academic evaluation only. LoopCoins and ratings are simulated demonstrations in browser localStorage.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={startPresentation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#BA4E29] hover:bg-[#A34322] text-white font-bold transition-colors cursor-pointer"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presentation Tour</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
