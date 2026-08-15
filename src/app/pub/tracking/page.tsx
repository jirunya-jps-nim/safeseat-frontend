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
import { Car, Phone, Copy, Check, Clock, ShieldCheck, MapPin, RefreshCw, AlertCircle, QrCode } from 'lucide-react'

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
      if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
        // เมื่อมีการเปลี่ยนสถานะ ให้รีเฟรชหน้าจอทันทีเพื่ออัปเดตสถานะการทำงานสดใหม่
        window.location.reload()
        return
      }
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
        router.push('/pub/request-driver?step=1')
      }
    }
  }, [reqData, router])

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

  // Real-time GPS tracking from driver team
  const realLat = reqData.buddyteam?.currentloclat
  const realLng = reqData.buddyteam?.currentloclng
  const hasRealGps = realLat && realLng && Number(realLat) !== 0 && Number(realLng) !== 0

  let driverLat: number | undefined = undefined
  let driverLng: number | undefined = undefined

  if (currentStep === 2) {
    // 📍 ถึงจุดรับ/ร้านค้าแล้ว -> ปักหมุดคนขับที่ตำแหน่งร้านค้า/จุดรับทันที
    driverLat = pickuplatitude
    driverLng = pickuplongitude
  } else if (currentStep === 4) {
    // 🏁 ถึงจุดหมายปลายทางแล้ว -> ปักหมุดคนขับที่ตำแหน่งจุดส่งทันที
    driverLat = dropofflatitude
    driverLng = dropofflongitude
  } else if (hasRealGps) {
    // 🛰️ ใช้พิกัด GPS จริงจากคนขับตามเรียลไทม์ระหว่างเดินทาง
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
          
          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-3 pb-6 border-b border-[var(--color-border)]">
            {stepsList.map(s => {
              const active = currentStep >= s.step
              return (
                <div key={s.step} className="flex flex-col items-center gap-2">
                  <div className={`w-full h-2.5 rounded-full transition-all ${
                    active ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] shadow-sm' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                  }`} />
                  <span className={`text-[11px] font-bold text-center ${active ? 'text-[#7C3AED]' : 'text-[var(--color-text-muted)]'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>

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

          {/* Partner Pub Info Section */}
          {(reqData?.pub_id || reqData?.pub) && (
            <div className="p-5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl text-xl font-bold">
                  🏪
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ร้านค้า / ผับผู้เรียกใช้บริการ</span>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    {reqData?.pub?.pubname || reqData?.pub_id || 'ร้านค้าพาร์ทเนอร์ SafeSeat'}
                  </div>
                  {reqData?.pub?.pubemail && (
                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
                      {reqData.pub.pubemail}
                    </div>
                  )}
                </div>
              </div>

              {reqData?.pub?.pubphone && (
                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-3 sm:pt-0 sm:pl-6">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">เบอร์โทรศัพท์ร้านค้า</span>
                    <span className="text-xs font-bold font-mono text-[var(--color-text)]">{reqData.pub.pubphone}</span>
                  </div>
                  <a
                    href={`tel:${reqData.pub.pubphone}`}
                    className="ml-1 px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    📞 โทรออก
                  </a>
                </div>
              )}
            </div>
          )}
          {trackingUrl && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowQrModal(true)}
                className="py-2.5 px-6 rounded-full text-xs font-bold bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                📲 แสดง QR Code & ลิงก์ติดตามส่งให้ลูกค้า
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

      {/* ── QR CODE MODAL (ROOT LEVEL Z-99999 OVER EVERYTHING) ── */}
      {showQrModal && trackingUrl && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
          <div className="bg-[var(--color-card)] border border-[#7C3AED]/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-5 text-center relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold text-lg p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-[#7C3AED]/15 rounded-full flex items-center justify-center text-[#7C3AED] text-2xl">
              📲
            </div>

            <div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                QR Code ติดตามการเดินทาง
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium whitespace-nowrap overflow-x-auto px-2">
                ให้ลูกค้าใช้กล้องโทรศัพท์สแกน QR Code นี้เพื่อเปิดหน้าติดตามการเดินทางของคนขับได้ทันทีเรียลไทม์
              </p>
            </div>

            {/* QR Code Image */}
            <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-200 my-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingUrl)}`}
                alt="QR Code สำหรับติดตามการเดินทาง"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
              <span className="truncate text-[var(--color-text-muted)] text-[11px]">
                {trackingUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                className="px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-[#6D28D9] transition-colors cursor-pointer"
              >
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-full text-xs font-bold hover:bg-[var(--color-card)] transition-colors cursor-pointer"
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
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
