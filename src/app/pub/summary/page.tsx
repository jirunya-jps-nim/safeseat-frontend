'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { BarChart3, TrendingUp, DollarSign, Calendar, CheckCircle2, ArrowRight, Clock, CalendarDays } from 'lucide-react'

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

type PeriodType = 'day' | 'week' | 'month' | 'year'

function parseThaiDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const s = String(dateStr).trim()
  const cleanStr = s.replace(/Z$/i, '')
  const isoWithTz = cleanStr.includes('T')
    ? `${cleanStr.split('+')[0]}+07:00`
    : `${cleanStr.replace(' ', 'T').split('+')[0]}+07:00`
  const d = new Date(isoWithTz)
  return isNaN(d.getTime()) ? new Date(dateStr) : d
}

function formatServiceDate(dateStr: string) {
  try {
    const d = parseThaiDate(dateStr)
    const now = new Date()

    const isToday = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

    const time = d.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.'
    const shortDate = d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' })
    const fullThai = d.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: '2-digit' })

    let relative = fullThai
    let badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    if (isToday) {
      relative = 'วันนี้'
      badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    } else if (isYesterday) {
      relative = 'เมื่อวาน'
      badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    }

    return { relative, shortDate, time, fullThai, isToday, isYesterday, badgeColor }
  } catch {
    return { relative: dateStr, shortDate: dateStr, time: '', fullThai: dateStr, isToday: false, isYesterday: false, badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30' }
  }
}

export default function SummaryPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)
  const [records, setRecords] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('week')

  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [weeklyEarnings, setWeeklyEarnings] = useState(0)
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [yearlyEarnings, setYearlyEarnings] = useState(0)

  const [dailyCount, setDailyCount] = useState(0)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [yearlyCount, setYearlyCount] = useState(0)

  // Chart data according to selected period
  const [chartLabels, setChartLabels] = useState<string[]>([])
  const [chartHeights, setChartHeights] = useState<number[]>([])
  const [chartCounts, setChartCounts] = useState<number[]>([])
  const [chartColors, setChartColors] = useState<string[]>([])
  const [periodDescription, setPeriodDescription] = useState<string>('')

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    if (user.regisstatus !== 'approved' && user.regisstatus !== 'อนุมัติแล้ว') {
      router.push('/status')
      return
    }
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
        calculateStats(data, period)
      } else {
        setRecords([])
        calculateStats([], period)
      }
    } catch (err: any) {
      console.warn('Could not fetch real records.', err)
      setRecords([])
      calculateStats([], period)
    } finally {
      setLoading(false)
    }
  }

  // Recalculate when period changes
  useEffect(() => {
    if (records.length >= 0) {
      calculateStats(records, period)
    }
  }, [period])

  const calculateStats = (allRecords: RequestRecord[], selectedPeriod: PeriodType) => {
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
    const todayThaiKey = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
    const toThaiDateKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

    const thaiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const startOfWeek = new Date(thaiNow)
    startOfWeek.setDate(thaiNow.getDate() - thaiNow.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const currentMonth = thaiNow.getMonth()
    const currentYear = thaiNow.getFullYear()

    completed.forEach((r) => {
      const date = parseThaiDate(r.reqdatetime)
      const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const recordKey = toThaiDateKey(date)
      const commission = 30 // ส่วนแบ่งรายได้เข้าสถานบันเทิง 30 บาทต่อครั้ง

      // 1. วันนี้ (Today)
      if (recordKey === todayThaiKey) {
        dailySum += commission
        dailyC += 1
      }
      // 2. สัปดาห์นี้ (This Week)
      if (recordThaiDate >= startOfWeek && recordThaiDate <= endOfWeek) {
        weeklySum += commission
        weeklyC += 1
      }
      // 3. เดือนนี้ (This Month)
      if (recordThaiDate.getMonth() === currentMonth && recordThaiDate.getFullYear() === currentYear) {
        monthlySum += commission
        monthlyC += 1
      }
      // 4. ปีนี้ (This Year)
      if (recordThaiDate.getFullYear() === currentYear) {
        yearlySum += commission
        yearlyC += 1
      }
    })

    setDailyEarnings(dailySum)
    setWeeklyEarnings(weeklySum)
    setMonthlyEarnings(monthlySum)
    setYearlyEarnings(yearlySum)

    setDailyCount(dailyC)
    setWeeklyCount(weeklyC)
    setMonthlyCount(monthlyC)
    setYearlyCount(yearlyC)

    // Build Chart depending on selected Period
    let labels: string[] = []
    let counts: number[] = []
    let colors: string[] = []
    let desc = ''

    if (selectedPeriod === 'day') {
      // 6 time slots today
      labels = ['00.00 - 03.59', '04.00 - 07.59', '08.00 - 11.59', '12.00 - 15.59', '16.00 - 19.59', '20.00 - 23.59']
      counts = [0, 0, 0, 0, 0, 0]
      colors = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#c084fc']
      
      const todayDateThai = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long', year: 'numeric' })
      desc = `สถิติรายช่วงเวลา ประจำวันนี้ (${todayDateThai})`

      completed.forEach((r) => {
        const date = parseThaiDate(r.reqdatetime)
        const recordKey = toThaiDateKey(date)
        if (recordKey === todayThaiKey) {
          const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
          const hour = recordThaiDate.getHours()
          const slot = Math.floor(hour / 4)
          if (slot >= 0 && slot < 6) {
            counts[slot] += 1
          }
        }
      })
    } else if (selectedPeriod === 'week') {
      // 7 days of this week
      labels = ['อา. (Sun)', 'จ. (Mon)', 'อ. (Tue)', 'พ. (Wed)', 'พฤ. (Thu)', 'ศ. (Fri)', 'ส. (Sat)']
      counts = [0, 0, 0, 0, 0, 0, 0]
      colors = ['#a78bfa', '#f472b6', '#38bdf8', '#fb923c', '#60a5fa', '#34d399', '#c084fc']

      const weekRangeStr = `${startOfWeek.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' })}`
      desc = `สถิติรายวัน ประจำสัปดาห์นี้ (${weekRangeStr})`

      completed.forEach((r) => {
        const date = parseThaiDate(r.reqdatetime)
        const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
        if (recordThaiDate >= startOfWeek && recordThaiDate <= endOfWeek) {
          const dayIdx = recordThaiDate.getDay()
          counts[dayIdx] += 1
        }
      })
    } else if (selectedPeriod === 'month') {
      // 4 weeks of this month
      labels = ['สัปดาห์ที่ 1', 'สัปดาห์ที่ 2', 'สัปดาห์ที่ 3', 'สัปดาห์ที่ 4+']
      counts = [0, 0, 0, 0]
      colors = ['#38bdf8', '#34d399', '#fbbf24', '#c084fc']

      const monthNameThai = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', month: 'long', year: 'numeric' })
      desc = `สถิติแบ่งตามสัปดาห์ ประจำเดือนนี้ (${monthNameThai})`

      completed.forEach((r) => {
        const date = parseThaiDate(r.reqdatetime)
        const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
        if (recordThaiDate.getMonth() === currentMonth && recordThaiDate.getFullYear() === currentYear) {
          const dayNum = recordThaiDate.getDate()
          const weekIdx = Math.min(3, Math.floor((dayNum - 1) / 7))
          counts[weekIdx] += 1
        }
      })
    } else if (selectedPeriod === 'year') {
      // 12 months of this year
      labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
      counts = new Array(12).fill(0)
      colors = ['#818cf8', '#a78bfa', '#f472b6', '#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#c084fc']

      desc = `สถิติรายเดือน ประจำปีนี้ (${currentYear + 543})`

      completed.forEach((r) => {
        const date = parseThaiDate(r.reqdatetime)
        const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
        if (recordThaiDate.getFullYear() === currentYear) {
          const mIdx = recordThaiDate.getMonth()
          counts[mIdx] += 1
        }
      })
    }

    const maxCount = Math.max(...counts, 1)
    const normalized = counts.map((c) => (c === 0 ? 0 : Math.max(12, Math.round((c / maxCount) * 85))))

    setChartLabels(labels)
    setChartCounts(counts)
    setChartHeights(normalized)
    setChartColors(colors)
    setPeriodDescription(desc)
  }

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'PUB'

  const completedJobs = [...records]
    .filter(
      (r) =>
        r.requeststatus?.toLowerCase() === 'completed' ||
        r.requeststatus === 'เสร็จสิ้น'
    )
    .sort((a, b) => parseThaiDate(b.reqdatetime).getTime() - parseThaiDate(a.reqdatetime).getTime())
    .slice(0, 10)

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">REVENUE SUMMARY &amp; ANALYTICS</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                ● ส่วนแบ่งรายได้ 30 บาท/ครั้ง
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">
              ผลสรุปบริการและส่วนแบ่งรายได้ ({pubName})
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              สรุปข้อมูลการใช้บริการจริง แบ่งตามวัน สัปดาห์ เดือน และปี
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/pub/dashboard')}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              ← ย้อนกลับหน้าหลัก
            </button>
          </div>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              periodKey: 'day' as PeriodType,
              label: 'รายได้รายวัน', 
              timeTag: 'วันนี้ (Today)', 
              value: `฿${dailyEarnings.toLocaleString()}`, 
              sub: `${dailyCount} รายการวันนี้`, 
              icon: Clock, 
              color: 'text-pink-500', 
              badgeBg: 'bg-pink-500/10 text-pink-500 border-pink-500/20' 
            },
            { 
              periodKey: 'week' as PeriodType,
              label: 'รายได้รายสัปดาห์', 
              timeTag: 'สัปดาห์นี้ (This Week)', 
              value: `฿${weeklyEarnings.toLocaleString()}`, 
              sub: `${weeklyCount} รายการในสัปดาห์นี้`, 
              icon: Calendar, 
              color: 'text-blue-500', 
              badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
            },
            { 
              periodKey: 'month' as PeriodType,
              label: 'รายได้รายเดือน', 
              timeTag: 'เดือนนี้ (This Month)', 
              value: `฿${monthlyEarnings.toLocaleString()}`, 
              sub: `${monthlyCount} รายการในเดือนนี้`, 
              icon: TrendingUp, 
              color: 'text-[#2340A7]', 
              badgeBg: 'bg-[#2340A7]/10 text-[#2340A7] border-[#2340A7]/20' 
            },
            { 
              periodKey: 'year' as PeriodType,
              label: 'รายได้รายปี', 
              timeTag: 'ปีนี้ (This Year)', 
              value: `฿${yearlyEarnings.toLocaleString()}`, 
              sub: `${yearlyCount} รายการในปีนี้`, 
              icon: BarChart3, 
              color: 'text-emerald-500', 
              badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            },
          ].map((stat, i) => {
            const IconComp = stat.icon
            const isSelected = period === stat.periodKey
            return (
              <div 
                key={i} 
                onClick={() => setPeriod(stat.periodKey)}
                className={`p-6 bg-[var(--color-card)] border rounded-2xl shadow-md flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected ? 'border-[#2340A7] ring-2 ring-[#2340A7]/30' : 'border-[var(--color-border)] hover:border-[#2340A7]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl ${stat.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${stat.badgeBg}`}>
                    {stat.timeTag}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</div>
                  <div className="text-2xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{stat.value}</div>
                  <div className="text-[11px] font-medium text-[var(--color-text-muted)] mt-1">{stat.sub}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Middle Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Interactive Chart with Day/Week/Month/Year switcher */}
          <div className="lg:col-span-7 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              {/* Chart Header & Controls */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                      สถิติการใช้บริการ
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2340A7]/15 text-[#2340A7] border border-[#2340A7]/30">
                      {period === 'day' ? 'รายวัน' : period === 'week' ? 'รายสัปดาห์' : period === 'month' ? 'รายเดือน' : 'รายปี'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{periodDescription}</p>
                </div>

                {/* Period Switcher Tabs */}
                <div className="flex items-center p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-1">
                  {[
                    { key: 'day' as PeriodType, label: 'วัน (วันนี้)' },
                    { key: 'week' as PeriodType, label: 'สัปดาห์ (สัปดาห์นี้)' },
                    { key: 'month' as PeriodType, label: 'เดือน (เดือนนี้)' },
                    { key: 'year' as PeriodType, label: 'ปี (ปีนี้)' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPeriod(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        period === tab.key
                          ? 'bg-[#2340A7] !text-white shadow-md'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                      style={period === tab.key ? { color: '#ffffff' } : undefined}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Bar Chart */}
              <div className="h-60 flex items-end justify-between gap-2 border-b border-[var(--color-border)] pb-2 px-4 relative">
                {chartHeights.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#2340A7] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      {chartCounts[idx]} ครั้ง
                    </span>
                    <div 
                      className="w-full max-w-[36px] rounded-t-lg transition-all duration-500 shadow-md hover:brightness-110"
                      style={{
                        height: `${val}%`,
                        backgroundColor: chartColors[idx] || '#2340A7',
                        minHeight: chartCounts[idx] > 0 ? '8px' : '2px',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Labels */}
              <div className="flex justify-between px-2 mt-3 overflow-x-auto gap-1">
                {chartLabels.map((lbl, idx) => (
                  <div key={idx} className="flex-1 text-center text-[10.5px] font-semibold text-[var(--color-text-muted)] truncate px-0.5">
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Recent Completed Services with Clear Date Tags */}
          <div className="lg:col-span-5 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">การบริการที่เสร็จสิ้นล่าสุด</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ระบุวันที่และเวลาที่นำส่งผู้โดยสารเรียบร้อย</p>
                </div>
                <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-64 pr-1">
                {completedJobs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">ยังไม่มีประวัติการบริการที่เสร็จสิ้น</div>
                ) : (
                  completedJobs.map((job: any, index) => {
                    const distance = job.reqdistance || 0
                    const commission = 30 // ส่วนแบ่งรายได้เข้าสถานบันเทิง 30 บาทต่อครั้ง
                    const dateInfo = formatServiceDate(job.reqdatetime)

                    return (
                      <div key={index} className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-3 hover:border-[#2340A7]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {/* Date & Time Capsule */}
                          <div className="p-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-center min-w-[72px]">
                            <div className="text-[10px] font-bold text-[#2340A7]">{dateInfo.relative}</div>
                            <div className="text-xs font-extrabold text-[var(--color-text)]">{dateInfo.time}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[var(--color-text)]">{job.custname || 'ผู้ใช้บริการ SafeSeat'}</div>
                            <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                              <span>ระยะทาง {distance.toFixed(1)} km</span>
                              <span>•</span>
                              <span>{dateInfo.fullThai}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-500">+฿{commission}</div>
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 inline-block mt-0.5">
                            เสร็จสิ้น
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <button 
              onClick={() => router.push('/pub/service-info')}
              className="mt-6 w-full py-3 bg-[var(--color-surface)] hover:bg-[#2340A7]/20 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              ดูประวัติย้อนหลังทั้งหมด <ArrowRight className="w-4 h-4 text-[#2340A7]" />
            </button>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}

