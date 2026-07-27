'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false })
const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

type Step = 1 | 2 | 3 | 4

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
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
  const [note, setNote] = useState('')
  const [isLadyMode, setIsLadyMode] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<1 | 2>(2) // 1=cash, 2=transfer
  const [destination, setDestination] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [showMap, setShowMap] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [createdRequestId, setCreatedRequestId] = useState<string | number>('')
  const [distance, setDistance] = useState<number>(0)
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false)

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    setPubUser(JSON.parse(userStr))
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
          if (parsed.note) setNote(parsed.note)
          if (parsed.isLadyMode !== undefined) setIsLadyMode(parsed.isLadyMode)
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod)
          if (parsed.destination) setDestination(parsed.destination)
        } catch (e) {
          console.error('Error parsing saved request form:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const formData = {
        custName,
        phoneNo,
        phoneEmer,
        carType,
        note,
        isLadyMode,
        paymentMethod,
        destination
      }
      localStorage.setItem('safeseat_request_form', JSON.stringify(formData))
    }
  }, [custName, phoneNo, phoneEmer, carType, note, isLadyMode, paymentMethod, destination])

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
          const estimatedDrivingDist = straightDist * 1.3 // circuity factor
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
    try {
      let finalNote = note;
      if (paymentMethod === 2 && simulatedPaymentStatus) {
        const statusText = simulatedPaymentStatus === 'paid' ? 'ชำระเงินแล้ว' : 'ยังไม่ได้ชำระเงิน';
        finalNote = note ? `${note} [${statusText}]` : `[${statusText}]`;
      }
      const res = await api.post('/pub/request-driver', {
        pubUsername: pubUser.username,
        custName, phoneNo, phoneEmer,
        carType,
        isLadyMode,
        note: finalNote,
        paymentMethod,
        dropoffLatitude: destination?.lat,
        dropoffLongitude: destination?.lng,
      })
      if (res.data.success) {
        const requestId = res.data.data?.requestid || res.data.data?.id
        router.push(`/pub/waiting?id=${requestId}`)
      } else {
        setError(res.data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 19, left: '6%', right: '6%', height: 2, backgroundColor: '#e2e8f0', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 19, left: '6%', width: `${((step - 1) / 3) * 88}%`, height: 2, backgroundColor: '#4f46e5', zIndex: 0, transition: 'all 0.3s' }} />
        {steps.map(s => {
          const isCurrent = step === s.num
          const isCompleted = step > s.num
          return (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, cursor: s.num < step ? 'pointer' : 'default' }} onClick={() => { if (s.num < step) setStep(s.num as Step) }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                backgroundColor: isCompleted ? '#4f46e5' : '#ffffff',
                border: isCompleted ? '2px solid #4f46e5' : (isCurrent ? '2px solid #4f46e5' : '2px solid #cbd5e1'),
                color: isCompleted ? '#ffffff' : (isCurrent ? '#4f46e5' : '#64748b'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                boxShadow: isCurrent ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
              }}>
                {isCompleted ? '✓' : s.num}
              </div>
              <span style={{ fontSize: 13, fontWeight: isCurrent || isCompleted ? 600 : 400, color: isCurrent || isCompleted ? '#4f46e5' : '#64748b', marginTop: 8, textAlign: 'center' }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (!pubUser) return null
  if (success) {
    const trackingCode = createdRequestId
    const trackingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/tracking?id=${trackingCode}`
      : `http://localhost:3000/tracking?id=${trackingCode}`

    return (
      <div style={s.page}>
        <nav style={s.navbar}><NavContent pubName={pubName} router={router} /></nav>
        <div style={s.heroBar}>
          <span style={s.heroLeft}>เรียก Safe Seat</span>
          <span style={s.heroRight}>Hello {pubName}</span>
        </div>
        <main style={s.main}>
          <div style={s.card}>
            <div style={{ textAlign: 'center', padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: 64, margin: '0 auto 8px' }}>✅</div>
              <h2 style={{ color: '#4f46e5', fontSize: 24, fontWeight: 700, margin: 0 }}>เรียกรถสำเร็จ!</h2>
              <p style={{ color: '#64748b', fontSize: 15, margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
                บันทึกการเดินทางเรียบร้อยแล้ว แนะนำให้ลูกค้าหรือคนรู้จักสแกน QR Code ด้านล่างนี้เพื่อติดตามสถานะการเดินทางแบบเรียลไทม์
              </p>

              {/* QR Code Container */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 24,
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                marginTop: 8,
                width: '100%',
                maxWidth: '360px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 16, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`}
                    alt="Trip Tracking QR Code"
                    style={{ width: 200, height: 200, display: 'block' }}
                  />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>รหัสติดตามการเดินทาง (Tracking Code)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5', marginTop: 4, letterSpacing: '1px' }}>{trackingCode}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, width: '100%', maxWidth: '360px' }}>
                <button 
                  onClick={() => router.push(`/pub/tracking?id=${trackingCode}`)}
                  style={{
                    width: '100%',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 16px',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Kanit', sans-serif"
                  }}
                >
                  ติดตามการเดินทาง →
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <NavContent pubName={pubName} router={router} />
      </nav>

      {/* Hero Bar */}
      <div style={s.heroBar}>
        <span style={s.heroLeft}>เรียก Safe Seat</span>
        <span style={s.heroRight}>Hello {pubName}</span>
      </div>

      <main style={s.main}>
        <div style={s.card}>
          {renderStepper()}

          {/* ─── STEP 1: กรอกข้อมูลส่วนตัว ─── */}
          {step === 1 && (
            <div style={s.stepContainer}>
              <h2 style={s.cardTitle}>กรุณากรอกข้อมูลส่วนตัวของลูกค้า</h2>
              {error && <div style={s.errorBox}>{error}</div>}

              <div style={s.fieldFull}>
                <label style={s.label}>ชื่อ - นามสกุล *</label>
                <input value={custName} onChange={e => setCustName(e.target.value)}
                  style={s.input} placeholder="กรอกชื่อ - นามสกุล" />
              </div>

              <div style={s.fieldRow}>
                <div style={s.field}>
                  <label style={s.label}>เบอร์โทรติดต่อ *</label>
                  <input value={phoneNo} onChange={e => setPhoneNo(e.target.value)}
                    maxLength={10} style={s.input} placeholder="เช่น 083xxxxxxx" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>เบอร์โทรติดต่อฉุกเฉิน *</label>
                  <input value={phoneEmer} onChange={e => setPhoneEmer(e.target.value)}
                    maxLength={10} style={s.input} placeholder="เช่น 083xxxxxxx" />
                </div>
              </div>

              <div style={s.fieldFull}>
                <label style={s.label}>ชนิดรถยนต์ของลูกค้า *</label>
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  {['Autometric', 'Manual', 'Electric'].map(type => {
                    const active = carType === type
                    return (
                      <div
                        key={type}
                        onClick={() => setCarType(type)}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '14px 10px',
                          borderRadius: 12,
                          border: active ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                          backgroundColor: active ? '#f5f3ff' : '#ffffff',
                          color: active ? '#4f46e5' : '#475569',
                          fontWeight: active ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: 14,
                        }}
                      >
                        {type === 'Autometric' ? '🚗 Auto' : type === 'Manual' ? '⚙️ Manual' : '⚡ Electric'}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={s.fieldFull}>
                <label style={s.label}>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  maxLength={100} rows={3}
                  style={{ ...s.input, resize: 'none' } as React.CSSProperties}
                  placeholder="เช่น ผู้ใช้บริการต้องการระบุข้อมูลที่อยู่เพิ่มเติม หรือข้อมูลที่ต้องการแจ้งให้ทราบ" />
              </div>

              <div style={s.btnCenter}>
                <button style={s.greenBtn} onClick={handleStep1Next}>ดำเนินการต่อ</button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: เลือกจุดหมาย ─── */}
          {step === 2 && (
            <div style={s.stepContainer}>
              <h2 style={s.cardTitle}>เลือกจุดหมายปลายทาง</h2>
              
              {/* Location bar */}
              <div style={s.locationBar}>
                <div style={s.locBubbleBlue}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span>จุดรับ: {pubName}</span>
                </div>
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
                <div
                  style={s.locBubbleRed}
                  onClick={() => setShowMap(true)}
                >
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span style={{ color: destination ? '#dc2626' : '#64748b' }}>
                    {destination ? (destination.label || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`) : 'กรุณาเลือกจุดหมายปลายทาง'}
                  </span>
                </div>
              </div>

              {error && <div style={s.errorBox}>{error}</div>}

              {/* Placeholder list or selected */}
              <div style={s.locationList}>
                {destination ? (
                  <div style={s.locationItemSelected}>
                    <span style={{ fontSize: 18 }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>จุดหมายปลายทางที่เลือก</div>
                      <div style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, marginTop: 2 }}>
                        {destination.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        ละติจูด {destination.lat.toFixed(5)}, ลองจิจูด {destination.lng.toFixed(5)}
                      </div>
                    </div>
                    <button onClick={() => setShowMap(true)} style={s.changeBtn}>เปลี่ยนตำแหน่ง</button>
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', margin: '0 0 8px' }}>
                      ยังไม่ได้เลือกจุดหมายปลายทาง
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
                      กรุณากดปุ่มด้านล่างเพื่อเปิดแผนที่<br/>และค้นหาหรือปักหมุดตำแหน่งที่ต้องการให้คนขับไปส่ง
                    </p>
                    <button style={s.mapBtn} onClick={() => setShowMap(true)}>
                      🗺️ เปิดแผนที่เพื่อระบุตำแหน่ง
                    </button>
                  </div>
                )}
              </div>

              <div style={s.btnRow}>
                <button style={s.outlineBtn} onClick={() => { setError(''); setStep(1) }}>← ย้อนกลับ</button>
                <button
                  style={{ ...s.greenBtn, opacity: loadingRoute ? 0.7 : 1, cursor: loadingRoute ? 'not-allowed' : 'pointer' }}
                  onClick={handleStep2Next}
                  disabled={loadingRoute}
                >
                  {loadingRoute ? 'กำลังคำนวณ...' : 'ยืนยันพิกัด'}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: ยืนยันข้อมูล ─── */}
          {step === 3 && (
            <div style={s.stepContainer}>
              <h2 style={s.cardTitle}>ตรวจสอบข้อมูล & บริการความปลอดภัย</h2>
              
              {/* Live route map display */}
              {destination && (
                <div style={{ height: 260, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <RouteMap pickupLat={pickupLat} pickupLng={pickupLng} dropoffLat={destination.lat} dropoffLng={destination.lng} />
                  <div style={{ position: 'absolute', left: 16, bottom: 16, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                    🛣️ ระยะทางประมาณ: {distance.toFixed(2)} กม.
                  </div>
                  <div style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#0f172a', border: '1px solid #cbd5e1' }}>
                    🛡️ ระบบติดตามความปลอดภัย
                  </div>
                </div>
              )}

              {/* Info section */}
              <div style={{ padding: '16px 8px 0' }}>
                {error && <div style={s.errorBox}>{error}</div>}
                <div style={s.infoGrid}>
                  <div style={s.infoItem}>
                    <span style={{ fontSize: 20 }}>👤</span>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>ชื่อลูกค้า</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{custName}</div>
                    </div>
                  </div>
                  <div style={s.infoItem}>
                    <span style={{ fontSize: 20 }}>📞</span>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>เบอร์โทรติดต่อ / ฉุกเฉิน</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{phoneNo} / {phoneEmer}</div>
                    </div>
                  </div>
                  <div style={s.infoItem}>
                    <span style={{ fontSize: 20 }}>🚗</span>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>ประเภทรถ</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{carType}</div>
                    </div>
                  </div>
                  <div style={s.infoItem}>
                    <span style={{ fontSize: 20 }}>📍</span>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>จุดหมายปลายทาง</div>
                      <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                        {destination?.label || '-'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                        {destination?.lat.toFixed(5)}, {destination?.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lady Mode */}
                <div style={s.ladyModeRow}>
                  <div style={s.ladyLeft}>
                    <span style={{ fontSize: 22 }}>👩</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Lady Mode (คนขับผู้หญิง)</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>เปิดตัวเลือกนี้หากต้องการเฉพาะคนขับผู้หญิง</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>ฟรี</span>
                    <input type="checkbox" checked={isLadyMode}
                      onChange={e => setIsLadyMode(e.target.checked)}
                      style={{ width: 20, height: 20, accentColor: '#4f46e5', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={s.btnRow}>
                  <button style={s.outlineBtn} onClick={() => { setError(''); setStep(2) }}>← ย้อนกลับ</button>
                  <button style={s.greenBtn} onClick={() => { setError(''); setStep(4) }}>ดำเนินการต่อ</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: ชำระเงิน ─── */}
          {step === 4 && (
            <div style={s.stepContainer}>
              <h2 style={s.cardTitle}>เลือกช่องทางการชำระเงิน</h2>
              {error && <div style={s.errorBox}>{error}</div>}

              <div style={s.priceBox}>
                <span style={{ fontSize: 24 }}>💳</span>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>ค่าบริการตามระยะทาง ({distance.toFixed(2)} กม.)</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#4f46e5' }}>฿{estimatedPrice}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#334155', margin: '20px 0 12px' }}>เลือกช่องทางการชำระเงิน</h3>

              {[
                { value: 2, icon: '📱', name: 'โอนเงิน / PromptPay', desc: 'สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking' },
                { value: 1, icon: '💵', name: 'เงินสด (Cash)', desc: 'ชำระเงินสดโดยตรงกับคนขับรถเมื่อถึงที่หมาย' },
              ].map(opt => (
                <div
                  key={opt.value}
                  style={{
                    ...s.payOption,
                    border: paymentMethod === opt.value ? '2.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                    backgroundColor: paymentMethod === opt.value ? '#f5f3ff' : '#ffffff',
                  }}
                  onClick={() => {
                    if (!verifyingPayment && !loading) {
                      setPaymentMethod(opt.value as 1 | 2);
                    }
                  }}
                >
                  <div style={{
                    ...s.radioCircle,
                    borderColor: paymentMethod === opt.value ? '#4f46e5' : '#cbd5e1',
                  }}>
                    {paymentMethod === opt.value && <div style={s.radioFill} />}
                  </div>
                  <span style={{ fontSize: 28 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{opt.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
              ))}

              {/* QR Code Container if PromptPay is selected */}
              {paymentMethod === 2 && !verifyingPayment && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 16,
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 16,
                  transition: 'all 0.3s'
                }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>Prompt Pay</span>
                    สแกนเพื่อชำระเงินนอกระบบ
                  </div>
                  
                  <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SafeSeat-Payment-Fee-${estimatedPrice}`}
                      alt="PromptPay QR Code"
                      style={{ width: 160, height: 160, display: 'block' }}
                    />
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>ยอดชำระเงิน</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>฿{estimatedPrice}</div>
                  </div>

                  <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
                    * สามารถชำระเงินตอนนี้ หรือชำระหลังจากถึงที่หมายกับคนขับโดยตรงก็ได้
                  </p>
                </div>
              )}

              {/* Verification Loading State */}
              {verifyingPayment && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '32px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 16,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>🔄</div>
                  <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: 15 }}>กำลังตรวจสอบการชำระเงินจำลอง...</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>ระบบกำลังจำลองการเชื่อมต่อ API ของธนาคาร</div>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Action Buttons */}
              <div style={s.btnRow}>
                <button 
                  style={s.outlineBtn} 
                  onClick={() => { setError(''); setStep(3) }}
                  disabled={loading || verifyingPayment}
                >
                  ← ย้อนกลับ
                </button>

                {paymentMethod === 2 ? (
                  // PromptPay buttons
                  <button
                    type="button"
                    style={{ 
                      ...s.greenBtn, 
                      opacity: loading || verifyingPayment ? 0.5 : 1,
                      cursor: loading || verifyingPayment ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (!loading && !verifyingPayment) {
                        setVerifyingPayment(true);
                        setError('');
                        setTimeout(() => {
                          setVerifyingPayment(false);
                          handleSubmit('paid');
                        }, 1500);
                      }
                    }}
                    disabled={loading || verifyingPayment}
                  >
                    ชำระเงินแล้ว
                  </button>
                ) : (
                  // Cash button
                  <button
                    style={{ ...s.greenBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleSubmit()}
                    disabled={loading}
                  >
                    {loading ? 'กำลังส่งข้อมูล...' : 'เรียกคนขับรถเลย!'}
                  </button>
                )}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Prompt', sans-serif; }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
        }
      `}</style>
    </div>
  )
}

function NavContent({ pubName, router }: { pubName: string; router: any }) {
  const handleLogout = () => {
    const isConfirmed = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
    if (isConfirmed) {
      localStorage.removeItem('pub_user')
      router.push('/login')
    }
  }
  return (
    <>
      <div style={s.navLeft}>
        <div style={s.logoCircle}>🛡️</div>
        <span onClick={() => router.push('/pub/dashboard')} style={{ ...s.logoText, cursor: 'pointer' }}>Safe<span style={s.logoAccent}>Seat</span></span>
      </div>
      <div style={s.navRight}>
        <span style={s.navLink} onClick={() => router.push('/pub/dashboard')}>หน้าแรก</span>
        <span style={s.navLink} onClick={() => router.push('/pub/service-info')}>ประวัติการเรียกรถ</span>
        <span style={{ ...s.navLink, display: 'flex', alignItems: 'center', gap: 6 }}>
          👤 {pubName}
        </span>
        <button onClick={handleLogout} style={s.logoutBtn}>ออกจากระบบ</button>
      </div>
    </>
  )
}

function Footer() {
  return (
    <footer style={s.footer}>
      © 2026 Safe Seat Application. All rights reserved.
    </footer>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Prompt', sans-serif",
    display: 'flex', flexDirection: 'column',
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 40px', height: 64,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, border: '2px solid #bfdbfe',
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  logoAccent: { color: '#4f46e5' },
  navRight: { display: 'flex', alignItems: 'center', gap: 20 },
  navLink: { fontSize: 14, color: '#4f46e5', cursor: 'pointer', fontWeight: 500 },
  logoutBtn: {
    background: 'none', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '6px 14px',
    fontSize: 12, color: '#64748b',
    cursor: 'pointer', fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
  },
  // Hero banner
  heroBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundImage: 'linear-gradient(to right, rgba(248,250,252,0.8), rgba(255,255,255,1), rgba(248,250,252,0.8))',
  },
  heroLeft: {
    fontSize: 24, fontWeight: 700, color: '#1e293b',
    letterSpacing: '-0.5px',
  },
  heroRight: {
    fontSize: 16, fontWeight: 600, color: '#64748b',
  },
  main: {
    flex: 1,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '40px 24px 60px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: '40px 48px',
    width: '100%',
    maxWidth: 860,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column',
  },
  stepContainer: {
    display: 'flex', flexDirection: 'column', gap: 24,
  },
  cardTitle: {
    fontSize: 20, fontWeight: 700, color: '#1e293b',
    textAlign: 'left' as const, margin: '0 0 8px 0',
  },
  errorBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 12,
    padding: '12px 18px', fontSize: 14,
  },
  // Form elements
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 8 },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: '#475569' },
  input: {
    padding: '13px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12, fontSize: 14,
    color: '#0f172a', backgroundColor: '#f8fafc',
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
  } as React.CSSProperties,
  btnCenter: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 },
  btnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 16 },
  greenBtn: {
    backgroundColor: '#4f46e5',
    border: 'none', borderRadius: 12,
    padding: '14px 40px',
    fontSize: 15, fontWeight: 600,
    color: '#ffffff', cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)',
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    border: '1.5px solid #cbd5e1',
    borderRadius: 12, padding: '13px 32px',
    fontSize: 14, color: '#475569',
    cursor: 'pointer', fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
  },
  mapBtn: {
    backgroundColor: '#f1f5f9',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '12px 24px',
    fontSize: 14, color: '#475569', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  // Step 2: Location
  locationBar: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '8px 0',
  },
  locBubbleBlue: {
    display: 'flex', alignItems: 'center', gap: 8,
    backgroundColor: '#eff6ff',
    border: '1.5px solid #dbeafe',
    borderRadius: 12, padding: '12px 20px',
    fontSize: 14, color: '#1e40af', fontWeight: 600,
  },
  locBubbleRed: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    backgroundColor: '#fff1f2',
    border: '1.5px solid #ffe4e6',
    borderRadius: 12, padding: '12px 20px',
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
  },
  locationList: { display: 'flex', flexDirection: 'column', gap: 12 },
  locationItem: {
    display: 'flex', alignItems: 'center', gap: 14,
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '16px 20px',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  locationItemSelected: {
    display: 'flex', alignItems: 'center', gap: 14,
    backgroundColor: '#f5f3ff',
    border: '2px solid #c7d2fe',
    borderRadius: 12, padding: '16px 20px',
  },
  changeBtn: {
    marginLeft: 'auto', background: 'none',
    border: '1.5px solid #c7d2fe', borderRadius: 8,
    padding: '8px 16px', fontSize: 13,
    color: '#4f46e5', cursor: 'pointer',
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
  },
  // Step 3: Confirmation
  mapPlaceholder: {
    height: 240,
    backgroundColor: '#e8f0fe',
    backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    position: 'relative',
    borderRadius: 16,
    display: 'flex', alignItems: 'flex-end',
    padding: 20,
  },
  mapLabel: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12, padding: '8px 16px',
    fontSize: 13, color: '#4f46e5', fontWeight: 600,
  },
  safetyBadge: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12, padding: '8px 16px',
    fontSize: 13, color: '#0f172a', fontWeight: 600,
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 24, marginBottom: 24,
  },
  infoItem: {
    display: 'flex', alignItems: 'center', gap: 14,
    backgroundColor: '#f8fafc', padding: '16px 20px',
    borderRadius: 16, border: '1px solid #e2e8f0',
  },
  ladyModeRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    border: '1.5px solid #ffedd5',
    borderRadius: 16, padding: '16px 24px',
    marginBottom: 16,
  },
  ladyLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  // Step 4: Payment
  priceBox: {
    display: 'flex', alignItems: 'center', gap: 20,
    padding: '20px 24px',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
  },
  payOption: {
    display: 'flex', alignItems: 'center', gap: 20,
    padding: '20px 24px', borderRadius: 16,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  radioCircle: {
    width: 22, height: 22, borderRadius: '50%',
    border: '2px solid #cbd5e1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  radioFill: {
    width: 12, height: 12, borderRadius: '50%',
    backgroundColor: '#4f46e5',
  },
  footer: {
    padding: '24px 40px',
    textAlign: 'center' as const,
    fontSize: 13,
    color: '#94a3b8',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
  },
}

export default function RequestDriverPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Prompt', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลดหน้าจอเรียกรถ...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <RequestDriverContent />
    </Suspense>
  )
}

