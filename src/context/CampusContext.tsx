import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Listing, Category, Condition, ReportReason, SortOption } from '../types';
import { INITIAL_SEED_LISTINGS } from '../data/seedListings';

const STORAGE_KEY_LISTINGS = 'campusloop_listings_v1';
const STORAGE_KEY_SAVED = 'campusloop_saved_items_v1';
const STORAGE_KEY_USER_LISTINGS = 'campusloop_user_listings_v1';

interface CampusContextType {
  listings: Listing[];
  savedItemIds: string[];
  userListingIds: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (cat: Category | 'All') => void;
  selectedCondition: Condition | 'All';
  setSelectedCondition: (cond: Condition | 'All') => void;
  selectedSort: SortOption;
  setSelectedSort: (sort: SortOption) => void;
  
  // Modals & Panels
  isListItemModalOpen: boolean;
  setIsListItemModalOpen: (open: boolean) => void;
  selectedProduct: Listing | null;
  setSelectedProduct: (product: Listing | null) => void;
  contactingProduct: Listing | null;
  setContactingProduct: (product: Listing | null) => void;
  reportingProduct: Listing | null;
  setReportingProduct: (product: Listing | null) => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (open: boolean) => void;
  
  // Presentation Mode
  isPresentationMode: boolean;
  setIsPresentationMode: (active: boolean) => void;
  presentationStep: number;
  setPresentationStep: (step: number) => void;
  nextPresentationStep: () => void;
  prevPresentationStep: () => void;
  
  // Toast notifications
  toast: { title: string; message: string; type?: 'success' | 'info' | 'warning' } | null;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;

  // Actions
  addListing: (newListingData: Omit<Listing, 'id' | 'timestamp' | 'dateListed' | 'isUserListing'>) => Listing;
  deleteListing: (id: string) => void;
  toggleSaveItem: (id: string) => void;
  isItemSaved: (id: string) => boolean;
  resetDemoData: () => void;
  clearAllFilters: () => void;
  submitReport: (id: string, reason: ReportReason, details?: string) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State from localStorage
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading listings from localStorage, falling back to seed:', e);
    }
    return INITIAL_SEED_LISTINGS;
  });

  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading saved items:', e);
    }
    // Seed one saved item by default (Casio fx-991EX) to show immediate utility
    return ['cl-3'];
  });

  const [userListingIds, setUserListingIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER_LISTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading user listings:', e);
    }
    return [];
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
    } catch (e) {
      console.error('Failed to save listings to localStorage', e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedItemIds));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [savedItemIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_LISTINGS, JSON.stringify(userListingIds));
    } catch (e) {
      console.error('Failed to save user listing IDs', e);
    }
  }, [userListingIds]);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'All'>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('newest');

  // Modals
  const [isListItemModalOpen, setIsListItemModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null);
  const [contactingProduct, setContactingProduct] = useState<Listing | null>(null);
  const [reportingProduct, setReportingProduct] = useState<Listing | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Presentation Mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);

  // Toast Notification
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const hideToast = () => setToast(null);

  const addListing = (newListingData: Omit<Listing, 'id' | 'timestamp' | 'dateListed' | 'isUserListing'>) => {
    const newId = `user-listing-${Date.now()}`;
    const newListing: Listing = {
      ...newListingData,
      id: newId,
      timestamp: Date.now(),
      dateListed: 'Just now',
      isUserListing: true,
      isFeatured: false,
    };

    setListings(prev => [newListing, ...prev]);
    setUserListingIds(prev => [newId, ...prev]);
    showToast('Listing Created!', `"${newListing.title}" is now visible in the marketplace.`, 'success');
    return newListing;
  };

  const deleteListing = (id: string) => {
    const itemToDelete = listings.find(item => item.id === id);
    setListings(prev => prev.filter(item => item.id !== id));
    setUserListingIds(prev => prev.filter(item => item !== id));
    setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
    showToast('Listing Removed', `"${itemToDelete?.title || 'Item'}" was removed from the demo.`, 'info');
  };

  const toggleSaveItem = (id: string) => {
    const item = listings.find(i => i.id === id);
    if (savedItemIds.includes(id)) {
      setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
      showToast('Removed from Saved', `"${item?.title || 'Item'}" removed from your saved list.`, 'info');
    } else {
      setSavedItemIds(prev => [...prev, id]);
      showToast('Saved for Later', `"${item?.title || 'Item'}" added to your saved list.`, 'success');
    }
  };

  const isItemSaved = (id: string) => savedItemIds.includes(id);

  const resetDemoData = () => {
    setListings(INITIAL_SEED_LISTINGS);
    setSavedItemIds(['cl-3']);
    setUserListingIds([]);
    setIsResetConfirmOpen(false);
    showToast('Demo Data Reset', 'Restored 14 default campus listings and initial demo state.', 'info');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedSort('newest');
  };

  const submitReport = (id: string, reason: ReportReason, details?: string) => {
    setReportingProduct(null);
    showToast('Report Simulated', `Thank you. Report for reason "${reason}" logged in demo mode.`, 'info');
  };

  const nextPresentationStep = () => {
    setPresentationStep(prev => Math.min(prev + 1, 4));
  };

  const prevPresentationStep = () => {
    setPresentationStep(prev => Math.max(prev - 1, 0));
  };

  // Keyboard shortcut: Escape closes active modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contactingProduct) setContactingProduct(null);
        else if (reportingProduct) setReportingProduct(null);
        else if (selectedProduct) setSelectedProduct(null);
        else if (isListItemModalOpen) setIsListItemModalOpen(false);
        else if (isProfileDrawerOpen) setIsProfileDrawerOpen(false);
        else if (isResetConfirmOpen) setIsResetConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contactingProduct, reportingProduct, selectedProduct, isListItemModalOpen, isProfileDrawerOpen, isResetConfirmOpen]);

  return (
    <CampusContext.Provider
      value={{
        listings,
        savedItemIds,
        userListingIds,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedCondition,
        setSelectedCondition,
        selectedSort,
        setSelectedSort,
        isListItemModalOpen,
        setIsListItemModalOpen,
        selectedProduct,
        setSelectedProduct,
        contactingProduct,
        setContactingProduct,
        reportingProduct,
        setReportingProduct,
        isProfileDrawerOpen,
        setIsProfileDrawerOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
        isPresentationMode,
        setIsPresentationMode,
        presentationStep,
        setPresentationStep,
        nextPresentationStep,
        prevPresentationStep,
        toast,
        showToast,
        hideToast,
        addListing,
        deleteListing,
        toggleSaveItem,
        isItemSaved,
        resetDemoData,
        clearAllFilters,
        submitReport,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
