import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  DollarSign,
  CalendarCheck,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Check,
  AlertCircle,
  Home,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const availableCategories = [
  'Beachfront',
  'Cabins',
  'Luxe',
  'Trending',
  'Amazing Pools',
  'Mansions',
  'Islands',
  'Countryside',
  'Desert',
  'Lakefront',
  'Historical Homes',
  'Tiny Homes',
];

const standardAmenities = [
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
];

export default function HostDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'reservations', 'create'
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalListings: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Listing Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Luxe');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('34.0259');
  const [formLng, setFormLng] = useState('-118.7798');
  const [formPrice, setFormPrice] = useState(450);
  const [formCleaningFee, setFormCleaningFee] = useState(80);
  const [formMaxGuests, setFormMaxGuests] = useState(4);
  const [formBedrooms, setFormBedrooms] = useState(2);
  const [formBeds, setFormBeds] = useState(2);
  const [formBaths, setFormBaths] = useState(2);
  const [formAmenities, setFormAmenities] = useState(['Wifi', 'Pool', 'Kitchen']);
  const [formImages, setFormImages] = useState([
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchHostData = async () => {
    try {
      const res = await api.get('/listings/host/my-listings');
      setListings(res.data.listings || []);
      setBookings(res.data.bookings || []);
      setStats(res.data.stats || { totalListings: 0, totalBookings: 0, totalRevenue: 0 });
    } catch (err) {
      console.error('Failed to load host dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    // Automatically switch to host role if not already
    if (user && user.role !== 'host') {
      switchRole('host');
    }
    fetchHostData();
  }, [isAuthenticated, user, navigate]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${listingId}`);
      await fetchHostData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      await api.post('/listings', {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        location: {
          city: formCity,
          country: formCountry,
          address: formAddress,
          coordinates: {
            lat: parseFloat(formLat) || 0,
            lng: parseFloat(formLng) || 0,
          },
        },
        pricePerNight: Number(formPrice),
        cleaningFee: Number(formCleaningFee),
        maxGuests: Number(formMaxGuests),
        bedrooms: Number(formBedrooms),
        beds: Number(formBeds),
        baths: Number(formBaths),
        amenities: formAmenities,
        images: formImages.filter((img) => img.trim() !== ''),
      });

      // Reset wizard
      setFormTitle('');
      setFormDescription('');
      setWizardStep(1);
      setActiveTab('listings');
      await fetchHostData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish listing');
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleAmenity = (item) => {
    setFormAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#FF385C] tracking-widest">
            Host Operations Portal
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Oversee your properties, track gross booking revenue, and launch new luxury stays.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
        >
          <Plus size={16} />
          <span>Create New Listing</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Gross Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              ${stats.totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Active Listings</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalListings}</h3>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Reservations Booked</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalBookings}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'listings' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          My Properties ({listings.length})
          {activeTab === 'listings' && (
            <motion.div layoutId="hostUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'reservations' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Guest Reservations ({bookings.length})
          {activeTab === 'reservations' && (
            <motion.div layoutId="hostUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'create' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Listing Wizard
          {activeTab === 'create' && (
            <motion.div layoutId="hostUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-video w-full bg-gray-100">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900">
                  ${item.pricePerNight} / night
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    {item.category} · {item.location.city}, {item.location.country}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">
                    {item.bedrooms} bed · {item.baths} bath · {item.reviewCount} reviews
                  </span>
                  <button
                    onClick={() => handleDeleteListing(item._id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Delete property"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Guest Reservations */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Itinerary Code</th>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Listing</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Total Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      No guest bookings recorded yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{b.itineraryCode || 'HM-RES'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{b.guest?.name || 'Traveler'}</td>
                      <td className="px-6 py-4 text-gray-800 max-w-xs truncate">{b.listing?.title}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${b.totalPrice}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Listing Creation Wizard */}
      {activeTab === 'create' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          {/* Wizard Step Progress */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
            {['1. Details', '2. Location', '3. Pricing & Specs', '4. Amenities & Photos'].map((stepName, i) => (
              <div
                key={stepName}
                className={`text-xs font-bold ${
                  wizardStep === i + 1 ? 'text-[#FF385C]' : wizardStep > i + 1 ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {stepName}
              </div>
            ))}
          </div>

          {formError && (
            <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateListing}>
            {/* Step 1: Basics */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900">Step 1: Listing Information</h3>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. The Edge: Cliffside Ocean Sanctuary"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium cursor-pointer"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the architectural design, luxury finishes, panoramic vistas, and special amenities..."
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formTitle || !formDescription) {
                        setFormError('Please enter a title and description');
                        return;
                      }
                      setFormError('');
                      setWizardStep(2);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800"
                  >
                    Next: Location
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900">Step 2: Property Location</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Malibu"
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="28400 Pacific Coast Highway"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formCity || !formCountry) {
                        setFormError('Please enter city and country');
                        return;
                      }
                      setFormError('');
                      setWizardStep(3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800"
                  >
                    Next: Pricing & Specs
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Capacity */}
            {wizardStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900">Step 3: Pricing & Capacity</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Price Per Night ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Cleaning Fee ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formCleaningFee}
                      onChange={(e) => setFormCleaningFee(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Max Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={formMaxGuests}
                      onChange={(e) => setFormMaxGuests(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min="0"
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Beds</label>
                    <input
                      type="number"
                      min="1"
                      value={formBeds}
                      onChange={(e) => setFormBeds(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Baths</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={formBaths}
                      onChange={(e) => setFormBaths(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800"
                  >
                    Next: Amenities & Photos
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Amenities & Images */}
            {wizardStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900">Step 4: Amenities & High-Res Photos</h3>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Amenities</label>
                  <div className="grid grid-cols-3 gap-2">
                    {standardAmenities.map((am) => (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                          formAmenities.includes(am)
                            ? 'border-black bg-gray-50 text-black'
                            : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        <span>{am}</span>
                        {formAmenities.includes(am) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">High-Res Image URLs</label>
                  {formImages.map((img, idx) => (
                    <input
                      key={idx}
                      type="url"
                      value={img}
                      onChange={(e) => {
                        const newImgs = [...formImages];
                        newImgs[idx] = e.target.value;
                        setFormImages(newImgs);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 mb-2 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormImages([...formImages, ''])}
                    className="text-xs font-semibold text-[#FF385C] underline"
                  >
                    + Add another image URL
                  </button>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
