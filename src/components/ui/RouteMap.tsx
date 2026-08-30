'use client'
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// 🍺 จุดรับ (Pickup) - Beer Mug Icon | Amber/Orange #F97316 (ขอบขาว)
const pickupIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px;">
      <div style="background-color: #F97316; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="22px" height="22px">
          <path d="M16.5 7.5A2.5 2.5 0 0 0 14 5a2.5 2.5 0 0 0-2.4 1.8A2.5 2.5 0 0 0 9 5a2.5 2.5 0 0 0-2.4 1.8A2 2 0 0 0 4 8.5c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2a2 2 0 0 0-2.5-1zm-11 5v7.5A1.5 1.5 0 0 0 7 21h8a1.5 1.5 0 0 0 1.5-1.5V12.5h-11zm13 1h-1.5v4.5H18.5a1.5 1.5 0 0 0 1.5-1.5v-1.5a1.5 1.5 0 0 0-1.5-1.5z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #F97316; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -42]
}) : null;

// 🏠 จุดหมายปลายทาง (Dropoff) - Icons.home_rounded | Emerald #10B981 (ขอบขาว)
const dropoffIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-dropoff-marker',
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

// 🚗 รถคนขับ (Driver) - Icons.directions_car_filled_rounded | Background White, Border & Icon dynamic according to statusUI color
const createDriverIcon = (currentStep?: number) => {
  let mainColor = '#2563EB' // Step 1 & 2: สีน้ำเงิน (กำลังไปรับ / รับงาน)
  if (currentStep === 2) {
    mainColor = '#D97706' // Step 3: สีส้มอำพัน (ถึงจุดนัดหมายแล้ว)
  } else if (currentStep === 3) {
    mainColor = '#2340A7' // Step 4: สีน้ำเงินเข้ม SafeSeat (กำลังเดินทางไปจุดหมาย)
  } else if (currentStep === 4) {
    mainColor = '#059669' // Step 5: สีเขียว (การเดินทางเสร็จสิ้น)
  }

  return typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-driver-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px;">
        <div style="background-color: #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid ${mainColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${mainColor}" width="22px" height="22px">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.51-.68.94-.68h9.56c.43 0 .8.28.94.68L19 11H5z"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${mainColor}; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -42]
  }) : null
}

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

      const paddedBounds = bounds.pad(0.3) 
      map.setMaxBounds(paddedBounds)
      
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

function getHaversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 1.25 * 10) / 10
}

async function fetchOSRMRoute(waypoints: string): Promise<{ coords: [number, number][]; distanceKm?: number }> {
  const endpoints = [
    `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number])
          const distanceKm = data.routes[0].distance ? data.routes[0].distance / 1000 : undefined
          return { coords, distanceKm }
        }
      }
    } catch (e) {
      console.warn('[RouteMap Warning] OSRM fetch failed on endpoint:', url, e)
    }
  }
  return { coords: [] }
}

interface RouteMapProps {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  driverLat?: number
  driverLng?: number
  currentStep?: number
  distance?: number
}

export default function RouteMap({ pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, currentStep, distance }: RouteMapProps) {
  const [mainRouteCoords, setMainRouteCoords] = useState<[number, number][]>([])
  const [driverRouteCoords, setDriverRouteCoords] = useState<[number, number][]>([])
  const [osrmDistance, setOsrmDistance] = useState<number | null>(null)

  const defaultCenter: [number, number] = [
    (pickupLat + dropoffLat) / 2,
    (pickupLng + dropoffLng) / 2,
  ]

  useEffect(() => {
    let active = true

    const loadRoutes = async () => {
      const mainWaypoints = `${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`
      const { coords: mainCoords, distanceKm } = await fetchOSRMRoute(mainWaypoints)

      if (active) {
        if (distanceKm) setOsrmDistance(distanceKm)
        if (mainCoords.length > 0) {
          setMainRouteCoords(mainCoords)
        } else {
          setMainRouteCoords([[pickupLat, pickupLng], [dropoffLat, dropoffLng]])
        }
      }

      if (driverLat && driverLng) {
        let driverWaypoints = ''
        if (currentStep === 1) {
          driverWaypoints = `${driverLng},${driverLat};${pickupLng},${pickupLat}`
        } else if (currentStep === 3 || currentStep === 4) {
          driverWaypoints = `${driverLng},${driverLat};${dropoffLng},${dropoffLat}`
        } else {
          driverWaypoints = `${driverLng},${driverLat};${pickupLng},${pickupLat}`
        }

        const { coords: drvCoords } = await fetchOSRMRoute(driverWaypoints)
        if (active) {
          if (drvCoords.length > 0) {
            setDriverRouteCoords(drvCoords)
          } else {
            setDriverRouteCoords([[driverLat, driverLng], currentStep === 3 ? [dropoffLat, dropoffLng] : [pickupLat, pickupLng]])
          }
        }
      } else {
        if (active) setDriverRouteCoords([])
      }
    }

    loadRoutes()
    return () => {
      active = false
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, currentStep])

  const allPositions = [
    ...mainRouteCoords,
    ...driverRouteCoords,
    [pickupLat, pickupLng] as [number, number],
    [dropoffLat, dropoffLng] as [number, number],
    ...(driverLat && driverLng ? [[driverLat, driverLng] as [number, number]] : [])
  ]

  const dynamicDriverIcon = createDriverIcon(currentStep)

  // Calculate final distance in KM (prop > osrm > haversine)
  const displayDistance = distance && distance > 0 
    ? distance 
    : osrmDistance && osrmDistance > 0 
      ? osrmDistance 
      : getHaversineDistKm(pickupLat, pickupLng, dropoffLat, dropoffLng)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 250, borderRadius: 16, overflow: 'hidden' }}>
      
      {/* 🛣️ ระยะทางการเดินทางแสดงตลอดเวลาบนแผนที่ */}
      <div 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#2340A7',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          pointerEvents: 'none'
        }}
      >
        <span>🛣️ ระยะทางประมาณ:</span>
        <span style={{ fontWeight: 800 }}>
          {displayDistance ? `${displayDistance.toFixed(2)} กม.` : 'กำลังคำนวณ...'}
        </span>
      </div>

      <MapContainer center={defaultCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        {/* 🍺 จุดรับ (Pickup) */}
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon || undefined} />

        {/* 🏠 จุดหมายปลายทาง (Dropoff) */}
        <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon || undefined} />

        {/* 🚗 รถคนขับ (Driver) */}
        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={dynamicDriverIcon || undefined} />
        )}

        {/* เส้นทางหลัก */}
        {mainRouteCoords.length > 0 && (
          <Polyline
            positions={mainRouteCoords}
            color="#2340A7"
            weight={5}
            opacity={0.85}
          />
        )}

        {/* เส้นทางคนขับ */}
        {driverRouteCoords.length > 0 && (
          <Polyline
            positions={driverRouteCoords}
            color="#2563EB"
            weight={5}
            dashArray="8, 8"
          />
        )}

        {allPositions.length > 0 && (
          <AutoFitBounds positions={allPositions} driverLat={driverLat} driverLng={driverLng} />
        )}
      </MapContainer>
    </div>
  )
}
