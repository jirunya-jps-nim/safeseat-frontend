'use client'

// ═══════════════════════════════════════════════════════════════
// app/pub/summary/page.tsx — Analytics & Revenue Summary (Royal Purple-Blue)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { BarChart3, TrendingUp, DollarSign, Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'

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

  // Statistics
  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [weeklyEarnings, setWeeklyEarnings] = useState(0)
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [yearlyEarnings, setYearlyEarnings] = useState(0)

  const [dailyCount, setDailyCount] = useState(0)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [yearlyCount, setYearlyCount] = useState(0)

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

    let dailySum = 0, dailyC = 0
    let weeklySum = 0, weeklyC = 0
    let monthlySum = 0, monthlyC = 0
    let yearlySum = 0, yearlyC = 0

    const now = new Date()
    const todayStr = now.toDateString()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const dayCounts = [0, 0, 0, 0, 0, 0, 0]

    completed.forEach((r) => {
      const fee = Number(r.requestfee) || 0
      const date = new Date(r.reqdatetime)
      const commission = Math.round(fee * 0.15)

      if (date.toDateString() === todayStr) {
        dailySum += commission
        dailyC += 1
      }
      if (date >= startOfWeek) {
        weeklySum += commission
        weeklyC += 1
      }
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthlySum += commission
        monthlyC += 1
      }
      if (date.getFullYear() === currentYear) {
        yearlySum += commission
        yearlyC += 1
      }

      const dayIndex = date.getDay()
      dayCounts[dayIndex] += 1
    })

    setDailyEarnings(dailySum)
    setWeeklyEarnings(weeklySum)
    setMonthlyEarnings(monthlySum)
    setYearlyEarnings(yearlySum)

    setDailyCount(dailyC)
    setWeeklyCount(weeklyC)
    setMonthlyCount(monthlyC)
    setYearlyCount(yearlyC)

    setWeeklyRealCounts(dayCounts)
    const maxCount = Math.max(...dayCounts)
    if (maxCount > 0) {
      const normalized = dayCounts.map((c) => Math.round((c / maxCount) * 80) + 10)
      setWeeklyStats(normalized)
    } else {
      setWeeklyStats([0, 0, 0, 0, 0, 0, 0])
    }
  }

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'PUB'

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
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#7C3AED] tracking-wider uppercase font-manrope">REVENUE SUMMARY &amp; ANALYTICS</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">ผลสรุปบริการและส่วนแบ่งรายได้ ({pubName})</h1>
          </div>
          <div className="text-xs font-semibold px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            📊 รายงานสรุปภาพรวมรายได้ร้านค้า
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Weekly Chart */}
          <div className="lg:col-span-7 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">สถิติการใช้บริการรายสัปดาห์</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">จำนวนครั้งการเรียกพนักงานขับรถสำรองหน้าร้าน</p>
                </div>
                <div className="p-2.5 bg-[#7C3AED]/15 rounded-xl text-[#7C3AED]">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              {/* Chart Plot Area */}
              <div className="h-56 flex items-end justify-between gap-2 border-b border-[var(--color-border)] pb-2 px-4 relative">
                {weeklyStats.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      {weeklyRealCounts[idx]} ครั้ง
                    </span>
                    <div 
                      className="w-full max-w-[36px] rounded-t-lg transition-all duration-500 shadow-md"
                      style={{
                        height: `${val}%`,
                        backgroundColor: barColors[idx],
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* X Axis */}
              <div className="flex justify-between px-4 mt-3">
                {weekLabels.map((lbl, idx) => (
                  <div key={idx} className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: barColors[idx] }} />
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Completed Services List */}
          <div className="lg:col-span-5 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">การบริการที่เสร็จสิ้นล่าสุด</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">รายการนำส่งผู้โดยสารเรียบร้อย</p>
                </div>
                <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-56 pr-1">
                {completedJobs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">ยังไม่มีประวัติการบริการที่เสร็จสิ้น</div>
                ) : (
                  completedJobs.map((job: any, index) => {
                    const distance = job.reqdistance || 0
                    const fee = job.requestfee || 0
                    const commission = Math.round(fee * 0.15)
                    const date = new Date(job.reqdatetime)
                    const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div key={index} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text)]">
                            {timeStr}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[var(--color-text)]">{job.custname || 'ลูกค้า SafeSeat'}</div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">{distance.toFixed(1)} km</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-500">+฿{commission}</div>
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">Completed</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <button 
              onClick={() => router.push('/pub/service-info')}
              className="mt-6 w-full py-3 bg-[var(--color-surface)] hover:bg-[#7C3AED]/20 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              ดูประวัติย้อนหลังทั้งหมด <ArrowRight className="w-4 h-4 text-[#7C3AED]" />
            </button>
          </div>

        </div>

        {/* Bottom Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'รายได้รายวัน', value: `฿${dailyEarnings}`, sub: `${dailyCount} รายการ`, icon: DollarSign, color: 'text-pink-500' },
            { label: 'รายได้รายสัปดาห์', value: `฿${weeklyEarnings}`, sub: `${weeklyCount} รายการ`, icon: Calendar, color: 'text-blue-500' },
            { label: 'รายได้รายเดือน', value: `฿${monthlyEarnings}`, sub: `${monthlyCount} รายการ`, icon: TrendingUp, color: 'text-[#7C3AED]' },
            { label: 'รายได้รายปี', value: `฿${yearlyEarnings}`, sub: `${yearlyCount} รายการ`, icon: BarChart3, color: 'text-emerald-500' },
          ].map((stat, i) => {
            const IconComp = stat.icon
            return (
              <div key={i} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-md flex items-center gap-4">
                <div className={`p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl ${stat.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</div>
                  <div className="text-2xl font-extrabold font-manrope text-[var(--color-text)] mt-0.5">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5">{stat.sub}</div>
                </div>
              </div>
            )
          })}
        </div>

      </main>

      <Footer />
    </div>
  )
}
