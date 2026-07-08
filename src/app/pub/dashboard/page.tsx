'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

export default function PubDashboardPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    setPubUser(JSON.parse(userStr))
    // Clear saved request form data when landing on dashboard
    localStorage.removeItem('safeseat_request_form')
  }, [router])

  const handleLogout = () => {
    const isConfirmed = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
    if (isConfirmed) {
      localStorage.removeItem('pub_user')
      router.push('/login')
    }
  }

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'PUB'

  const cards = [
    {
      id: 'request',
      title: 'เรียกรถให้ลูกค้า',
      subtitle: 'Request Driver',
      desc: 'เรียกพนักงานขับรถแทนให้ลูกค้าของคุณ รับส่งถึงที่หมายปลอดภัยทุกเส้นทาง',
      btnLabel: 'เรียกรถเดี๋ยวนี้',
      accentColor: '#4f46e5',
      path: '/pub/request-driver',
      image: '/images/request_driver_mockup.png',
    },
    {
      id: 'list',
      title: 'ประวัติการเรียกรถ',
      subtitle: 'Service History',
      desc: 'ตรวจสอบรายการและติดตามสถานะการเดินทางของลูกค้าทุกครั้ง',
      btnLabel: 'ดูประวัติ',
      accentColor: '#059669',
      path: '/pub/service-info',
      image: '/images/service_history_mockup.png',
    },
    {
      id: 'summary',
      title: 'ผลสรุปบริการ',
      subtitle: 'Service Summary',
      desc: 'ดูยอดรวมการใช้บริการ ส่วนแบ่งรายได้ และสถิติประจำเดือนของร้านคุณ',
      btnLabel: 'ดูสรุปผล',
      accentColor: '#0891b2',
      path: '/pub/summary',
      image: '/images/service_summary_mockup.png',
    },
  ]

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.logoCircle}>🛡️</div>
          <span style={s.logoText}>Safe<span style={s.logoAccent}>Seat</span></span>
        </div>
        <div style={s.navRight}>
          <span style={s.navGreeting}>สวัสดี, <strong>{pubName}</strong></span>
          <button style={s.logoutBtn} onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </nav>

      {/* ── Header with beautiful Night Pub/Lounge background image ── */}
      <header style={s.pageHeader}>
        <div style={s.headerOverlay}>
          <h1 style={s.pageTitle}>ยินดีต้อนรับ, {pubName} 👋</h1>
          <p style={s.pageSubtitle}>เลือกเมนูด้านล่างเพื่อเริ่มต้นใช้งานระบบ SafeSeat สำหรับพาร์ทเนอร์ร้านค้าของคุณ</p>
        </div>
      </header>

      {/* ── Cards ── */}
      <main style={s.main}>
        <div style={s.cardGrid}>
          {cards.map(card => (
            <div key={card.id} style={s.card} className={`pub-card-${card.id}`}>
              {/* Header Image */}
              <img src={card.image} alt={card.title} style={s.cardImg} />

              <div style={s.cardContent}>
                {/* Text */}
                <div style={s.cardText}>
                  <span style={{ ...s.cardSubtitle, color: card.accentColor }}>{card.subtitle}</span>
                  <h3 style={s.cardTitle}>{card.title}</h3>
                  <p style={s.cardDesc}>{card.desc}</p>
                </div>

                {/* Button */}
                <button
                  style={{
                    ...s.cardBtn,
                    backgroundColor: card.accentColor,
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(card.path)}
                >
                  {card.btnLabel} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { icon: '✅', label: 'บัญชีได้รับการอนุมัติ', value: 'Approved' },
            { icon: '🛡️', label: 'ระดับความปลอดภัย', value: 'สูงสุด' },
            { icon: '📞', label: 'ช่องทางติดต่อ', value: '24/7' },
          ].map((item, i) => (
            <div key={i} style={s.statItem}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={s.statLabel}>{item.label}</div>
                <div style={s.statValue}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={s.footer}>
        © 2026 Safe Seat Application. All rights reserved.
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Kanit', sans-serif; }
        .pub-card-request:hover, .pub-card-summary:hover, .pub-card-list:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
        }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Kanit', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 48px',
    height: 64,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36,
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
    border: '1.5px solid #c7d2fe',
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  logoAccent: { color: '#4f46e5' },
  navRight: { display: 'flex', alignItems: 'center', gap: 20 },
  navGreeting: { fontSize: 14, color: '#64748b' },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
    fontFamily: "'Kanit', sans-serif",
    transition: 'all 0.2s',
  },
  pageHeader: {
    backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.92)), url('/images/pub_dashboard_bg.png')",
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    color: '#ffffff',
    padding: '70px 48px',
    textAlign: 'center',
    boxShadow: 'inset 0 -10px 20px rgba(0, 0, 0, 0.2)',
  },
  headerOverlay: {
    maxWidth: 800,
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 700,
    margin: '0 0 12px 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  pageSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0,
    lineHeight: 1.6,
  },
  main: {
    flex: 1,
    padding: '40px 24px 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
    width: '100%',
    maxWidth: 1050,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImg: {
    width: '100%',
    height: '145px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardText: { display: 'flex', flexDirection: 'column', gap: 6 },
  cardSubtitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' },
  cardDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '4px 0 0' },
  cardBtn: {
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Kanit', sans-serif",
    transition: 'transform 0.2s, filter 0.2s',
  },
  statsRow: {
    display: 'flex',
    gap: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '20px 32px',
    width: '100%',
    maxWidth: 1050,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '0 24px',
    borderRight: '1px solid #f1f5f9',
  },
  statLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  footer: {
    padding: '24px 48px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
}
