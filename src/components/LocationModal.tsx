import React, { useState } from 'react';
import { X, MapPin, Navigation, Search, Check, Globe, AlertCircle, Compass } from 'lucide-react';
import { LocationConfig } from '../types';
import { PRESET_CITIES } from '../constants/defaults';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationConfig;
  onSelectLocation: (location: LocationConfig) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCustomCoords, setShowCustomCoords] = useState(false);

  const [customLat, setCustomLat] = useState(currentLocation.latitude.toString());
  const [customLng, setCustomLng] = useState(currentLocation.longitude.toString());
  const [customName, setCustomName] = useState(currentLocation.name);
  const [customCountry, setCustomCountry] = useState(currentLocation.country);

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetecting(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        // Try reverse geocode or identify closest known city
        const newLocation: LocationConfig = {
          name: `Current Location (${lat}°, ${lng}°)`,
          country: 'GPS Location',
          latitude: lat,
          longitude: lng,
          timezone,
          isAutoDetected: true,
        };

        onSelectLocation(newLocation);
        onClose();
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg(
            'Location permission was denied. You can easily pick a city below or enter your exact coordinates.'
          );
        } else {
          setErrorMsg('Unable to acquire GPS signal. Please select your city below.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredCities = PRESET_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrorMsg('Please enter valid Latitude (-90 to 90) and Longitude (-180 to 180).');
      return;
    }

    const customLoc: LocationConfig = {
      name: customName || 'Custom Location',
      country: customCountry || 'User Defined',
      latitude: lat,
      longitude: lng,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      isAutoDetected: false,
    };
    onSelectLocation(customLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Select Your Location
              </h3>
              <p className="text-xs text-stone-500">
                Astronomical times adjust to your exact latitude and longitude
              </p>
            </div>
          </div>
          <button
            id="close-location-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Detect Location Button */}
          <button
            id="detect-gps-btn"
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-xl border border-emerald-700 bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>
              {isDetecting ? 'Requesting GPS Location...' : 'Use Current Device Location (GPS)'}
            </span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Presets */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search major city (e.g. Madinah, Karachi, London)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-emerald-700 focus:border-emerald-700"
            />
          </div>

          {/* Cities List */}
          <div className="border border-stone-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-stone-100 bg-stone-50/40">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => {
                const isCurrent =
                  currentLocation.latitude === city.latitude &&
                  currentLocation.longitude === city.longitude;

                return (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => {
                      onSelectLocation(city);
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-stone-100 transition-colors ${
                      isCurrent ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <span>{city.name}</span>
                        {city.name.includes('Madinah') && (
                          <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.2 rounded font-normal">
                            Sanctuary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {city.country} • Lat: {city.latitude}°, Lng: {city.longitude}°
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-stone-400">
                No matching city found in presets. You can enter custom coordinates below.
              </div>
            )}
          </div>

          {/* Custom Coordinates Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showCustomCoords ? 'Hide manual coordinates' : 'Enter manual coordinates / custom town'}</span>
            </button>

            {showCustomCoords && (
              <form onSubmit={handleCustomSubmit} className="mt-3 space-y-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">
                      City / Area Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                      placeholder="My City"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">
                      Latitude (-90 to 90)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900"
                      placeholder="24.4672"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">
                      Longitude (-180 to 180)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900"
                      placeholder="39.6111"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Save Custom Coordinates
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Current: <strong className="text-stone-800">{currentLocation.name}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
