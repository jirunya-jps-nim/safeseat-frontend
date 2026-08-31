'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Car, Phone, Copy, Check, Clock, ShieldCheck, MapPin, RefreshCw, AlertCircle, QrCode, UserCheck, PhoneCall } from 'lucide-react'

const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

const decodeId = (input: string) => {
  const clean = input.replace('#', '').trim().toLowerCase();
  if (!clean) return null;
  if (clean.startsWith('p') || clean.startsWith('u')) {
    const num = parseInt(clean.substring(1), 10);
    if (!isNaN(num)) return num;
  }
  const num = parseInt(clean, 10);
  if (!isNaN(num)) return num;
  return null;
};

function parseThaiDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const s = String(dateStr).trim()
  const cleanStr = s.replace(/Z$/i, '')
  const isoWithTz = cleanStr.includes('T')
    ? `${cleanStr.split('+')[0]}+07:00`
    : `${cleanStr.replace(' ', 'T').split('+')[0]}+07:00`
  const d = new Date(isoWithTz)
  return isNaN(d.getTime()) ? new Date(dateStr) : d
}

function TrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackingParam = searchParams.get('id')
  const requestId = trackingParam ? decodeId(trackingParam) : null;
  const alphaCode = trackingParam || ''

  const [reqData, setReqData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const prevStatusRef = React.useRef<string | null>(null)

  const [dropoffAddress, setDropoffAddress] = useState<string>('')
  const [pickupAddress, setPickupAddress] = useState<string>('')

  useEffect(() => {
    if (!reqData) return
    const { requestid, note, dropoffname, destination_name, pickuplatitude, pickuplongitude, dropofflatitude, dropofflongitude } = reqData

    // 1. Priority 1: Direct backend dropoffname field
    if (dropoffname || destination_name) {
      setDropoffAddress(dropoffname || destination_name)
      return
    }

    // 2. Priority 2: Parse [DEST:...] from note column
    if (note && note.includes('[DEST:')) {
      const match = note.match(/\[DEST:(.*?)\]/)
      if (match && match[1] && match[1].trim()) {
        setDropoffAddress(match[1].trim())
        return
      }
    }

    // 3. Priority 3: Local storage pinned label
    if (requestid) {
      try {
        const localSavedName = localStorage.getItem(`safeseat_dest_name_${requestid}`)
        if (localSavedName && localSavedName.trim()) {
          setDropoffAddress(localSavedName.trim())
          return
        }
      } catch (e) {}
    }

    // 4. Priority 4: Reverse geocoding fetch
    if (dropofflatitude && dropofflongitude) {
      let active = true
      const fetchDestName = async () => {
        // 1. Nominatim API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${dropofflatitude}&lon=${dropofflongitude}&format=json&accept-language=th`)
          if (res.ok) {
            const data = await res.json()
            if (active && data) {
              const nameCandidate = data.name || data.address?.tourism || data.address?.building || data.address?.amenity || data.address?.shop || data.address?.road || data.address?.suburb || data.address?.city || data.display_name?.split(',')[0]
              if (nameCandidate && nameCandidate.trim()) {
                const district = data.address?.city || data.address?.suburb || data.address?.province || ''
                const fullName = district && !nameCandidate.includes(district) ? `${nameCandidate.trim()}, ${district}` : nameCandidate.trim()
                setDropoffAddress(fullName)
                return
              }
            }
          }
        } catch (e) {}

        // 2. Photon API
        try {
          const pRes = await fetch(`https://photon.komoot.io/reverse?lat=${dropofflatitude}&lon=${dropofflongitude}&lang=th`)
          if (pRes.ok) {
            const pData = await pRes.json()
            if (active && pData?.features?.[0]?.properties) {
              const prop = pData.features[0].properties
              const nameCandidate = prop.name || prop.street || prop.district || prop.city
              if (nameCandidate && nameCandidate.trim()) {
                const cityStr = prop.city || prop.district || ''
                const fullName = cityStr && !nameCandidate.includes(cityStr) ? `${nameCandidate.trim()}, ${cityStr}` : nameCandidate.trim()
                setDropoffAddress(fullName)
                return
              }
            }
          }
        } catch (e) {}

        // 3. BigDataCloud API
        try {
          const bRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${dropofflatitude}&longitude=${dropofflongitude}&localityLanguage=th`)
          if (bRes.ok) {
            const bData = await bRes.json()
            if (active && bData) {
              const locName = bData.locality || bData.city || bData.principalSubdivision
              if (locName) {
                setDropoffAddress(`${locName}, ${bData.principalSubdivision || ''}`.replace(/,\s*$/, ''))
                return
              }
            }
          }
        } catch (e) {}

        // 4. Default Place Name Fallback
        if (active) {
          setDropoffAddress('เชียงใหม่ (จุดหมายปลายทาง)')
        }
      }

      fetchDestName()
      return () => { active = false }
    }
  }, [reqData])

  const fetchRequestData = async () => {
    if (!requestId) return
    try {
      const res = await api.get(`/pub/service-request/${requestId}?type=pub`)
      if (res.status === 200 && res.data?.success && res.data?.data) {
        if (res.data.data.requestType === 'user') {
          router.push(`/trip?id=U${requestId}`)
          return
        }
        setReqData(res.data.data)
      } else {
        setError('ไม่พบข้อมูลการเรียกรถ หรือรหัสไม่ถูกต้อง')
      }
    } catch (err: any) {
      console.error('Fetch tracking error:', err)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล หรือไม่มีรหัสการเดินทางนี้ในระบบ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      setError('กรุณาระบุรหัสการเดินทางที่ต้องการติดตาม เช่น /tracking?id=P1')
      return
    }

    fetchRequestData()
    const interval = setInterval(fetchRequestData, 2000)
    return () => clearInterval(interval)
  }, [requestId])

  if (loading) {
    return (
      <div className="selection-purple min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-10 h-10 text-[#2340A7] animate-spin mb-4" />
        <p className="text-sm font-bold text-[var(--color-text-muted)] animate-pulse">กำลังโหลดข้อมูลสถานะการเดินทาง SafeSeat...</p>
      </div>
    )
  }

  if (error || !reqData) {
    return (
      <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl mb-6 shadow-xl">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold font-manrope mb-3 text-[var(--color-text)]">ไม่พบข้อมูลการบริการ</h1>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-8 leading-relaxed font-medium">
          {error || 'รหัสการติดตามนี้ไม่มีอยู่ในระบบ หรือสิ้นสุดการให้บริการเรียบร้อยแล้ว'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-sm shadow-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    )
  }

  const {
    custname = 'ผู้ใช้บริการทั่วไป',
    phoneno,
    phoneemer,
    pickuplatitude,
    pickuplongitude,
    dropofflatitude,
    dropofflongitude,
    reqdistance,
    requestfee,
    paymentmethod,
    requeststatus,
    cartype,
    carmodel,
  } = reqData

  const payLabel = paymentmethod === 1 ? 'เงินสด' : paymentmethod === 2 ? 'โอนเงิน (พร้อมเพย์)' : 'ไม่ระบุ'

  const getStep = (s?: string) => {
    if (!s) return 0
    const str = s.toLowerCase().trim()
    if (['accepted', 'คนขับรับงาน', 'กำลังไปรับ', 'รับงานแล้ว', 'คนขับรับงานแล้ว', 'matched'].includes(str) || str.includes('กำลังไปรับ') || str.includes('accepted') || str.includes('คนขับรับงาน') || str.includes('รับงาน')) return 1
    if (['ถึงจุดรับแล้ว', 'ถึงจุดรับ', 'ถึงจุดนัดหมาย', 'arrived'].includes(str) || str.includes('ถึงจุดรับ') || str.includes('ถึงจุดนัดหมาย') || str.includes('arrived')) return 2
    if (['ระหว่างเดินทาง', 'กำลังเดินทาง', 'in_transit', 'driving', 'in_progress'].includes(str) || str.includes('ระหว่างเดินทาง') || str.includes('กำลังเดินทาง') || str.includes('เดินทาง')) return 3
    if (['เสร็จสิ้น', 'completed', 'ถึงจุดหมายปลายทาง', 'finished', 'done', 'success'].includes(str) || str.includes('เสร็จสิ้น') || str.includes('completed') || str.includes('ถึงจุดหมาย')) return 4
    if (['cancelled', 'ยกเลิก', 'ปฏิเสธ', 'rejected', 'cancel'].includes(str) || str.includes('ยกเลิก') || str.includes('ปฏิเสธ') || str.includes('cancel')) return -1
    return 0
  }

  const currentStep = getStep(requeststatus)

  let displayStatus = 'กำลังค้นหาคนขับ'
  let statusBadgeBg = 'bg-slate-500/10 border-slate-500/30 text-slate-400'

  if (currentStep === 1) {
    displayStatus = 'คนขับรับงานแล้ว (กำลังเดินทางไปรับ)'
    statusBadgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-500'
  } else if (currentStep === 2) {
    displayStatus = 'คนขับถึงจุดรับแล้ว'
    statusBadgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-500'
  } else if (currentStep === 3) {
    displayStatus = 'กำลังเดินทางไปส่ง'
    statusBadgeBg = 'bg-purple-500/10 border-purple-500/30 text-purple-400'
  } else if (currentStep === 4) {
    displayStatus = 'การเดินทางเสร็จสิ้น'
    statusBadgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
  } else if (currentStep === -1) {
    displayStatus = 'การเดินทางถูกยกเลิก'
    statusBadgeBg = 'bg-red-500/10 border-red-500/30 text-red-500'
  } else {
    displayStatus = 'กำลังค้นหาคนขับ'
    statusBadgeBg = 'bg-slate-500/10 border-slate-500/30 text-slate-400'
  }

  const leader = reqData.leader || reqData.buddyteam?.leader
  const follower = reqData.follower || reqData.buddyteam?.follower

  const driver1Name = leader && (leader.firstname || leader.name) ? `คุณ${leader.firstname || leader.name} ${leader.lastname || ''}`.trim() : 'ผู้ให้บริการ SafeSeat'
  const driver1Phone = leader?.phone_no || leader?.phoneno || leader?.phone || reqData.leader_phone || ''
  const driver2Name = follower && (follower.firstname || follower.name) ? `คุณ${follower.firstname || follower.name} ${follower.lastname || ''}`.trim() : 'ผู้ช่วยคนขับ (บัดดี้)'
  const driver2Phone = follower?.phone_no || follower?.phoneno || follower?.phone || reqData.follower_phone || ''

  const realLat = reqData.buddyteam?.currentloclat
  const realLng = reqData.buddyteam?.currentloclng
  const hasRealGps = realLat && realLng && Number(realLat) !== 0 && Number(realLng) !== 0

  let driverLat: number | undefined = undefined
  let driverLng: number | undefined = undefined
  if (currentStep === 2) {
    driverLat = pickuplatitude
    driverLng = pickuplongitude
  } else if (currentStep === 4) {
    driverLat = dropofflatitude
    driverLng = dropofflongitude
  } else if (hasRealGps) {
    driverLat = Number(realLat)
    driverLng = Number(realLng)
  } else if (currentStep === 1) {
    driverLat = pickuplatitude ? pickuplatitude + 0.003 : undefined
    driverLng = pickuplongitude ? pickuplongitude - 0.003 : undefined
  } else if (currentStep === 3 && pickuplatitude && dropofflatitude) {
    driverLat = (pickuplatitude + dropofflatitude) / 2
    driverLng = (pickuplongitude + dropofflongitude) / 2
  }

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">TRACKING SERVICE</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">ติดตามสถานะการเดินทาง (Realtime Tracking)</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back()
                } else {
                  router.push('/')
                }
              }}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              ← ย้อนกลับ
            </button>
          </div>
        </div>

        <div>
          <div className={`p-4.5 rounded-2xl border flex items-center gap-4 shadow-md transition-all duration-300 ${
            currentStep === 1 ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
            currentStep === 2 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
            currentStep === 3 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
            currentStep === 4 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
            requeststatus?.includes('ยกเลิก') || requeststatus?.includes('cancelled') ? 'bg-red-500/10 border-red-500/30 text-red-500' :
            'bg-slate-500/10 border-slate-500/30 text-slate-400'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-current/15 flex items-center justify-center shrink-0 text-2xl">
              {currentStep === 1 && '🚘'}
              {currentStep === 2 && '📍'}
              {currentStep === 3 && '🚗'}
              {currentStep === 4 && '✅'}
              {requeststatus?.includes('ยกเลิก') || requeststatus?.includes('cancelled') ? '❌' : ''}
              {currentStep === 0 && !requeststatus?.includes('ยกเลิก') && '⏳'}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold font-manrope">
                {displayStatus}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                {currentStep === 1 && 'พนักงานขับรถรับงานเรียบร้อยแล้ว กำลังเดินทางไปรับผู้ใช้บริการ'}
                {currentStep === 2 && 'พนักงานขับรถถึงจุดรับผู้ใช้บริการแล้ว'}
                {currentStep === 3 && 'กำลังพาผู้ใช้บริการเดินทางไปยังจุดหมายปลายทางอย่างปลอดภัย'}
                {currentStep === 4 && 'ถึงจุดหมายปลายทางเรียบร้อยแล้ว'}
                {currentStep === -1 && 'รายการเรียกรถนี้ถูกยกเลิกแล้ว'}
                {currentStep === 0 && 'ระบบกำลังค้นหาพนักงานขับรถบริเวณใกล้เคียง กรุณารอสักครู่'}
              </span>
            </div>
          </div>
        </div>

        <div className="h-96 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl">
          <RouteMap 
            pickupLat={pickuplatitude} pickupLng={pickuplongitude} 
            dropoffLat={dropofflatitude} dropoffLng={dropofflongitude} 
            driverLat={driverLat} driverLng={driverLng}
            currentStep={currentStep}
            distance={reqdistance}
          />
        </div>

        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-[var(--color-border)] pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">รหัสการบริการ</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{reqData?.requestid || requestId || alphaCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ชื่อผู้ใช้บริการ</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{custname}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ระยะทาง</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{reqdistance ? `${reqdistance.toFixed(2)} กม.` : '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ค่าบริการ</span>
              <span className="text-base font-extrabold font-manrope text-[#2340A7]">฿{requestfee || '-'} ({payLabel})</span>
            </div>
          </div>

          {/* 📍 ตำแหน่งจุดรับเเละจุดหมายปลายทาง (Pickup & Destination) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[var(--color-border)] pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0 font-bold text-lg">
                📍
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">
                  จุดรับ (Pickup)
                </span>
                <span className="text-base font-extrabold text-[var(--color-text)] mt-0.5">
                  {reqData?.pub?.pubname || reqData?.pub_id || 'สถานบันเทิง (จุดรับ)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/15 text-red-500 shrink-0 font-bold text-lg">
                🏁
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                  จุดหมายปลายทาง (Destination)
                </span>
                <span className="text-base font-extrabold text-[var(--color-text)] mt-0.5">
                  {dropoffAddress || 'เชียงใหม่ (จุดหมายปลายทาง)'}
                </span>
              </div>
            </div>
          </div>

          {/* ข้อมูลสถานบันเทิงผู้เรียกใช้บริการ */}
          <div className="p-5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl text-xl font-bold">
                🏪
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">สถานบันเทิงผู้เรียกใช้บริการ</span>
                <div className="text-sm font-bold text-[var(--color-text)]">
                  {reqData?.pub?.pubname || reqData?.pub_id || 'สถานบันเทิงพาร์ทเนอร์ SafeSeat'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
                  {reqData?.pub?.pubemail || (reqData?.pub_id ? `${reqData.pub_id}@gmail.com` : 'pubemail@safeseat.com')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">เบอร์โทรศัพท์สถานบันเทิง</span>
                <span className="text-xs font-bold font-mono text-[var(--color-text)]">
                  {reqData?.pub?.pubphone || reqData?.pubphone || '0812345695'}
                </span>
              </div>
              <a
                href={`tel:${reqData?.pub?.pubphone || reqData?.pubphone || '0812345695'}`}
                className="ml-1 px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                📞 โทรออก
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold font-manrope text-[var(--color-text)] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2340A7]" /> ข้อมูลการติดต่อทีมงานคนขับ &amp; เบอร์ฉุกเฉิน
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#2340A7]/15 rounded-xl text-[#2340A7] text-xl">👨‍✈️</div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">คนขับหลัก (Driver 1)</span>
                    <div className="text-sm font-bold text-[var(--color-text)]">{driver1Name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 mt-1">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">เบอร์โทรติดต่อ</span>
                    <span className="text-xs font-bold font-mono text-[var(--color-text)]">{driver1Phone || 'ไม่ได้ระบุ'}</span>
                  </div>
                  {driver1Phone && (
                    <a 
                      href={`tel:${driver1Phone}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรหาคนขับ
                    </a>
                  )}
                </div>
              </div>

              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/15 rounded-xl text-blue-500 text-xl">👩‍✈️</div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ผู้ช่วยคนขับ (Driver 2)</span>
                    <div className="text-sm font-bold text-[var(--color-text)]">{driver2Name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 mt-1">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">เบอร์โทรติดต่อ</span>
                    <span className="text-xs font-bold font-mono text-[var(--color-text)]">{driver2Phone || 'ไม่ได้ระบุ'}</span>
                  </div>
                  {driver2Phone && (
                    <a 
                      href={`tel:${driver2Phone}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรหาบัดดี้
                    </a>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-500 text-xl">🚨</div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">เบอร์โทรฉุกเฉิน (Emergency Contact)</span>
                    <div className="text-sm font-bold text-[var(--color-text)]">{phoneemer || phoneno || 'ไม่ได้ระบุ'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-red-500/20 pt-3 mt-1">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">โทรแจ้งเหตุฉุกเฉิน</span>
                    <span className="text-xs font-bold font-mono text-red-400">{phoneemer || phoneno || '-'}</span>
                  </div>
                  {(phoneemer || phoneno) && (
                    <a 
                      href={`tel:${phoneemer || phoneno}`}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-red-700 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรเบอร์ฉุกเฉิน
                    </a>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
