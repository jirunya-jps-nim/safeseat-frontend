'use client'
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// สร้าง Custom DivIcon สำหรับจุดรับ (ตำแหน่งร้านค้า - สีน้ำเงิน/ฟ้า พร้อมไอคอนร้านค้า)
const pickupIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 36px; height: 44px;">
      <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="18px" height="18px">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40]
}) : null;

// สร้าง Custom DivIcon สำหรับจุดหมายปลายทาง (หมุดสีแดง)
const dropoffIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-dropoff-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 36px; height: 44px;">
      <div style="background-color: #dc2626; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="20px" height="20px">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #dc2626; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40]
}) : null;


// สร้าง Custom DivIcon สำหรับคนขับ (รถสีส้ม/เหลือง)
const driverIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 36px; height: 44px;">
      <div style="background-color: #f59e0b; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="20px" height="20px">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.51-.68.94-.68h9.56c.43 0 .8.28.94.68L19 11H5z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #f59e0b; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40]
}) : null;


// Component to dynamically fit the map view bounds to include the entire route and driver
function AutoFitBounds({ 
  positions, 
  driverLat, 
  driverLng 
}: { 
  positions: [number, number][], 
  driverLat?: number, 
  driverLng?: number 
}) {
  const map = useMap()
  const positionsKey = JSON.stringify(positions)

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      if (driverLat && driverLng) {
        bounds.extend([driverLat, driverLng])
      }
      map.fitBounds(bounds, { padding: [40, 40], animate: false })

      // Restrict zooming/panning to only the route area
      const paddedBounds = bounds.pad(0.3) // 30% padding around the route
      map.setMaxBounds(paddedBounds)
      
      // Determine optimal zoom level based on bounds
      const optimalZoom = map.getBoundsZoom(bounds)
      map.setMinZoom(Math.max(optimalZoom - 2, 8))
      map.setMaxZoom(17)
    }
    return () => {
      map.setMaxBounds(undefined)
    }
  }, [positionsKey, driverLat, driverLng, map])
  return null
}

interface RouteMapProps {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  driverLat?: number
  driverLng?: number
  currentStep?: number
}

export default function RouteMap({ pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, currentStep }: RouteMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])

  const defaultCenter: [number, number] = [
    (pickupLat + dropoffLat) / 2,
    (pickupLng + dropoffLng) / 2,
  ]

  useEffect(() => {
    let active = true
    const fetchRoute = async () => {
      try {
        let startLng = pickupLng
        let startLat = pickupLat
        let endLng = dropoffLng
        let endLat = dropoffLat

        // หากคนขับกำลังเดินทางไปรับที่ร้านค้า (Pub) ให้วาดเส้นจากตำแหน่งคนขับ ➔ ร้านค้า
        if (currentStep === 1 && driverLat && driverLng) {
          startLat = driverLat
          startLng = driverLng
          endLat = pickupLat
          endLng = pickupLng
        } 
        // หากกำลังนำส่งผู้ใช้ไปยังจุดหมายปลายทาง ให้วาดเส้นจากตำแหน่งคนขับ ➔ จุดหมายปลายทาง
        else if (currentStep === 3 && driverLat && driverLng) {
          startLat = driverLat
          startLng = driverLng
          endLat = dropoffLat
          endLng = dropoffLng
        }

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
        const response = await fetch(osrmUrl)
        if (response.ok) {
          const data = await response.json()
          if (active && data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number])
            setRouteCoords(coords)
            return
          }
        }
        throw new Error('OSRM response was not Ok')
      } catch (err) {
        console.warn('[RouteMap Warning] OSRM route fetch failed, using straight-line fallback:', err)
        if (active) {
          let sLat = pickupLat, sLng = pickupLng, eLat = dropoffLat, eLng = dropoffLng
          if (currentStep === 1 && driverLat && driverLng) {
            sLat = driverLat; sLng = driverLng; eLat = pickupLat; eLng = pickupLng
          } else if (currentStep === 3 && driverLat && driverLng) {
            sLat = driverLat; sLng = driverLng; eLat = dropoffLat; eLng = dropoffLng
          }
          setRouteCoords([
            [sLat, sLng],
            [eLat, eLng]
          ])
        }
      }
    }

    fetchRoute()
    return () => {
      active = false
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, currentStep])

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 250, borderRadius: 16, overflow: 'hidden' }}>
      <MapContainer center={defaultCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon || undefined} />
        <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon || undefined} />
        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon || undefined} />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#4f46e5"
            weight={5}
          />
        )}
        {routeCoords.length > 0 && <AutoFitBounds positions={routeCoords} driverLat={driverLat} driverLng={driverLng} />}
      </MapContainer>
    </div>
  )
}
