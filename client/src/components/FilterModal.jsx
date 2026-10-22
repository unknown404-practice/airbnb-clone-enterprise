import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useListings } from '../context/ListingContext';

const availableAmenities = [
  'Wifi',
  'Pool',
  'Kitchen',
  'Free parking',
  'Air conditioning',
  'Hot tub',
  'EV charger',
  'Beach access',
  'Ocean view',
  'Sauna',
  'Dedicated workspace',
  'Indoor fireplace',
  'Ski-in/ski-out',
  'Wine cellar',
];

export default function FilterModal({ isOpen, onClose }) {
  const {
    priceRange,
    setPriceRange,
    selectedAmenities,
    setSelectedAmenities,
    listings,
    fetchListings,
  } = useListings();

  if (!isOpen) return null;

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleApply = () => {
    fetchListings();
    onClose();
  };

  const handleClear = () => {
    setPriceRange([0, 2000]);
    setSelectedAmenities([]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="font-semibold text-base text-[#222222]">Filters</h3>
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-8">
              {/* Price Range Section */}
              <div>
                <h4 className="text-base font-semibold text-[#222222] mb-1">Price range</h4>
                <p className="text-xs text-[#717171] mb-5">Nightly prices before taxes and fees</p>

                <div className="flex items-center gap-4">
                  <div className="flex-1 p-3 border border-gray-300 rounded-2xl focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block">Minimum</label>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                        className="w-full font-medium outline-none text-sm text-[#222222]"
                      />
                    </div>
                  </div>

                  <span className="text-gray-400 font-bold">-</span>

                  <div className="flex-1 p-3 border border-gray-300 rounded-2xl focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block">Maximum</label>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        min={priceRange[0]}
                        max="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 2000])}
                        className="w-full font-medium outline-none text-sm text-[#222222]"
                      />
                    </div>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[#FF385C]"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Amenities Section */}
              <div>
                <h4 className="text-base font-semibold text-[#222222] mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableAmenities.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'border-black bg-gray-50 text-black shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span>{amenity}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-black border-black text-white' : 'border-gray-300'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-gray-700 underline hover:text-black"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-3 rounded-xl bg-[#222222] hover:bg-black text-white text-xs font-semibold transition-colors"
              >
                Show {listings.length} stays
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
