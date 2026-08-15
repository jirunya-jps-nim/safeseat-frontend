'use client'

// ═══════════════════════════════════════════════════════════════
// app/trip/page.tsx — Shared Trip Tracking (No Header/Navbar)
// ═══════════════════════════════════════════════════════════════

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
      const currentStatus = reqData.requeststatus
      if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
        // เมื่อมีการเปลี่ยนสถานะ ให้รีเฟรชหน้าจอทันทีเพื่ออัปเดตสถานะการทำงานสดใหม่
        window.location.reload()
        return
      }
      prevStatusRef.current = currentStatus
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
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin mb-3" />
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

  const driverLat = (buddyteam && buddyteam.currentloclat !== 0 && buddyteam.currentloclat !== null) ? buddyteam.currentloclat : undefined
  const driverLng = (buddyteam && buddyteam.currentloclng !== 0 && buddyteam.currentloclng !== null) ? buddyteam.currentloclng : undefined

  let statusText = 'กำลังดำเนินการ'
  let statusBadgeBg = 'bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30'

  const normalizedStatus = requeststatus ? requeststatus.trim() : ''

  const currentStep = (normalizedStatus === 'กำลังไปรับ') ? 1
                    : (normalizedStatus === 'ถึงจุดนัดหมาย' || normalizedStatus === 'ถึงจุดรับแล้ว') ? 2
                    : (normalizedStatus === 'กำลังเดินทาง' || normalizedStatus === 'ระหว่างเดินทาง' || normalizedStatus === 'accepted') ? 3
                    : (normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed') ? 4
                    : 0;

  if (normalizedStatus === 'กำลังค้นหาคนขับ' || normalizedStatus === 'รอคนขับ' || normalizedStatus === 'pending') {
    statusText = 'กำลังจับคู่ทีมคนขับ SafeSeat'
    statusBadgeBg = 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  } else if (normalizedStatus === 'กำลังไปรับ') {
    statusText = 'คนขับกำลังเดินทางไปรับคุณ'
    statusBadgeBg = 'bg-blue-500/15 text-blue-500 border-blue-500/30'
  } else if (normalizedStatus === 'ถึงจุดนัดหมาย' || normalizedStatus === 'ถึงจุดรับแล้ว') {
    statusText = 'คนขับเดินทางมาถึงตำแหน่งของคุณแล้ว'
    statusBadgeBg = 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  } else if (normalizedStatus === 'กำลังเดินทาง' || normalizedStatus === 'ระหว่างเดินทาง' || normalizedStatus === 'accepted') {
    statusText = 'อยู่ระหว่างเดินทางไปยังจุดหมายปลายทาง'
    statusBadgeBg = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
  } else if (normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed') {
    statusText = 'เดินทางถึงที่หมายอย่างปลอดภัยเรียบร้อยแล้ว'
    statusBadgeBg = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
  } else if (normalizedStatus === 'ยกเลิก' || normalizedStatus === 'cancelled') {
    statusText = 'การเดินทางนี้ถูกยกเลิกแล้ว'
    statusBadgeBg = 'bg-red-500/15 text-red-500 border-red-500/30'
  }

  const driver1Name = leader
    ? `คุณ${leader.firstname} ${leader.lastname || ''}`
    : 'ผู้ให้บริการ SafeSeat'
  const driver1Phone = leader?.phone_no || leader?.phoneno || ''

  const driver2Name = follower
    ? `คุณ${follower.firstname} ${follower.lastname || ''}`
    : 'ผู้ช่วยคนขับ SafeSeat (บัดดี้)'
  const driver2Phone = follower?.phone_no || follower?.phoneno || ''

  const isCompleted = normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed'

  const stepsList = [
    { label: 'รับงาน', step: 1 },
    { label: 'ถึงจุดรับ', step: 2 },
    { label: 'ระหว่างเดินทาง', step: 3 },
    { label: 'เสร็จสิ้น', step: 4 },
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
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-mono">สถานะการบริการเรียลไทม์ (Live Trip Status)</span>
              <h1 className="text-2xl md:text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{statusText}</h1>
            </div>
            <div className={`px-5 py-2.5 rounded-full border text-xs font-bold font-manrope flex items-center gap-2.5 shadow-md ${statusBadgeBg}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
              <span>{statusText}</span>
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
            pickupLat={pickuplatitude}
            pickupLng={pickuplongitude}
            dropoffLat={dropofflatitude}
            dropoffLng={dropofflongitude}
            driverLat={driverLat}
            driverLng={driverLng}
          />
          <div className="absolute left-4 bottom-4 z-20 bg-[var(--color-card)]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold shadow-lg">
            <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">สถานะปัจจุบัน</span>
            <span className={`text-sm font-manrope font-bold flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-[#7C3AED]'}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
              {statusText}
            </span>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-8">
          
          {/* Metadata Grid */}
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
              <span className="text-base font-extrabold font-manrope text-[#7C3AED]">฿{requestfee || '-'}</span>
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
                    : 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
              </button>
            </div>
          </div>

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

export default function TripTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    }>
      <TripTrackingContent />
    </Suspense>
  )
}
