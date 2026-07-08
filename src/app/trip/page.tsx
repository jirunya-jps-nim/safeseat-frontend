'use client'
// ═══════════════════════════════════════════════════════════════
// app/trip/page.tsx
// หน้าแสดงความคืบหน้าการเดินทางสำหรับผู้ใช้ทั่วไป (Shared Trip Tracking)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '@/services/api'

// ดึง Component แผนที่แบบ dynamic เพื่อเลี่ยงปัญหา SSR ของ Leaflet
const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

function TripTrackingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id') // ดึง id ตรงๆ (เช่น 123)

  const [reqData, setReqData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && requestId) {
      setShareUrl(`${window.location.origin}/trip?id=${requestId}`)
    }
  }, [requestId])

  const fetchTripData = async () => {
    if (!requestId) return
    try {
      // ดึงข้อมูลความคืบหน้าการเดินทางระบุ requestId
      const res = await api.get(`/user/request/${requestId}`)
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

  // เริ่มดึงข้อมูลครั้งแรก และตั้งเวลา Polling ทุกๆ 5 วินาที
  useEffect(() => {
    if (!requestId) {
      setError('กรุณาระบุรหัสการเดินทาง (id)')
      setLoading(false)
      return
    }

    fetchTripData()
    const pollInterval = setInterval(fetchTripData, 5000) // ทุกๆ 5 วินาที

    return () => clearInterval(pollInterval)
  }, [requestId])

  if (loading) {
    return (
      <div style={s.pageCenter}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลดข้อมูลความคืบหน้าการเดินทาง...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !reqData) {
    return (
      <div style={s.pageCenter}>
        <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '40px 32px', borderRadius: 24, border: '1px solid #e2e8f0', maxWidth: 450, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 12px', fontSize: 20, fontWeight: 700 }}>เกิดข้อผิดพลาด</h2>
          <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>{error}</p>
          <button style={s.btnPrimary} onClick={() => router.push('/')}>กลับหน้าแรก</button>
        </div>
      </div>
    )
  }

  // สกัดข้อมูลจากการตอบกลับ
  const {
    requestid,
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

  // 1. ตรวจสอบค่าตำแหน่งคนขับล่าสุด (จากคู่หูบัดดี้ทีม)
  const driverLat = (buddyteam && buddyteam.currentloclat !== 0 && buddyteam.currentloclat !== null) ? buddyteam.currentloclat : undefined
  const driverLng = (buddyteam && buddyteam.currentloclng !== 0 && buddyteam.currentloclng !== null) ? buddyteam.currentloclng : undefined

  // 2. จับคู่ค่าของสถานะ (requeststatus Mapping)
  let statusText = 'กำลังดำเนินการ'
  let statusColor = '#4f46e5'
  let statusSubText = 'กรุณารอสักครู่ ระบบกำลังอัปเดตข้อมูล'

  const normalizedStatus = requeststatus ? requeststatus.trim() : ''

  if (normalizedStatus === 'กำลังค้นหาคนขับ' || normalizedStatus === 'รอคนขับ' || normalizedStatus === 'pending') {
    statusText = 'กำลังจับคู่คนขับ'
    statusColor = '#d97706'
    statusSubText = 'ระบบกำลังจัดหาทีมคนขับคู่หู SafeSeat ให้คุณ'
  } else if (normalizedStatus === 'กำลังไปรับ') {
    statusText = 'คนขับกำลังเดินทางไปรับคุณ'
    statusColor = '#2563eb'
    statusSubText = 'คนขับคู่หูกำลังเดินทางไปรับคุณที่จุดเริ่มต้น'
  } else if (normalizedStatus === 'ถึงจุดนัดหมาย' || normalizedStatus === 'ถึงจุดรับแล้ว') {
    statusText = 'คนขับเดินทางมาถึงตำแหน่งของคุณแล้ว'
    statusColor = '#7c3aed'
    statusSubText = 'กรุณาเดินทางไปยังรถยนต์ของท่านและพบบัดดี้ทีม'
  } else if (normalizedStatus === 'กำลังเดินทาง' || normalizedStatus === 'ระหว่างเดินทาง' || normalizedStatus === 'accepted') {
    statusText = 'อยู่ระหว่างเดินทางไปยังจุดหมาย'
    statusColor = '#0891b2'
    statusSubText = 'พนักงานบัดดี้ทีมกำลังนำส่งคุณไปยังจุดหมายอย่างปลอดภัย'
  } else if (normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed') {
    statusText = 'เดินทางถึงที่หมายปลอดภัย'
    statusColor = '#059669'
    statusSubText = 'การเดินทางสิ้นสุดเรียบร้อยแล้ว ส่งคุณถึงปลายทางอย่างปลอดภัย'
  } else if (normalizedStatus === 'ยกเลิก' || normalizedStatus === 'cancelled') {
    statusText = 'การเดินทางนี้ถูกยกเลิกแล้ว'
    statusColor = '#dc2626'
    statusSubText = 'รายการเรียกรถนี้ถูกกดยกเลิกในระบบแล้ว'
  }

  const isCompleted = normalizedStatus === 'เสร็จสิ้น' || normalizedStatus === 'completed'
  const isCancelled = normalizedStatus === 'ยกเลิก' || normalizedStatus === 'cancelled'

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div onClick={() => router.push('/')} style={{ ...s.navLeft, cursor: 'pointer' }}>
          <div style={s.logoCircle}>🛡️</div>
          <span style={s.logoText}>Safe<span style={s.logoAccent}>Seat</span></span>
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
          ระบบติดตามการเดินทางสาธารณะ
        </div>
      </nav>

      {/* ── ส่วนเนื้อหาหลัก ── */}
      <main style={s.main} className="main-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          
          {/* แผนที่แบบเต็มความกว้าง */}
          <div style={{ ...s.mapWrapper, height: 420 }}>
            <RouteMap
              pickupLat={pickuplatitude}
              pickupLng={pickuplongitude}
              dropoffLat={dropofflatitude}
              dropoffLng={dropofflongitude}
              driverLat={driverLat}
              driverLng={driverLng}
            />

            {/* การแสดงสถานะลอยบนแผนที่ */}
            <div style={s.statusOverlay}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>สถานะการเดินทาง</div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: statusColor,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  ...s.pulsingDot,
                  backgroundColor: statusColor,
                  animation: (isCompleted || isCancelled) ? 'none' : 'pulse 2s infinite'
                }}></span>
                {statusText}
              </div>
            </div>
          </div>

          {/* การ์ดรายละเอียดด้านล่าง */}
          <div style={s.card} className="tracking-card">
            
            {/* ส่วนหัวแสดงสรุปสั้น */}
            <div className="metadata-grid" style={s.metadataGrid}>
              <div>
                <span style={s.metadataLabel}>รหัสการเรียก</span>
                <span style={s.metadataValue}>#{requestid}</span>
              </div>
              <div>
                <span style={s.metadataLabel}>ระยะทาง</span>
                <span style={s.metadataValue}>{reqdistance ? `${parseFloat(reqdistance).toFixed(1)} กม.` : '-'}</span>
              </div>
              <div>
                <span style={s.metadataLabel}>ค่าบริการที่ประเมิน</span>
                <span style={{ ...s.metadataValue, color: '#4f46e5' }}>฿{requestfee || '-'}</span>
              </div>
              <div>
                <span style={s.metadataLabel}>แชร์ให้เพื่อนติดตาม</span>
                <button
                  type="button"
                  onClick={() => {
                    if (shareUrl) {
                      navigator.clipboard.writeText(shareUrl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }
                  }}
                  style={{
                    backgroundColor: copied ? '#059669' : '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: 11.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: 2,
                    fontFamily: "'Prompt', sans-serif"
                  }}
                >
                  {copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอกลิงก์'}
                </button>
              </div>
            </div>

            {/* ส่วนรายละเอียดคนขับและสถานะอย่างละเอียด */}
            <div className="details-grid" style={s.detailsGrid}>
              
              {/* คอลัมน์ที่ 1: สถานะและข้อมูลพาหนะ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: statusColor, margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                    {statusText}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    {statusSubText}
                  </p>
                </div>

                {/* ข้อมูลป้ายทะเบียนและรถคนขับ */}
                {leader && (
                  <div style={s.infoBox}>
                    <div style={s.infoBoxIcon}>🚗</div>
                    <div>
                      <div style={s.infoBoxLabel}>ยานพาหนะที่จะมารับ</div>
                      <div style={s.infoBoxValue}>
                        ป้ายทะเบียน: <span style={{ color: '#4f46e5' }}>{leader.license_plate || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* กล่องรายละเอียดการติดต่อฉุกเฉิน / หรือคำแจ้งเตือน */}
                <div style={{ ...s.infoBox, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div style={{ ...s.infoBoxIcon, backgroundColor: '#dcfce7', color: '#166534' }}>🛡️</div>
                  <div>
                    <div style={{ ...s.infoBoxLabel, color: '#166534' }}>SafeSeat มั่นใจตลอดเส้นทาง</div>
                    <div style={{ fontSize: 11.5, color: '#15803d', marginTop: 1 }}>การเดินทางนี้ได้รับการคุ้มครองด้วยพนักงานบัดดี้ 2 คน</div>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ที่ 2: โปรไฟล์บัดดี้คนขับ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {leader ? (
                  <>
                    <div style={s.badgeLabel}>ทีมคนขับดูแลคุณ (บัดดี้ทีม)</div>
                    
                    {/* ข้อมูลหัวหน้าทีม */}
                    <div style={s.driverCard}>
                      <div style={{ ...s.driverAvatar, backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe' }}>👨‍✈️</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14.5 }}>
                          คุณ{leader.firstname} {leader.lastname}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          บัดดี้หลัก (พนักงานขับรถแทน) • โทร: {leader.phone_no || '—'}
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลคู่หูผู้ดูแล (Follower) */}
                    {follower && (
                      <div style={s.driverCard}>
                        <div style={{ ...s.driverAvatar, backgroundColor: '#fff1f2', border: '1.5px solid #fecdd3' }}>👩‍✈️</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14.5 }}>
                            คุณ{follower.firstname} {follower.lastname || ''}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            บัดดี้ขับตามเพื่อความปลอดภัย
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={s.waitingDriversBox}>
                    <span style={{ fontSize: 24 }}>⏳</span>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#b45309' }}>กำลังจัดหาคู่หูคนขับ...</div>
                    <div style={{ fontSize: 11.5, color: '#d97706', lineHeight: 1.4, marginTop: 2 }}>
                      เมื่อมีคนขับตอบรับงาน ระบบจะแสดงข้อมูลคนขับและหมายเลขติดต่อทันที
                    </div>
                  </div>
                )}
              </div>

              {/* คอลัมน์ที่ 3: เวลาจำลองแสดงความคืบหน้า */}
              <div style={s.timerColumn}>
                <div style={{ fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCompleted ? '🎉' : isCancelled ? '❌' : '⏱️'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: statusColor, textAlign: 'center', marginTop: 4 }}>
                  {isCompleted ? 'สำเร็จ' : isCancelled ? 'ยกเลิก' : 'เรียลไทม์'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 2, lineHeight: 1.3 }}>
                  {isCompleted ? 'ส่งถึงที่หมายแล้ว' : isCancelled ? 'รายการยกเลิก' : 'อัปเดตทุกๆ 5 วินาที'}
                </div>
              </div>

            </div>

            {/* แสดงข้อความแจ้งเตือนเมื่อเดินทางเสร็จสิ้นสำเร็จ */}
            {isCompleted && (
              <div style={s.completedBanner}>
                🎉 ข้อมูลการเดินทางนี้เสร็จสิ้นปลอดภัย ส่งผู้โดยสารและรถยนต์ถึงปลายทางเรียบร้อยแล้ว!
              </div>
            )}

            {/* แสดงข้อความเมื่อยกเลิกการเดินทาง */}
            {isCancelled && (
              <div style={s.cancelledBanner}>
                🚫 รายการเรียกรถบริการนี้ถูกยกเลิกแล้วในระบบ
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        © 2026 Safe Seat Application. All rights reserved.
      </footer>

      {/* Animation และ Responsive CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Prompt', sans-serif; }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
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
        }
      `}</style>
    </div>
  )
}

export default function TripTrackingPage() {
  return (
    <Suspense fallback={
      <div style={s.pageCenter}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลดหน้าจอติดตามการเดินทาง...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <TripTrackingContent />
    </Suspense>
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
  main: {
    flex: 1,
    padding: '32px 40px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  mapWrapper: {
    height: 420,
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  statusOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '12px 20px',
    borderRadius: 16,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    border: '1px solid #cbd5e1',
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: '32px 40px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    border: '1px solid #e2e8f0',
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    paddingBottom: 20,
    borderBottom: '1.5px dashed #cbd5e1',
    marginBottom: 28
  },
  metadataLabel: {
    fontSize: 11, color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3
  },
  metadataValue: {
    fontSize: 14.5, fontWeight: 700, color: '#0f172a'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.45fr 1.75fr 0.8fr',
    gap: 40,
    alignItems: 'start'
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
  },
  infoBoxIcon: {
    width: 40, height: 40, borderRadius: '50%',
    backgroundColor: '#e0e7ff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0
  },
  infoBoxLabel: {
    fontSize: 11, color: '#64748b', fontWeight: 600
  },
  infoBoxValue: {
    fontSize: 14, fontWeight: 700, color: '#1e293b', marginTop: 1
  },
  badgeLabel: {
    fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2
  },
  driverCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 20px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
  },
  driverAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0
  },
  waitingDriversBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '24px 20px',
    backgroundColor: '#fffbeb',
    border: '1.5px dashed #f59e0b',
    borderRadius: 16,
    color: '#d97706',
    textAlign: 'center',
    minHeight: 150
  },
  timerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '16px 10px',
    borderLeft: '1.5px solid #e2e8f0',
    height: '100%'
  },
  completedBanner: {
    marginTop: 24,
    padding: '14px',
    backgroundColor: '#ecfdf5',
    border: '1.5px solid #a7f3d0',
    color: '#059669',
    borderRadius: 12,
    fontWeight: 700,
    textAlign: 'center',
    fontSize: 13.5
  },
  cancelledBanner: {
    marginTop: 24,
    padding: '14px',
    backgroundColor: '#fef2f2',
    border: '1.5px solid #fecaca',
    color: '#dc2626',
    borderRadius: 12,
    fontWeight: 700,
    textAlign: 'center',
    fontSize: 13.5
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 24px',
    fontSize: 14.5,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#0b0f19',
    borderTop: '1px solid #1e293b',
    fontSize: 12.5,
    color: '#cbd5e1',
  }
}
