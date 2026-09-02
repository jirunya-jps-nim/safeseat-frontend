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
  const [copied, setCopied] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState('')
  const [isPubLoggedIn, setIsPubLoggedIn] = useState(false)
  const [isRequestTimeout, setIsRequestTimeout] = useState(false)
  const prevStatusRef = React.useRef<string | null>(null)

  useEffect(() => {
    if (reqData && reqData.requeststatus) {
      const currentStatus = reqData.requeststatus
      prevStatusRef.current = currentStatus

      if (
        currentStatus === 'ปฏิเสธ' ||
        currentStatus === 'rejected' ||
        currentStatus === 'cancelled' ||
        currentStatus === 'ยกเลิก'
      ) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('safeseat_reject_notice', 'รายการเรียกรถถูกยกเลิกหรือปฏิเสธ กรุณาเริ่มเรียกรถใหม่อีกครั้ง')
        }
        router.push('/pub/dashboard')
      }
    }
  }, [reqData, router])

  useEffect(() => {
    if (!reqData || reqData.requeststatus !== 'รอคนขับ') {
      setIsRequestTimeout(false)
      return
    }
    const checkTimeout = () => {
      const createdTime = parseThaiDate(reqData.reqdatetime).getTime()
      const now = new Date().getTime()
      const elapsedSeconds = (now - createdTime) / 1000
      setIsRequestTimeout(elapsedSeconds >= 300)
    }
    checkTimeout()
    const timer = setInterval(checkTimeout, 1000)
    return () => clearInterval(timer)
  }, [reqData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('pub_user')
      setIsPubLoggedIn(!!userStr)
      if (userStr) {
        const parsed = JSON.parse(userStr)
        if (parsed.regisstatus !== 'approved' && parsed.regisstatus !== 'อนุมัติแล้ว') {
          router.push('/status')
          return
        }
      }
      localStorage.removeItem('safeseat_request_form')
    }
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined' && trackingParam) {
      setTrackingUrl(`${window.location.origin}/tracking?id=${trackingParam}`)
    }
  }, [trackingParam])

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
        setReqData(res.data.data)
        setError('')
      } else {
        setError(res.data?.message || 'ไม่พบข้อมูลการบริการ')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!requestId) {
      const isPub = typeof window !== 'undefined' && localStorage.getItem('pub_user')
      router.push(isPub ? '/pub/dashboard' : '/')
      return
    }
    fetchRequestData()
    const pollInterval = setInterval(fetchRequestData, 10000)
    return () => clearInterval(pollInterval)
  }, [requestId, router])

  const goBack = () => {
    if (isPubLoggedIn) router.push('/pub/dashboard')
    else router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin mb-3" />
        <p className="text-sm font-bold">กำลังโหลดข้อมูลการบริการ...</p>
      </div>
    )
  }

  if (error || !reqData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)] font-inter px-6">
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl text-center max-w-md shadow-xl flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold font-manrope text-red-500">เกิดข้อผิดพลาด</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{error}</p>
          <button 
            onClick={goBack}
            className="w-full py-3 bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md cursor-pointer"
            style={{ color: '#ffffff' }}
          >
            {isPubLoggedIn ? 'กลับ Dashboard' : 'กลับหน้าแรก'}
          </button>
        </div>
      </div>
    )
  }

  const {
    custname, phoneno, phoneemer,
    pickuplatitude, pickuplongitude,
    dropofflatitude, dropofflongitude,
    requeststatus, reqdistance, requestfee,
    requiredcartype, paymentmethod
  } = reqData

  const carTypeLabel = requiredcartype === 1 ? 'EV' : (requiredcartype === 2 ? 'Manual' : 'Auto')
  const payLabel = paymentmethod === 1 ? 'เงินสด' : 'โอนเงิน / PromptPay'

  const getStep = (s: string) => {
    if (!s) return 0
    const str = s.toLowerCase().trim()
    if (['accepted', 'คนขับรับงาน', 'กำลังไปรับ', 'รับงานแล้ว'].includes(str) || str.includes('กำลังไปรับ') || str.includes('accepted') || str.includes('คนขับรับงาน')) return 1
    if (['ถึงจุดรับแล้ว', 'ถึงจุดรับ', 'ถึงจุดนัดหมาย', 'arrived'].includes(str) || str.includes('ถึงจุดรับ') || str.includes('ถึงจุดนัดหมาย')) return 2
    if (['ระหว่างเดินทาง', 'กำลังเดินทาง', 'in_transit', 'driving'].includes(str) || str.includes('ระหว่างเดินทาง') || str.includes('กำลังเดินทาง')) return 3
    if (['เสร็จสิ้น', 'completed', 'ถึงจุดหมายปลายทาง', 'finished'].includes(str) || str.includes('เสร็จสิ้น') || str.includes('completed') || str.includes('ถึงจุดหมาย')) return 4
    if (['cancelled', 'ยกเลิก', 'ปฏิเสธ', 'rejected'].includes(str) || str.includes('ยกเลิก') || str.includes('ปฏิเสธ')) return -1
    return 0
  }

  const currentStep = getStep(requeststatus)

  let displayStatus = requeststatus
  if (currentStep === 1) displayStatus = 'คนขับรับงานแล้ว (กำลังเดินทางไปรับ)'
  else if (currentStep === 2) displayStatus = 'คนขับถึงจุดรับแล้ว (กำลังออกเดินทาง)'
  else if (currentStep === 3) displayStatus = 'กำลังเดินทางไปยังจุดหมายปลายทาง'
  else if (currentStep === 4) displayStatus = 'เสร็จสิ้นการบริการ (ถึงที่หมายเรียบร้อย)'
  else if (currentStep === -1) displayStatus = 'การเดินทางถูกยกเลิก'
  else displayStatus = 'กำลังค้นหาพนักงานขับรถ...'

  const leader = reqData.leader || reqData.buddyteam?.leader
  const follower = reqData.follower || reqData.buddyteam?.follower

  const driver1Name = leader && (leader.firstname || leader.name)
    ? `คุณ${leader.firstname || leader.name} ${leader.lastname || ''}`.trim()
    : 'ผู้ให้บริการ SafeSeat'
  const driver1Phone = leader?.phone_no || leader?.phoneno || leader?.phone || reqData.leader_phone || ''

  const driver2Name = follower && (follower.firstname || follower.name)
    ? `คุณ${follower.firstname || follower.name} ${follower.lastname || ''}`.trim()
    : 'ผู้ช่วยคนขับ SafeSeat (บัดดี้)'
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
    driverLat = pickuplatitude + 0.003
    driverLng = pickuplongitude - 0.003
  } else if (currentStep === 3) {
    driverLat = (pickuplatitude + dropofflatitude) / 2
    driverLng = (pickuplongitude + dropofflongitude) / 2
  }

  const isCompleted = requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed'

  const stepsList = [
    { label: 'คนขับรับงาน', step: 1 },
    { label: 'ถึงจุดรับ', step: 2 },
    { label: 'กำลังเดินทาง', step: 3 },
    { label: 'ถึงจุดหมายปลายทาง', step: 4 },
  ]

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">TRACKING SERVICE</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">ติดตามสถานะการเดินทาง (Realtime Tracking)</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/pub/dashboard')}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              ← ย้อนกลับ
            </button>
          </div>
        </div>

        {}
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
                {currentStep === 1 && 'คนขับรับงานแล้ว'}
                {currentStep === 2 && 'ถึงจุดรับแล้ว'}
                {currentStep === 3 && 'กำลังเดินทาง'}
                {currentStep === 4 && 'ถึงจุดหมายปลายทางแล้ว'}
                {requeststatus?.includes('ยกเลิก') || requeststatus?.includes('cancelled') ? 'การเดินทางถูกยกเลิก' : ''}
                {currentStep === 0 && !requeststatus?.includes('ยกเลิก') && 'กำลังค้นหาคนขับ...'}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                {currentStep === 1 && 'พนักงานขับรถรับงานเรียบร้อยแล้ว กำลังเดินทางไปรับผู้ใช้บริการที่จุดนัดหมาย'}
                {currentStep === 2 && 'พนักงานขับรถเดินทางมาถึงจุดรับผู้ใช้บริการเรียบร้อยแล้ว'}
                {currentStep === 3 && 'พนักงานขับรถกำลังพาผู้ใช้บริการเดินทางไปยังจุดหมายปลายทางอย่างปลอดภัย'}
                {currentStep === 4 && 'เดินทางถึงจุดหมายปลายทางเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ SafeSeat'}
                {requeststatus?.includes('ยกเลิก') || requeststatus?.includes('cancelled') ? 'รายการเรียกรถนี้ถูกยกเลิกแล้ว' : ''}
                {currentStep === 0 && !requeststatus?.includes('ยกเลิก') && 'ระบบกำลังค้นหาพนักงานขับรถบริเวณใกล้เคียง กรุณารอสักครู่'}
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="h-96 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl">
          <RouteMap 
            pickupLat={pickuplatitude} pickupLng={pickuplongitude} 
            dropoffLat={dropofflatitude} dropoffLng={dropofflongitude} 
            driverLat={driverLat} driverLng={driverLng}
            currentStep={currentStep}
            distance={reqdistance}
          />
        </div>

        {}
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-8">

          {}
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

          {}
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
          {/* 👥 ข้อมูลการติดต่อทีมงานคนขับ & เบอร์ฉุกเฉิน (Driver Team & Emergency Contact) */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold font-manrope text-[var(--color-text)] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2340A7]" /> ข้อมูลการติดต่อทีมงานคนขับ &amp; เบอร์ฉุกเฉิน
              </h3>
              {trackingUrl && (
                <button
                  onClick={() => setShowQrModal(true)}
                  className="py-2.5 px-6 rounded-full text-xs font-bold bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] !text-white transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                  style={{ color: '#ffffff' }}
                >
                  <QrCode className="w-4 h-4 !text-white" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>📲 แสดง QR Code &amp; ลิงก์ติดตามส่งให้ผู้ใช้บริการ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* คนขับหลัก */}
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
                      className="px-4 py-2 bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                      style={{ color: '#ffffff' }}
                    >
                      <PhoneCall className="w-3.5 h-3.5 !text-white" style={{ color: '#ffffff' }} /> <span style={{ color: '#ffffff' }}>โทรหาคนขับ</span>
                    </a>
                  )}
                </div>
              </div>

              {/* ผู้ช่วยคนขับ */}
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

              {/* เบอร์โทรฉุกเฉิน */}
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

      {}
      {showQrModal && trackingUrl && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={() => setShowQrModal(false)}>
          <div className="bg-[var(--color-card)] border border-[#2340A7]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl flex flex-col items-center gap-6 text-center relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold text-xl p-1.5 cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-[#2340A7]/15 rounded-full flex items-center justify-center text-[#2340A7] text-2xl shadow-inner">
              📲
            </div>

            <div className="max-w-xl mx-auto px-2">
              <h3 className="text-xl sm:text-2xl font-bold font-manrope text-[var(--color-text)]">
                QR Code ติดตามการเดินทาง
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2 font-medium leading-relaxed break-words">
                ให้ผู้ใช้บริการใช้กล้องโทรศัพท์สแกน QR Code นี้เพื่อเปิดหน้าติดตามการเดินทางของคนขับได้ทันทีเรียลไทม์
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-200 my-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingUrl)}`}
                alt="QR Code สำหรับติดตามการเดินทาง"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
              <span className="truncate text-[var(--color-text-muted)] text-[12px] select-all">
                {trackingUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                className="px-4 py-2 bg-[#2340A7] !text-white rounded-lg font-bold text-xs shrink-0 hover:bg-[#1D358F] transition-colors cursor-pointer shadow-sm"
                style={{ color: '#ffffff' }}
              >
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-full text-xs sm:text-sm font-bold hover:bg-[var(--color-card-hover)] transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PubTrackingPage() {
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
