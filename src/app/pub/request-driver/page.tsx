'use client'

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

// หน้าเรียกรถให้ลูกค้าสำหรับสถานบันเทิงพาร์ทเนอร์ (กระบวนการ 4 ขั้นตอน)
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
  const [paymentMethod, setPaymentMethod] = useState<1 | 2>(2) 
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
          if (parsed.note) {
            // Strip internal metadata tags before restoring user-visible note
            const cleanNote = parsed.note
              .replace(/\[รุ่นรถ:\s*.*?\|\s*ทะเบียน:\s*.*?\]/g, '')
              .replace(/\[DEST:.*?\]/g, '')
              .trim()
            if (cleanNote) setNote(cleanNote)
          }
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
      const R = 6371; 
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
            setDistance(data.routes[0].distance / 1000) 
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

  const estimatedPrice = distance > 0 ? Math.round(300 + distance * 10) : 0

  const isCustNameError = error.includes('ชื่อ - นามสกุล') || (error.includes('ชื่อ') && !error.includes('ยี่ห้อ') && !error.includes('จุดหมาย'))
  const isPhoneError = (error.includes('เบอร์โทรศัพท์') || error.includes('เบอร์โทรติดต่อ')) && !error.includes('ฉุกเฉิน')
  const isPhoneEmerError = error.includes('ฉุกเฉิน') || error.includes('ซ้ำกัน')
  const isCarBrandError = error.includes('ยี่ห้อ')
  const isCarModelError = error.includes('รุ่นรถ')
  const isLicensePlateError = error.includes('ทะเบียน')
  const isCarTypeError = error.includes('เกียร์')
  const isDestError = error.includes('จุดหมาย') || error.includes('ระยะทาง')

  const validateStep1 = () => {
    if (!custName.trim()) return 'กรุณากรอกชื่อ - นามสกุลลูกค้า'
    if (custName.trim().length < 2) return 'ชื่อ - นามสกุลลูกค้าต้องมีความยาวอย่างน้อย 2 ตัวอักษร'
    if (!/^[ก-๙a-zA-Z\s.-]+$/.test(custName.trim())) return 'ชื่อ - นามสกุลลูกค้า ต้องเป็นอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น'
    
    // เบอร์โทรศัพท์ติดต่อของลูกค้า (10 หลัก ขึ้นต้นด้วย 06, 08, 09 เท่านั้น)
    if (!phoneNo.trim()) return 'กรุณากรอกเบอร์โทรศัพท์ติดต่อของลูกค้า'
    if (!/^0[689]\d{8}$/.test(phoneNo.trim()) || /^(\d)\1+$/.test(phoneNo.trim())) {
      return 'เบอร์โทรศัพท์ติดต่อไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น)'
    }
    
    // เบอร์โทรติดต่อฉุกเฉิน (10 หลัก ขึ้นต้นด้วย 06, 08, 09 เท่านั้น)
    if (!phoneEmer.trim()) return 'กรุณากรอกเบอร์โทรติดต่อฉุกเฉิน'
    if (!/^0[689]\d{8}$/.test(phoneEmer.trim()) || /^(\d)\1+$/.test(phoneEmer.trim())) {
      return 'เบอร์โทรติดต่อฉุกเฉินไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น)'
    }
    
    if (phoneNo.trim() === phoneEmer.trim()) return 'เบอร์โทรศัพท์ของลูกค้าและเบอร์โทรฉุกเฉินต้องห้ามซ้ำกัน'
    
    if (!carBrand.trim()) return 'กรุณากรอกยี่ห้อรถยนต์ของลูกค้า'
    if (!carModel.trim()) return 'กรุณากรอกรุ่นรถยนต์ของลูกค้า'
    if (!licensePlate.trim()) return 'กรุณากรอกทะเบียนรถยนต์ของลูกค้า'
    if (!/^[ก-๙0-9\s.-]+$/.test(licensePlate.trim())) return 'ทะเบียนรถยนต์ต้องเป็นตัวเลขและภาษาไทยเท่านั้น (เช่น 1กข-1234 หรือ กข 1234)'
    if (!carType) return 'กรุณาเลือกชนิดระบบเกียร์รถยนต์'
    return ''
  }

  const handleStep1Next = () => {
    const err = validateStep1()
    if (err) {
      setError(err)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2Next = () => {
    const s1Err = validateStep1()
    if (s1Err) {
      setError(s1Err)
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!destination) {
      setError('กรุณาเลือกจุดหมายปลายทางของลูกค้า')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (distance <= 0) {
      setError('ไม่พบข้อมูลระยะทางจากจุดเริ่มต้นไปยังปลายทาง กรุณาเลือกจุดหมายใหม่อีกครั้งเพื่อคำนวณระยะทางจริง')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep3Next = () => {
    const s1Err = validateStep1()
    if (s1Err) {
      setError(s1Err)
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!destination || distance <= 0) {
      setError('กรุณาเลือกจุดหมายปลายทางของลูกค้า')
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        reqdatetime: (() => {
          const now = new Date()
          const pad = (n: number) => String(n).padStart(2, '0')
          return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, '0')}`
        })(),
        dropoffLatitude: destination?.lat,
        dropoffLongitude: destination?.lng,
        dropoffName: destination?.label || ''
      })
      if (res.data.success) {
        const requestId = res.data.data?.requestid || res.data.data?.id
        if (requestId && destination?.label) {
          try {
            localStorage.setItem(`safeseat_dest_name_${requestId}`, destination.label)
          } catch (e) {}
        }
        if (requestId) {
          try {
            if (fullCarModel) localStorage.setItem(`safeseat_carmodel_${requestId}`, fullCarModel)
            if (licensePlate) localStorage.setItem(`safeseat_carplate_${requestId}`, licensePlate)
          } catch (e) {}
        }
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
        <div className="absolute top-5 left-[6%] h-[2px] bg-gradient-to-r from-[#2340A7] to-[#2563EB] z-0 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 88}%` }} />
        {steps.map(s => {
          const isCurrent = step === s.num
          const isCompleted = step > s.num
          return (
            <div 
              key={s.num} 
              onClick={() => { if (s.num < step) setStep(s.num as Step) }}
              className={`flex flex-col items-center z-10 flex-1 ${s.num < step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base transition-all shadow-md ${
                isCompleted 
                  ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white border-none' 
                  : isCurrent 
                  ? 'bg-[var(--color-card)] border-2 border-[#2340A7] text-[#2340A7] ring-4 ring-[#2340A7]/20' 
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}>
                {isCompleted ? '✓' : s.num}
              </div>
              <span className={`text-sm sm:text-base font-bold mt-2.5 text-center font-manrope ${
                isCurrent || isCompleted ? 'text-[#2340A7]' : 'text-[var(--color-text-muted)]'
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
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">REQUEST SERVICE</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">เรียกรถให้ลูกค้า (Create Driver Request)</h1>
          </div>
          <div className="text-xs font-semibold px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            🏪 สถานบันเทิง: <span className="text-[var(--color-text)] font-bold">{pubName}</span>
          </div>
        </div>

        {rejectNotice && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-500 font-bold text-xs shadow-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <span>{rejectNotice}</span>
          </div>
        )}

        {}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl flex flex-col gap-8">
          {renderStepper()}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm sm:text-base font-bold flex items-center gap-2.5 animate-fade-in shadow-sm">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold font-manrope text-[var(--color-text)]">กรุณากรอกข้อมูลส่วนตัวของลูกค้า</h2>

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

              <div className="flex flex-col gap-2.5">
                <label className="text-[15.5px] font-bold text-[var(--color-text)]">ชื่อ - นามสกุลลูกค้า *</label>
                <input 
                  value={custName} 
                  onChange={e => {
                    const val = e.target.value
                    if (/^[ก-๙a-zA-Z\s.-]*$/.test(val)) {
                      setCustName(val)
                    }
                  }}
                  autoComplete="off"
                  className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                    isCustNameError
                      ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                      : 'border-[var(--color-border)] focus:border-[#2340A7]'
                  }`}
                  placeholder="กรอกชื่อ - นามสกุล" 
                />
                {isCustNameError && (
                  <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15.5px] font-bold text-[var(--color-text)]">เบอร์โทรติดต่อ *</label>
                  <input 
                    value={phoneNo} 
                    onChange={e => setPhoneNo(e.target.value)}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                      }
                    }}
                    maxLength={10} 
                    inputMode="numeric"
                    autoComplete="off"
                    className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                      isPhoneError
                        ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                        : 'border-[var(--color-border)] focus:border-[#2340A7]'
                    }`}
                    placeholder="กรุณากรอกเบอร์โทรศัพท์ (10 หลัก)" 
                  />
                  {isPhoneError && (
                    <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15.5px] font-bold text-[var(--color-text)]">เบอร์โทรติดต่อฉุกเฉิน *</label>
                  <input 
                    value={phoneEmer} 
                    onChange={e => setPhoneEmer(e.target.value)}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                      }
                    }}
                    maxLength={10} 
                    inputMode="numeric"
                    autoComplete="off"
                    className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                      isPhoneEmerError
                        ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                        : 'border-[var(--color-border)] focus:border-[#2340A7]'
                    }`}
                    placeholder="กรุณากรอกเบอร์โทรฉุกเฉิน (10 หลัก)" 
                  />
                  {isPhoneEmerError && (
                    <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15.5px] font-bold text-[var(--color-text)]">ยี่ห้อรถยนต์ *</label>
                  <input 
                    value={carBrand} 
                    onChange={e => setCarBrand(e.target.value)}
                    autoComplete="off"
                    className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                      isCarBrandError
                        ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                        : 'border-[var(--color-border)] focus:border-[#2340A7]'
                    }`}
                    placeholder="เช่น Honda, Toyota, BYD" 
                  />
                  {isCarBrandError && (
                    <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15.5px] font-bold text-[var(--color-text)]">รุ่นรถยนต์ *</label>
                  <input 
                    value={carModel} 
                    onChange={e => setCarModel(e.target.value)}
                    autoComplete="off"
                    className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                      isCarModelError
                        ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                        : 'border-[var(--color-border)] focus:border-[#2340A7]'
                    }`}
                    placeholder="เช่น Civic, Camry, Atto 3" 
                  />
                  {isCarModelError && (
                    <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[15.5px] font-bold text-[var(--color-text)]">ทะเบียนรถยนต์ *</label>
                  <input 
                    value={licensePlate} 
                    onChange={e => {
                      const val = e.target.value
                      if (/^[ก-๙0-9\s.-]*$/.test(val)) {
                        setLicensePlate(val)
                      }
                    }}
                    autoComplete="off"
                    className={`w-full px-4 py-3.5 bg-[var(--color-surface)] border rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none transition-colors ${
                      isLicensePlateError
                        ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                        : 'border-[var(--color-border)] focus:border-[#2340A7]'
                    }`}
                    placeholder="เช่น 1กข 1234 หรือ กข 1234 เชียงใหม่" 
                  />
                  {isLicensePlateError && (
                    <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[15.5px] font-bold text-[var(--color-text)]">ชนิดระบบเกียร์รถยนต์ *</label>
                <div className="grid grid-cols-3 gap-3.5">
                  {['Autometric', 'Manual', 'Electric'].map(type => {
                    const active = carType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCarType(type)}
                        className={`py-4 px-3 rounded-xl text-[15px] font-bold tracking-wider transition-all border cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white border-transparent shadow-md'
                            : isCarTypeError
                            ? 'bg-[var(--color-surface)] border-red-500 text-[var(--color-text-muted)]'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[#2340A7]'
                        }`}
                      >
                        {type === 'Autometric' ? '🚗 Auto' : type === 'Manual' ? '⚙️ Manual' : '⚡ Electric'}
                      </button>
                    )
                  })}
                </div>
                {isCarTypeError && (
                  <span className="text-xs text-red-500 font-semibold block">⚠️ {error}</span>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[15.5px] font-bold text-[var(--color-text)]">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  maxLength={100} 
                  rows={3}
                  autoComplete="off"
                  className="w-full px-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[16px] text-[var(--color-text)] focus:outline-none focus:border-[#2340A7] transition-colors resize-none"
                  placeholder="เช่น ผู้ใช้บริการต้องการระบุข้อมูลที่อยู่เพิ่มเติม หรือข้อมูลที่ต้องการแจ้งให้ทราบ" 
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <button 
                  type="button"
                  onClick={() => router.push('/pub/dashboard')}
                  className="px-6 py-3 border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>
                <button 
                  onClick={handleStep1Next}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#1D358F] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  ดำเนินการต่อ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold font-manrope text-[var(--color-text)]">เลือกจุดหมายปลายทาง</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-500 text-sm sm:text-base font-bold w-full">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span>จุดรับ: {pubName}</span>
                </div>
                <span className="text-[var(--color-text-muted)] font-bold text-lg">→</span>
                <div
                  onClick={() => setShowMap(true)}
                  className={`flex-1 flex items-center gap-2.5 p-4 bg-[var(--color-surface)] border rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-colors w-full ${
                    isDestError
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-[var(--color-border)] hover:border-[#2340A7]'
                  }`}
                >
                  <MapPin className="w-5 h-5 shrink-0 text-[#2340A7]" />
                  <span className={destination ? 'text-[#2340A7]' : 'text-[var(--color-text-muted)]'}>
                    {destination ? (destination.label || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`) : 'กรุณาคลิกเลือกจุดหมายปลายทาง'}
                  </span>
                </div>
              </div>
              {isDestError && (
                <span className="text-xs text-red-500 font-semibold block -mt-2">⚠️ {error}</span>
              )}

              {destination ? (
                <div className="p-6 bg-[var(--color-surface)] border-2 border-[#2340A7] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-[#2340A7]/15 rounded-xl text-[#2340A7]">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-[var(--color-text)]">จุดหมายปลายทางที่เลือก</div>
                      <div className="text-sm sm:text-base font-bold text-[#2340A7] mt-1">{destination.label}</div>
                      <div className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">พิกัด: {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMap(true)} 
                    className="px-5 py-2.5 border border-[var(--color-border)] rounded-full text-sm font-bold text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer"
                  >
                    เปลี่ยนตำแหน่ง
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3">
                  <MapPin className="w-14 h-14 text-[#2340A7]" />
                  <h3 className="text-lg font-bold text-[var(--color-text)]">ยังไม่ได้เลือกจุดหมายปลายทาง</h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-sm">กรุณากดปุ่มด้านล่างเพื่อเปิดแผนที่และปักหมุดตำแหน่งจุดหมายปลายทางให้คนขับไปส่ง</p>
                  <button 
                    onClick={() => setShowMap(true)}
                    className="mt-2 px-7 py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-full shadow-md cursor-pointer flex items-center gap-2"
                  >
                    🗺️ เปิดแผนที่เพื่อระบุตำแหน่ง
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => { setError(''); setStep(1) }}
                  className="px-7 py-3.5 border border-[var(--color-border)] rounded-full text-sm sm:text-base font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>
                <button
                  onClick={handleStep2Next}
                  disabled={loadingRoute}
                  className="px-9 py-4 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-full shadow-md hover:from-[#1D358F] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  {loadingRoute ? 'กำลังคำนวณ...' : 'ยืนยันพิกัด →'}
                </button>
              </div>
            </div>
          )}

          {}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold font-manrope text-[var(--color-text)]">ตรวจสอบข้อมูล &amp; บริการความปลอดภัย</h2>
              
              {destination && (
                <div className="h-64 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md">
                  <RouteMap pickupLat={pickupLat} pickupLng={pickupLng} dropoffLat={destination.lat} dropoffLng={destination.lng} distance={distance} />
                </div>
              )}

              {/* ข้อมูลลูกค้าและช่องทางการติดต่อ */}
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-3 shadow-xs">
                <div className="text-sm font-extrabold text-[#2340A7] flex items-center gap-2 border-b border-[var(--color-border)] pb-2.5">
                  <span>👤</span> ข้อมูลผู้ใช้บริการ &amp; ช่องทางการติดต่อ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">ชื่อ - นามสกุลลูกค้า</div>
                    <div className="text-sm font-bold text-[var(--color-text)] mt-0.5">{custName || '—'}</div>
                  </div>
                  <div className="p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">เบอร์โทรศัพท์ติดต่อ</div>
                    <div className="text-sm font-bold text-[var(--color-text)] mt-0.5">{phoneNo || '—'}</div>
                  </div>
                  <div className="p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">เบอร์โทรติดต่อฉุกเฉิน</div>
                    <div className="text-sm font-bold text-[var(--color-text)] mt-0.5">{phoneEmer || '—'}</div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลรถยนต์และจุดหมายปลายทาง */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/15 rounded-lg text-indigo-500 text-xl">🚗</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">รถยนต์ / ทะเบียน / ระบบเกียร์</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{carBrand} {carModel} ({licensePlate}) · {carType === 'Autometric' ? 'Auto' : carType}</div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/15 rounded-lg text-indigo-500 text-xl">📍</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">จุดหมายปลายทาง ({distance.toFixed(2)} กม.)</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{destination?.label || '-'}</div>
                  </div>
                </div>
              </div>

              {note && (
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-amber-500/15 rounded-lg text-amber-500 text-lg shrink-0">📝</div>
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">หมายเหตุเพิ่มเติม</div>
                    <div className="text-sm font-semibold text-[var(--color-text)] mt-0.5">{note}</div>
                  </div>
                </div>
              )}

              <div className="p-5 bg-[#2340A7]/10 border border-[#2340A7]/30 rounded-2xl flex items-center justify-between">
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
                    className="w-5 h-5 accent-[#2340A7] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => { setError(''); setStep(2) }}
                  className="px-7 py-3.5 border border-[var(--color-border)] rounded-full text-sm sm:text-base font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  ← ย้อนกลับ
                </button>
                <button 
                  onClick={handleStep3Next}
                  className="px-9 py-4 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-full shadow-md hover:from-[#1D358F] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
                >
                  ดำเนินการต่อ →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold font-manrope text-[var(--color-text)]">เลือกช่องทางการชำระเงิน</h2>

              <div className="p-6 bg-gradient-to-r from-[#2340A7]/15 to-[#2563EB]/15 border border-[#2340A7]/40 rounded-2xl flex items-center gap-4">
                <div className="p-4 bg-[#2340A7] text-white rounded-xl shadow-md">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-muted)] font-medium">ค่าบริการประมาณการตามระยะทาง ({distance.toFixed(2)} กม.)</div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-manrope text-[var(--color-text)] mt-1">฿{estimatedPrice}</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
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
                      className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        active
                          ? 'border-2 border-[#2340A7] bg-[#2340A7]/10 shadow-md'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[#2340A7]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#2340A7]' : 'border-[var(--color-border)]'}`}>
                        {active && <div className="w-3 h-3 rounded-full bg-[#2340A7]" />}
                      </div>
                      <div className="p-3 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] text-[#2340A7]">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-[var(--color-text)]">{opt.name}</div>
                        <div className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {paymentMethod === 2 && !verifyingPayment && (
                <div className="p-6 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-4 text-center">
                  <div className="text-sm font-bold text-[#2340A7] uppercase tracking-wider font-manrope">PROMPTPAY QR CODE</div>
                  <div className="p-4 bg-white rounded-2xl shadow-md border overflow-hidden">
                    <img 
                      src="/images/promptpay_qr.png"
                      alt="PromptPay QR Code"
                      className="w-52 h-52 object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-xl font-extrabold text-[var(--color-text)]">ยอดชำระเงิน: ฿{estimatedPrice}</div>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-sm">* สแกนเพื่อโอนชำระเงินล่วงหน้า หรือชำระเงินสดกับคนขับเมื่อถึงที่หมาย</p>
                </div>
              )}

              {verifyingPayment && (
                <div className="p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3 text-center">
                  <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin" />
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
                  className="px-8 py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:from-[#1D358F] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-2"
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
          <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin" />
          <p className="text-sm font-bold">กำลังโหลดหน้าจอเรียกรถ...</p>
        </div>
      </div>
    }>
      <RequestDriverContent />
    </Suspense>
  )
}
