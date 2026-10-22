import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-extrabold text-[#222222] mb-3">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">We can't seem to find the page you're looking for.</h2>
      <p className="text-xs text-gray-500 max-w-sm mb-6">
        Here are some helpful links instead:
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-full bg-[#222222] text-white text-xs font-semibold hover:bg-black transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
