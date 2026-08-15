'use client'

// ═══════════════════════════════════════════════════════════════
// app/pub/request-driver/page.tsx — SafeSeat Request Driver Page
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Car, MapPin, Shield, CreditCard, ArrowRight, CheckCircle2, QrCode, RefreshCw } from 'lucide-react'

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false })
const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

type Step = 1 | 2 | 3 | 4

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  return 'P' + id;
};

function RequestDriverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pubUser, setPubUser] = useState<any>(null)
  const [step, setStep] = useState<Step>(1)

  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam) {
      const parsedStep = parseInt(stepParam)
      if (parsedStep >= 1 && parsedStep <= 4) {
        setStep(parsedStep as Step)
      }
    }
  }, [searchParams])

  // Form state
  const [custName, setCustName] = useState('')
  const [phoneNo, setPhoneNo] = useState('')
  const [phoneEmer, setPhoneEmer] = useState('')
  const [carType, setCarType] = useState('Autometric')
  const [carBrand, setCarBrand] = useState('')
  const [carModel, setCarModel] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [note, setNote] = useState('')
  const [isLadyMode, setIsLadyMode] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<1 | 2>(2) // 1=cash, 2=transfer
  const [destination, setDestination] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [showMap, setShowMap] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rejectNotice, setRejectNotice] = useState('')
  const [distance, setDistance] = useState<number>(0)
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false)
  const [isFormLoaded, setIsFormLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notice = sessionStorage.getItem('safeseat_reject_notice')
      if (notice) {
        setRejectNotice(notice)
        sessionStorage.removeItem('safeseat_reject_notice')
      }
    }
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    const parsed = JSON.parse(userStr)
    if (parsed.regisstatus !== 'approved' && parsed.regisstatus !== 'อนุมัติแล้ว') {
      router.push('/status')
      return
    }
    setPubUser(parsed)
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safeseat_request_form')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.custName) setCustName(parsed.custName)
          if (parsed.phoneNo) setPhoneNo(parsed.phoneNo)
          if (parsed.phoneEmer) setPhoneEmer(parsed.phoneEmer)
          if (parsed.carType) setCarType(parsed.carType)
          if (parsed.carBrand) setCarBrand(parsed.carBrand)
          if (parsed.carModel) setCarModel(parsed.carModel)
          if (parsed.licensePlate) setLicensePlate(parsed.licensePlate)
          if (parsed.note) setNote(parsed.note)
          if (parsed.isLadyMode !== undefined) setIsLadyMode(Boolean(parsed.isLadyMode))
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod)
          if (parsed.destination) setDestination(parsed.destination)
        } catch (e) {
          console.error('Error parsing saved request form:', e)
        }
      }
      setIsFormLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && isFormLoaded) {
      const formData = {
        custName,
        phoneNo,
        phoneEmer,
        carType,
        carBrand,
        carModel,
        licensePlate,
        note,
        isLadyMode,
        paymentMethod,
        destination
      }
      localStorage.setItem('safeseat_request_form', JSON.stringify(formData))
    }
  }, [isFormLoaded, custName, phoneNo, phoneEmer, carType, carBrand, carModel, licensePlate, note, isLadyMode, paymentMethod, destination])

  const pubName = pubUser?.pubname || pubUser?.username || 'PUB'
  const pickupLat = parseFloat(pubUser?.pubaddresslat || '18.7883')
  const pickupLng = parseFloat(pubUser?.pubaddresslng || '98.9853')

  useEffect(() => {
    if (!destination) {
      setDistance(0)
      return
    }

    const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    let active = true
    const fetchRouteDistance = async () => {
      setLoadingRoute(true)
      setError('')
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destination.lng},${destination.lat}?overview=false`
        const response = await fetch(osrmUrl)
        if (response.ok) {
          const data = await response.json()
          if (active && data.code === 'Ok' && data.routes && data.routes.length > 0) {
            setDistance(data.routes[0].distance / 1000) // convert meters to km
            setError('')
            return
          }
        }
        throw new Error('OSRM response was not Ok')
      } catch (err) {
        console.warn('[RequestDriver Warning] OSRM distance fetch failed, using straight-line fallback:', err)
        if (active) {
          const straightDist = getHaversineDistance(pickupLat, pickupLng, destination.lat, destination.lng)
          const estimatedDrivingDist = straightDist * 1.3
          setDistance(estimatedDrivingDist)
          setError('')
        }
      } finally {
        if (active) {
          setLoadingRoute(false)
        }
      }
    }

    fetchRouteDistance()
    return () => {
      active = false
    }
  }, [destination, pickupLat, pickupLng])

  const estimatedPrice = distance > 0 ? Math.round(150 + distance * 25) : 0

  const validateStep1 = () => {
    if (!custName.trim()) return 'กรุณากรอกชื่อ - นามสกุล'
    if (!phoneNo.trim() || phoneNo.length !== 10) return 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก'
    if (!phoneEmer.trim() || phoneEmer.length !== 10) return 'กรุณากรอกเบอร์โทรฉุกเฉิน 10 หลัก'
    if (phoneNo.trim() === phoneEmer.trim()) return 'เบอร์โทรศัพท์ของลูกค้าและเบอร์โทรฉุกเฉินต้องห้ามซ้ำกัน'
    if (!carBrand.trim()) return 'กรุณากรอกยี่ห้อรถยนต์ของลูกค้า'
    if (!carModel.trim()) return 'กรุณากรอกรุ่นรถยนต์ของลูกค้า'
    if (!licensePlate.trim()) return 'กรุณากรอกทะเบียนรถยนต์ของลูกค้า'
    return ''
  }

  const handleStep1Next = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleStep2Next = () => {
    if (!destination) { setError('กรุณาเลือกจุดหมายปลายทาง'); return }
    if (distance <= 0) { setError('ไม่พบข้อมูลระยะทางจากจุดเริ่มต้นไปยังปลายทาง กรุณาเลือกจุดหมายใหม่อีกครั้งเพื่อคำนวณระยะทางจริง'); return }
    setError('')
    setStep(3)
  }

  const handleSubmit = async (simulatedPaymentStatus?: 'paid' | 'unpaid') => {
    setLoading(true); setError('')
    const fullCarModel = `${carBrand.trim()} ${carModel.trim()}`.trim()
    try {
      const res = await api.post('/pub/request-driver', {
        pubUsername: pubUser.username,
        custName, phoneNo, phoneEmer,
        carType,
        carModel: fullCarModel,
        licensePlate,
        isLadyMode,
        note,
        paymentMethod,
        dropoffLatitude: destination?.lat,
        dropoffLongitude: destination?.lng,
      })
      if (res.data.success) {
        const requestId = res.data.data?.requestid || res.data.data?.id
        router.push(`/pub/waiting?id=${requestId}`)
      } else {
        setError(res.data.message || 'เกิดข้อผิดพลาดในการเรียกรถ')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const renderStepper = () => {
    const steps = [
      { num: 1, label: 'ข้อมูลลูกค้า' },
      { num: 2, label: 'เลือกจุดหมาย' },
      { num: 3, label: 'ตรวจสอบความปลอดภัย' },
      { num: 4, label: 'เลือกช่องทางชำระเงิน' }
    ]
    return (
      <div className="flex justify-between items-center mb-10 relative">
        <div className="absolute top-5 left-[6%] right-[6%] h-[2px] bg-[var(--color-border)] z-0" />
        <div className="absolute top-5 left-[6%] h-[2px] bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] z-0 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 88}%` }} />
        {steps.map(s => {
          const isCurrent = step === s.num
          const isCompleted = step > s.num
          return (
            <div 
              key={s.num} 
              onClick={() => { if (s.num < step) setStep(s.num as Step) }}
              className={`flex flex-col items-center z-10 flex-1 ${s.num < step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                isCompleted 
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white border-none' 
                  : isCurrent 
                  ? 'bg-[var(--color-card)] border-2 border-[#7C3AED] text-[#7C3AED] ring-4 ring-[#7C3AED]/20' 
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}>
                {isCompleted ? '✓' : s.num}
              </div>
              <span className={`text-xs font-semibold mt-2.5 text-center font-manrope ${
                isCurrent || isCompleted ? 'text-[#7C3AED] font-bold' : 'text-[var(--color-text-muted)]'
              }`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (!pubUser) return null

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#7C3AED] tracking-wider uppercase font-manrope">REQUEST SERVICE</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">เรียกรถให้ลูกค้า (Create Driver Request)</h1>
          </div>
          <div className="text-xs font-semibold px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            🏪 ร้านค้า: <span className="text-[var(--color-text)] font-bold">{pubName}</span>
          </div>
        </div>

        {rejectNotice && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-500 font-bold text-xs shadow-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <span>{rejectNotice}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl flex flex-col gap-8">
          {renderStepper()}

          {/* ─── STEP 1: กรอกข้อมูลส่วนตัว ─── */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">กรุณากรอกข้อมูลส่วนตัวของลูกค้า</h2>

              {rejectNotice && (
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>{rejectNotice}</span>
                  </div>
                  <button type="button" onClick={() => setRejectNotice('')} className="text-xs text-amber-400 hover:underline ml-2 cursor-pointer font-bold">
                    ปิด
                  </button>
                </div>
              )}

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">ชื่อ - นามสกุลลูกค้า *</label>
                <input 
                  value={custName} 
                  onChange={e => setCustName(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                  placeholder="กรอกชื่อ - นามสกุล" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">เบอร์โทรติดต่อ *</label>
                  <input 
                    value={phoneNo} 
                    onChange={e => setPhoneNo(e.target.value)}
                    maxLength={10} 
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    placeholder="เช่น 083xxxxxxx" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">เบอร์โทรติดต่อฉุกเฉิน *</label>
                  <input 
                    value={phoneEmer} 
                    onChange={e => setPhoneEmer(e.target.value)}
                    maxLength={10} 
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    placeholder="เช่น 083xxxxxxx" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">ยี่ห้อรถยนต์ *</label>
                  <input 
                    value={carBrand} 
                    onChange={e => setCarBrand(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    placeholder="เช่น Honda, Toyota, BYD" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">รุ่นรถยนต์ *</label>
                  <input 
                    value={carModel} 
                    onChange={e => setCarModel(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    placeholder="เช่น Civic, Camry, Atto 3" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">ทะเบียนรถยนต์ *</label>
                  <input 
                    value={licensePlate} 
                    onChange={e => setLicensePlate(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    placeholder="เช่น กข 1234 เชียงใหม่" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">ชนิดระบบเกียร์รถยนต์ *</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Autometric', 'Manual', 'Electric'].map(type => {
                    const active = carType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCarType(type)}
                        className={`py-3.5 px-3 rounded-xl text-xs font-bold tracking-wider transition-all border cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white border-transparent shadow-md'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[#7C3AED]'
                        }`}
                      >
                        {type === 'Autometric' ? '🚗 Auto' : type === 'Manual' ? '⚙️ Manual' : '⚡ Electric'}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  maxLength={100} 
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#7C3AED] transition-colors resize-none"
                  placeholder="เช่น ผู้ใช้บริการต้องการระบุข้อมูลที่อยู่เพิ่มเติม หรือข้อมูลที่ต้องการแจ้งให้ทราบ" 
                />
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleStep1Next}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#6D28D9] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  ดำเนินการต่อ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: เลือกจุดหมาย ─── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">เลือกจุดหมายปลายทาง</h2>
              
              {/* Location bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 flex items-center gap-2 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-500 text-xs font-bold w-full">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>จุดรับ: {pubName}</span>
                </div>
                <span className="text-[var(--color-text-muted)] font-bold">→</span>
                <div
                  onClick={() => setShowMap(true)}
                  className="flex-1 flex items-center gap-2 p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-bold cursor-pointer hover:border-[#7C3AED] transition-colors w-full"
                >
                  <MapPin className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                  <span className={destination ? 'text-[#7C3AED]' : 'text-[var(--color-text-muted)]'}>
                    {destination ? (destination.label || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`) : 'กรุณาคลิกเลือกจุดหมายปลายทาง'}
                  </span>
                </div>
              </div>

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

              {/* Location list or selected */}
              {destination ? (
                <div className="p-6 bg-[var(--color-surface)] border-2 border-[#7C3AED] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#7C3AED]/15 rounded-xl text-[#7C3AED]">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--color-text)]">จุดหมายปลายทางที่เลือก</div>
                      <div className="text-xs font-bold text-[#7C3AED] mt-1">{destination.label}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">พิกัด: {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMap(true)} 
                    className="px-4 py-2 border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text)] hover:border-[#7C3AED] transition-colors cursor-pointer"
                  >
                    เปลี่ยนตำแหน่ง
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3">
                  <MapPin className="w-12 h-12 text-[#7C3AED]" />
                  <h3 className="text-base font-bold text-[var(--color-text)]">ยังไม่ได้เลือกจุดหมายปลายทาง</h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-sm">กรุณากดปุ่มด้านล่างเพื่อเปิดแผนที่และปักหมุดตำแหน่งจุดหมายปลายทางให้คนขับไปส่ง</p>
                  <button 
                    onClick={() => setShowMap(true)}
                    className="mt-2 px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md cursor-pointer flex items-center gap-2"
                  >
                    🗺️ เปิดแผนที่เพื่อระบุตำแหน่ง
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => { setError(''); setStep(1) }}
                  className="px-6 py-3 border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>
                <button
                  onClick={handleStep2Next}
                  disabled={loadingRoute}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#6D28D9] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  {loadingRoute ? 'กำลังคำนวณ...' : 'ยืนยันพิกัด →'}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: ยืนยันข้อมูล ─── */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">ตรวจสอบข้อมูล &amp; บริการความปลอดภัย</h2>
              
              {destination && (
                <div className="h-64 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md">
                  <RouteMap pickupLat={pickupLat} pickupLng={pickupLng} dropoffLat={destination.lat} dropoffLng={destination.lng} />
                  <div className="absolute left-4 bottom-4 z-20 bg-[var(--color-card)]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold text-[#7C3AED] shadow-sm">
                    🛣️ ระยะทางประมาณ: {distance.toFixed(2)} กม.
                  </div>
                </div>
              )}

              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-[#7C3AED]/15 rounded-lg text-[#7C3AED]">👤</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">ชื่อลูกค้า</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{custName}</div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/15 rounded-lg text-blue-500">📞</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">เบอร์โทรติดต่อ / ฉุกเฉิน</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{phoneNo} / {phoneEmer}</div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/15 rounded-lg text-purple-500">🚗</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">ระบบเกียร์ / รุ่นรถ</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{carType} ({carModel})</div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/15 rounded-lg text-indigo-500">📍</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">จุดหมายปลายทาง</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{destination?.label || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Lady Mode Toggle */}
              <div className="p-5 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👩</span>
                  <div>
                    <div className="text-sm font-bold text-[var(--color-text)]">Lady Mode (คนขับผู้หญิง)</div>
                    <div className="text-xs text-[var(--color-text-muted)]">เปิดตัวเลือกนี้หากต้องการคนขับผู้หญิงในการให้บริการ</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-500 uppercase">ฟรี</span>
                  <input 
                    type="checkbox" 
                    checked={isLadyMode}
                    onChange={e => setIsLadyMode(e.target.checked)}
                    className="w-5 h-5 accent-[#7C3AED] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => { setError(''); setStep(2) }}
                  className="px-6 py-3 border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>
                <button 
                  onClick={() => { setError(''); setStep(4) }}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#6D28D9] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  ดำเนินการต่อ →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: ชำระเงิน ─── */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">เลือกช่องทางการชำระเงิน</h2>
              {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

              {/* Price Banner */}
              <div className="p-6 bg-gradient-to-r from-[#7C3AED]/15 to-[#1D4ED8]/15 border border-[#7C3AED]/40 rounded-2xl flex items-center gap-4">
                <div className="p-3.5 bg-[#7C3AED] text-white rounded-xl shadow-md">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">ค่าบริการประมาณการตามระยะทาง ({distance.toFixed(2)} กม.)</div>
                  <div className="text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">฿{estimatedPrice}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-3">
                {[
                  { value: 2, icon: QrCode, name: 'โอนเงิน / PromptPay', desc: 'สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking' },
                  { value: 1, icon: CreditCard, name: 'เงินสด (Cash)', desc: 'ชำระเงินสดโดยตรงกับคนขับรถเมื่อถึงที่หมาย' },
                ].map(opt => {
                  const IconComp = opt.icon
                  const active = paymentMethod === opt.value
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        if (!verifyingPayment && !loading) {
                          setPaymentMethod(opt.value as 1 | 2);
                        }
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        active
                          ? 'border-2 border-[#7C3AED] bg-[#7C3AED]/10 shadow-md'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[#7C3AED]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#7C3AED]' : 'border-[var(--color-border)]'}`}>
                        {active && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />}
                      </div>
                      <div className="p-2.5 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] text-[#7C3AED]">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--color-text)]">{opt.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{opt.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* QR Code Container */}
              {paymentMethod === 2 && !verifyingPayment && (
                <div className="p-6 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-4 text-center">
                  <div className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">PromptPay QR Code</div>
                  <div className="p-4 bg-white rounded-2xl shadow-md border">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SafeSeat-Payment-Fee-${estimatedPrice}`}
                      alt="PromptPay QR Code"
                      className="w-44 h-44"
                    />
                  </div>
                  <div className="text-xl font-extrabold text-[var(--color-text)]">ยอดชำระเงิน: ฿{estimatedPrice}</div>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-sm">* สแกนเพื่อโอนชำระเงินล่วงหน้า หรือชำระเงินสดกับคนขับเมื่อถึงที่หมาย</p>
                </div>
              )}

              {verifyingPayment && (
                <div className="p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3 text-center">
                  <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
                  <div className="text-sm font-bold text-[var(--color-text)]">กำลังตรวจสอบข้อมูลการชำระเงิน...</div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => { setError(''); setStep(3) }}
                  disabled={loading || verifyingPayment}
                  className="px-6 py-3 border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>

                <button
                  onClick={() => {
                    if (paymentMethod === 2) {
                      setVerifyingPayment(true);
                      setTimeout(() => {
                        setVerifyingPayment(false);
                        handleSubmit('paid');
                      }, 1500);
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={loading || verifyingPayment}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#6D28D9] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  {loading ? 'กำลังส่งข้อมูล...' : 'เรียกคนขับรถเลย! ✓'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {showMap && (
        <MapPicker
          defaultLat={destination?.lat}
          defaultLng={destination?.lng}
          onConfirm={(lat, lng, label) => {
            setDestination({ lat, lng, label: label || `พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}` })
            setShowMap(false)
          }}
          onCancel={() => setShowMap(false)}
        />
      )}
    </div>
  )
}

export default function RequestDriverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)] font-inter">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
          <p className="text-sm font-bold">กำลังโหลดหน้าจอเรียกรถ...</p>
        </div>
      </div>
    }>
      <RequestDriverContent />
    </Suspense>
  )
}
