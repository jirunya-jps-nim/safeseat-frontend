'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { BarChart3, TrendingUp, DollarSign, Calendar, CheckCircle2, ArrowRight, Clock, CalendarDays } from 'lucide-react'

// Custom Thai Date Input Component (วัน / เดือน / ปี)
function ThaiDateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const formatThaiDisplay = (isoStr: string) => {
    if (!isoStr) return 'วว/ดด/ปปปป'
    const parts = isoStr.split('-')
    if (parts.length !== 3) return isoStr
    const y = parseInt(parts[0], 10)
    const m = parts[1]
    const d = parts[2]
    const thaiYear = y + 543
    return `${d}/${m}/${thaiYear}`
  }

  const short = formatThaiDisplay(value)

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
        {label}
      </label>
      <div 
        onClick={() => {
          try {
            inputRef.current?.showPicker?.()
          } catch {
            inputRef.current?.focus()
          }
        }}
        className="relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#2340A7] transition-all cursor-pointer group shadow-xs"
      >
        <span className="text-xs sm:text-sm font-bold font-mono text-[var(--color-text)]">
          {short}
        </span>
        <CalendarDays className="w-4 h-4 text-[#2340A7] group-hover:scale-110 transition-transform pointer-events-none" />
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
    </div>
  )
}

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

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'custom'

function parseThaiDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const s = String(dateStr).trim()
  const cleanStr = s.replace(/Z$/i, '')
  const d = new Date(cleanStr)
  if (isNaN(d.getTime())) {
    return new Date()
  }
  return d
}

function formatServiceDate(dateStr: string) {
  if (!dateStr) return { relative: 'วันนี้', shortDate: '', time: '', fullThai: '', isToday: false, isYesterday: false, badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30' }
  
  try {
    const targetDate = parseThaiDate(dateStr)
    const now = new Date()

    const targetBangkok = new Date(targetDate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const nowBangkok = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))

    const targetDateOnly = new Date(targetBangkok.getFullYear(), targetBangkok.getMonth(), targetBangkok.getDate())
    const nowDateOnly = new Date(nowBangkok.getFullYear(), nowBangkok.getMonth(), nowBangkok.getDate())
    
    const diffDays = Math.round((nowDateOnly.getTime() - targetDateOnly.getTime()) / (1000 * 60 * 60 * 24))

    const isToday = diffDays === 0
    const isYesterday = diffDays === 1

    const hours = String(targetBangkok.getHours()).padStart(2, '0')
    const mins = String(targetBangkok.getMinutes()).padStart(2, '0')
    const time = `${hours}:${mins} น.`

    const day = targetBangkok.getDate()
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const month = monthNames[targetBangkok.getMonth()]
    const thaiYear = (targetBangkok.getFullYear() + 543).toString().slice(-2)

    const shortDate = `${day} ${month}`
    const fullThai = `${day} ${month} ${thaiYear}`

    let relative = ''
    let badgeColor = ''
    if (isToday) {
      relative = 'วันนี้'
      badgeColor = 'bg-blue-500/15 text-[#2340A7] border-blue-500/30'
    } else if (isYesterday) {
      relative = 'เมื่อวาน'
      badgeColor = 'bg-amber-500/15 text-amber-500 border-amber-500/30'
    } else {
      relative = shortDate
      badgeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30'
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

  // Custom Calendar Date Range
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  })
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  })
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [customEarnings, setCustomEarnings] = useState(0)
  const [customCount, setCustomCount] = useState(0)

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
  const [periodSubDescription, setPeriodSubDescription] = useState<string>('')

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
        calculateStats(data, period, customStartDate, customEndDate)
      } else {
        setRecords([])
        calculateStats([], period, customStartDate, customEndDate)
      }
    } catch (err: any) {
      console.warn('Could not fetch real records.', err)
      setRecords([])
      calculateStats([], period, customStartDate, customEndDate)
    } finally {
      setLoading(false)
    }
  }

  // Recalculate when period or custom dates change
  useEffect(() => {
    if (records.length >= 0) {
      calculateStats(records, period, customStartDate, customEndDate)
    }
  }, [period, customStartDate, customEndDate])

  const calculateStats = (allRecords: RequestRecord[], selectedPeriod: PeriodType, sDateStr: string, eDateStr: string) => {
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
      const fee = 30 // ส่วนแบ่งคงที่ 30 บาทเข้าสถานบันเทิง
      const recordKey = toThaiDateKey(date)
      const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))

      // Daily
      if (recordKey === todayThaiKey) {
        dailySum += fee
        dailyC += 1
      }

      // Weekly (This Week Sunday to Saturday)
      if (recordThaiDate >= startOfWeek && recordThaiDate <= endOfWeek) {
        weeklySum += fee
        weeklyC += 1
      }

      // Monthly
      if (recordThaiDate.getMonth() === currentMonth && recordThaiDate.getFullYear() === currentYear) {
        monthlySum += fee
        monthlyC += 1
      }

      // Yearly
      if (recordThaiDate.getFullYear() === currentYear) {
        yearlySum += fee
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
    let subDesc = ''

    if (selectedPeriod === 'day') {
      // 6 time slots today
      labels = ['00.00 - 03.59', '04.00 - 07.59', '08.00 - 11.59', '12.00 - 15.59', '16.00 - 19.59', '20.00 - 23.59']
      counts = [0, 0, 0, 0, 0, 0]
      colors = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#c084fc']
      
      const todayDateThai = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long', year: 'numeric' })
      desc = `สถิติรายช่วงเวลา ประจำวันนี้ (${todayDateThai})`
      subDesc = `• รวม ${dailyC} รายการ (฿${dailySum.toLocaleString()})`

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
      subDesc = `• รวม ${weeklyC} รายการ (฿${weeklySum.toLocaleString()})`

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
      subDesc = `• รวม ${monthlyC} รายการ (฿${monthlySum.toLocaleString()})`

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
      subDesc = `• รวม ${yearlyC} รายการ (฿${yearlySum.toLocaleString()})`

      completed.forEach((r) => {
        const date = parseThaiDate(r.reqdatetime)
        const recordThaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
        if (recordThaiDate.getFullYear() === currentYear) {
          const mIdx = recordThaiDate.getMonth()
          counts[mIdx] += 1
        }
      })
    } else if (selectedPeriod === 'custom') {
      // Custom Calendar Date Range
      const sDate = new Date(`${sDateStr || customStartDate}T00:00:00+07:00`)
      const eDate = new Date(`${eDateStr || customEndDate}T23:59:59.999+07:00`)

      const validStart = sDate <= eDate ? sDate : eDate
      const validEnd = sDate <= eDate ? eDate : sDate

      const diffTime = Math.abs(validEnd.getTime() - validStart.getTime())
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

      const customCompleted = completed.filter((r) => {
        const d = parseThaiDate(r.reqdatetime)
        return d >= validStart && d <= validEnd
      })

      const cEarnings = customCompleted.length * 30
      setCustomEarnings(cEarnings)
      setCustomCount(customCompleted.length)

      const startThaiStr = validStart.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: '2-digit' })
      const endThaiStr = validEnd.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: '2-digit' })
      desc = `สถิติตามช่วงวันที่เลือก (${startThaiStr} - ${endThaiStr})`
      subDesc = `• รวม ${customCompleted.length} รายการ (฿${cEarnings.toLocaleString()})`

      const palette = ['#2563EB', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1']

      if (diffDays <= 1) {
        labels = ['00.00 - 03.59', '04.00 - 07.59', '08.00 - 11.59', '12.00 - 15.59', '16.00 - 19.59', '20.00 - 23.59']
        counts = [0, 0, 0, 0, 0, 0]
        colors = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#c084fc']

        customCompleted.forEach((r) => {
          const date = parseThaiDate(r.reqdatetime)
          const hour = date.getHours()
          const slot = Math.min(Math.floor(hour / 4), 5)
          counts[slot] += 1
        })
      } else if (diffDays <= 14) {
        labels = []
        counts = []
        colors = []
        const cur = new Date(validStart)
        let i = 0
        while (cur <= validEnd && labels.length < 14) {
          const dayLabel = cur.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' })
          labels.push(dayLabel)

          const dayKey = cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
          const matchCount = customCompleted.filter((r) => {
            const rd = parseThaiDate(r.reqdatetime)
            return rd.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === dayKey
          }).length
          counts.push(matchCount)
          colors.push(palette[i % palette.length])

          cur.setDate(cur.getDate() + 1)
          i++
        }
      } else {
        const intervalCount = Math.min(diffDays, 7)
        labels = []
        counts = new Array(intervalCount).fill(0)
        colors = []
        const intervalDuration = diffTime / intervalCount

        for (let i = 0; i < intervalCount; i++) {
          const segStart = new Date(validStart.getTime() + i * intervalDuration)
          const segEnd = new Date(validStart.getTime() + (i + 1) * intervalDuration)
          const segLabel = `${segStart.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'numeric' })}-${segEnd.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'numeric' })}`
          labels.push(segLabel)
          colors.push(palette[i % palette.length])

          customCompleted.forEach((r) => {
            const rd = parseThaiDate(r.reqdatetime)
            if (rd >= segStart && (i === intervalCount - 1 ? rd <= segEnd : rd < segEnd)) {
              counts[i] += 1
            }
          })
        }
      }
    }

    const maxCount = Math.max(...counts, 1)
    const normalized = counts.map((c) => (c === 0 ? 0 : Math.max(12, Math.round((c / maxCount) * 85))))

    setChartLabels(labels)
    setChartCounts(counts)
    setChartHeights(normalized)
    setChartColors(colors)
    setPeriodDescription(desc)
    setPeriodSubDescription(subDesc)
  }

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'PUB'

  // Filter completed jobs according to active period accurately
  const completedJobs = [...records]
    .filter((r) => {
      const isComp = r.requeststatus?.toLowerCase() === 'completed' || r.requeststatus === 'เสร็จสิ้น'
      if (!isComp) return false

      const d = parseThaiDate(r.reqdatetime)
      const now = new Date()
      const todayThaiKey = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
      const toThaiDateKey = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
      const recordThaiDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const thaiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
      const currentMonth = thaiNow.getMonth()
      const currentYear = thaiNow.getFullYear()

      const startOfWeek = new Date(thaiNow)
      startOfWeek.setDate(thaiNow.getDate() - thaiNow.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      if (period === 'day') {
        return toThaiDateKey(d) === todayThaiKey
      } else if (period === 'week') {
        return recordThaiDate >= startOfWeek && recordThaiDate <= endOfWeek
      } else if (period === 'month') {
        return recordThaiDate.getMonth() === currentMonth && recordThaiDate.getFullYear() === currentYear
      } else if (period === 'year') {
        return recordThaiDate.getFullYear() === currentYear
      } else if (period === 'custom') {
        const sDate = new Date(`${customStartDate}T00:00:00+07:00`)
        const eDate = new Date(`${customEndDate}T23:59:59.999+07:00`)
        const validStart = sDate <= eDate ? sDate : eDate
        const validEnd = sDate <= eDate ? eDate : sDate
        return d >= validStart && d <= validEnd
      }
      return true
    })
    .sort((a, b) => parseThaiDate(b.reqdatetime).getTime() - parseThaiDate(a.reqdatetime).getTime())

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
              สรุปข้อมูลการใช้บริการจริง แบ่งตามวัน สัปดาห์ เดือน ปี และเลือกช่วงวันที่ตามต้องการจากปฏิทิน
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
              value: `฿${dailyEarnings.toLocaleString()}`, 
              sub: `${dailyCount} รายการวันนี้`, 
              icon: Clock, 
              color: 'text-pink-500'
            },
            { 
              periodKey: 'week' as PeriodType,
              label: 'รายได้รายสัปดาห์', 
              value: `฿${weeklyEarnings.toLocaleString()}`, 
              sub: `${weeklyCount} รายการในสัปดาห์นี้`, 
              icon: Calendar, 
              color: 'text-blue-500'
            },
            { 
              periodKey: 'month' as PeriodType,
              label: 'รายได้รายเดือน', 
              value: `฿${monthlyEarnings.toLocaleString()}`, 
              sub: `${monthlyCount} รายการในเดือนนี้`, 
              icon: TrendingUp, 
              color: 'text-[#2340A7]'
            },
            { 
              periodKey: (period === 'custom' ? 'custom' : 'year') as PeriodType,
              label: period === 'custom' ? 'รายได้ตามช่วงวันที่เลือก' : 'รายได้รายปี', 
              value: period === 'custom' ? `฿${customEarnings.toLocaleString()}` : `฿${yearlyEarnings.toLocaleString()}`, 
              sub: period === 'custom' ? `${customCount} รายการตามช่วงวันที่เลือก` : `${yearlyCount} รายการในปีนี้`, 
              icon: BarChart3, 
              color: 'text-emerald-500'
            },
          ].map((card, idx) => {
            const Icon = card.icon
            const isSelected = period === card.periodKey || (card.periodKey === 'custom' && period === 'custom')
            return (
              <div 
                key={idx}
                onClick={() => setPeriod(card.periodKey)}
                className={`p-5 rounded-2xl bg-[var(--color-card)] border transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer group hover:scale-[1.02] ${
                  isSelected 
                    ? 'border-[#2340A7] ring-2 ring-[#2340A7]/20 bg-[var(--color-card)]' 
                    : 'border-[var(--color-border)] hover:border-[#2340A7]/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] group-hover:border-[#2340A7]/30 transition-colors ${card.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[var(--color-text)]">
                      {card.label}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-manrope text-[var(--color-text)] tracking-tight">
                    {card.value}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-4 flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <span>{card.sub}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-[#2340A7]' : 'text-[var(--color-text-muted)]'}`}>
                    {isSelected ? '● กำลังดู' : 'คลิกเพื่อดู'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Analytics Section: Chart + Completed List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Interactive Chart with Day/Week/Month/Year/Calendar switcher */}
          <div className="lg:col-span-7 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              {/* Chart Header & Controls */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                    สถิติการใช้บริการ
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{periodDescription}</p>
                  {periodSubDescription && (
                    <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">{periodSubDescription}</p>
                  )}
                </div>

                {/* Period Switcher Tabs */}
                <div className="inline-flex items-center p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl gap-1 shrink-0">
                  {[
                    { key: 'day' as PeriodType, label: 'วัน' },
                    { key: 'week' as PeriodType, label: 'สัปดาห์' },
                    { key: 'month' as PeriodType, label: 'เดือน' },
                    { key: 'year' as PeriodType, label: 'ปี' },
                    { key: 'custom' as PeriodType, label: '📅 ปฏิทิน' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPeriod(tab.key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
                        period === tab.key
                          ? 'bg-[#2340A7] text-white shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
                      }`}
                      style={period === tab.key ? { color: '#ffffff', backgroundColor: '#2340A7' } : undefined}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expandable Calendar Date Range Bar */}
              {period === 'custom' && (
                <div className="mb-6 p-4 rounded-xl bg-[var(--color-surface)] border border-[#2340A7]/30 flex flex-col gap-3.5 animate-fade-in shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2340A7]">
                    <CalendarDays className="w-4 h-4 text-[#2340A7]" />
                    <span>เลือกช่วงวันที่ต้องการกรองข้อมูลจากปฏิทิน</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ThaiDateInput
                      label="วันที่เริ่มต้น (วัน / เดือน / ปี)"
                      value={customStartDate}
                      onChange={(val) => {
                        setCustomStartDate(val)
                        setPeriod('custom')
                      }}
                    />
                    <ThaiDateInput
                      label="วันที่สิ้นสุด (วัน / เดือน / ปี)"
                      value={customEndDate}
                      onChange={(val) => {
                        setCustomEndDate(val)
                        setPeriod('custom')
                      }}
                    />
                  </div>
                </div>
              )}

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
          <div className="lg:col-span-5 p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col h-full justify-between">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                    {period === 'custom' ? 'การบริการในช่วงวันที่เลือก' : 'การบริการที่เสร็จสิ้น'}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    แสดงรายการบริการที่เสร็จสิ้น ({completedJobs.length} รายการ)
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[320px] max-h-[480px] pr-1.5 custom-scrollbar">
                {completedJobs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                    {period === 'custom' ? 'ไม่พบรายการบริการที่เสร็จสิ้นในช่วงวันที่เลือก' : 'ยังไม่มีประวัติการบริการที่เสร็จสิ้น'}
                  </div>
                ) : (
                  completedJobs.map((job: any, index) => {
                    const distance = job.reqdistance || 0
                    const commission = 30 // ส่วนแบ่งรายได้เข้าสถานบันเทิง 30 บาทต่อครั้ง
                    const dateInfo = formatServiceDate(job.reqdatetime)

                    return (
                      <div key={index} className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-3 hover:border-[#2340A7]/40 transition-colors shrink-0">
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
              className="mt-4 w-full py-3.5 px-4 bg-[#2340A7] hover:bg-[#1D358F] active:scale-[0.99] rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-[#2340A7]/25 shrink-0"
            >
              <span>ดูประวัติย้อนหลังทั้งหมด</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}

