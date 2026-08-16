'use client'
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '@/services/api'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
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
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultLat && defaultLng ? new L.LatLng(defaultLat, defaultLng) : null
  )

  const initialCenter: [number, number] = defaultLat && defaultLng 
    ? [defaultLat, defaultLng] 
    : [18.7883, 98.9853]

  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [noResults, setNoResults] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<string>('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setNoResults(false)
    try {
      const res = await api.get(`/search/places?q=${encodeURIComponent(searchQuery)}`)
      const items = res.data.results || []
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
    const newLatLng = new L.LatLng(place.latitude, place.longitude)
    setPosition(newLatLng)
    setSelectedLabel(place.title)
    setMapCenter([place.latitude, place.longitude])
    setSearchResults([]) 
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 18 }}>คลิกบนแผนที่เพื่อปักหมุด</h3>
          <button type="button" onClick={onCancel} style={closeBtnStyle}>✕</button>
        </div>

        {}
        <div 
          style={searchContainerStyle} 
          onKeyDown={(e) => e.stopPropagation()} 
          onKeyUp={(e) => e.stopPropagation()} 
          onKeyPress={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="map-search-input"
              placeholder="🔍 ค้นหาชื่อสถานที่, ที่อยู่ หรือร้านค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') handleSearch();
              }}
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
              {searching ? 'ค้นหา...' : 'ค้นหา'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={dropdownStyle}>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPlace(item)}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#1e293b' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.address}
                  </div>
                </div>
              ))}
            </div>
          )}

          {noResults && (
            <div style={{ color: '#ef4444', fontSize: '12.5px', marginTop: '6px', paddingLeft: '4px' }}>
              ❌ ไม่พบสถานที่ตามคำค้นหา กรุณาลองใหม่อีกครั้ง
            </div>
          )}
        </div>
        
        <div style={mapContainerStyle}>
          <MapContainer center={mapCenter} zoom={13} keyboard={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            <LocationMarker position={position} setPosition={(latlng) => {
              setPosition(latlng);
              setSelectedLabel(`พิกัด: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
            }} />
            <ChangeMapCenter center={mapCenter} />
          </MapContainer>
        </div>

        <div style={footerStyle}>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {selectedLabel || (position ? `พิกัดที่เลือก: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'ยังไม่ได้เลือกตำแหน่ง')}
          </div>
          <button 
            type="button"
            onClick={() => position && onConfirm(position.lat, position.lng, selectedLabel || `พิกัด: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`)}
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
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
  zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20
}
const modalStyle: React.CSSProperties = {
  width: '100%', maxWidth: 600, backgroundColor: '#fff', borderRadius: 16,
  overflow: 'hidden', display: 'flex', flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  fontFamily: "'Prompt', sans-serif"
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
