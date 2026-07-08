'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'

// We reuse the RouteMap component to show the pickup and dropoff points
const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
};

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
  const [hasAlertedAccepted, setHasAlertedAccepted] = useState(false)
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
      if (elapsedSeconds >= 60) {
        setIsRequestTimeout(true)
      } else {
        setIsRequestTimeout(false)
      }
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
    if (reqData && reqData.requeststatus === 'กำลังไปรับ' && !hasAlertedAccepted) {
      alert('คนขับตอบรับงานของคุณแล้ว!')
      setHasAlertedAccepted(true)
    }
  }, [reqData, hasAlertedAccepted])

  const goBack = () => {
    if (isPubLoggedIn) {
      router.push('/pub/dashboard')
    } else {
      router.push('/')
    }
  }

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
        setError(res.data.message || 'ไม่พบข้อมูล')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  // Poll request details from database
  useEffect(() => {
    if (!requestId) {
      const isPub = typeof window !== 'undefined' && localStorage.getItem('pub_user')
      router.push(isPub ? '/pub/dashboard' : '/')
      return
    }

    fetchRequestData()

    // Poll status every 10 seconds
    const pollInterval = setInterval(fetchRequestData, 10000)

    return () => clearInterval(pollInterval)
  }, [requestId, router])

  if (loading) {
    return (
      <div style={s.pageCenter}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลดข้อมูลการบริการ...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !reqData) {
    return (
      <div style={s.pageCenter}>
        <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: 40, borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 8px' }}>เกิดข้อผิดพลาด</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>{error}</p>
          <button style={s.btnPrimary} onClick={goBack}>{isPubLoggedIn ? 'กลับ Dashboard' : 'กลับหน้าแรก'}</button>
        </div>
      </div>
    )
  }

  const {
    custname, phoneno,
    pickuplatitude, pickuplongitude,
    dropofflatitude, dropofflongitude,
    requeststatus, reqdistance, requestfee,
    requiredcartype, paymentmethod,
    buddy_team_id, note
  } = reqData

  const carTypeLabel = requiredcartype === 1 ? 'EV' : (requiredcartype === 2 ? 'Manual' : 'Auto')
  const payLabel = paymentmethod === 1 ? 'เงินสด' : 'โอนเงิน / PromptPay'

  // คำนวณขั้นตอนปัจจุบัน (1-4) ตามข้อมูลสถานะในฐานข้อมูล
  const currentStep = (requeststatus === 'กำลังไปรับ') ? 1
                    : (requeststatus === 'ถึงจุดรับแล้ว') ? 2
                    : (requeststatus === 'ระหว่างเดินทาง') ? 3
                    : (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') ? 4
                    : 0;

  let displayStatus = requeststatus
  if (requeststatus === 'รอคนขับ') {
    displayStatus = 'รอคนขับตอบรับงาน...'
  } else if (requeststatus === 'กำลังไปรับ') {
    displayStatus = 'กำลังรอคนขับ'
  } else if (requeststatus === 'ถึงจุดรับแล้ว') {
    displayStatus = 'คนขับถึงจุดรับแล้ว (กำลังเริ่มออกเดินทาง)'
  } else if (requeststatus === 'ระหว่างเดินทาง') {
    displayStatus = 'กำลังเดินทางไปยังจุดหมายปลายทาง'
  } else if (requeststatus === 'เสร็จสิ้น' || requeststatus === 'completed') {
    displayStatus = 'เสร็จสิ้นการบริการ (ถึงที่หมายเรียบร้อย)'
  }

  const displayBuddy = (reqData.leader && reqData.follower)
    ? `ทีมคู่หู SafeSeat (คุณ${reqData.leader.firstname} & คุณ${reqData.follower.firstname})`
    : 'กำลังจัดหาทีมคนขับคู่หู SafeSeat...'

  const driver1Name = reqData.leader 
    ? `${reqData.leader.firstname} ${reqData.leader.lastname} (คนขับรถของคุณ)`
    : 'ผู้ให้บริการ SafeSeat'
  const driver2Name = reqData.follower
    ? `${reqData.follower.firstname} ${reqData.follower.lastname} (ผู้ช่วย)`
    : 'ผู้ช่วยคนขับ SafeSeat'
  const licensePlate = reqData.leader?.license_plate || '—'

  let driverLat: number | undefined = undefined
  let driverLng: number | undefined = undefined

  // อัปเดตพิกัดคนขับตามสถานะในฐานข้อมูล
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
  const isCancelled = requeststatus === 'ยกเลิก' || requeststatus === 'cancelled'

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.logoCircle}>🛡️</div>
          <span style={s.logoText}>Safe<span style={s.logoAccent}>Seat</span></span>
        </div>
        <button onClick={goBack} style={s.backBtn}>
          ← {isPubLoggedIn ? 'กลับ Dashboard' : 'กลับหน้าแรก'}
        </button>
      </nav>

      <main style={s.main} className="main-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Top Row: Map spanning full width */}
          <div style={{ ...s.mapWrapper, height: 420 }}>
            <RouteMap 
              pickupLat={pickuplatitude} pickupLng={pickuplongitude} 
              dropoffLat={dropofflatitude} dropoffLng={dropofflongitude} 
              driverLat={driverLat} driverLng={driverLng}
            />
            {/* Overlay Status */}
            <div style={s.statusOverlay}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>สถานะการเดินทาง</div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: isCompleted ? '#059669' : (isRequestTimeout ? '#dc2626' : '#4f46e5'),
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  ...s.pulsingDot,
                  backgroundColor: isCompleted ? '#10b981' : (isRequestTimeout ? '#ef4444' : '#4f46e5'),
                  animation: (isCompleted || isRequestTimeout) ? 'none' : 'pulse 2s infinite'
                }}></span>
                {isRequestTimeout ? 'ไม่มีคนขับรับงาน' : (displayStatus || 'กำลังดำเนินการ')}
              </div>
            </div>
          </div>

          {/* Bottom Row: Info Card (3 Columns just like the image but matching our theme) */}
          <div style={{ ...s.card, padding: '32px 40px' }} className="tracking-card">
            
            {/* Metadata details (Moved to top of card, below the map and above the details) */}
            <div className="metadata-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
              paddingBottom: 20,
              borderBottom: '1.5px dashed #cbd5e1',
              marginBottom: 28
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>รหัสการเรียก</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>#{alphaCode}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>ลูกค้า</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{custname}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>ระยะทาง</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{reqdistance ? `${reqdistance.toFixed(2)} กม.` : '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>ช่องทางชำระ & ยอดรวม</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>
                  ฿{requestfee || '-'} ({payLabel})
                </span>
              </div>
            </div>

            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1.45fr 1.75fr 0.8fr', gap: 40, alignItems: 'start' }}>
              
              {/* Column 1: Left - Status and Vehicle details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: isRequestTimeout ? '#dc2626' : '#4f46e5', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                    {isRequestTimeout && "หมดเวลาค้นหาคนขับ"}
                    {!isRequestTimeout && currentStep === 0 && "กำลังหาคู่หูคนขับ"}
                    {!isRequestTimeout && currentStep === 1 && "กำลังรอคนขับ"}
                    {!isRequestTimeout && currentStep === 2 && "คนขับถึงจุดรับแล้ว!"}
                    {!isRequestTimeout && currentStep === 3 && "กำลังเดินทาง!"}
                    {!isRequestTimeout && currentStep === 4 && "ถึงจุดหมายปลายทาง!"}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {isRequestTimeout && <span style={{ whiteSpace: 'nowrap' }}>ขออภัยด้วยครับ ไม่มีคนขับตอบรับงานภายในเวลาที่กำหนด</span>}
                    {!isRequestTimeout && currentStep === 0 && "ระบบกำลังส่งรายละเอียดการเรียกรถไปยังคนขับโดยรอบ"}
                    {!isRequestTimeout && currentStep === 1 && "กรุณารอสักครู่ คนขับกำลังเดินทางมาหาคุณ"}
                    {!isRequestTimeout && currentStep === 2 && "คนขับมาถึงแล้ว กรุณาไปที่รถของท่าน"}
                    {!isRequestTimeout && currentStep === 3 && "ระบบกำลังนำส่งท่านไปยังจุดหมายปลายทาง"}
                    {!isRequestTimeout && currentStep === 4 && "การเดินทางเสร็จสิ้นปลอดภัย ส่งผู้โดยสารเรียบร้อย"}
                  </p>
                </div>
                
                {/* Vehicle details */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#e0e7ff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0
                  }}>
                    🚗
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>รถยนต์ผู้ให้บริการ</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginTop: 1 }}>
                      {carTypeLabel === 'EV' ? 'BYD Atto 3 (Electric)' : (carTypeLabel === 'Manual' ? 'Toyota Yaris (Manual)' : 'Honda Civic (Auto)')}
                    </div>
                    <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, marginTop: 1 }}>{licensePlate}</div>
                  </div>
                </div>

                {/* Contact box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
                }}
                className="contact-box"
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#dcfce7', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: '#15803d', flexShrink: 0
                  }}>
                    📞
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>ติดต่อคนขับรถของคุณ</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>ช่องทางการติดต่อผู้ให้บริการ</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Middle - Driver Profiles or Pending State */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(reqData.leader || requeststatus !== 'รอคนขับ') ? (
                  <>
                    {/* Driver 1 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 20px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 16,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        backgroundColor: '#eff6ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, border: '2px solid #bfdbfe'
                      }}>
                        👨‍✈️
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                          {driver1Name}
                        </div>
                        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          ⭐ 5.0 คะแนน
                        </div>
                      </div>
                    </div>

                    {/* Driver 2 (Helper) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 20px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 16,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        backgroundColor: '#fff1f2', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, border: '2px solid #fecdd3'
                      }}>
                        👩‍✈️
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                          {driver2Name}
                        </div>
                        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          ⭐ 5.0 คะแนน
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  isRequestTimeout ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '28px 20px',
                      backgroundColor: '#fef2f2',
                      border: '1.5px dashed #ef4444',
                      borderRadius: 16,
                      color: '#dc2626',
                      textAlign: 'center',
                      height: '100%',
                      minHeight: 180
                    }}>
                      <span style={{ fontSize: 28 }}>⏱️</span>
                      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Prompt', sans-serif" }}>ไม่มีคนขับรับงาน</div>
                      <div style={{ fontSize: 12, color: '#b91c1c', fontFamily: "'Prompt', sans-serif", lineHeight: 1.4 }}>ขออภัยครับ ไม่มีคนขับพร้อมรับงานในพื้นที่ภายในระยะเวลาที่กำหนด</div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '28px 20px',
                      backgroundColor: '#fffbeb',
                      border: '1.5px dashed #f59e0b',
                      borderRadius: 16,
                      color: '#d97706',
                      textAlign: 'center',
                      height: '100%',
                      minHeight: 180
                    }}>
                      <span style={{ fontSize: 28 }}>⏳</span>
                      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Prompt', sans-serif" }}>กำลังจัดหาคู่หูคนขับ...</div>
                      <div style={{ fontSize: 12, color: '#b45309', fontFamily: "'Prompt', sans-serif", lineHeight: 1.4 }}>เมื่อมีทีมคนขับตอบรับงาน ระบบจะแสดงข้อมูลคนขับและช่องทางติดต่อทันที</div>
                    </div>
                  )
                )}

                {/* QR Code and Sharing Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  marginTop: 6
                }}>
                  {/* Simulated/Real QR Code generation of current tracking page */}
                  <div style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    {trackingUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(trackingUrl)}`}
                        alt="Tracking QR Code"
                        style={{ width: 72, height: 72, display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: 72, height: 72, backgroundColor: '#f1f5f9', borderRadius: 6 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                      📱 สแกนเพื่อติดตามบนมือถือ
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (trackingUrl) {
                          navigator.clipboard.writeText(trackingUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: copied ? '#059669' : '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: "'Prompt', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      {copied ? '✅ คัดลอกสำเร็จ!' : '📋 คัดลอกลิงก์การเดินทาง'}
                    </button>
                  </div>
                </div>


                {/* Cancel Button */}
                {currentStep < 3 && (
                  <button 
                    type="button"
                    style={{
                      width: '100%',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 16px',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(239,68,68,0.15)',
                      transition: 'all 0.2s',
                      fontFamily: "'Prompt', sans-serif",
                      marginTop: 10
                    }}
                    onClick={goBack}
                    className="cancel-btn"
                  >
                    ยกเลิกการใช้บริการ
                  </button>
                )}
              </div>

              {/* Column 3: Right - Timer */}
              <div className="timer-column" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '16px 10px',
                borderLeft: '1.5px solid #e2e8f0',
                height: '100%'
              }}>
                <div style={{
                  fontSize: 54,
                  animation: currentStep === 3 ? 'pulse 2s infinite' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ⏰
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: isRequestTimeout ? '#dc2626' : '#4f46e5',
                  textAlign: 'center',
                  fontFamily: "'Prompt', sans-serif",
                  marginTop: 4
                }}>
                  {isRequestTimeout && "หมดเวลา"}
                  {!isRequestTimeout && currentStep === 0 && "รอคนขับ"}
                  {!isRequestTimeout && currentStep === 1 && "5 นาที"}
                  {!isRequestTimeout && currentStep === 2 && "45 นาที"}
                  {!isRequestTimeout && currentStep === 3 && "15 นาที"}
                  {!isRequestTimeout && currentStep === 4 && "ถึงที่หมาย"}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 2, lineHeight: 1.3 }}>
                  {isRequestTimeout && "ค้นหาไม่สำเร็จ"}
                  {!isRequestTimeout && currentStep === 0 && "กำลังจัดหาทีมคนขับ"}
                  {!isRequestTimeout && currentStep === 1 && "เวลาที่คาดว่าจะมาถึง"}
                  {!isRequestTimeout && currentStep === 2 && "เวลาสลับตัวคนขับ"}
                  {!isRequestTimeout && currentStep === 3 && "เวลาประเมินปลายทาง"}
                  {!isRequestTimeout && currentStep === 4 && "เดินทางสำเร็จปลอดภัย"}
                </div>
              </div>

            </div>

            {/* Bottom Row: Metadata details removed (moved to top) */}

            {isCompleted && (
              <div style={{
                marginTop: 20,
                padding: '14px',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#059669',
                borderRadius: 12,
                fontWeight: 700,
                textAlign: 'center',
                fontSize: 14
              }}>
                ✅ การเดินทางเสร็จสิ้นเรียบร้อยแล้ว ส่งถึงที่หมายปลายทางอย่างปลอดภัย!
              </div>
            )}

            {isCancelled && (
              <div style={{ ...s.successBox, backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginTop: 20 }}>
                ❌ การเรียกบริการถูกยกเลิก
              </div>
            )}

            {isRequestTimeout && (
              <div style={{
                marginTop: 20,
                padding: '14px',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#dc2626',
                borderRadius: 12,
                fontWeight: 700,
                textAlign: 'center',
                fontSize: 14
              }}>
                ❌ หมดเวลาค้นหาคนขับ: ไม่มีคนขับตอบรับงานภายในระยะเวลาที่กำหนด กรุณาติดต่อหน้าร้านหรือทำรายการใหม่อีกครั้ง
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Kanit', sans-serif; }
        
        .contact-box:hover {
          border-color: #4f46e5 !important;
          background-color: #f5f3ff !important;
        }
        .cancel-btn:hover {
          background-color: #dc2626 !important;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }

        @media (max-width: 768px) {
          .main-container {
            padding: 16px 12px !important;
          }
          .tracking-card {
            padding: 24px 16px !important;
          }
          .metadata-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            padding-bottom: 16px !important;
            margin-bottom: 16px !important;
          }
          .details-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .timer-column {
            border-left: none !important;
            border-top: 1.5px solid #e2e8f0 !important;
            padding-top: 24px !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  pageCenter: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: "'Prompt', sans-serif",
  },
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Prompt', sans-serif",
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
  backBtn: {
    backgroundColor: 'transparent', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '6px 14px',
    fontSize: 13, color: '#4f46e5', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: 32,
    alignItems: 'start',
  },
  mapColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  mapWrapper: {
    height: 600,
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #cbd5e1',
  },
  statusOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '12px 20px',
    borderRadius: 16,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 1000, // Above leaflet
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    backgroundColor: '#4f46e5',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  infoColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px',
  },
  requestId: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  driverBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
  },
  driverIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  divider: {
    border: 'none',
    borderTop: '1px dashed #cbd5e1',
    margin: '24px 0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: 600,
  },
  infoSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  successBox: {
    marginTop: 24,
    padding: '16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#059669',
    borderRadius: 12,
    fontWeight: 600,
    textAlign: 'center',
  }
}

export default function TrackingPage() {
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
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลด...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
