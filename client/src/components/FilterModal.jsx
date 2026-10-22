import React, { useMemo } from 'react';
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

  const minVal = priceRange[0];
  const maxVal = priceRange[1];
  const sliderMax = 2000;

  // 30-bar Price Distribution Histogram Calculation
  const { histogramBars, avgPrice } = useMemo(() => {
    const BINS = 30;
    const binWidth = sliderMax / BINS;
    const bins = Array(BINS).fill(0);

    const prices = (listings || []).map((l) => l.pricePerNight).filter(Boolean);
    const avg = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 420;

    if (prices.length > 0) {
      prices.forEach((price) => {
        const binIndex = Math.min(Math.floor(price / binWidth), BINS - 1);
        if (binIndex >= 0) bins[binIndex]++;
      });
    } else {
      // Bell curve baseline
      const mockCurve = [1, 2, 4, 7, 12, 18, 22, 28, 30, 26, 21, 17, 14, 11, 8, 6, 5, 4, 3, 2, 2, 1, 1, 1, 1, 0, 1, 0, 0, 1];
      mockCurve.forEach((val, idx) => (bins[idx] = val));
    }

    const maxCount = Math.max(...bins, 1);
    const bars = bins.map((count, i) => {
      const barPrice = i * binWidth;
      const inRange = barPrice >= minVal && barPrice <= maxVal;
      const heightPercent = count === 0 ? 10 : Math.max(16, (count / maxCount) * 100);
      return {
        id: i,
        priceStart: barPrice,
        inRange,
        heightPercent,
        count,
      };
    });

    return { histogramBars: bars, avgPrice: avg };
  }, [listings, minVal, maxVal, sliderMax]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value) || 0, maxVal - 50);
    setPriceRange([Math.max(0, val), maxVal]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value) || 0, minVal + 50);
    setPriceRange([minVal, Math.min(sliderMax, val)]);
  };

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

  // Compute percentage positions for active range track
  const minPercent = Math.min(100, Math.max(0, (minVal / sliderMax) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxVal / sliderMax) * 100));

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
              {/* Price Range Section with 30-Bar Histogram */}
              <div>
                <h4 className="text-base font-semibold text-[#222222] mb-1">Price range</h4>
                <p className="text-xs text-[#717171] mb-2">
                  Average nightly rate is <span className="font-semibold text-gray-900">${avgPrice}</span>
                </p>

                {/* 30-Bar Price Histogram Graphic */}
                <div className="pt-6 pb-2 px-2">
                  <div className="h-24 flex items-end gap-[3px] w-full px-1">
                    {histogramBars.map((bar) => (
                      <div
                        key={bar.id}
                        className={`flex-1 rounded-t-sm transition-all duration-200 ${
                          bar.inRange ? 'bg-[#222222]' : 'bg-gray-200'
                        }`}
                        style={{ height: `${bar.heightPercent}%` }}
                        title={`$${Math.round(bar.priceStart)}: ${bar.count} stays`}
                      />
                    ))}
                  </div>

                  {/* Dual-Thumb Range Slider Container */}
                  <div className="relative w-full h-8 flex items-center">
                    {/* Background Track */}
                    <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
                    {/* Active Range Highlight */}
                    <div
                      className="absolute h-1.5 bg-[#222222] rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        width: `${Math.max(0, maxPercent - minPercent)}%`,
                      }}
                    />

                    {/* Dual Range Sliders */}
                    <input
                      type="range"
                      min="0"
                      max={sliderMax}
                      step="25"
                      value={minVal}
                      onChange={handleMinChange}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent accent-black z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max={sliderMax}
                      step="25"
                      value={maxVal}
                      onChange={handleMaxChange}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent accent-black z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>
                </div>

                {/* Min / Max Numeric Input Boxes */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 p-3 border border-gray-300 rounded-2xl focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block">Minimum</label>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        max={maxVal}
                        value={minVal}
                        onChange={(e) => setPriceRange([Math.max(0, Number(e.target.value) || 0), maxVal])}
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
                        min={minVal}
                        max={sliderMax}
                        value={maxVal}
                        onChange={(e) => setPriceRange([minVal, Math.min(sliderMax, Number(e.target.value) || sliderMax)])}
                        className="w-full font-medium outline-none text-sm text-[#222222]"
                      />
                    </div>
                  </div>
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
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-medium transition-all ${
                          isChecked
                            ? 'border-black bg-gray-50 text-gray-900 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{amenity}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-[#222222] underline hover:text-black transition-colors"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-3 rounded-xl bg-[#222222] text-white font-semibold text-xs hover:bg-black transition-all shadow-md active:scale-95"
              >
                Show {listings?.length ? `${listings.length} stays` : 'stays'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
