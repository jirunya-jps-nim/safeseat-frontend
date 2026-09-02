'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useTheme } from '../ThemeContext'

// 🍺 จุดรับ (Pickup): Top One แม่โจ้ - Amber/Orange #F97316
const pickupIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <div style="background-color: #F97316; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="22px" height="22px">
          <path d="M16.5 7.5A2.5 2.5 0 0 0 14 5a2.5 2.5 0 0 0-2.4 1.8A2.5 2.5 0 0 0 9 5a2.5 2.5 0 0 0-2.4 1.8A2 2 0 0 0 4 8.5c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2a2 2 0 0 0-2.5-1zm-11 5v7.5A1.5 1.5 0 0 0 7 21h8a1.5 1.5 0 0 0 1.5-1.5V12.5h-11zm13 1h-1.5v4.5H18.5a1.5 1.5 0 0 0 1.5-1.5v-1.5a1.5 1.5 0 0 0-1.5-1.5z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #F97316; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -42]
}) : null;

// 🏠 จุดส่ง (Dropoff): Diya Valley Foresta - Emerald #10B981
const dropoffIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-dropoff-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <div style="background-color: #10B981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="22px" height="22px">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #10B981; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -42]
}) : null;

// 🚗 รถคนขับ (Driver): หน้ามอแม่โจ้ - White with #2340A7 border
const driverIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 48px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
      <div style="background-color: #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #2340A7;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2340A7" width="22px" height="22px">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.51-.68.94-.68h9.56c.43 0 .8.28.94.68L19 11H5z"/>
        </svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2340A7; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -42]
}) : null;

// 1. จุดรับ: Top One แม่โจ้
const TOP_ONE_PICKUP: [number, number] = [18.8932, 99.0148]

// 2. รถคนขับ: หน้ามหาวิทยาลัยแม่โจ้
const DRIVER_MAEJO_FRONT: [number, number] = [18.8965, 99.0138]

// 3. จุดส่ง: Diya Valley Foresta
const DIYA_VALLEY_DROPOFF: [number, number] = [18.8765, 99.0128]

// ดึงเส้นทางถนนจริง OSRM
async function fetchOSRMRoute(waypoints: string): Promise<[number, number][]> {
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
          return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number])
        }
      }
    } catch (e) {
      console.warn('[ChiangMaiHeroMap Warning] OSRM fetch failed on endpoint:', url, e)
    }
  }
  return []
}

// ตัวจัดการจำกัดขอบเขตการซูมและเลื่อนแผนที่เฉพาะพื้นที่ที่ปักตำแหน่งเท่านั้น
function StrictBoundedMapHelper({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    const lockBounds = () => {
      if (!map || !positions || positions.length === 0) return
      map.invalidateSize()
      
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [35, 35], animate: false })

      // จำกัดกรอบการเลื่อน (maxBounds) ล็อคแน่น 100% ไม่ให้เลื่อนหลุดออกนอกพื้นที่
      const paddedBounds = bounds.pad(0.18)
      map.setMaxBounds(paddedBounds)

      // จำกัดระดับการซูม (minZoom และ maxZoom) เฉพาะบริเวณทริปนี้เท่านั้น
      const optimalZoom = map.getBoundsZoom(bounds)
      map.setMinZoom(Math.max(optimalZoom - 1, 13))
      map.setMaxZoom(17)
    }

    lockBounds()
    const t1 = setTimeout(lockBounds, 150)
    const t2 = setTimeout(lockBounds, 400)
    const t3 = setTimeout(lockBounds, 900)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      map.setMaxBounds(undefined)
    }
  }, [map, positions])

  return null
}

export default function ChiangMaiHeroMap() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [mounted, setMounted] = useState(false)
  
  // เส้นทางหลัก: Top One แม่โจ้ ➔ Diya Valley Foresta
  const [mainRoute, setMainRoute] = useState<[number, number][]>([])
  
  // เส้นทางคนขับ: หน้ามอแม่โจ้ ➔ Top One แม่โจ้
  const [driverRoute, setDriverRoute] = useState<[number, number][]>([])

  useEffect(() => {
    setMounted(true)
    const loadRoutes = async () => {
      // 1. เส้นทางหลัก: Top One -> Diya Valley
      const mainWaypoints = `${TOP_ONE_PICKUP[1]},${TOP_ONE_PICKUP[0]};${DIYA_VALLEY_DROPOFF[1]},${DIYA_VALLEY_DROPOFF[0]}`
      const mainCoords = await fetchOSRMRoute(mainWaypoints)
      if (mainCoords.length > 0) {
        setMainRoute(mainCoords)
      } else {
        setMainRoute([TOP_ONE_PICKUP, [18.8850, 99.0135], DIYA_VALLEY_DROPOFF])
      }

      // 2. เส้นทางคนขับ: หน้ามอแม่โจ้ -> Top One
      const driverWaypoints = `${DRIVER_MAEJO_FRONT[1]},${DRIVER_MAEJO_FRONT[0]};${TOP_ONE_PICKUP[1]},${TOP_ONE_PICKUP[0]}`
      const drvCoords = await fetchOSRMRoute(driverWaypoints)
      if (drvCoords.length > 0) {
        setDriverRoute(drvCoords)
      } else {
        setDriverRoute([DRIVER_MAEJO_FRONT, TOP_ONE_PICKUP])
      }
    }
    loadRoutes()
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[440px] rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400">กำลังโหลดแผนที่...</span>
      </div>
    )
  }

  const allPositions = [
    ...mainRoute,
    ...driverRoute,
    TOP_ONE_PICKUP,
    DRIVER_MAEJO_FRONT,
    DIYA_VALLEY_DROPOFF
  ]

  return (
    <div className={`w-full h-full min-h-[440px] rounded-3xl overflow-hidden relative border shadow-2xl transition-all duration-300 ${
      isDark 
        ? 'bg-[#0B132B] border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.7)]' 
        : 'bg-white border-slate-200/90 shadow-[0_15px_45px_rgba(35,64,167,0.14)]'
    }`}>
      
      {/* Real Leaflet Map Container (Strictly Bounded Zoom & Pan) */}
      <div className="w-full h-full min-h-[440px] relative z-0">
        <MapContainer
          center={[18.8850, 99.0138]}
          zoom={14}
          minZoom={13}
          maxZoom={17}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%', minHeight: '440px', zIndex: 0 }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Tile Layer */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />

          {/* ล็อคการซูมและเลื่อนให้อยู่เฉพาะพื้นที่ที่ปักหมุดเท่านั้น */}
          <StrictBoundedMapHelper positions={allPositions} />

          {/* 1. เส้นทางหลัก: Top One แม่โจ้ ➔ Diya Valley Foresta */}
          {mainRoute.length > 0 && (
            <Polyline
              positions={mainRoute}
              pathOptions={{
                color: '#2340A7',
                weight: 6,
                opacity: 0.95
              }}
            />
          )}

          {/* 2. เส้นทางคนขับ: หน้ามอแม่โจ้ ➔ Top One แม่โจ้ */}
          {driverRoute.length > 0 && (
            <Polyline
              positions={driverRoute}
              pathOptions={{
                color: '#2563EB',
                weight: 5,
                dashArray: '8, 8',
                opacity: 0.9
              }}
            />
          )}

          {/* 🍺 จุดรับ (Pickup): Top One แม่โจ้ */}
          {pickupIcon && (
            <Marker position={TOP_ONE_PICKUP} icon={pickupIcon}>
              <Popup autoPan={false}>
                <div className="p-1 min-w-[170px] text-slate-900">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-black text-[#F97316]">🍺 จุดรับ: Top One แม่โจ้</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">ย่านแม่โจ้ เชียงใหม่</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">⏰ SafeSeat พร้อมบริการ 24 ชม.</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🚗 รถคนขับ (Driver): หน้ามอแม่โจ้ */}
          {driverIcon && (
            <Marker position={DRIVER_MAEJO_FRONT} icon={driverIcon}>
              <Popup autoPan={false}>
                <div className="p-1 min-w-[170px] text-slate-900">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-black text-[#2340A7]">🚗 คนขับ SafeSeat</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">หน้ามหาวิทยาลัยแม่โจ้</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-1">⭐️ กำลังมุ่งหน้าไปรับคุณ</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🏠 จุดส่ง (Dropoff): Diya Valley Foresta */}
          {dropoffIcon && (
            <Marker position={DIYA_VALLEY_DROPOFF} icon={dropoffIcon}>
              <Popup autoPan={false}>
                <div className="p-1 min-w-[170px] text-slate-900">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-black text-[#10B981]">🏠 จุดส่ง: Diya Valley Foresta</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">สันทราย - แม่โจ้ เชียงใหม่</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">✅ ถึงที่หมายอย่างปลอดภัย</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

    </div>
  )
}
