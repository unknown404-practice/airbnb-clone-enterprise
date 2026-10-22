import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';

// Helper component to center map and force resize calculation
function MapCenterUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
      map.invalidateSize();
    }
  }, [center, zoom, map]);

  return null;
}

// Marker Clustering & Interactive Rendering Component
function ClusteredListingMarkers({ listings, hoveredListingId, setHoveredListingId, navigate }) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  // Perform spatial clustering when zoom is broad (<= 4)
  const clusters = useMemo(() => {
    const valid = (listings || []).filter(
      (l) => l.location?.coordinates?.lat && l.location?.coordinates?.lng
    );

    // If zoomed in close (zoom >= 5) or very few listings, don't cluster
    if (currentZoom >= 5 || valid.length <= 2) {
      return valid.map((l) => ({
        isCluster: false,
        listing: l,
        lat: l.location.coordinates.lat,
        lng: l.location.coordinates.lng,
      }));
    }

    // Grid-based spatial clustering
    // Cluster grid cell size scales dynamically with zoom level
    const cellSize = currentZoom <= 2 ? 35 : currentZoom === 3 ? 20 : 10;
    const grid = {};

    valid.forEach((item) => {
      const lat = item.location.coordinates.lat;
      const lng = item.location.coordinates.lng;
      const key = `${Math.floor(lat / cellSize)}_${Math.floor(lng / cellSize)}`;

      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(item);
    });

    const result = [];
    Object.values(grid).forEach((group) => {
      if (group.length === 1) {
        result.push({
          isCluster: false,
          listing: group[0],
          lat: group[0].location.coordinates.lat,
          lng: group[0].location.coordinates.lng,
        });
      } else {
        const avgLat = group.reduce((s, g) => s + g.location.coordinates.lat, 0) / group.length;
        const avgLng = group.reduce((s, g) => s + g.location.coordinates.lng, 0) / group.length;
        const minPrice = Math.min(...group.map((g) => g.pricePerNight));

        result.push({
          isCluster: true,
          count: group.length,
          minPrice,
          lat: avgLat,
          lng: avgLng,
          listings: group,
        });
      }
    });

    return result;
  }, [listings, currentZoom]);

  const createSingleIcon = (listing) => {
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

  const createClusterIcon = (count, minPrice) => {
    return L.divIcon({
      className: 'custom-cluster-marker',
      html: `
        <div class="px-2.5 py-1.5 rounded-full bg-[#222222] text-white font-bold text-xs shadow-xl border-2 border-white flex items-center space-x-1 hover:scale-105 transition-transform cursor-pointer">
          <span>$${minPrice}+</span>
          <span class="bg-[#FF385C] text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-1">${count}</span>
        </div>
      `,
      iconSize: [85, 34],
      iconAnchor: [42, 17],
    });
  };

  return (
    <>
      {clusters.map((item, index) => {
        if (item.isCluster) {
          return (
            <Marker
              key={`cluster-${index}-${item.lat}-${item.lng}`}
              position={[item.lat, item.lng]}
              icon={createClusterIcon(item.count, item.minPrice)}
              eventHandlers={{
                click: () => {
                  map.setView([item.lat, item.lng], currentZoom + 3, { animate: true });
                },
              }}
            />
          );
        }

        const listing = item.listing;
        return (
          <Marker
            key={listing._id}
            position={[item.lat, item.lng]}
            icon={createSingleIcon(listing)}
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
                    src={
                      listing.images?.[0] ||
                      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-0.5">
                  <span className="truncate">
                    {listing.location.city}, {listing.location.country}
                  </span>
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
    </>
  );
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

  return (
    <div
      className={`w-full h-full relative rounded-2xl overflow-hidden shadow-inner ${
        isSplitView ? 'min-h-[600px]' : 'h-[75vh]'
      }`}
    >
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
        <ClusteredListingMarkers
          listings={listings}
          hoveredListingId={hoveredListingId}
          setHoveredListingId={setHoveredListingId}
          navigate={navigate}
        />
      </MapContainer>
    </div>
  );
}
