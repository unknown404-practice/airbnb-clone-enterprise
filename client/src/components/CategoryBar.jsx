import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Umbrella,
  Flame,
  Waves,
  Castle,
  Palmtree,
  TreePine,
  Sun,
  Sailboat,
  Landmark,
  Home,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useListings } from '../context/ListingContext';

const categories = [
  { label: 'All', icon: Compass },
  { label: 'Beachfront', icon: Umbrella },
  { label: 'Trending', icon: Flame },
  { label: 'Amazing Pools', icon: Waves },
  { label: 'Luxe', icon: Castle },
  { label: 'Cabins', icon: TreePine },
  { label: 'Islands', icon: Palmtree },
  { label: 'Lakefront', icon: Sailboat },
  { label: 'Desert', icon: Sun },
  { label: 'Historical Homes', icon: Landmark },
  { label: 'Mansions', icon: Castle },
  { label: 'Tiny Homes', icon: Home },
];

export default function CategoryBar() {
  const {
    selectedCategory,
    setSelectedCategory,
    setIsFilterModalOpen,
    selectedAmenities,
    priceRange,
    viewMode,
    setViewMode,
    setIsMapVisible,
  } = useListings();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeFiltersCount = (selectedAmenities.length > 0 ? selectedAmenities.length : 0) +
    (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0);

  return (
    <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] py-3 transition-shadow">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 hover:scale-105 bg-white items-center justify-center transition-all shadow-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable Category Icons List */}
        <div
          ref={scrollRef}
          className="flex items-center space-x-8 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;

            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`relative flex flex-col items-center space-y-2 pb-2 flex-shrink-0 transition-colors group ${
                  isSelected ? 'text-[#222222]' : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                <Icon
                  size={24}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isSelected ? 'stroke-[2.2]' : 'stroke-[1.6]'
                  }`}
                />
                <span className="text-xs font-semibold whitespace-nowrap tracking-tight">
                  {cat.label}
                </span>

                {/* Animated Bottom Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="categoryUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#222222] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 hover:scale-105 bg-white items-center justify-center transition-all shadow-sm"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>

        {/* Right Action Controls: Filters & View Mode */}
        <div className="flex-shrink-0 flex items-center space-x-2 pl-2">
          {/* View Mode Toggle (Grid / Split / Map) */}
          <div className="hidden lg:flex items-center border border-gray-300 rounded-xl p-0.5 bg-gray-100/80 shadow-sm">
            <button
              onClick={() => {
                setViewMode('grid');
                setIsMapVisible(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => {
                setViewMode('split');
                setIsMapVisible(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => {
                setViewMode('map');
                setIsMapVisible(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Map
            </button>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-900 text-xs font-semibold text-[#222222] transition-colors shadow-sm bg-white"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#222222] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
