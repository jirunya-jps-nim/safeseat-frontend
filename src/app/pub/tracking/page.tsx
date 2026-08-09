'use client'

// ═══════════════════════════════════════════════════════════════
// app/pub/tracking/page.tsx — Realtime Tracking (Royal Purple-Blue)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Car, Phone, Copy, Check, Clock, ShieldCheck, MapPin, RefreshCw, AlertCircle } from 'lucide-react'

const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

const decodeId = (input: string) => {
  const clean = input.replace('#', '').trim();
  if (!clean) return null;
  if (/^\d+$/.test(clean) && clean.length < 6) {
    return parseInt(clean, 10);
  }
  const offset = 100000000;
  const num = parseInt(clean.toLowerCase(), 36);
  if (isNaN(num)) return null;
  const decoded = num - offset;
  return decoded > 0 ? decoded : null;
};

function TrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackingParam = searchParams.get('id')
  const requestId = (() => {
    if (!trackingParam) return null;
    if (/^\d+$/.test(trackingParam)) {
      return parseInt(trackingParam, 10);
    }
    return decodeId(trackingParam);
  })();
  const alphaCode = requestId ? String(requestId) : ''

  const [reqData, setReqData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState('')
  const [isPubLoggedIn, setIsPubLoggedIn] = useState(false)
  const [isRequestTimeout, setIsRequestTimeout] = useState(false)

  useEffect(() => {
    if (!reqData || reqData.requeststatus !== 'รอคนขับ') {
      setIsRequestTimeout(false)
      return
    }
    const checkTimeout = () => {
      const createdTime = new Date(reqData.reqdatetime).getTime()
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
      setIsPubLoggedIn(!!localStorage.getItem('pub_user'))
      localStorage.removeItem('safeseat_request_form')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && trackingParam) {
      setTrackingUrl(`${window.location.origin}/tracking?id=${trackingParam}`)
    }
  }, [trackingParam])

  const fetchRequestData = async () => {
    if (!requestId) return
    try {
      const res = await api.get(`/pub/service-request/${requestId}`)
      if (res.data.success) {
        setReqData(res.data.data)
      } else {
        setError(res.data.message || 'ไม่พบข้อมูลการบริการ')
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
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin mb-3" />
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
            className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md cursor-pointer"
          >
            {isPubLoggedIn ? 'กลับ Dashboard' : 'กลับหน้าแรก'}
          </button>
        </div>
      </div>
    )
  }

  const {
    custname, phoneno,
    pickuplatitude, pickuplongitude,
    dropofflatitude, dropofflongitude,
    requeststatus, reqdistance, requestfee,
    requiredcartype, paymentmethod
  } = reqData

  const carTypeLabel = requiredcartype === 1 ? 'EV' : (requiredcartype === 2 ? 'Manual' : 'Auto')
  const payLabel = paymentmethod === 1 ? 'เงินสด' : 'โอนเงิน / PromptPay'

  const currentStep = (requeststatus === 'กำลังไปรับ') ? 1
                    : (requeststatus === 'ถึงจุดรับแล้ว') ? 2
                    : (requeststatus === 'ระหว่างเดินทาง') ? 3
                    : (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') ? 4
                    : 0;

  let displayStatus = requeststatus
  if (requeststatus === 'รอคนขับ') displayStatus = 'รอคนขับตอบรับงาน...'
  else if (requeststatus === 'กำลังไปรับ') displayStatus = 'กำลังรอคนขับเดินทางมาหา'
  else if (requeststatus === 'ถึงจุดรับแล้ว') displayStatus = 'คนขับถึงจุดรับแล้ว (กำลังออกเดินทาง)'
  else if (requeststatus === 'ระหว่างเดินทาง') displayStatus = 'กำลังเดินทางไปยังจุดหมายปลายทาง'
  else if (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') displayStatus = 'เสร็จสิ้นการบริการ (ถึงที่หมายเรียบร้อย)'

  const driver1Name = reqData.leader 
    ? `${reqData.leader.firstname} ${reqData.leader.lastname}`
    : 'ผู้ให้บริการ SafeSeat'
  const driver2Name = reqData.follower
    ? `${reqData.follower.firstname} ${reqData.follower.lastname}`
    : 'ผู้ช่วยคนขับ SafeSeat'

  let driverLat: number | undefined = undefined
  let driverLng: number | undefined = undefined
  if (currentStep === 1) {
    driverLat = pickuplatitude + 0.003
    driverLng = pickuplongitude - 0.003
  } else if (currentStep === 2) {
    driverLat = pickuplatitude
    driverLng = pickuplongitude
  } else if (currentStep === 3) {
    driverLat = (pickuplatitude + dropofflatitude) / 2
    driverLng = (pickuplongitude + dropofflongitude) / 2
  } else if (currentStep === 4) {
    driverLat = dropofflatitude
    driverLng = dropofflongitude
  }

  const isCompleted = requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed'

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {/* Map Section */}
        <div className="h-96 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl">
          <RouteMap 
            pickupLat={pickuplatitude} pickupLng={pickuplongitude} 
            dropoffLat={dropofflatitude} dropoffLng={dropofflongitude} 
            driverLat={driverLat} driverLng={driverLng}
            currentStep={currentStep}
          />
          <div className="absolute left-4 bottom-4 z-20 bg-[var(--color-card)]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold shadow-lg">
            <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">สถานะปัจจุบัน</span>
            <span className={`text-sm font-manrope font-bold flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-[#7C3AED]'}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-[var(--color-border)] pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">รหัสการบริการ</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">#{alphaCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ชื่อลูกค้า</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{custname}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ระยะทาง</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{reqdistance ? `${reqdistance.toFixed(2)} กม.` : '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ค่าบริการ</span>
              <span className="text-base font-extrabold font-manrope text-[#7C3AED]">฿{requestfee || '-'} ({payLabel})</span>
            </div>
          </div>

          {/* Copy Share Link Button */}
          {trackingUrl && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                className={`py-2.5 px-6 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'คัดลอกลิงก์สำเร็จ!' : '📋 คัดลอกลิงก์ติดตามส่งให้ลูกค้า'}
              </button>
            </div>
          )}

          {/* Details Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left: Driver Details */}
            <div className="md:col-span-8 flex flex-col gap-4">
              <h3 className="text-xl font-bold font-manrope text-[var(--color-text)]">ข้อมูลทีมพนักงานขับรถสำรอง</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#7C3AED]/15 rounded-xl text-[#7C3AED]">👨‍✈️</div>
                    <div>
                      <div className="text-xs font-bold text-[var(--color-text)]">{driver1Name}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{reqData.leader?.phone_no || reqData.leader?.phoneno || 'คนขับรถ'}</div>
                    </div>
                  </div>
                  {(reqData.leader?.phone_no || reqData.leader?.phoneno) && (
                    <a href={`tel:${reqData.leader?.phone_no || reqData.leader?.phoneno}`} className="p-2 bg-[#7C3AED] text-white rounded-lg shadow-md">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/15 rounded-xl text-blue-500">👩‍✈️</div>
                    <div>
                      <div className="text-xs font-bold text-[var(--color-text)]">{driver2Name}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{reqData.follower?.phone_no || reqData.follower?.phoneno || 'ผู้ช่วยคนขับ'}</div>
                    </div>
                  </div>
                  {(reqData.follower?.phone_no || reqData.follower?.phoneno) && (
                    <a href={`tel:${reqData.follower?.phone_no || reqData.follower?.phoneno}`} className="p-2 bg-emerald-500 text-white rounded-lg shadow-md">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="md:col-span-4 flex flex-col justify-between p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-center">
              <div>
                <Clock className="w-8 h-8 text-[#7C3AED] mx-auto mb-2" />
                <div className="text-sm font-bold text-[var(--color-text)]">การคุ้มครองสวัสดิภาพ 24 ชม.</div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">รับประกันภัยความคุ้มครองยานพาหนะระหว่างการเดินทาง</p>
              </div>
              <button 
                onClick={goBack}
                className="mt-4 w-full py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] hover:border-[#7C3AED] transition-colors cursor-pointer"
              >
                {isPubLoggedIn ? 'กลับ Dashboard ร้านค้า' : 'กลับหน้าหลัก'}
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PubTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
