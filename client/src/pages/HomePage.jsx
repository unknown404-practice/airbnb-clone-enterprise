import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ListFilter } from 'lucide-react';
import CategoryBar from '../components/CategoryBar';
import ListingGrid from '../components/ListingGrid';
import ListingMap from '../components/ListingMap';
import FilterModal from '../components/FilterModal';
import SearchModal from '../components/SearchModal';
import { useListings } from '../context/ListingContext';

export default function HomePage() {
  const {
    listings,
    isMapVisible,
    setIsMapVisible,
    viewMode,
    setViewMode,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
  } = useListings();

  const handleTogglePill = () => {
    if (viewMode === 'map') {
      setViewMode('grid');
      setIsMapVisible(false);
    } else if (viewMode === 'grid') {
      setViewMode('map');
      setIsMapVisible(true);
    } else {
      // In split view on desktop, toggle to full map or grid
      if (isMapVisible) {
        setViewMode('grid');
        setIsMapVisible(false);
      } else {
        setViewMode('split');
        setIsMapVisible(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Category Bar */}
      <CategoryBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-8 md:px-12 py-6 relative">
        {viewMode === 'split' ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            {/* Left: Scrollable Listing Grid */}
            <div className={`w-full lg:w-[58%] xl:w-[60%] ${isMapVisible ? 'hidden lg:block' : 'block'}`}>
              <ListingGrid isSplitView={true} />
            </div>

            {/* Right: Sticky Interactive Map */}
            <div className={`w-full lg:w-[42%] xl:w-[40%] sticky top-[148px] h-[78vh] lg:h-[calc(100vh-175px)] rounded-3xl overflow-hidden shadow-md border border-gray-200 ${isMapVisible ? 'block' : 'hidden lg:block'}`}>
              <ListingMap listings={listings} isSplitView={true} />
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <motion.div
            key="map-full"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-[80vh] rounded-3xl overflow-hidden shadow-md border border-gray-200"
          >
            <ListingMap listings={listings} />
          </motion.div>
        ) : (
          <motion.div
            key="grid-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ListingGrid />
          </motion.div>
        )}

        {/* Floating "Show Map / Show List" Pill Button */}
        <div className="fixed bottom-14 md:bottom-10 left-1/2 -translate-x-1/2 z-30">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleTogglePill}
            className="flex items-center space-x-2 px-5 py-3 rounded-full bg-[#222222] text-white text-xs sm:text-sm font-semibold shadow-2xl hover:bg-black transition-colors"
          >
            {viewMode === 'map' || (viewMode === 'split' && isMapVisible && typeof window !== 'undefined' && window.innerWidth < 1024) ? (
              <>
                <span>Show list</span>
                <ListFilter size={16} />
              </>
            ) : (
              <>
                <span>Show map</span>
                <Map size={16} />
              </>
            )}
          </motion.button>
        </div>
      </main>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
