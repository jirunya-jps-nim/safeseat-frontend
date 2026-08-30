'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'
import Footer from '@/components/ui/Footer'
import { PhoneCall, Copy, Check, RefreshCw, AlertCircle, UserCheck } from 'lucide-react'

const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

function TripTrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')

  const [reqData, setReqData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const prevStatusRef = React.useRef<string | null>(null)

  useEffect(() => {
    if (reqData && reqData.requeststatus) {
      prevStatusRef.current = reqData.requeststatus
    }
  }, [reqData])

  const getNumericId = (rawId: string | null) => {
    if (!rawId) return null;
    const clean = rawId.replace('#', '').trim().toLowerCase();
    if (clean.startsWith('u') || clean.startsWith('p')) {
      return clean.substring(1);
    }
    return clean;
  };

  const numericId = getNumericId(requestId);

  useEffect(() => {
    if (typeof window !== 'undefined' && requestId) {
      setShareUrl(`${window.location.origin}/trip?id=${requestId}`)
    }
  }, [requestId])

  const fetchTripData = async () => {
    if (!numericId) return
    try {
      const res = await api.get(`/user/request/${numericId}`)
      if (res.data && res.data.request) {
        setReqData(res.data.request)
        setError('')
      } else {
        setError('ไม่พบข้อมูลการเดินทางสำหรับรหัสนี้')
      }
    } catch (err: any) {
      console.error('Error fetching trip data:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลความคืบหน้า')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!numericId) {
      setError('กรุณาระบุรหัสการเดินทาง (id)')
      setLoading(false)
      return
    }
    fetchTripData()
    const pollInterval = setInterval(fetchTripData, 5000)
    return () => clearInterval(pollInterval)
  }, [requestId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin mb-3" />
        <p className="text-sm font-bold">กำลังโหลดข้อมูลความคืบหน้าการเดินทาง...</p>
      </div>
    )
  }

  if (error || !reqData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-[var(--color-text)] font-inter px-6">
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl text-center max-w-md shadow-xl flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold font-manrope text-red-500">ไม่พบข้อมูลการเดินทาง</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{error}</p>
        </div>
      </div>
    )
  }

  const {
    requestid,
    custname,
    phoneno,
    phoneemer,
    pickuplatitude,
    pickuplongitude,
    dropofflatitude,
    dropofflongitude,
    requeststatus,
    requestfee,
    reqdistance,
    buddyteam,
    leader,
    follower
  } = reqData

  const normalizedStatus = requeststatus ? requeststatus.trim() : ''

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

  const realLat = buddyteam?.currentloclat
  const realLng = buddyteam?.currentloclng
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

  let statusText = 'กำลังดำเนินการ'
  let statusBadgeBg = 'bg-[#2340A7]/15 text-[#2340A7] border-[#2340A7]/30'

  if (currentStep === 1) {
    statusText = 'คนขับรับงานแล้ว (กำลังเดินทางไปรับ)'
    statusBadgeBg = 'bg-blue-500/15 text-blue-500 border-blue-500/30'
  } else if (currentStep === 2) {
    statusText = 'คนขับเดินทางมาถึงตำแหน่งของคุณแล้ว'
    statusBadgeBg = 'bg-blue-600/15 text-blue-400 border-blue-500/30'
  } else if (currentStep === 3) {
    statusText = 'อยู่ระหว่างเดินทางไปยังจุดหมายปลายทาง'
    statusBadgeBg = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
  } else if (currentStep === 4) {
    statusText = 'เดินทางถึงที่หมายอย่างปลอดภัยเรียบร้อยแล้ว'
    statusBadgeBg = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
  } else if (currentStep === -1) {
    statusText = 'การเดินทางนี้ถูกยกเลิกแล้ว'
    statusBadgeBg = 'bg-red-500/15 text-red-500 border-red-500/30'
  } else {
    statusText = 'กำลังจับคู่ทีมคนขับ SafeSeat'
    statusBadgeBg = 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  }

  const leaderObj = leader || reqData.leader || reqData.buddyteam?.leader
  const followerObj = follower || reqData.follower || reqData.buddyteam?.follower

  const driver1Name = leaderObj && (leaderObj.firstname || leaderObj.name)
    ? `คุณ${leaderObj.firstname || leaderObj.name} ${leaderObj.lastname || ''}`.trim()
    : 'ผู้ให้บริการ SafeSeat'
  const rawDriver1Phone = leaderObj?.phone_no || leaderObj?.phoneno || leaderObj?.phone || reqData.leader_phone || ''

  const driver2Name = followerObj && (followerObj.firstname || followerObj.name)
    ? `คุณ${followerObj.firstname || followerObj.name} ${followerObj.lastname || ''}`.trim()
    : 'ผู้ช่วยคนขับ SafeSeat (บัดดี้)'
  const rawDriver2Phone = followerObj?.phone_no || followerObj?.phoneno || followerObj?.phone || reqData.follower_phone || ''

  const getPhoneDisplay = (phone: string) => {
    if (phone) return phone
    if (normalizedStatus === 'กำลังค้นหาคนขับ' || normalizedStatus === 'รอคนขับ' || normalizedStatus === 'pending') {
      return 'กำลังจับคู่คนขับ...'
    }
    if (normalizedStatus === 'ยกเลิก' || normalizedStatus === 'cancelled') {
      return 'คำขอถูกยกเลิกแล้ว'
    }
    return 'กำลังจัดทีมคนขับ'
  }
  const driver1PhoneDisplay = getPhoneDisplay(rawDriver1Phone)
  const driver2PhoneDisplay = getPhoneDisplay(rawDriver2Phone)

  const isCompleted = normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed'

  return (
    <div className="selection-blue min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col gap-8">
        
        {/* Status Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">TRIP TRACKING SERVICE</span>
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

        {/* Status Notification Alert Box */}
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
                {statusText}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                {currentStep === 1 && 'พนักงานขับรถรับงานเรียบร้อยแล้ว กำลังเดินทางไปรับลูกค้าที่จุดนัดหมาย'}
                {currentStep === 2 && 'พนักงานขับรถเดินทางมาถึงจุดรับลูกค้าเรียบร้อยแล้ว'}
                {currentStep === 3 && 'พนักงานขับรถกำลังพาลูกค้าเดินทางไปยังจุดหมายปลายทางอย่างปลอดภัย'}
                {currentStep === 4 && 'เดินทางถึงจุดหมายปลายทางเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ SafeSeat'}
                {requeststatus?.includes('ยกเลิก') || requeststatus?.includes('cancelled') ? 'รายการเรียกรถนี้ถูกยกเลิกแล้ว' : ''}
                {currentStep === 0 && !requeststatus?.includes('ยกเลิก') && 'ระบบกำลังค้นหาพนักงานขับรถบริเวณใกล้เคียง กรุณารอสักครู่'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Route Tracking Map */}
        <div className="h-96 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl">
          <RouteMap
            pickupLat={pickuplatitude}
            pickupLng={pickuplongitude}
            dropoffLat={dropofflatitude}
            dropoffLng={dropofflongitude}
            driverLat={driverLat}
            driverLng={driverLng}
            currentStep={currentStep}
            distance={reqdistance ? parseFloat(reqdistance) : undefined}
          />
        </div>

        {/* Service Details Card */}
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border-b border-[var(--color-border)] pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">รหัสการเรียก</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">#{requestid}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ผู้ใช้บริการ</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{reqData?.custname || 'ผู้ใช้บริการ SafeSeat'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ระยะทาง</span>
              <span className="text-base font-extrabold font-manrope text-[var(--color-text)]">{reqdistance ? `${parseFloat(reqdistance).toFixed(1)} กม.` : '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ค่าบริการ</span>
              <span className="text-base font-extrabold font-manrope text-[#2340A7]">฿{requestfee || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">แชร์การเดินทาง</span>
              <button
                onClick={() => {
                  if (shareUrl) {
                    navigator.clipboard.writeText(shareUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }
                }}
                className={`mt-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold font-manrope text-[var(--color-text)] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2340A7]" /> ข้อมูลการติดต่อทีมงานคนขับ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Driver 1 Card */}
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
                    <span className="text-xs font-bold font-mono text-[var(--color-text)]">{driver1PhoneDisplay}</span>
                  </div>
                  {rawDriver1Phone && (
                    <a 
                      href={`tel:${rawDriver1Phone}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรหาคนขับ
                    </a>
                  )}
                </div>
              </div>

              {/* Driver 2 Card */}
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
                    <span className="text-xs font-bold font-mono text-[var(--color-text)]">{driver2PhoneDisplay}</span>
                  </div>
                  {rawDriver2Phone && (
                    <a 
                      href={`tel:${rawDriver2Phone}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรหาบัดดี้
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

export default function TripTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin" />
      </div>
    }>
      <TripTrackingContent />
    </Suspense>
  )
}
