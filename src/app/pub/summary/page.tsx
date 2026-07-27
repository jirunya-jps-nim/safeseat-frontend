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
  reqdistance?: number
  requestfee?: number
  paymentmethod: number
  isladymode: boolean
}

export default function SummaryPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)
  const [records, setRecords] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Statistics
  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState([0, 0, 0, 0, 0, 0, 0])
  const [weeklyRealCounts, setWeeklyRealCounts] = useState([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setPubUser(user)
    fetchRecords(user.username)
  }, [router])

  const fetchRecords = async (username: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/pub/service-info/${username}`)
      if (res.data.success) {
        const data = res.data.data || []
        setRecords(data)
        calculateStats(data)
      } else {
        setRecords([])
        calculateStats([])
      }
    } catch (err: any) {
      console.warn('Could not fetch real records.', err)
      setRecords([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (allRecords: RequestRecord[]) => {
    const completed = allRecords.filter(
      (r) =>
        r.requeststatus?.toLowerCase() === 'completed' ||
        r.requeststatus === 'เสร็จสิ้น'
    )

    let dailySum = 0
    let monthlySum = 0
    let totalSum = 0
    const todayStr = new Date().toDateString()
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Week days counts (Sun = 0, Mon = 1, ...)
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]

    completed.forEach((r) => {
      const fee = Number(r.requestfee) || 0
      const date = new Date(r.reqdatetime)
      
      // Calculate earnings (e.g. 15% revenue share for the pub/venue)
      const commission = Math.round(fee * 0.15) 

      totalSum += commission

      if (date.toDateString() === todayStr) {
        dailySum += commission
      }
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthlySum += commission
      }

      const dayIndex = date.getDay() // 0 - 6
      dayCounts[dayIndex] += 1
    })

    setDailyEarnings(dailySum)
    setMonthlyEarnings(monthlySum)
    setTotalEarnings(totalSum)

    setWeeklyRealCounts(dayCounts)
    // Normalize weekly stats to fit height percentages (max 100)
    const maxCount = Math.max(...dayCounts)
    if (maxCount > 0) {
      const normalized = dayCounts.map((c) => Math.round((c / maxCount) * 80) + 10)
      setWeeklyStats(normalized)
    } else {
      setWeeklyStats([0, 0, 0, 0, 0, 0, 0])
    }
  }

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'ITSCI'

  // Get completed jobs list (sorted descending)
  const completedJobs = records
    .filter(
      (r) =>
        r.requeststatus?.toLowerCase() === 'completed' ||
        r.requeststatus === 'เสร็จสิ้น'
    )
    .slice(0, 5)

  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const barColors = ['#a78bfa', '#f472b6', '#38bdf8', '#fb923c', '#60a5fa', '#34d399', '#c084fc']

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <span style={s.logoText}>Safe<span style={s.logoAccent}>Seat</span></span>
        </div>
        <div style={s.navRight}>
          <button onClick={() => router.push('/pub/dashboard')} style={s.backBtn}>
            ← กลับ Dashboard
          </button>
        </div>
      </nav>

      {/* ── Header ── */}
      <header style={s.pageHeader}>
        <div style={s.headerBadge}>📊 ผลสรุปบริการ</div>
        <h1 style={s.pageTitle}>Hello {pubName} 👋</h1>
        <p style={s.pageSubtitle}>รายงานสถิติ ยอดผู้ใช้บริการ และส่วนแบ่งรายได้พาร์ทเนอร์ร้านค้าของคุณ</p>
      </header>

      {/* ── Main Content ── */}
      <main style={s.main}>
        <div style={s.grid2Col}>
          
          {/* Left Column: Weekly Statistics Chart */}
          <div style={s.chartCard}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>สถิติการใช้บริการรายสัปดาห์</h3>
              <span style={s.chartSubtitle}>จำนวนครั้งการเรียกพนักงานขับรถ</span>
            </div>
            
            <div style={s.chartArea}>
              {/* Y Axis Labels */}
              <div style={s.yAxis}>
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart Grid Lines & Bars */}
              <div style={s.chartPlot}>
                <div style={s.gridLines}>
                  <div style={s.gridLine} />
                  <div style={s.gridLine} />
                  <div style={s.gridLine} />
                  <div style={s.gridLine} />
                  <div style={s.gridLine} />
                </div>
                
                <div style={s.barsContainer}>
                  {weeklyStats.map((val, idx) => (
                    <div key={idx} style={s.barColumn}>
                      <div 
                        style={{
                          ...s.bar,
                          height: `${val}%`,
                          backgroundColor: barColors[idx],
                        }}
                      >
                        <div style={s.tooltip} className="bar-tooltip">{weeklyRealCounts[idx]} ครั้ง</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* X Axis Labels */}
            <div style={s.xAxis}>
              {weekLabels.map((lbl, idx) => (
                <div key={idx} style={s.xAxisLabel}>
                  <span style={{ ...s.dotIndicator, backgroundColor: barColors[idx] }} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Completed Services List */}
          <div style={s.servicesCard}>
            <div style={s.servicesHeader}>
              <h3 style={s.servicesTitle}>การบริการที่ดำเนินการเสร็จสิ้นแล้วทั้งหมด</h3>
              <span style={s.servicesSubtitle}>รายการล่าสุดที่นำส่งผู้โดยสารเรียบร้อย</span>
            </div>

            <div style={s.jobsList}>
              {completedJobs.length === 0 ? (
                <div style={s.emptyList}>
                  <span style={{ fontSize: 32 }}>📭</span>
                  <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: 13, fontWeight: 500 }}>
                    ยังไม่มีประวัติการบริการที่เสร็จสิ้น
                  </p>
                </div>
              ) : (
                completedJobs.map((job: any, index) => {
                  const distance = job.reqdistance || 0
                  const fee = job.requestfee || 0
                  const commission = Math.round(fee * 0.15)
                  const date = new Date(job.reqdatetime)
                  const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                  const dateStr = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

                  return (
                    <div key={index} style={s.jobItem}>
                      <div style={s.jobTimeBox}>
                        <span style={s.jobTime}>{timeStr}</span>
                        <span style={s.jobDate}>{dateStr}</span>
                      </div>

                      <div style={s.jobInfo}>
                        <div style={s.jobDestination}>
                          <span style={s.pinIcon}>📍</span>
                          <span style={s.destText}>{job.custname || 'ลูกค้า SafeSeat'}</span>
                        </div>
                        <div style={s.jobMeta}>
                          <span>{distance.toFixed(1)} km</span>
                          <span style={s.metaDivider}>•</span>
                          <span>15 min</span>
                        </div>
                      </div>

                      <div style={s.jobEarningBox}>
                        <span style={s.jobEarning}>+฿{commission}</span>
                        <span style={s.jobStatusBadge}>Completed</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <button 
              style={s.moreBtn}
              onClick={() => router.push('/pub/service-info')}
            >
              แสดงการบริการเพิ่มเติม
            </button>
          </div>

        </div>

        {/* Bottom Row: Stat Cards */}
        <div style={s.statsRow}>
          {[
            { label: 'รายได้ต่อวัน', value: `฿${dailyEarnings}`, icon: '💵', gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
            { label: 'รายได้ต่อเดือน', value: `฿${monthlyEarnings}`, icon: '🪙', gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
            { label: 'รายได้ทั้งหมด', value: `฿${totalEarnings}`, icon: '💰', gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }
          ].map((stat, i) => (
            <div key={i} style={{ ...s.statCard, background: stat.gradient }}>
              <div style={s.statIconWrapper}>
                <span style={{ fontSize: 28 }}>{stat.icon}</span>
              </div>
              <div style={s.statText}>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statValue}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        © 2026 Safe Seat Application. All rights reserved.
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Prompt', sans-serif; }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Prompt', sans-serif",
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    height: 60,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 18, fontWeight: 700, color: '#1e293b' },
  logoAccent: { color: '#4f46e5' },
  navRight: { display: 'flex', alignItems: 'center' },
  backBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
  },
  pageHeader: {
    padding: '40px 40px 10px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  headerBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
    borderRadius: 20,
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: 600,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748b',
    margin: 0,
  },
  main: {
    flex: 1,
    padding: '24px 40px 60px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 28,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    height: 380,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    display: 'block',
  },
  chartArea: {
    flex: 1,
    display: 'flex',
    gap: 12,
    position: 'relative',
    height: 200,
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 24,
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
    paddingRight: 6,
    height: '100%',
  },
  chartPlot: {
    flex: 1,
    position: 'relative',
    height: '100%',
    borderLeft: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#f1f5f9',
  },
  barsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: '0 10px',
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '10%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
    cursor: 'pointer',
    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
  },
  tooltip: {
    position: 'absolute',
    top: -26,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingLeft: 36,
    marginTop: 12,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
  },
  servicesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    height: 380,
  },
  servicesHeader: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  servicesSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    display: 'block',
  },
  jobsList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto',
    marginBottom: 14,
  },
  jobItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#eff6ff',
    border: '1.5px solid #dbeafe',
    borderRadius: 14,
  },
  jobTimeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '4px 10px',
    minWidth: 60,
  },
  jobTime: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
  },
  jobDate: {
    fontSize: 10,
    color: '#64748b',
  },
  jobInfo: {
    flex: 1,
    padding: '0 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  jobDestination: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  pinIcon: { fontSize: 13 },
  destText: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#1e293b',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    color: '#64748b',
  },
  metaDivider: { color: '#cbd5e1' },
  jobEarningBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  jobEarning: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#15803d',
  },
  jobStatusBadge: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '2px 8px',
    borderRadius: 12,
  },
  moreBtn: {
    width: '100%',
    backgroundColor: '#818cf8',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '12px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 24,
  },
  statCard: {
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  statIconWrapper: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  statText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 600,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1e293b',
  },
  footer: {
    padding: '20px 40px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
    backgroundColor: '#ffffff',
  },
  emptyList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px 0',
  },
}
