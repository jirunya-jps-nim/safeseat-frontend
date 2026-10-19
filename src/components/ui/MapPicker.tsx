'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '@/services/api'

const mapPickerPinIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-mappicker-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px;">
      <div style="background-color: #10B981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="22px" height="22px">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #10B981; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -42]
}) : null;

const THAILAND_BOUNDS: [[number, number], [number, number]] = [
  [5.5, 97.0], // South-West
  [20.5, 106.0], // North-East
];

function isWithinThailand(lat: number, lng: number): boolean {
  return lat >= 5.5 && lat <= 20.5 && lng >= 97.0 && lng <= 106.0;
}

async function fetchAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SafeSeat-App/1.0' } });
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(',').map((s: string) => s.trim());
        if (parts.length > 3) {
          return parts.slice(0, 4).join(', ');
        }
        return data.display_name;
      }
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
  }
  return `พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function LocationMarker({ 
  position, 
  onPinClick, 
  setGeoError 
}: { 
  position: L.LatLng | null; 
  onPinClick: (pos: L.LatLng) => void;
  setGeoError: (err: string) => void;
}) {
  useMapEvents({
    click(e) {
      if (!isWithinThailand(e.latlng.lat, e.latlng.lng)) {
        setGeoError('⚠️ กรุณาปักหมุดตำแหน่งภายในประเทศไทยเท่านั้น');
        return;
      }
      setGeoError('');
      onPinClick(e.latlng);
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={mapPickerPinIcon || undefined} />
  )
}

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 15) 
    }
  }, [center, map])
  return null
}

interface PlaceResult {
  title: string
  address: string
  latitude: number
  longitude: number
}

interface MapPickerProps {
  defaultLat?: number
  defaultLng?: number
  onConfirm: (lat: number, lng: number, label?: string) => void
  onCancel: () => void
}

export default function MapPicker({ defaultLat, defaultLng, onConfirm, onCancel }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  const isValidDefault = defaultLat && defaultLng && isWithinThailand(defaultLat, defaultLng);
  const [position, setPosition] = useState<L.LatLng | null>(
    isValidDefault ? new L.LatLng(defaultLat!, defaultLng!) : null
  )

  const initialCenter: [number, number] = isValidDefault
    ? [defaultLat!, defaultLng!] 
    : [18.7883, 98.9853] // Default Chiang Mai / Thailand center

  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [noResults, setNoResults] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<string>('')

  const handleMapPin = async (latlng: L.LatLng) => {
    setPosition(latlng);
    setSelectedLabel('กำลังค้นหาชื่อสถานที่...');
    const readable = await fetchAddressFromCoords(latlng.lat, latlng.lng);
    setSelectedLabel(readable);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setNoResults(false)
    setGeoError('')
    try {
      const res = await api.get(`/search/places?q=${encodeURIComponent(searchQuery)}`)
      const rawItems: PlaceResult[] = res.data.results || []
      // Filter strictly within Thailand bounds
      const items = rawItems.filter(p => isWithinThailand(p.latitude, p.longitude))
      
      setSearchResults(items)
      if (items.length === 0) {
        setNoResults(true)
      } else {
        const firstPlace = items[0]
        const newLatLng = new L.LatLng(firstPlace.latitude, firstPlace.longitude)
        setPosition(newLatLng)
        setSelectedLabel(firstPlace.title)
        setMapCenter([firstPlace.latitude, firstPlace.longitude])
      }
    } catch (err) {
      console.error('Search places error:', err)
      setNoResults(true)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectPlace = (place: PlaceResult) => {
    if (!isWithinThailand(place.latitude, place.longitude)) {
      setGeoError('⚠️ สถานที่นี้อยู่นอกเขตประเทศไทย');
      return;
    }
    setGeoError('')
    const newLatLng = new L.LatLng(place.latitude, place.longitude)
    setPosition(newLatLng)
    setSelectedLabel(place.title)
    setMapCenter([place.latitude, place.longitude])
    setSearchResults([]) 
  }

  const handleConfirmLocation = () => {
    if (!position) return;
    if (!isWithinThailand(position.lat, position.lng)) {
      setGeoError('⚠️ กรุณาเลือกตำแหน่งที่ตั้งภายในประเทศไทยเท่านั้น');
      return;
    }
    onConfirm(position.lat, position.lng, selectedLabel || `พิกัด: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`);
  }

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            📍 เลือกตำแหน่งสถานบันเทิงของคุณ (ประเทศไทย)
          </h3>
          <button 
            type="button"
            onClick={onCancel}
            style={closeBtnStyle}
            aria-label="ปิดหน้าต่างแผนที่"
          >
            ✕
          </button>
        </div>

        {geoError && (
          <div style={{ padding: '8px 20px', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: 13, borderBottom: '1px solid #fee2e2', fontWeight: 600 }}>
            {geoError}
          </div>
        )}

        <div style={searchContainerStyle}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="map-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!e.target.value.trim()) {
                  setSearchResults([])
                  setNoResults(false)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              placeholder="ค้นหาชื่อสถานที่ หรือ ย่านในประเทศไทย..."
              style={searchInputStyle}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              style={{
                ...searchBtnStyle,
                opacity: searching ? 0.7 : 1,
                cursor: searching ? 'not-allowed' : 'pointer'
              }}
            >
              {searching ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div style={dropdownStyle}>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  style={dropdownItemStyle}
                  onClick={() => handleSelectPlace(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.address}</div>
                </div>
              ))}
            </div>
          )}

          {noResults && !searching && (
            <div style={noResultStyle}>
              ❌ ไม่พบสถานที่ในประเทศไทยตามคำค้นหา กรุณาลองใหม่อีกครั้ง
            </div>
          )}
        </div>
        
        <div style={mapContainerStyle}>
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            minZoom={5}
            maxBounds={THAILAND_BOUNDS}
            maxBoundsViscosity={1.0}
            keyboard={false} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            <LocationMarker 
              position={position} 
              onPinClick={handleMapPin} 
              setGeoError={setGeoError}
            />
            <ChangeMapCenter center={mapCenter} />
          </MapContainer>
        </div>

        <div style={footerStyle}>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {selectedLabel || (position ? `พิกัดที่เลือก: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'ยังไม่ได้เลือกตำแหน่ง')}
          </div>
          <button 
            type="button"
            onClick={handleConfirmLocation}
            disabled={!position}
            style={{
              ...confirmBtnStyle,
              opacity: position ? 1 : 0.5,
              cursor: position ? 'pointer' : 'not-allowed'
            }}
          >
            ยืนยันตำแหน่ง
          </button>
        </div>
      </div>
      <style>{`
        .map-search-input {
          font-weight: 700 !important;
          color: #000000 !important;
        }
        .map-search-input::placeholder {
          color: #475569 !important;
          opacity: 1 !important;
          font-weight: 600 !important;
        }
        .map-search-input:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15) !important;
        }
      `}</style>
    </div>,
    document.body
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  zIndex: 999999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
}
const modalStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 640,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  fontFamily: "'Prompt', sans-serif",
  zIndex: 1000000,
}
const headerStyle: React.CSSProperties = {
  padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  color: '#0f172a'
}
const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b'
}
const mapContainerStyle: React.CSSProperties = {
  height: 400, width: '100%', backgroundColor: '#f1f5f9'
}
const footerStyle: React.CSSProperties = {
  padding: '16px 20px', borderTop: '1px solid #e2e8f0',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
}
const confirmBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: 'none',
  backgroundColor: '#4f46e5', color: '#fff', fontWeight: 600, fontFamily: "'Prompt', sans-serif"
}

const searchContainerStyle: React.CSSProperties = {
  padding: '12px 20px',
  borderBottom: '1px solid #e2e8f0',
  position: 'relative',
  backgroundColor: '#f8fafc',
}
const searchInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: 8,
  border: '1.5px solid #cbd5e1',
  fontSize: 14,
  outline: 'none',
  fontFamily: "'Prompt', sans-serif",
  boxSizing: 'border-box',
  color: '#0f172a',
  fontWeight: 500,
}
const searchBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "'Prompt', sans-serif",
}
const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 20,
  right: 20,
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  maxHeight: 220,
  overflowY: 'auto',
  zIndex: 1000,
  marginTop: 4,
}
const dropdownItemStyle: React.CSSProperties = {
  padding: '10px 14px',
  cursor: 'pointer',
  borderBottom: '1px solid #f1f5f9',
  transition: 'background-color 0.2s',
  textAlign: 'left',
}
const noResultStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '12.5px',
  marginTop: '8px',
  paddingLeft: '4px',
  fontWeight: 600,
}
