'use client'

// ═══════════════════════════════════════════════════════════════
// app/pub/waiting/page.tsx — Waiting for Driver (5 Minutes Timer)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Car, Copy, Check, RefreshCw, AlertTriangle, FileText } from 'lucide-react'

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
};

function WaitingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')
  
  // 5 Minutes = 300 seconds
  const [timeLeft, setTimeLeft] = useState(300)
  const [status, setStatus] = useState('กำลังกระจายงานไปยังทีมคนขับในพื้นที่...')
  const [isTimeout, setIsTimeout] = useState(false)
  const [reqData, setReqData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState('')

  const trackingParam = searchParams.get('tracking') || (requestId ? encodeId(requestId) : '')

  useEffect(() => {
    if (typeof window !== 'undefined' && trackingParam) {
      setTrackingUrl(`${window.location.origin}/tracking?id=${trackingParam}`)
    }
  }, [trackingParam])

  useEffect(() => {
    if (!requestId) return
    const fetchRequestInfo = async () => {
      try {
        const res = await api.get(`/pub/service-request/${requestId}`)
        if (res.data.success) {
          setReqData(res.data.data)
        }
      } catch (err) {
        console.error('Fetch request info error:', err)
      }
    }
    fetchRequestInfo()
  }, [requestId])

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeout(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    if (timeLeft > 240) setStatus('กำลังกระจายงานไปยังทีมคนขับในพื้นที่...')
    else if (timeLeft > 180) setStatus('กำลังแจ้งเตือนคนขับในรัศมีใกล้เคียง...')
    else if (timeLeft > 120) setStatus('กำลังรอการตอบรับจากทีมคนขับคู่หู SafeSeat...')
    else if (timeLeft > 60) setStatus('ขยายรัศมีเพื่อจับคู่คนขับมืออาชีพเพิ่มเติม...')
    else setStatus('นาทีสุดท้าย: กำลังเร่งติดตามการตอบรับงาน...')

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (!requestId || isTimeout) return

    const checkStatus = async () => {
      try {
        const res = await api.get(`/pub/service-request/${requestId}`)
        if (res.data.success) {
          const req = res.data.data
          if (req.requeststatus === 'กำลังไปรับ' || req.requeststatus === 'accepted' || req.driverid) {
            router.push(`/pub/tracking?id=${trackingParam}`)
          } else if (
            req.requeststatus === 'ปฏิเสธ' ||
            req.requeststatus === 'rejected' ||
            req.requeststatus === 'cancelled' ||
            req.requeststatus === 'ยกเลิก'
          ) {
            // เมื่อคนขับกดปฏิเสธ ทำการยกเลิกการค้นหาและให้ผู้ใช้ลองเรียกใหม่ทันที
            handleCancelSearch(req, 'คนขับได้ปฏิเสธรายการเรียกรถ กรุณาตรวจสอบข้อมูลแล้วลองเรียกรถใหม่อีกครั้ง')
          }
        }
      } catch (err) {
        console.error('Check status error:', err)
      }
    }

    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [requestId, isTimeout, router, trackingParam])

  const handleCancelSearch = (targetData?: any, reason?: string) => {
    const pubUserStr = localStorage.getItem('pub_user')
    const pubUser = pubUserStr ? JSON.parse(pubUserStr) : null
    const dataToUse = targetData || reqData

    if (dataToUse) {
      const dropLat = Number(dataToUse.dropofflatitude) || 0
      const dropLng = Number(dataToUse.dropofflongitude) || 0
      const formData = {
        pubId: pubUser?.pubid || dataToUse.pubid || 1,
        custName: dataToUse.custname || '',
        phoneNo: dataToUse.phoneno || '',
        phoneEmer: dataToUse.phoneemer || '',
        carModel: dataToUse.carmodel || '',
        licensePlate: dataToUse.carplate || '',
        carType: dataToUse.requiredcartype === 1 ? 'Electric' : (dataToUse.requiredcartype === 2 ? 'Manual' : 'Autometric'),
        destination: (dropLat && dropLng) ? {
          lat: dropLat,
          lng: dropLng,
          label: dataToUse.destination_name || `พิกัด: ${dropLat.toFixed(5)}, ${dropLng.toFixed(5)}`
        } : null,
        isLadyMode: dataToUse.isladymode || false,
        paymentMethod: dataToUse.paymentmethod === 1 ? 1 : 2,
        note: dataToUse.note || '',
      }
      localStorage.setItem('safeseat_request_form', JSON.stringify(formData))
    }

    if (reason && typeof window !== 'undefined') {
      sessionStorage.setItem('safeseat_reject_notice', reason)
    }

    router.push('/pub/request-driver?step=1')
  }

  // Format 300 seconds -> 5:00
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  if (isTimeout) {
    return (
      <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[140px]"></div>
        </div>
        <div className="gradient-blur"></div>
        <Navbar />
        <FloatingNav />

        <main className="relative z-10 max-w-xl mx-auto px-6 pt-48 pb-24 flex items-center justify-center">
          <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col items-center text-center gap-6 w-full">
            <AlertTriangle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold font-manrope text-red-500">ไม่มีคนขับรับงานภายใน 5 นาที</h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
              ขณะนี้ยังไม่มีคนขับอยู่ในพื้นที่หรือสะดวกรับงานภายในเวลา 5 นาทีที่กำหนด <br/>กรุณากดปุ่มย้อนกลับเพื่อลองเรียกรถใหม่อีกครั้ง
            </p>
            <button 
              onClick={() => handleCancelSearch()}
              className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md cursor-pointer transition-all"
            >
              กลับไปหน้าเรียกรถ
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const payLabel = reqData?.paymentmethod === 1 ? 'เงินสด' : 'โอนเงิน / PromptPay'

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-48 pb-24 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl">
          
          {/* Left Column: Radar Animation & Timer */}
          <div className="lg:col-span-5 flex flex-col items-center text-center justify-between border-b lg:border-b-0 lg:border-r border-[var(--color-border)] pb-8 lg:pb-0 lg:pr-8">
            <div className="flex flex-col items-center w-full">
              <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-[#7C3AED]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="p-4 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] rounded-full text-white shadow-xl relative z-10">
                  <Car className="w-10 h-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold font-manrope text-[var(--color-text)]">กำลังค้นหาคนขับรถ</h2>
              <p className="text-xs font-bold text-[#7C3AED] mt-1 tracking-wider">{status}</p>

              <div className="w-full mt-6 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-mono">เหลือเวลาค้นหา (5 นาที)</span>
                <span className={`text-5xl font-extrabold font-manrope mt-2 tracking-tight ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-[var(--color-text)]'}`}>
                  {formattedTime} <span className="text-xs font-semibold text-[var(--color-text-muted)]">นาที</span>
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleCancelSearch()}
              className="mt-6 w-full py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
            >
              ยกเลิกการค้นหา
            </button>
          </div>

          {/* Right Column: Request Details & QR */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {reqData && (
              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                  <span className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#7C3AED]" /> สรุปข้อมูลการเรียกรถ
                  </span>
                  {reqData.isladymode && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400">
                      👩 Lady Mode
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">ชื่อลูกค้า</span>
                    <span className="text-[var(--color-text)] font-bold">{reqData.custname || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">เบอร์โทรศัพท์</span>
                    <span className="text-[var(--color-text)] font-bold">{reqData.phoneno || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">เบอร์ฉุกเฉิน</span>
                    <span className="text-[var(--color-text)] font-bold">{reqData.phoneemer || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">ชำระเงิน</span>
                    <span className="text-blue-500 font-bold">{payLabel}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">รุ่น / ทะเบียนรถ</span>
                    <span className="text-[var(--color-text)] font-bold">{reqData.carmodel || '-'} ({reqData.carplate || '-'})</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-mono block">ค่าบริการคาดการณ์</span>
                    <span className="text-emerald-500 font-bold">฿{reqData.requestfee || '-'} ({reqData.reqdistance ? reqData.reqdistance.toFixed(2) : 0} กม.)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking QR & Link Share */}
            {trackingUrl && (
              <div className="p-6 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-4 text-center">
                <span className="text-xs font-bold text-[var(--color-text)]">ลูกค้าสแกน QR Code เพื่อติดตามสถานะเรียลไทม์</span>
                <div className="p-3 bg-white rounded-xl shadow-md border">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(trackingUrl)}`}
                    alt="Trip Tracking QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <button
                  onClick={() => {
                    if (trackingUrl) {
                      navigator.clipboard.writeText(trackingUrl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2500)
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'คัดลอกลิงก์ติดตามสำเร็จ!' : 'คัดลอกลิงก์ติดตามสำหรับลูกค้า'}
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PubWaitingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
          <p className="text-sm font-bold">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <WaitingContent />
    </Suspense>
  )
}
