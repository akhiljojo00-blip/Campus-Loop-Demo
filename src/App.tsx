import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CampusProvider, useCampus } from './context/CampusContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedSection } from './components/FeaturedSection';
import { ImpactSection } from './components/ImpactSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BusinessModelSection } from './components/BusinessModelSection';
import { TrustSafetySection } from './components/TrustSafetySection';
import { MarketplaceView } from './components/MarketplaceView';
import { WantedBoardView } from './components/WantedBoardView';
import { CampusMapView } from './components/CampusMapView';
import { HomeCTA } from './components/HomeCTA';
import { Footer } from './components/Footer';

// Modals & Panels
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ContactSellerModal } from './components/ContactSellerModal';
import { ListItemModal } from './components/ListItemModal';
import { ReportModal } from './components/ReportModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PresentationTour } from './components/PresentationTour';
import { PostWantedModal } from './components/PostWantedModal';
import { WantedDetailModal } from './components/WantedDetailModal';
import { SellerProfileModal } from './components/SellerProfileModal';
import { ReviewModal } from './components/ReviewModal';
import { LoopCoinsWalletModal } from './components/LoopCoinsWalletModal';
import { CategoryPreferencesModal } from './components/CategoryPreferencesModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { PromoteModal } from './components/PromoteModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeTab } = useCampus();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0D1C15] text-[#1C2520] dark:text-[#FAF8F5] transition-colors">
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

        {activeTab === 'wanted' && (
          <WantedBoardView />
        )}

        {activeTab === 'map' && (
          <CampusMapView />
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
      <AuthModal />
      <ProductDetailModal />
      <ContactSellerModal />
      <ListItemModal />
      <ReportModal />
      <ProfileDrawer />
      <ResetConfirmModal />
      <PresentationTour />
      <PostWantedModal />
      <WantedDetailModal />
      <SellerProfileModal />
      <ReviewModal />
      <LoopCoinsWalletModal />
      <CategoryPreferencesModal />
      <NotificationCenterModal />
      <PromoteModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CampusProvider>
        <MainContent />
      </CampusProvider>
    </AuthProvider>
  );
}
