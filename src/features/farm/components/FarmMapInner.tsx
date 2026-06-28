"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, MapPin, Navigation, Plus, Minus, Target } from "lucide-react";
import { useTheme } from "next-themes";

export interface FarmLocation {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
}

const MAP_STYLES = {
  voyager: {
    name: "Modern (Vibrant)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark_matter: {
    name: "Mode Gelap (Dark)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  positron: {
    name: "Minimal (Light)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    name: "Satelit (Citra)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
};

type StyleKey = keyof typeof MAP_STYLES;

const createCustomMarker = () => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
        <div class="relative inline-flex rounded-full h-8 w-8 bg-sky-600 border-2 border-white shadow-lg items-center justify-center text-white transform hover:scale-110 transition-transform duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface FarmMapInnerProps {
  farms: FarmLocation[];
}

export default function FarmMapInner({ farms }: FarmMapInnerProps) {
  const { resolvedTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [currentStyle, setCurrentStyle] = useState<StyleKey>("voyager");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [scaleText, setScaleText] = useState("1 km");
  const [scaleWidth, setScaleWidth] = useState(60);

  // Auto switch map style on theme change
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setCurrentStyle("dark_matter");
    } else {
      setCurrentStyle("voyager");
    }
  }, [resolvedTheme]);

  // Inisialisasi Peta & Cleanup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const defaultCenter: [number, number] =
      farms.length > 0
        ? [farms[0].latitude, farms[0].longitude]
        : [-2.548926, 118.0148634];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: farms.length > 0 ? 11 : 5,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Tile Layer Initial
    const styleObj = MAP_STYLES[currentStyle];
    const tileLayer = L.tileLayer(styleObj.url, {
      attribution: styleObj.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Add Markers
    farms.forEach((farm) => {
      const popupContent = `
        <div class="p-2 min-w-[180px] max-w-xs space-y-1.5 font-sans">
          <div class="flex items-center gap-1.5 text-sky-600 font-semibold text-xs uppercase tracking-wider">
            📍 Lokasi Farm
          </div>
          <h3 class="font-bold text-gray-900 text-sm leading-tight">
            ${farm.name}
          </h3>
          ${
            farm.address
              ? `<p class="text-xs text-gray-600 leading-normal bg-gray-50 p-1.5 rounded-md border border-gray-100">${farm.address}</p>`
              : `<p class="text-[11px] text-gray-400 italic">Alamat belum diisi</p>`
          }
          <div class="pt-1 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 mt-2">
            <span>GPS: ${farm.latitude.toFixed(4)}, ${farm.longitude.toFixed(4)}</span>
            <a href="https://www.google.com/maps?q=${farm.latitude},${farm.longitude}" target="_blank" class="text-sky-600 font-medium hover:underline">Google Maps ↗</a>
          </div>
        </div>
      `;
      L.marker([farm.latitude, farm.longitude], { icon: createCustomMarker() })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Adjust Bounds
    if (farms.length > 0) {
      const bounds = L.latLngBounds(farms.map((f) => [f.latitude, f.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Custom Scale listener
    const updateScale = () => {
      if (!mapInstanceRef.current) return;
      const y = mapInstanceRef.current.getSize().y / 2;
      const maxPixels = 100;
      const maxMeters = mapInstanceRef.current.distance(
        mapInstanceRef.current.containerPointToLatLng([0, y]),
        mapInstanceRef.current.containerPointToLatLng([maxPixels, y])
      );
      const pow10 = Math.pow(10, Math.floor(Math.log10(maxMeters)));
      const d = maxMeters / pow10;
      let mult = 1;
      if (d >= 5) mult = 5;
      else if (d >= 2) mult = 2;

      const targetMeters = mult * pow10;
      const calculatedWidth = Math.round((targetMeters / maxMeters) * maxPixels);
      let text = `${targetMeters} m`;
      if (targetMeters >= 1000) {
        text = `${targetMeters / 1000} km`;
      }
      setScaleWidth(Math.max(calculatedWidth, 30));
      setScaleText(text);
    };

    updateScale();
    map.on("zoomend moveend", updateScale);

    // Cleanup pada unmount
    return () => {
      map.off("zoomend moveend", updateScale);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [farms]);

  // Update Tile Layer saat style berubah
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const styleObj = MAP_STYLES[currentStyle];
    tileLayerRef.current = L.tileLayer(styleObj.url, {
      attribution: styleObj.attribution,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [currentStyle]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (!mapInstanceRef.current) return;
    if (farms.length > 0) {
      const bounds = L.latLngBounds(farms.map((f) => [f.latitude, f.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      mapInstanceRef.current.setView([-2.548926, 118.0148634], 5);
    }
  };

  const activeStyle = MAP_STYLES[currentStyle];

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />

      {/* Custom Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80 dark:border-slate-800 p-1 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <Plus size={16} />
          </button>
          <div className="w-full h-px bg-gray-100 dark:bg-slate-800" />
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <Minus size={16} />
          </button>
        </div>

        <button
          onClick={handleReset}
          title="Fokuskan Semua Lokasi"
          className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center justify-center"
        >
          <Target size={16} />
        </button>
      </div>

      {/* Custom Scale Control */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-gray-200/80 dark:border-slate-800 flex items-center gap-2.5 select-none transition-all duration-200">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200 tracking-tight leading-none">
            {scaleText}
          </span>
          <div
            style={{ width: `${scaleWidth}px` }}
            className="h-1.5 bg-sky-500 rounded-full relative transition-all duration-200 shadow-sm"
          >
            <div className="absolute -left-0.5 -top-0.5 w-1.5 h-2.5 bg-sky-700 dark:bg-sky-400 rounded-sm shadow-sm" />
            <div className="absolute -right-0.5 -top-0.5 w-1.5 h-2.5 bg-sky-700 dark:bg-sky-400 rounded-sm shadow-sm" />
          </div>
        </div>
      </div>

      {/* Style Switcher Menu */}
      <div className="absolute top-3 right-3 z-[400]">
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200/80 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-all"
          >
            <Layers size={14} className="text-sky-500" />
            <span>Tampilan: {activeStyle.name.split(" ")[0]}</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 p-1.5 space-y-1 text-xs">
              {(Object.keys(MAP_STYLES) as StyleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentStyle(key);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    currentStyle === key
                      ? "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {MAP_STYLES[key].name}
                  {currentStyle === key && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
