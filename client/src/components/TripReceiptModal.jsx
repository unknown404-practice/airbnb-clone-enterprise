import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, ShieldCheck, CheckCircle2, Calendar, MapPin, User, Home, Clock, Sparkles } from 'lucide-react';

export default function TripReceiptModal({ isOpen, onClose, booking, listing: fallbackListing }) {
  const listing = booking?.listing && typeof booking.listing === 'object' && booking.listing.title
    ? booking.listing
    : fallbackListing || {};

  const checkIn = booking?.checkIn ? new Date(booking.checkIn) : new Date();
  const checkOut = booking?.checkOut ? new Date(booking.checkOut) : new Date();
  const diffDays = Math.max(1, Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)));

  const nightlyRate = booking?.nightlyRate || listing.pricePerNight || Math.round((booking?.totalPrice || 500) / diffDays) || 500;
  const nightlySubtotal = nightlyRate * diffDays;
  const cleaningFee = booking?.cleaningFee ?? listing.cleaningFee ?? 75;
  const serviceFee = booking?.serviceFee ?? Math.round(nightlySubtotal * 0.14);
  const totalPrice = booking?.totalPrice || (nightlySubtotal + cleaningFee + serviceFee);

  const itineraryCode = booking?.itineraryCode || `HM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const bookingDate = new Date(booking?.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const checkInFormatted = checkIn.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const checkOutFormatted = checkOut.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Manage body class for pure CSS print mode
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('receipt-modal-open');
    } else {
      document.body.classList.remove('receipt-modal-open');
    }
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, [isOpen]);

  // Robust, zero-blank iframe print engine
  const handlePrint = useCallback(() => {
    const printableElement = document.getElementById('trip-receipt-printable');
    if (!printableElement) {
      window.print();
      return;
    }

    try {
      // Remove any prior print frame
      const existingFrame = document.getElementById('receipt-print-frame');
      if (existingFrame && existingFrame.parentNode) {
        existingFrame.parentNode.removeChild(existingFrame);
      }

      // Create a fresh hidden iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'receipt-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();

      // Collect all active stylesheets and inline styles from the host document
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

      doc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Airbnb Trip Receipt - ${itineraryCode}</title>
            ${styleSheets}
            <style>
              @page {
                size: portrait;
                margin: 10mm 12mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #222222 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              }
              #trip-receipt-printable {
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 16px 20px !important;
                background: #ffffff !important;
                box-shadow: none !important;
                border: none !important;
              }
            </style>
          </head>
          <body>
            <div id="trip-receipt-printable">
              ${printableElement.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      // Allow DOM, fonts, and cached images to settle before triggering print dialog
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }, 400);
    } catch (err) {
      console.error('Iframe print error, falling back to window.print():', err);
      window.print();
    }
  }, [itineraryCode]);

  // Intercept Ctrl+P / Cmd+P while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint]);

  if (!isOpen || !booking) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="receipt-portal-wrapper fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
        {/* Background Backdrop (hidden on print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="receipt-modal-backdrop fixed inset-0 no-print"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="receipt-modal-card relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 z-10 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:rounded-none"
        >
          {/* Top Bar for Screen Action Controls (hidden on print) */}
          <div className="no-print flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Official Itinerary & Tax Receipt</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Canvas */}
          <div id="trip-receipt-printable" className="p-8 sm:p-12 text-[#222222] bg-white font-sans">
            {/* Header / Brand & Document Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b-2 border-gray-900 gap-6">
              <div>
                <div className="flex items-center space-x-2.5 text-[#FF385C] mb-2">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.187 8.593 5.467 12.304 1.109 3.218 1.027 6.036-.24 8.214-1.464 2.515-3.957 3.824-7.011 3.824-2.274 0-4.32-.782-6.082-2.327C11.656 28.854 9.61 29.636 7.336 29.636c-3.054 0-5.547-1.309-7.011-3.824-1.267-2.178-1.349-4.996-.24-8.214C1.365 13.887 3.598 9.124 5.552 5.294l.533-1.025C7.373 1.963 8.828 1 10.836 1h5.164zm0 2.222h-5.164c-1.282 0-2.28.625-3.238 2.336l-.527 1.013c-1.921 3.766-4.125 8.468-5.184 11.543-.951 2.76-.879 4.957.106 6.65 1.036 1.778 2.825 2.704 5.167 2.704 2.227 0 4.249-.968 5.864-2.824l1.836-2.112 1.836 2.112c1.615 1.856 3.637 2.824 5.864 2.824 2.342 0 4.131-.926 5.167-2.704.985-1.693 1.057-3.89.106-6.65-1.059-3.075-3.263-7.777-5.184-11.543l-.527-1.013C23.444 3.847 22.446 3.222 21.164 3.222H16z" />
                  </svg>
                  <span className="text-2xl font-black tracking-tight text-gray-900">airbnb</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 uppercase">
                  Confirmed Customer Itinerary & Receipt
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Airbnb Global Payments Inc. · 888 Brannan St, San Francisco, CA
                </p>
              </div>

              <div className="sm:text-right">
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                  ✓ Booking Confirmed & Paid
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p><span className="text-gray-400">Confirmation Code:</span> <span className="font-mono font-bold text-gray-900">{itineraryCode}</span></p>
                  <p><span className="text-gray-400">Issued On:</span> <span className="font-medium text-gray-800">{bookingDate}</span></p>
                </div>
              </div>
            </div>

            {/* Property Showcase Hero Card */}
            <div className="my-8 p-6 rounded-2xl bg-[#FAFAFA] border border-gray-200 flex flex-col md:flex-row gap-6 items-center">
              {listing.images?.[0] && (
                <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-300">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#FF385C] bg-rose-50 px-2 py-0.5 rounded mb-1.5">
                  {listing.category || 'Luxury Residence'}
                </span>
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-600 flex items-center">
                  <MapPin size={13} className="mr-1 text-[#FF385C] flex-shrink-0" />
                  <span>
                    {listing.location?.address ? `${listing.location.address}, ` : ''}
                    {listing.location?.city}, {listing.location?.country}
                  </span>
                </p>
              </div>
            </div>

            {/* Check-in / Check-out 4-Box Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-gray-200 mb-8 bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Check-in</span>
                <p className="text-xs font-bold text-gray-900">{checkInFormatted}</p>
                <p className="text-[11px] text-gray-500">3:00 PM onwards</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Check-out</span>
                <p className="text-xs font-bold text-gray-900">{checkOutFormatted}</p>
                <p className="text-[11px] text-gray-500">By 11:00 AM</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Duration</span>
                <p className="text-xs font-bold text-gray-900">{diffDays} Night{diffDays > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-gray-500">Private accommodation</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Guests</span>
                <p className="text-xs font-bold text-gray-900">{booking.guestsCount || 1} Guest{booking.guestsCount > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-gray-500">Entire place</p>
              </div>
            </div>

            {/* Host & Guest Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
              <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFA]">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2 flex items-center">
                  <User size={13} className="mr-1.5 text-gray-500" />
                  Primary Guest (Billed To)
                </h4>
                <p className="font-semibold text-gray-900">{booking.guest?.name || 'Verified Airbnb Guest'}</p>
                <p className="text-gray-500">{booking.guest?.email || 'guest@traveller.io'}</p>
                <p className="text-gray-400 text-[10px] mt-1">Payment Method: Visa ending in 4242</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFA]">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2 flex items-center">
                  <Home size={13} className="mr-1.5 text-gray-500" />
                  Host Information
                </h4>
                <p className="font-semibold text-gray-900">{listing.host?.name || 'Elena Rostova (Superhost)'}</p>
                <p className="text-gray-500">{listing.host?.email || 'host@luxuryretreats.com'}</p>
                <p className="text-emerald-600 font-medium text-[10px] mt-1">✓ Identity & Superhost Status Verified</p>
              </div>
            </div>

            {/* Itemized Financial Breakdown Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
              <div className="bg-gray-100 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-700 flex justify-between">
                <span>Description</span>
                <span>Amount (USD)</span>
              </div>

              <div className="divide-y divide-gray-100 text-xs px-5">
                <div className="py-3 flex justify-between">
                  <span className="text-gray-700">
                    Accommodation Rate (${nightlyRate} × {diffDays} night{diffDays > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium text-gray-900">${nightlySubtotal.toLocaleString()}</span>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-gray-700">Cleaning & Property Preparation Fee</span>
                  <span className="font-medium text-gray-900">${cleaningFee.toLocaleString()}</span>
                </div>

                <div className="py-3 flex justify-between">
                  <div>
                    <span className="text-gray-700">Airbnb Service & AirCover Protection Fee</span>
                    <p className="text-[10px] text-gray-400">Includes 24/7 emergency support & booking protection</p>
                  </div>
                  <span className="font-medium text-gray-900">${serviceFee.toLocaleString()}</span>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-gray-700">Occupancy Taxes & Government Levies</span>
                  <span className="font-medium text-emerald-600">$0.00 (Included)</span>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-4 border-t-2 border-gray-900 flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Total Amount Paid</span>
                  <p className="text-[10px] text-gray-500">Paid in full via Visa · Non-transferable</p>
                </div>
                <span className="text-2xl font-black text-[#FF385C]">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* House Rules & Important Notices */}
            <div className="border-t border-gray-200 pt-6 text-[11px] text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-1">Check-in Instructions</h5>
                <p className="leading-relaxed">
                  Keyless smartlock access. Your personal 4-digit keypad pin code will activate at 3:00 PM on arrival date. Detailed door code instructions have been transmitted to your verified mobile number.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-1">Cancellation Policy & AirCover</h5>
                <p className="leading-relaxed">
                  Strict cancellation. Full refund eligible up to 48 hours before check-in. Every reservation is backed by Airbnb AirCover protection against host cancellations and property discrepancies.
                </p>
              </div>
            </div>

            {/* Signature & Support Footer */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-2">
              <span>Security Hash: SHA256-{itineraryCode.toLowerCase()}-verified-official</span>
              <span>Need help? Contact Airbnb Priority Support: 1-844-234-2500</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
