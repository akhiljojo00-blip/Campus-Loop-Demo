import React from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedSection } from './components/FeaturedSection';
import { ImpactSection } from './components/ImpactSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BusinessModelSection } from './components/BusinessModelSection';
import { TrustSafetySection } from './components/TrustSafetySection';
import { MarketplaceView } from './components/MarketplaceView';
import { HomeCTA } from './components/HomeCTA';
import { Footer } from './components/Footer';

// Modals & Panels
import { ProductDetailModal } from './components/ProductDetailModal';
import { ContactSellerModal } from './components/ContactSellerModal';
import { ListItemModal } from './components/ListItemModal';
import { ReportModal } from './components/ReportModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PresentationTour } from './components/PresentationTour';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeTab } = useCampus();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C2520]">
      {/* Top sticky navigation */}
      <Navbar />

      {/* Main Page Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection />
            <FeaturedSection />
            <HowItWorksSection />
            <ImpactSection />
            <BusinessModelSection />
            <HomeCTA />
          </>
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView />
        )}

        {activeTab === 'how-it-works' && (
          <>
            <HowItWorksSection />
            <ImpactSection />
            <HomeCTA />
          </>
        )}

        {activeTab === 'business-model' && (
          <>
            <BusinessModelSection />
            <ImpactSection />
            <HomeCTA />
          </>
        )}

        {activeTab === 'safety' && (
          <>
            <TrustSafetySection />
            <HomeCTA />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Interactive Overlays */}
      <ProductDetailModal />
      <ContactSellerModal />
      <ListItemModal />
      <ReportModal />
      <ProfileDrawer />
      <ResetConfirmModal />
      <PresentationTour />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <CampusProvider>
      <MainContent />
    </CampusProvider>
  );
}
