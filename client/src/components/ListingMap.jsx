import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';

// Helper component to center map and force resize calculation
function MapCenterUpdater({ center, zoom }) {
  const map = useMap();

  React.useEffect(() => {
    // Invalidate size on mount and shortly after to fix hidden/animated container issues
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
      map.invalidateSize();
    }
  }, [center, zoom, map]);

  return null;
}

export default function ListingMap({ listings, isSplitView = false }) {
  const navigate = useNavigate();
  const { hoveredListingId, setHoveredListingId } = useListings();

  // Compute map center from listings
  const { center, zoom } = useMemo(() => {
    if (!listings || listings.length === 0) {
      return { center: [20, 0], zoom: 2 };
    }
    const valid = listings.filter((l) => l.location?.coordinates?.lat && l.location?.coordinates?.lng);
    if (valid.length === 0) return { center: [20, 0], zoom: 2 };

    const avgLat = valid.reduce((sum, l) => sum + l.location.coordinates.lat, 0) / valid.length;
    const avgLng = valid.reduce((sum, l) => sum + l.location.coordinates.lng, 0) / valid.length;

    return { center: [avgLat, avgLng], zoom: valid.length === 1 ? 9 : 3 };
  }, [listings]);

  const createCustomIcon = (listing) => {
    const isHovered = hoveredListingId === listing._id;
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="custom-price-marker ${isHovered ? 'active' : ''}">
          $${listing.pricePerNight}
        </div>
      `,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
    });
  };

  return (
    <div className={`w-full h-full relative rounded-2xl overflow-hidden shadow-inner ${isSplitView ? 'min-h-[600px]' : 'h-[75vh]'}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapCenterUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, OpenStreetMap contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {listings.map((listing) => {
          const lat = listing.location?.coordinates?.lat;
          const lng = listing.location?.coordinates?.lng;
          if (!lat || !lng) return null;

          return (
            <Marker
              key={listing._id}
              position={[lat, lng]}
              icon={createCustomIcon(listing)}
              eventHandlers={{
                mouseover: () => setHoveredListingId(listing._id),
                mouseout: () => setHoveredListingId(null),
              }}
            >
              <Popup closeButton={true} className="airbnb-custom-popup">
                <div
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="cursor-pointer w-64 p-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2.5">
                    <img
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-0.5">
                    <span className="truncate">{listing.location.city}, {listing.location.country}</span>
                    <div className="flex items-center space-x-0.5">
                      <Star size={11} className="fill-black" />
                      <span>{listing.ratingAvg > 0 ? listing.ratingAvg.toFixed(2) : 'New'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{listing.title}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="text-xs">
                      <span className="font-bold text-gray-900">${listing.pricePerNight}</span>
                      <span className="text-gray-500"> / night</span>
                    </div>
                    <span className="text-xs font-semibold text-[#FF385C] flex items-center">
                      View <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
