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
          <button style={s.logoutBtn} className="pub-logout-btn" onClick={handleLogout}>ออกจากระบบ</button>
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
            <div key={card.id} style={s.card} className={`glass-card pub-card-${card.id}`}>
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
                  className="pub-card-btn"
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
        * { box-sizing: border-box; font-family: 'Kanit', 'Inter', sans-serif; }
        .pub-card-request:hover, .pub-card-summary:hover, .pub-card-list:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(79, 70, 229, 0.12) !important;
          border-color: #c7d2fe !important;
        }
        .pub-logout-btn:hover {
          background: rgba(255,255,255,0.12) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .pub-card-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Kanit', 'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 48px',
    height: 64,
    backgroundColor: '#0f172a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 34, height: 34,
    borderRadius: '8px',
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17,
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  logoText: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' },
  logoAccent: { color: '#818cf8' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navGreeting: { fontSize: 13, color: '#94a3b8' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontFamily: "'Kanit', sans-serif",
    transition: 'background 150ms ease, border-color 150ms ease',
  },
  pageHeader: {
    backgroundImage: "linear-gradient(160deg, #0b0f1a 0%, #1e1b4b 60%, #0f172a 100%), url('/images/pub_dashboard_bg.png')",
    backgroundBlendMode: 'overlay',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    color: '#ffffff',
    padding: '64px 48px 56px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
  },
  headerOverlay: {
    maxWidth: 680,
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 700,
    margin: '0 0 10px 0',
    lineHeight: 1.3,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    lineHeight: 1.65,
    fontWeight: 400,
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
    gap: 24,
    width: '100%',
    maxWidth: 1020,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'box-shadow 250ms cubic-bezier(0.16, 1, 0.3, 1), border-color 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.03)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardText: { display: 'flex', flexDirection: 'column', gap: 4 },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    margin: '2px 0 0',
    letterSpacing: '-0.2px',
  },
  cardDesc: {
    fontSize: 13.5,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '4px 0 0',
    fontWeight: 400,
  },
  cardBtn: {
    border: 'none',
    borderRadius: 10,
    padding: '11px 18px',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Kanit', sans-serif",
    cursor: 'pointer',
    transition: 'filter 150ms ease, transform 150ms ease',
    letterSpacing: '0.1px',
  },
  statsRow: {
    display: 'flex',
    gap: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: '18px 28px',
    width: '100%',
    maxWidth: 1020,
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px',
    borderRight: '1px solid #f1f5f9',
  },
  statLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2, fontWeight: 400 },
  statValue: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  footer: {
    padding: '20px 48px',
    borderTop: '1px solid #f1f5f9',
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#ffffff',
  },
}

