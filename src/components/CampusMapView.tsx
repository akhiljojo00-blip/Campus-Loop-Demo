import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCampus } from '../context/CampusContext';
import { CAMPUS_ZONES } from '../data/seedListings';
import { 
  MapPin, 
  Navigation, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  X, 
  ExternalLink,
  Layers,
  Compass
} from 'lucide-react';

export const CampusMapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { 
    listings, 
    setSelectedProduct, 
    selectedCampusZone, 
    setSelectedCampusZone,
    userCoords,
    requestUserLocation,
    liveLocationSession,
    stopLiveLocationSharing,
    showToast
  } = useCampus();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map center on University Quad
      const map = L.map(mapContainerRef.current, {
        center: [28.5455, 77.1932],
        zoom: 16,
        minZoom: 14,
        maxZoom: 18,
      });

      // OpenStreetMap tile layer with appropriate attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CampusLoop Map',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // Filter listings if campus zone is selected
    const displayListings = selectedCampusZone === 'All'
      ? listings
      : listings.filter(item => item.campusLocation.toLowerCase().includes(selectedCampusZone.toLowerCase()));

    // Add Listing Markers
    displayListings.forEach((item) => {
      const lat = item.coordinates?.lat || 28.5450;
      const lng = item.coordinates?.lng || 77.1926;

      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #153225; color: white; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid #FAF8F5; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 11px; font-weight: bold; cursor: pointer;">
            ₹${item.price > 999 ? '1k+' : item.price}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family: inherit; width: 200px; padding: 4px;">
          <img src="${item.imageUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="font-size: 10px; font-weight: bold; color: #153225; text-transform: uppercase;">${item.category}</div>
          <div style="font-size: 13px; font-weight: bold; color: #111; line-height: 1.2; margin-top: 2px;">${item.title}</div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
            <span style="font-size: 15px; font-weight: 800; color: #153225;">₹${item.price}</span>
            <span style="font-size: 10px; color: #666;">${item.condition}</span>
          </div>
          <div style="font-size: 10px; color: #777; margin-top: 4px;">📍 ${item.campusLocation}</div>
          <button id="view-item-btn-${item.id}" style="margin-top: 8px; width: 100%; padding: 6px; background-color: #153225; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-item-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedProduct(item);
          };
        }
      });

      markersLayer.addLayer(marker);
    });

    // Add Live Location Session Radar Marker if active
    if (liveLocationSession && liveLocationSession.isActive) {
      const radarIcon = L.divIcon({
        className: 'custom-campus-radar-container',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(186, 78, 41, 0.35); animation: pulse-ring 2s infinite;"></div>
            <div style="position: relative; z-index: 10; width: 24px; height: 24px; border-radius: 50%; background-color: #BA4E29; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              📍
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      });

      const radarMarker = L.marker([liveLocationSession.lat, liveLocationSession.lng], { icon: radarIcon });
      radarMarker.bindPopup(`
        <div style="padding: 4px; font-family: inherit;">
          <div style="font-weight: bold; color: #BA4E29; font-size: 12px;">Active Exchange Meetup</div>
          <div style="font-size: 11px; margin-top: 2px;">Spot: ${liveLocationSession.campusSpot}</div>
          <div style="font-size: 10px; color: #666; margin-top: 4px;">Expires automatically in 15 mins</div>
        </div>
      `);
      markersLayer.addLayer(radarMarker);
      radarMarker.openPopup();
    }

    // Invalidate size to ensure proper rendering on load
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [listings, selectedCampusZone, liveLocationSession]);

  const handleLocateMe = async () => {
    const success = await requestUserLocation();
    if (success && userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 17);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] dark:bg-[#0D1C15] min-h-[85vh] transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E7E3DC] dark:border-emerald-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-2">
              <Compass className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Location-Aware Marketplace</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#153225] dark:text-[#FAF8F5]">
              Interactive Campus Map
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Explore where items are located around your university. Filter by campus landmark to arrange convenient exchanges between lectures.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLocateMe}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-900/80 bg-white dark:bg-stone-900 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Center on Campus</span>
            </button>
          </div>
        </div>

        {/* Live Location Sharing Alert Banner if Active */}
        {liveLocationSession && liveLocationSession.isActive && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#BA4E29] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                📍
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    Live Meetup Radar Active near {liveLocationSession.campusSpot}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-[#BA4E29] animate-ping"></span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Temporary exchange location expires in: <strong className="text-[#BA4E29]">{Math.floor(liveLocationSession.timeRemainingSeconds / 60)}m {liveLocationSession.timeRemainingSeconds % 60}s</strong>
                </p>
              </div>
            </div>

            <button
              onClick={stopLiveLocationSharing}
              className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
            >
              Stop Sharing
            </button>
          </div>
        )}

        {/* Landmark Quick Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-stone-400 shrink-0 uppercase tracking-wider pl-1">
            Campus Landmarks:
          </span>
          {['All', 'Central Library', 'Computer Lab', 'Science Quad', 'Hostel', 'Activity Center'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedCampusZone(zone)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCampusZone === zone
                  ? 'bg-[#153225] dark:bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-emerald-900/60 hover:bg-stone-50'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Interactive Map Box Container */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg bg-stone-100 dark:bg-stone-900">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] z-10" 
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-[#14231D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 dark:border-emerald-900/60 shadow-xs text-xs font-bold text-[#153225] dark:text-emerald-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#BA4E29]" />
            <span>Click any marker to view student item & price</span>
          </div>
        </div>

        {/* Privacy & Simulation Disclosure Box */}
        <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-[#14231D] border border-[#E7E3DC] dark:border-emerald-900/60 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-stone-900 dark:text-stone-100 font-bold block mb-0.5">
              Campus Privacy & Location Safety
            </strong>
            CampusLoop uses approximate college landmark zones rather than private personal addresses. 
            Temporary live-location sharing is an interactive peer meetup simulation that automatically expires after 15 minutes and can be stopped at any time.
          </div>
        </div>

      </div>
    </div>
  );
};
