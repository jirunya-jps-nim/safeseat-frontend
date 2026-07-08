'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

interface RequestRecord {
  requestId?: number
  requestid?: number
  custname: string
  phoneno: string
  requiredcartype: number
  requeststatus: string
  reqdatetime: string
  dropofflatitude: number
  dropofflongitude: number
  paymentmethod: number
  isladymode: boolean
  note?: string
}

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
};

export default function ServiceInfoPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)
  const [records, setRecords] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)
    setPubUser(user)
    fetchRecords(user.username)
  }, [router])

  const fetchRecords = async (username: string) => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/pub/service-info/${username}`)
      if (res.data.success) setRecords(res.data.data || [])
      else setError(res.data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally { setLoading(false) }
  }

  const statusConfig: { [k: string]: { label: string; color: string; bg: string; dot: string } } = {
    pending:   { label: 'รอรับงาน',      color: '#92400e', bg: '#fffbeb', dot: '#f59e0b' },
    accepted:  { label: 'กำลังเดินทาง', color: '#1e40af', bg: '#eff6ff', dot: '#3b82f6' },
    completed: { label: 'เสร็จสิ้น',     color: '#065f46', bg: '#ecfdf5', dot: '#10b981' },
    cancelled: { label: 'ยกเลิก',        color: '#991b1b', bg: '#fef2f2', dot: '#ef4444' },
    // รองรับกรณีค่าภาษาไทยจาก database
    'รอคนขับ': { label: 'รอรับงาน',      color: '#92400e', bg: '#fffbeb', dot: '#f59e0b' },
    'กำลังไปรับ': { label: 'กำลังไปรับ',  color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
    'ถึงจุดรับแล้ว': { label: 'ถึงจุดรับแล้ว', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
    'ระหว่างเดินทาง': { label: 'ระหว่างเดินทาง', color: '#0891b2', bg: '#ecfeff', dot: '#06b6d4' },
    'เสร็จสิ้น': { label: 'เสร็จสิ้น',     color: '#065f46', bg: '#ecfdf5', dot: '#10b981' },
    'ยกเลิก': { label: 'ยกเลิก',        color: '#991b1b', bg: '#fef2f2', dot: '#ef4444' },
  }

  const getStatus = (status: string) => {
    if (!status) return { label: 'รอรับงาน', color: '#92400e', bg: '#fffbeb', dot: '#f59e0b' }
    const s = status.toLowerCase()
    return statusConfig[status] || statusConfig[s] || { label: status, color: '#92400e', bg: '#fffbeb', dot: '#f59e0b' }
  }

  const paymentLabel = (m: number) => m === 1 ? '💵 เงินสด' : '📲 โอนเงิน'
  const carTypeLabel = (id: number) => {
    if (id === 1) return 'EV'
    if (id === 2) return 'Manual'
    return 'Auto'
  }

  const pendingStatuses = ['pending', 'รอคนขับ', 'กำลังไปรับ', 'ถึงจุดรับแล้ว', 'ระหว่างเดินทาง', 'accepted']
  const completedStatuses = ['completed', 'เสร็จสิ้น']
  const cancelledStatuses = ['cancelled', 'ยกเลิก']

  const isPending = (status: string) => {
    if (!status) return true
    const s = status.toLowerCase()
    return pendingStatuses.includes(s) || pendingStatuses.includes(status)
  }
  const isCompleted = (status: string) => {
    if (!status) return false
    const s = status.toLowerCase()
    return completedStatuses.includes(s) || completedStatuses.includes(status)
  }
  const isCancelled = (status: string) => {
    if (!status) return false
    const s = status.toLowerCase()
    return cancelledStatuses.includes(s) || cancelledStatuses.includes(status)
  }

  const filtered = records.filter(r => {
    const matchSearch = !searchQuery || r.custname?.toLowerCase().includes(searchQuery.toLowerCase()) || r.phoneno?.includes(searchQuery)
    
    let matchStatus = false
    if (statusFilter === 'all') {
      matchStatus = true
    } else if (statusFilter === 'pending') {
      matchStatus = isPending(r.requeststatus)
    } else if (statusFilter === 'completed') {
      matchStatus = isCompleted(r.requeststatus)
    } else if (statusFilter === 'cancelled') {
      matchStatus = isCancelled(r.requeststatus)
    }
    
    return matchSearch && matchStatus
  })

  const counts = {
    all: records.length,
    pending: records.filter(r => isPending(r.requeststatus)).length,
    completed: records.filter(r => isCompleted(r.requeststatus)).length,
    cancelled: records.filter(r => isCancelled(r.requeststatus)).length,
  }

  const tabDefs = [
    { key: 'all', label: 'ทั้งหมด', count: counts.all },
    { key: 'pending', label: 'รอรับงาน/กำลังดำเนินการ', count: counts.pending },
    { key: 'completed', label: 'เสร็จสิ้น', count: counts.completed },
    { key: 'cancelled', label: 'ยกเลิก', count: counts.cancelled },
  ]

  if (!pubUser) return null

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.logoCircle}>🛡️</div>
          <span style={s.logoText}>Safe<span style={s.logoAccent}>Seat</span></span>
        </div>
        <button onClick={() => router.push('/pub/dashboard')} style={s.backBtn}>
          ← กลับ Dashboard
        </button>
      </nav>

      <main style={s.main}>
        {/* Page Header */}
        <div style={s.pageHeader}>
          <div style={s.headerBadge}>📋 ประวัติการเรียกรถ</div>
          <div style={s.headerRow}>
            <div>
              <h1 style={s.pageTitle}>ประวัติการเรียกใช้บริการ</h1>
              <p style={s.pageSubtitle}>รายการเรียกรถทั้งหมดที่ร้านของคุณดำเนินการ</p>
            </div>
            <div style={s.headerActions}>
              <button onClick={() => pubUser && fetchRecords(pubUser.username)} style={s.refreshBtn}>
                🔄 รีเฟรช
              </button>
              <button onClick={() => router.push('/pub/request-driver')} style={s.newBtn}>
                + เรียกรถใหม่
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { label: 'คำขอทั้งหมด', value: counts.all, color: '#4f46e5', bg: '#eef2ff' },
            { label: 'รอรับงาน', value: counts.pending, color: '#d97706', bg: '#fffbeb' },
            { label: 'เสร็จสิ้น', value: counts.completed, color: '#059669', bg: '#ecfdf5' },
            { label: 'ยกเลิก', value: counts.cancelled, color: '#dc2626', bg: '#fef2f2' },
          ].map((stat, i) => (
            <div key={i} style={{ ...s.statCard, backgroundColor: stat.bg }}>
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={s.controls}>
          {/* Filter tabs */}
          <div style={s.tabs}>
            {tabDefs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  ...s.tab,
                  ...(statusFilter === tab.key ? s.tabActive : {}),
                }}
              >
                {tab.label}
                <span style={{
                  ...s.tabBadge,
                  backgroundColor: statusFilter === tab.key ? '#4f46e5' : '#e2e8f0',
                  color: statusFilter === tab.key ? '#fff' : '#64748b',
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={s.searchBox}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={s.searchInput}
              placeholder="ค้นหาชื่อลูกค้า หรือเบอร์โทรศัพท์..."
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={s.clearBtn}>✕</button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {/* Content */}
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            <p style={{ color: '#94a3b8', margin: 0 }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <span style={{ fontSize: 48 }}>📭</span>
            <h3 style={{ margin: '16px 0 8px', color: '#334155', fontWeight: 600 }}>
              {searchQuery ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีประวัติการเรียกรถ'}
            </h3>
            <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>
              {searchQuery ? 'ลองเปลี่ยนคำค้นหาดูครับ' : 'เริ่มต้นเรียกรถให้ลูกค้าได้เลย'}
            </p>
            {!searchQuery && (
              <button onClick={() => router.push('/pub/request-driver')} style={s.callBtn}>
                🚗 เรียกรถเดี๋ยวนี้
              </button>
            )}
          </div>
        ) : (
          <div style={s.table}>
            <table style={s.tableEl}>
              <thead>
                <tr>
                  {['วันที่/เวลา', 'ชื่อลูกค้า', 'เบอร์โทร', 'ประเภทรถ', 'ชำระเงิน', 'สถานะ', 'รายละเอียด'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const st = getStatus(item.requeststatus)
                  const recordId = item.requestid || item.requestId
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={s.td}>
                        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                          {item.reqdatetime
                            ? new Date(item.reqdatetime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
                            : '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {item.reqdatetime
                            ? new Date(item.reqdatetime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                          {item.custname}
                        </div>
                        {item.isladymode && (
                          <span style={s.ladyTag}>👩 Lady Mode</span>
                        )}
                      </td>
                      <td style={{ ...s.td, color: '#475569', fontFamily: 'monospace', fontSize: 13 }}>
                        {item.phoneno}
                      </td>
                      <td style={s.td}>
                        <span style={s.carTag}>{carTypeLabel(item.requiredcartype)}</span>
                      </td>
                      <td style={{ ...s.td, color: '#475569', fontSize: 13 }}>
                        {paymentLabel(item.paymentmethod)}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusBadge,
                          color: st.color,
                          backgroundColor: st.bg,
                        }}>
                          <span style={{ ...s.statusDot, backgroundColor: st.dot }} />
                          {st.label}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button
                          type="button"
                          onClick={() => router.push(`/pub/tracking?id=${recordId}`)}
                          style={{
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Prompt', sans-serif",
                            transition: 'all 0.2s',
                          }}
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Prompt', sans-serif; }
        tr:hover td { background-color: #f8fafc; }
        @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Prompt', sans-serif" },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 48px', height: 64,
    backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: '50%',
    backgroundColor: '#eef2ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, border: '1.5px solid #c7d2fe',
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  logoAccent: { color: '#4f46e5' },
  backBtn: {
    background: 'none', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '7px 16px',
    fontSize: 13, color: '#4f46e5', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Prompt', sans-serif",
  },
  main: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px 60px' },
  pageHeader: { marginBottom: 28 },
  headerBadge: {
    display: 'inline-block', padding: '5px 14px',
    backgroundColor: '#eef2ff', border: '1px solid #c7d2fe',
    borderRadius: 20, fontSize: 12, color: '#4f46e5',
    fontWeight: 600, marginBottom: 12,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' },
  pageSubtitle: { fontSize: 14, color: '#64748b', margin: 0 },
  headerActions: { display: 'flex', gap: 10 },
  refreshBtn: {
    border: '1px solid #e2e8f0', background: '#fff',
    borderRadius: 8, padding: '8px 16px',
    fontSize: 13, color: '#475569', cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
  },
  newBtn: {
    backgroundColor: '#4f46e5', border: 'none',
    borderRadius: 8, padding: '8px 18px',
    fontSize: 13, color: '#fff', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Prompt', sans-serif",
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 24,
  },
  statCard: {
    borderRadius: 12, padding: '18px 20px',
    border: '1px solid transparent',
  },
  statNum: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  controls: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 16, marginBottom: 20,
  },
  tabs: { display: 'flex', gap: 4 },
  tab: {
    background: 'none', border: 'none',
    padding: '8px 14px', borderRadius: 8,
    fontSize: 13, color: '#64748b',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: 6,
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.15s',
  },
  tabActive: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5', fontWeight: 600,
  },
  tabBadge: {
    padding: '1px 7px', borderRadius: 10,
    fontSize: 11, fontWeight: 700,
    transition: 'all 0.15s',
  },
  searchBox: {
    display: 'flex', alignItems: 'center',
    gap: 10, backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '8px 16px',
    minWidth: 280,
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: 14, color: '#0f172a',
    fontFamily: "'Prompt', sans-serif",
    backgroundColor: 'transparent',
  } as React.CSSProperties,
  clearBtn: {
    background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer', fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 10,
    padding: '12px 18px', fontSize: 14, marginBottom: 20,
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '80px 0', gap: 16,
  },
  loadingDots: { display: 'flex', gap: 8 },
  emptyBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center' as const,
    padding: '80px 0', backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0', borderRadius: 16,
  },
  callBtn: {
    backgroundColor: '#4f46e5', border: 'none',
    borderRadius: 10, padding: '12px 24px',
    color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Prompt', sans-serif",
  },
  table: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16, overflow: 'hidden',
  },
  tableEl: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '14px 20px',
    fontSize: 12, fontWeight: 600,
    color: '#64748b', textAlign: 'left' as const,
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  td: { padding: '14px 20px', verticalAlign: 'middle' as const },
  ladyTag: {
    display: 'inline-block',
    backgroundColor: '#fdf2f8',
    border: '1px solid #fbcfe8',
    color: '#9d174d',
    borderRadius: 8, padding: '2px 8px',
    fontSize: 11, fontWeight: 600, marginTop: 4,
  },
  carTag: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    borderRadius: 6, padding: '4px 10px',
    fontSize: 12, fontWeight: 600,
  },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  statusDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
}
