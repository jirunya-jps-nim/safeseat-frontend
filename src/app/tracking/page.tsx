'use client'

// ═══════════════════════════════════════════════════════════════
// app/tracking/page.tsx — Public Service Tracking (No Header/Navbar)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'
import Footer from '@/components/ui/Footer'
import { PhoneCall, RefreshCw, AlertCircle, UserCheck } from 'lucide-react'

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
        setError('')
      } else {
        setError(res.data?.message || 'ไม่พบข้อมูลการบริการ')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลการบริการ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!requestId) {
      setError('ไม่พบรหัสการบริการที่ระบุ')
      setLoading(false)
      return
    }
    fetchRequestData()
    const pollInterval = setInterval(fetchRequestData, 5000)
    return () => clearInterval(pollInterval)
  }, [requestId, router])

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
      <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter flex flex-col items-center justify-center p-6 relative overflow-x-hidden">
        <div className="gradient-blur"></div>

        <div className="relative z-10 p-8 sm:p-10 bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl text-center max-w-lg w-full shadow-2xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3AED]/20 to-[#1D4ED8]/20 border border-[#7C3AED]/30 flex items-center justify-center text-3xl shadow-inner">
            📱
          </div>

          <div>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest font-manrope">RECOMMENDED FOR CUSTOMERS</span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-manrope text-[var(--color-text)] mt-1">
              คำแนะนำสำหรับผู้ใช้บริการ SafeSeat
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
              สำหรับผู้ใช้บริการทั่วไป แนะนำให้เรียกรถและติดตามสถานะผ่าน <strong className="text-[#7C3AED] font-bold">แอปพลิเคชันบนมือถือ (Mobile Application)</strong> เพื่อรับประสบการณ์การบริการที่ดีที่สุดและสะดวกสูงสุดในการใช้งาน
            </p>
          </div>

          <div className="w-full p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--color-text)]">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
              <span>ติดตามตำแหน่งคนขับบนแผนที่แบบ Realtime</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--color-text)]">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
              <span>แจ้งเตือนสถานะทันทีเมื่อคนขับเดินทางถึงจุดรับ</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--color-text)]">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
              <span>โทรติดต่อทีมคนขับหลักและบัดดี้ได้โดยตรง</span>
            </div>
          </div>

          <div className="w-full">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              🏠 กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    custname,
    phoneno,
    phoneemer,
    pickuplatitude, pickuplongitude,
    dropofflatitude, dropofflongitude,
    requeststatus, reqdistance, requestfee,
    paymentmethod
  } = reqData

  const payLabel = paymentmethod === 1 ? 'เงินสด' : 'โอนเงิน / PromptPay'

  const currentStep = (requeststatus === 'กำลังไปรับ') ? 1
                    : (requeststatus === 'ถึงจุดรับแล้ว') ? 2
                    : (requeststatus === 'ระหว่างเดินทาง') ? 3
                    : (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') ? 4
                    : 0;

  let displayStatus = requeststatus
  let statusBadgeBg = 'bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30'
  if (requeststatus === 'รอคนขับ') {
    displayStatus = 'รอคนขับตอบรับงาน...'
    statusBadgeBg = 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  } else if (requeststatus === 'กำลังไปรับ') {
    displayStatus = 'คนขับกำลังเดินทางไปรับคุณ'
    statusBadgeBg = 'bg-blue-500/15 text-blue-500 border-blue-500/30'
  } else if (requeststatus === 'ถึงจุดรับแล้ว') {
    displayStatus = 'คนขับถึงจุดรับแล้ว (กำลังออกเดินทาง)'
    statusBadgeBg = 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  } else if (requeststatus === 'ระหว่างเดินทาง') {
    displayStatus = 'กำลังเดินทางไปยังจุดหมายปลายทาง'
    statusBadgeBg = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
  } else if (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') {
    displayStatus = 'เสร็จสิ้นการบริการ (ถึงที่หมายเรียบร้อยแล้ว)'
    statusBadgeBg = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
  }

  const driver1Name = reqData.leader 
    ? `คุณ${reqData.leader.firstname} ${reqData.leader.lastname}`
    : 'ผู้ให้บริการ SafeSeat'
  const driver1Phone = reqData.leader?.phone_no || reqData.leader?.phoneno || reqData.leader_phone || ''

  const driver2Name = reqData.follower
    ? `คุณ${reqData.follower.firstname} ${reqData.follower.lastname}`
    : 'ผู้ช่วยคนขับ SafeSeat (บัดดี้)'
  const driver2Phone = reqData.follower?.phone_no || reqData.follower?.phoneno || reqData.follower_phone || ''

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

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col gap-8">
        
        {/* Prominent Status Hero Banner */}
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-mono">สถานะการบริการเรียลไทม์ (Live Status)</span>
              <h1 className="text-2xl md:text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{displayStatus}</h1>
            </div>
            <div className={`px-5 py-2.5 rounded-full border text-xs font-bold font-manrope flex items-center gap-2.5 shadow-md ${statusBadgeBg}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
              <span>{displayStatus}</span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[var(--color-border)]">
            {stepsList.map(s => {
              const active = currentStep >= s.step
              return (
                <div key={s.step} className="flex flex-col items-center gap-2">
                  <div className={`w-full h-2 rounded-full transition-all ${
                    active ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                  }`} />
                  <span className={`text-[11px] font-bold ${active ? 'text-[#7C3AED]' : 'text-[var(--color-text-muted)]'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

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
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">ผู้ใช้บริการ</span>
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

          {/* Contact Details Section Grid */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold font-manrope text-[var(--color-text)] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#7C3AED]" /> ข้อมูลการติดต่อทีมงานคนขับ & เบอร์ฉุกเฉิน
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Driver 1: Leader */}
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#7C3AED]/15 rounded-xl text-[#7C3AED] text-xl">👨‍✈️</div>
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
                      className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> โทรหาคนขับ
                    </a>
                  )}
                </div>
              </div>

              {/* Driver 2: Follower */}
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
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
