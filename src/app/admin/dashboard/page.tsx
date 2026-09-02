'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import AlertModal from '@/components/ui/AlertModal'
import { Shield, Car, Store, AlertTriangle, User, LogOut, CheckCircle2, XCircle, Search, Calendar, Filter, RefreshCw, ChevronRight, Eye, FileText, Check, X, TrendingUp, BarChart2, Clock, BarChart3 } from 'lucide-react'

// หน้าผู้ดูแลระบบ (Admin Dashboard: สถิติภาพรวม, อนุมัติคนขับ, อนุมัติสถานบันเทิง, และจัดการรายงาน)
interface AdminUser {
  username: string
}

interface StatsData {
  drivers: { pending: number; approved: number; rejected: number; total: number }
  pubs: { pending: number; approved: number; rejected: number; total: number }
  driverReports: { pending: number; total: number }
  userReports: { pending: number; total: number }
}

interface DriverCar {
  drivercarid: number
  carbrand: string
  carmodel: string
  carcolor: string
  carplateno: string
}

interface DriverData {
  username: string
  firstname: string
  lastname: string
  phoneno: string
  email: string
  gender: number
  idcard: string
  bankaccountno: string
  registerstatus: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'ปฏิเสธ'
  regisdate: string
  regisimagepath: string
  drivercar?: DriverCar
}

interface PubData {
  username: string
  pubname: string
  pubemail: string
  pubphone: string
  pubopen: string
  pubclose: string
  taxnumber: string
  bankaccountno: string
  bankaccountname: string
  regisstatus: 'pending' | 'approved' | 'rejected' | 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'ปฏิเสธ'
  regisdate: string
  regisimagepath?: string
}

interface ReportData {
  driverreportid?: number
  userreportid?: number
  reportdate: string
  reporttype: string
  reportdetail: string
  status: 'กำลังดำเนินการ' | 'แก้ไขแล้ว' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ' | 'ปฏิเสธ'
  reportstatus?: string
  reportindex?: number
  request_id?: number
  reportimagepath?: string
  reportimages?: string[]
}

type TabType = 'home' | 'driver-app' | 'pub-app' | 'driver-report' | 'user-report'

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

function getThaiDateString(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = parseThaiDate(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  } catch {
    return ''
  }
}

const REPORT_TYPE_MAP: Record<string, string> = {
  'wrong location': 'พิกัดรับส่งไม่ถูกต้อง / ผิดตำแหน่ง',
  'behavior': 'พฤติกรรมไม่เหมาะสม / กิริยาไม่สุภาพ',
  'safety issue': 'ความปลอดภัย / เสี่ยงอันตราย',
  'safety': 'ความปลอดภัย / เสี่ยงอันตราย',
  'driving': 'ขับรถเร็วเกินกำหนด / ขับขี่อันตราย',
  'dangerous driving': 'ขับรถเร็วเกินกำหนด / ขับขี่อันตราย',
  'overcharge': 'เรียกเก็บค่าบริการเกินจริง / ไม่ตรงตามระบบ',
  'payment': 'เรียกเก็บค่าบริการเกินจริง / ไม่ตรงตามระบบ',
  'harassment': 'พูดจาไม่สุภาพ / แสดงพฤติกรรมคุกคาม',
  'other': 'อื่นๆ (ระบุในรายละเอียด)',
  'ขับรถอันตราย': 'ขับรถเร็วเกินกำหนด / ขับขี่อันตราย',
  'ขับรถเร็วเกินกำหนด/อันตราย': 'ขับรถเร็วเกินกำหนด / ขับขี่อันตราย',
  'เรียกเก็บเงินเกินจริง': 'เรียกเก็บค่าบริการเกินจริง / ไม่ตรงตามระบบ',
  'ขอเก็บค่าบริการเพิ่มจากที่กำหนด': 'เรียกเก็บค่าบริการเกินจริง / ไม่ตรงตามระบบ',
  'พูดจาไม่สุภาพ/คุกคาม': 'พูดจาไม่สุภาพ / แสดงพฤติกรรมคุกคาม',
  'อื่นๆ (โปรดระบุในคำอธิบาย)': 'อื่นๆ (ระบุในรายละเอียด)',
  'อื่นๆ': 'อื่นๆ (ระบุในรายละเอียด)'
}

function formatReportType(rawType: string): string {
  if (!rawType) return 'ไม่ระบุหัวข้อรายงาน'
  const trimmed = rawType.trim()
  const key = trimmed.toLowerCase()
  return REPORT_TYPE_MAP[key] || trimmed
}

const mapReports = (list: any[]) => {
  return (list || []).map((item: any) => {
    const raw = String(item.status || item.reportstatus || 'รอดำเนินการ').trim()
    let finalStatus = raw
    if (raw === 'กำลังดำเนินการ' || raw === 'รอพิจารณา' || raw === 'pending') finalStatus = 'รอดำเนินการ'
    else if (raw === 'แก้ไขแล้ว' || raw === 'approved') finalStatus = 'อนุมัติแล้ว'
    else if (raw === 'ไม่อนุมัติ' || raw === 'rejected') finalStatus = 'ปฏิเสธ'
    return {
      ...item,
      status: finalStatus,
      reportstatus: finalStatus
    }
  })
}

const sortItems = <T extends Record<string, any>>(items: T[], statusKey: string, dateKey: string): T[] => {
  return [...items].sort((a, b) => {
    const getStatusStr = (item: any) => {
      const val = item[statusKey] || item.status || item.reportstatus || item.registerstatus || item.regisstatus || ''
      return String(val).trim().toLowerCase()
    }

    const aStr = getStatusStr(a)
    const bStr = getStatusStr(b)

    const isPending = (s: string) => s === 'รอดำเนินการ' || s === 'รอพิจารณา' || s === 'pending' || s === 'กำลังดำเนินการ'
    const aPending = isPending(aStr)
    const bPending = isPending(bStr)

    if (aPending && !bPending) return -1
    if (!aPending && bPending) return 1

    const dateA = a[dateKey] ? parseThaiDate(a[dateKey]).getTime() : 0
    const dateB = b[dateKey] ? parseThaiDate(b[dateKey]).getTime() : 0
    return dateB - dateA
  })
}

export default function AdminDashboard() {
  const router = useRouter()

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [pubs, setPubs] = useState<PubData[]>([])
  const [driverReports, setDriverReports] = useState<ReportData[]>([])
  const [userReports, setUserReports] = useState<ReportData[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('รอดำเนินการ')
  const [dateFilter, setDateFilter] = useState('')

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab)
    setSearchQuery('')
    setStatusFilter('รอดำเนินการ')
    setDateFilter('')
  }

  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null)
  const [selectedPub, setSelectedPub] = useState<PubData | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [selectedReportType, setSelectedReportType] = useState<'driver' | 'user' | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const [chartTimeframe, setChartTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null)
  const [visibleSeries, setVisibleSeries] = useState({
    driverApp: true,
    pubApp: true,
    driverReport: true,
    userReport: true,
  })

  const [actionLoading, setActionLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('admin_user')
    setShowLogoutModal(false)
    router.push('/login')
  }

  useEffect(() => {
    const stored = localStorage.getItem('admin_user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const parsed = JSON.parse(stored) as AdminUser
      if (parsed && parsed.username) {
        setAdminUser(parsed)
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const [statsRes, driversRes, pubsRes, driverRepRes, userRepRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/drivers'),
        api.get('/admin/pubs'),
        api.get('/admin/driver-reports'),
        api.get('/admin/user-reports'),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data)
      }
      if (driversRes.status === 'fulfilled' && driversRes.value.data?.success) {
        setDrivers(sortItems(driversRes.value.data.data, 'registerstatus', 'regisdate'))
      }
      if (pubsRes.status === 'fulfilled' && pubsRes.value.data?.success) {
        setPubs(sortItems(pubsRes.value.data.data, 'regisstatus', 'regisdate'))
      }
      if (driverRepRes.status === 'fulfilled' && driverRepRes.value.data?.success) {
        setDriverReports(sortItems(mapReports(driverRepRes.value.data.data), 'status', 'reportdate'))
      }
      if (userRepRes.status === 'fulfilled' && userRepRes.value.data?.success) {
        setUserReports(sortItems(mapReports(userRepRes.value.data.data), 'status', 'reportdate'))
      }
    } catch (err) {
      console.error('Failed to fetch stats & real data:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchTabData = useCallback(async (tab: TabType) => {
    if (tab === 'home') {
      fetchStats()
      return
    }
    setLoadingData(true)
    try {
      let endpoint = ''
      if (tab === 'driver-app') endpoint = '/admin/drivers'
      else if (tab === 'pub-app') endpoint = '/admin/pubs'
      else if (tab === 'driver-report') endpoint = '/admin/driver-reports'
      else if (tab === 'user-report') endpoint = '/admin/user-reports'

      const res = await api.get(endpoint)
      if (res.data && res.data.success) {
        const payload = res.data.data
        if (tab === 'driver-app') {
          setDrivers(sortItems(payload, 'registerstatus', 'regisdate'))
        }
        else if (tab === 'pub-app') {
          setPubs(sortItems(payload, 'regisstatus', 'regisdate'))
        }
        else if (tab === 'driver-report') {
          setDriverReports(sortItems(mapReports(payload), 'status', 'reportdate'))
        }
        else if (tab === 'user-report') {
          setUserReports(sortItems(mapReports(payload), 'status', 'reportdate'))
        }
      }
    } catch (err) {
      console.error(`Failed to fetch data for ${tab}:`, err)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (adminUser) {
      fetchTabData(activeTab)
    }
  }, [adminUser, activeTab, fetchTabData])

  const handleDriverStatus = async (username: string, newStatus: 'อนุมัติแล้ว' | 'ปฏิเสธ') => {
    setActionLoading(true)
    try {
      const res = await api.put(`/admin/drivers/${username}/status`, { status: newStatus })
      if (res.data && res.data.success) {
        showToast(newStatus === 'ปฏิเสธ' ? `ปฏิเสธคำขอสมัครคนขับของ @${username} เรียบร้อยแล้ว` : `อนุมัติคำขอสมัครคนขับ @${username} เรียบร้อยแล้ว`)
        await fetchTabData('driver-app')
        setSelectedDriver(null)
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePubStatus = async (username: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(true)
    try {
      const res = await api.put(`/admin/pubs/${username}/status`, { status: newStatus })
      if (res.data && res.data.success) {
        showToast(newStatus === 'rejected' ? `ปฏิเสธคำขอพาร์ทเนอร์สถานบันเทิง @${username} เรียบร้อยแล้ว` : `อนุมัติคำขอพาร์ทเนอร์สถานบันเทิง @${username} เรียบร้อยแล้ว`)
        await fetchTabData('pub-app')
        setSelectedPub(null)
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReportStatus = async (reportId: number, type: 'driver' | 'user', newStatus: 'กำลังดำเนินการ' | 'แก้ไขแล้ว' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ' | 'ปฏิเสธ') => {
    setActionLoading(true)
    try {
      const endpoint = type === 'driver'
        ? `/admin/driver-reports/${reportId}/status`
        : `/admin/user-reports/${reportId}/status`
      const res = await api.put(endpoint, { status: newStatus })
      if (res.data && res.data.success) {
        showToast(newStatus === 'ปฏิเสธ' || newStatus === 'ไม่อนุมัติ' ? 'ปฏิเสธรายการรายงานเรียบร้อยแล้ว' : 'อนุมัติรายงานเรียบร้อยแล้ว')
        const targetTab: TabType = type === 'driver' ? 'driver-report' : 'user-report'
        await fetchTabData(targetTab)
        setSelectedReport(null)
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะรายงานได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    confirmBg: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    confirmBg: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
    onConfirm: () => {},
  })

  const promptDriverApprove = (username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการอนุมัติการสมัครคนขับ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการอนุมัติคำขอสมัครของคนขับ @${username}?`,
      confirmText: 'ยืนยันการอนุมัติ (Approve)',
      confirmBg: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
      onConfirm: () => handleDriverStatus(username, 'อนุมัติแล้ว')
    })
  }

  const promptDriverReject = (username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธการสมัครคนขับ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอสมัครของคนขับ @${username}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      confirmText: 'ยืนยันการปฏิเสธ (Confirm Reject)',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => handleDriverStatus(username, 'ปฏิเสธ')
    })
  }

  const promptPubApprove = (username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการอนุมัติการสมัครพาร์ทเนอร์สถานบันเทิง',
      message: `คุณแน่ใจหรือไม่ว่าต้องการอนุมัติคำขอสมัครของสถานบันเทิง @${username}?`,
      confirmText: 'ยืนยันการอนุมัติ (Approve)',
      confirmBg: 'bg-[#2340A7] hover:bg-[#1D358F]',
      onConfirm: () => handlePubStatus(username, 'approved')
    })
  }

  const promptPubReject = (username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธการสมัครพาร์ทเนอร์สถานบันเทิง',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอสมัครของสถานบันเทิง @${username}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      confirmText: 'ยืนยันการปฏิเสธ (Confirm Reject)',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => handlePubStatus(username, 'rejected')
    })
  }

  const promptReportApprove = (reportId: number, type: 'driver' | 'user') => {
    const label = type === 'driver' ? `รายงานคนขับ #DRV-${reportId}` : `รายงานผู้ใช้บริการ #USR-${reportId}`
    const targetStatus = 'อนุมัติแล้ว'
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการอนุมัติ / ดำเนินการรายงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะของ ${label} เป็น "${targetStatus}"?`,
      confirmText: 'ยืนยันการอัปเดตสถานะ',
      confirmBg: 'bg-[#2340A7] hover:bg-[#1D358F]',
      onConfirm: () => handleReportStatus(reportId, type, targetStatus)
    })
  }

  const promptReportReject = (reportId: number, type: 'driver' | 'user') => {
    const label = type === 'driver' ? `รายงานคนขับ #DRV-${reportId}` : `รายงานผู้ใช้บริการ #USR-${reportId}`
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธรายการรายงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธ ${label}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      confirmText: 'ยืนยันการปฏิเสธ (Confirm Reject)',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => handleReportStatus(reportId, type, type === 'user' ? 'ไม่อนุมัติ' : 'ปฏิเสธ')
    })
  }

  const parseDriverImages = (imagePathStr: string) => {
    try {
      const parsed = JSON.parse(imagePathStr)
      if (typeof parsed === 'object' && parsed !== null) return parsed
      return {}
    } catch {
      return { profile: imagePathStr }
    }
  }

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      const d = parseThaiDate(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const datePart = d.toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const timePart = d.toLocaleTimeString('th-TH', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      return `${datePart}, ${timePart} น.`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter flex flex-col md:flex-row transition-colors duration-300">
      
      <AlertModal
        isOpen={!!toast}
        message={toast?.msg || ''}
        type={toast?.type || 'info'}
        onClose={() => setToast(null)}
      />

      {}
      <aside className="w-full md:w-72 bg-white border-r border-[#E2E8F0] p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-manrope text-[#0F172A]">SafeSeat Admin</h2>
              <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-widest font-mono">Control Center</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => handleTabChange('home')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Shield className="w-5 h-5" /> ภาพรวมระบบ (Home)
            </button>

            <span className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8] mt-4 px-2">การอนุมัติคำขอ</span>

            <button
              onClick={() => handleTabChange('driver-app')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 cursor-pointer ${
                activeTab === 'driver-app'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Car className="w-5 h-5" /> พิจารณาคนขับรถ
            </button>

            <button
              onClick={() => handleTabChange('pub-app')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 cursor-pointer ${
                activeTab === 'pub-app'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Store className="w-5 h-5" /> พิจารณาสถานบันเทิง
            </button>

            <span className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8] mt-4 px-2">รายงานความประพฤติ</span>

            <button
              onClick={() => handleTabChange('driver-report')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 cursor-pointer ${
                activeTab === 'driver-report'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" /> รายงานคนขับ
            </button>

            <button
              onClick={() => handleTabChange('user-report')}
              className={`w-full p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 cursor-pointer ${
                activeTab === 'user-report'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <User className="w-5 h-5" /> รายงานผู้ใช้บริการ
            </button>
          </nav>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-6">
          <button 
            onClick={handleLogout} 
            className="w-full p-3.5 rounded-xl text-sm font-extrabold text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {}
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-white border border-[#E2E8F0] p-4.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <span className="text-[#64748B]">Admin</span>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            <span className="text-[#2563EB] font-manrope uppercase tracking-wider font-black text-base">
              {activeTab === 'home' && 'ภาพรวมระบบ'}
              {activeTab === 'driver-app' && 'พิจารณาอนุมัติคนขับ'}
              {activeTab === 'pub-app' && 'พิจารณาอนุมัติสถานบันเทิง'}
              {activeTab === 'driver-report' && 'รายงานความประพฤติคนขับ'}
              {activeTab === 'user-report' && 'รายงานความประพฤติผู้ใช้บริการ'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm font-bold text-[#0F172A] shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center text-xs font-black uppercase">
              {adminUser?.username ? adminUser.username.charAt(0) : 'A'}
            </div>
            <span>@{adminUser?.username || 'admin'}</span>
          </div>
        </div>

        {/* TAB: home */}
        {activeTab === 'home' && (
          <div>
            {loadingStats ? (
              <div className="p-12 text-center text-sm font-bold text-[#64748B]">กำลังโหลดสถิติระบบ...</div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm flex flex-col gap-6">
                {/* Main Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] flex items-center gap-2.5 font-manrope">
                      <TrendingUp className="w-6 h-6 text-[#2563EB]" /> สถิติการสมัครและรายงานสรุป
                    </h3>
                    <p className="text-sm font-semibold text-[#64748B] mt-1">
                      เปรียบเทียบแนวโน้มการสมัครและข้อร้องเรียนตามช่วงเวลา (วัน / สัปดาห์ / เดือน / ปี)
                    </p>
                  </div>
                </div>

                {/* Series Visibility Toggles */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-extrabold bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] uppercase tracking-wider text-xs font-black">หมวดหมู่สถิติ:</span>
                  <div className="flex flex-wrap items-center gap-5">
                    <button 
                      onClick={() => setVisibleSeries(prev => ({ ...prev, driverApp: !prev.driverApp }))}
                      className={`flex items-center gap-2.5 transition-opacity cursor-pointer text-sm font-bold ${visibleSeries.driverApp ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB]"></span>
                      <span className="text-[#0F172A]">การสมัครคนขับ</span>
                    </button>

                    <button 
                      onClick={() => setVisibleSeries(prev => ({ ...prev, pubApp: !prev.pubApp }))}
                      className={`flex items-center gap-2.5 transition-opacity cursor-pointer text-sm font-bold ${visibleSeries.pubApp ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0EA5E9]"></span>
                      <span className="text-[#0F172A]">การสมัครสถานบันเทิง</span>
                    </button>

                    <button 
                      onClick={() => setVisibleSeries(prev => ({ ...prev, driverReport: !prev.driverReport }))}
                      className={`flex items-center gap-2.5 transition-opacity cursor-pointer text-sm font-bold ${visibleSeries.driverReport ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444]"></span>
                      <span className="text-[#0F172A]">รายงานคนขับ</span>
                    </button>

                    <button 
                      onClick={() => setVisibleSeries(prev => ({ ...prev, userReport: !prev.userReport }))}
                      className={`flex items-center gap-2.5 transition-opacity cursor-pointer text-sm font-bold ${visibleSeries.userReport ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#EC4899]"></span>
                      <span className="text-[#0F172A]">รายงานผู้ใช้บริการ</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Chart Section */}
                {(() => {
                const getAnalyticsData = () => {
                  const now = new Date()
                  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
                  const currentMonth = now.getMonth()
                  const currentYear = now.getFullYear()

                  if (chartTimeframe === 'day') {
                    // วันนี้ (Today): แบ่งเป็น 6 ช่วงเวลาของวันนี้ (00.00 - 23.59)
                    const labels = ['00.00 - 03.59', '04.00 - 07.59', '08.00 - 11.59', '12.00 - 15.59', '16.00 - 19.59', '20.00 - 23.59']
                    const counts = {
                      driverApp: [0, 0, 0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0, 0, 0],
                      userReport: [0, 0, 0, 0, 0, 0],
                    }

                    const countByTimeSlot = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const d = parseThaiDate(item[dateKey])
                        const itemDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
                        if (itemDateStr === todayStr) {
                          const hour = d.getHours()
                          const slotIdx = Math.min(Math.floor(hour / 4), 5)
                          arr[slotIdx] += 1
                        }
                      })
                    }

                    countByTimeSlot(drivers, 'regisdate', counts.driverApp)
                    countByTimeSlot(pubs, 'regisdate', counts.pubApp)
                    countByTimeSlot(driverReports, 'reportdate', counts.driverReport)
                    countByTimeSlot(userReports, 'reportdate', counts.userReport)

                    const todayDateThai = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
                    return { 
                      labels, 
                      datasets: counts, 
                      periodTitle: `สถิติรายช่วงเวลา ประจำวันนี้ (${todayDateThai})` 
                    }
                  }

                  else if (chartTimeframe === 'week') {
                    // สัปดาห์นี้ (This Week): แสดง 7 วันของสัปดาห์นี้ (จันทร์ - อาทิตย์)
                    const labels = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
                    const dayMap = [6, 0, 1, 2, 3, 4, 5] // Sun=6, Mon=0, Tue=1, ...

                    const dayOfWeek = (now.getDay() + 6) % 7 // 0 = Mon, 6 = Sun
                    const startOfWeek = new Date(now)
                    startOfWeek.setHours(0, 0, 0, 0)
                    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

                    const endOfWeek = new Date(startOfWeek)
                    endOfWeek.setDate(endOfWeek.getDate() + 6)
                    endOfWeek.setHours(23, 59, 59, 999)

                    const counts = {
                      driverApp: [0, 0, 0, 0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0, 0, 0, 0],
                      userReport: [0, 0, 0, 0, 0, 0, 0],
                    }

                    const countByDayOfWeek = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const d = parseThaiDate(item[dateKey])
                        if (d >= startOfWeek && d <= endOfWeek) {
                          const dayIdx = dayMap[d.getDay()]
                          if (dayIdx >= 0 && dayIdx < 7) {
                            arr[dayIdx] += 1
                          }
                        }
                      })
                    }

                    countByDayOfWeek(drivers, 'regisdate', counts.driverApp)
                    countByDayOfWeek(pubs, 'regisdate', counts.pubApp)
                    countByDayOfWeek(driverReports, 'reportdate', counts.driverReport)
                    countByDayOfWeek(userReports, 'reportdate', counts.userReport)

                    const startStr = startOfWeek.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                    const endStr = endOfWeek.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                    return { 
                      labels, 
                      datasets: counts, 
                      periodTitle: `สถิติรายวัน ประจำสัปดาห์นี้ (${startStr} - ${endStr})` 
                    }
                  }

                  else if (chartTimeframe === 'month') {
                    // เดือนนี้ (This Month): แสดง 4 ช่วงสัปดาห์ของเดือนนี้
                    const labels = ['1 - 7 ของเดือน', '8 - 14 ของเดือน', '15 - 21 ของเดือน', '22 - สิ้นเดือน']
                    const counts = {
                      driverApp: [0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0],
                      userReport: [0, 0, 0, 0],
                    }

                    const countByWeekOfMonth = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const d = parseThaiDate(item[dateKey])
                        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                          const dateNum = d.getDate()
                          const weekIdx = Math.min(Math.floor((dateNum - 1) / 7), 3)
                          arr[weekIdx] += 1
                        }
                      })
                    }

                    countByWeekOfMonth(drivers, 'regisdate', counts.driverApp)
                    countByWeekOfMonth(pubs, 'regisdate', counts.pubApp)
                    countByWeekOfMonth(driverReports, 'reportdate', counts.driverReport)
                    countByWeekOfMonth(userReports, 'reportdate', counts.userReport)

                    const monthThai = now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
                    return { 
                      labels, 
                      datasets: counts, 
                      periodTitle: `สถิติรายสัปดาห์ ประจำเดือน ${monthThai}` 
                    }
                  }

                  else {
                    // ปีนี้ (This Year): แสดง 12 เดือนของปีปัจจุบัน
                    const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
                    const counts = {
                      driverApp: Array(12).fill(0),
                      pubApp: Array(12).fill(0),
                      driverReport: Array(12).fill(0),
                      userReport: Array(12).fill(0),
                    }

                    const countByMonthOfYear = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const d = parseThaiDate(item[dateKey])
                        if (d.getFullYear() === currentYear) {
                          const m = d.getMonth()
                          if (m >= 0 && m < 12) arr[m] += 1
                        }
                      })
                    }

                    countByMonthOfYear(drivers, 'regisdate', counts.driverApp)
                    countByMonthOfYear(pubs, 'regisdate', counts.pubApp)
                    countByMonthOfYear(driverReports, 'reportdate', counts.driverReport)
                    countByMonthOfYear(userReports, 'reportdate', counts.userReport)

                    const yearThai = now.toLocaleDateString('th-TH', { year: 'numeric' })
                    return { 
                      labels, 
                      datasets: counts, 
                      periodTitle: `สถิติรายเดือน ประจำปี ${yearThai}` 
                    }
                  }
                }

                const data = getAnalyticsData()
                const allValues = [
                  ...(visibleSeries.driverApp ? data.datasets.driverApp : []),
                  ...(visibleSeries.pubApp ? data.datasets.pubApp : []),
                  ...(visibleSeries.driverReport ? data.datasets.driverReport : []),
                  ...(visibleSeries.userReport ? data.datasets.userReport : []),
                ]
                const maxValue = Math.max(...allValues, 1) + 2

                return (
                  <div className="flex flex-col gap-4">
                    {/* Period Banner Description */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs sm:text-sm font-black text-[#2563EB] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full shadow-xs">
                        📊 {data.periodTitle}
                      </span>
                      <span className="text-xs font-bold text-[#64748B]">
                        คลิกที่การ์ดช่วงเวลาด้านล่างเพื่อสลับมุมมอง
                      </span>
                    </div>

                    <div className="relative pt-6 pb-2 px-2 bg-[#F8FAFC]/50 rounded-2xl border border-[#E2E8F0]">
                      {/* Y-Axis Guidelines */}
                      <div className="absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between pointer-events-none px-4 opacity-40">
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-xs font-mono text-[#64748B]"><span>{maxValue}</span></div>
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-xs font-mono text-[#64748B]"><span>{Math.round(maxValue / 2)}</span></div>
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-xs font-mono text-[#64748B]"><span>0</span></div>
                      </div>

                      {/* Dynamic Bar Columns */}
                      <div className={`relative z-10 grid gap-1.5 sm:gap-2 items-end min-h-[210px] sm:min-h-[240px] pt-8 pb-4 px-2 sm:px-4 ${
                        data.labels.length === 4 
                          ? 'grid-cols-4' 
                          : data.labels.length === 6 
                            ? 'grid-cols-6' 
                            : data.labels.length === 7 
                              ? 'grid-cols-7' 
                              : 'grid-cols-6 sm:grid-cols-12'
                      }`}>
                        {data.labels.map((label, idx) => {
                          const driverAppVal = data.datasets.driverApp[idx] || 0
                          const pubAppVal = data.datasets.pubApp[idx] || 0
                          const driverReportVal = data.datasets.driverReport[idx] || 0
                          const userReportVal = data.datasets.userReport[idx] || 0

                          const isHovered = chartHoverIndex === idx

                          return (
                            <div 
                              key={idx}
                              onMouseEnter={() => setChartHoverIndex(idx)}
                              onMouseLeave={() => setChartHoverIndex(null)}
                              className={`flex flex-col items-center justify-end h-full relative cursor-pointer p-1 sm:p-2 rounded-xl transition-all ${
                                isHovered ? 'bg-[#2563EB]/5 scale-[1.02]' : ''
                              }`}
                            >
                              {/* Hover Tooltip */}
                              {isHovered && (
                                <div className="absolute bottom-full mb-3 z-30 bg-[#0F172A] text-white p-3.5 rounded-2xl shadow-xl text-xs whitespace-nowrap min-w-[160px] pointer-events-none border border-slate-700">
                                  <div className="font-black border-b border-slate-700 pb-1.5 mb-2 text-blue-400 text-sm">{label}</div>
                                  {visibleSeries.driverApp && <div className="flex justify-between gap-3 text-slate-300 py-0.5"><span>การสมัครคนขับ:</span> <b className="text-white">{driverAppVal}</b></div>}
                                  {visibleSeries.pubApp && <div className="flex justify-between gap-3 text-slate-300 py-0.5"><span>การสมัครสถานบันเทิง:</span> <b className="text-white">{pubAppVal}</b></div>}
                                  {visibleSeries.driverReport && <div className="flex justify-between gap-3 text-slate-300 py-0.5"><span>รายงานคนขับ:</span> <b className="text-white">{driverReportVal}</b></div>}
                                  {visibleSeries.userReport && <div className="flex justify-between gap-3 text-slate-300 py-0.5"><span>รายงานผู้ใช้บริการ:</span> <b className="text-white">{userReportVal}</b></div>}
                                </div>
                              )}

                              {/* Bars Container */}
                              <div className="flex items-end justify-center gap-1 sm:gap-2 w-full h-[150px] sm:h-[180px]">
                                {visibleSeries.driverApp && (
                                  <div 
                                    style={{ height: `${(driverAppVal / maxValue) * 100}%` }} 
                                    className="w-2 sm:w-4 lg:w-5 bg-[#2563EB] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.pubApp && (
                                  <div 
                                    style={{ height: `${(pubAppVal / maxValue) * 100}%` }} 
                                    className="w-2 sm:w-4 lg:w-5 bg-[#0EA5E9] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.driverReport && (
                                  <div 
                                    style={{ height: `${(driverReportVal / maxValue) * 100}%` }} 
                                    className="w-2 sm:w-4 lg:w-5 bg-[#EF4444] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.userReport && (
                                  <div 
                                    style={{ height: `${(userReportVal / maxValue) * 100}%` }} 
                                    className="w-2 sm:w-4 lg:w-5 bg-[#EC4899] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                              </div>

                              {/* Column Label */}
                              <span className={`text-[10px] sm:text-xs font-black mt-2.5 truncate transition-colors text-center w-full ${isHovered ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                                {label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* 4 Interactive Period Overview Stat Cards */}
                    {(() => {
                      const now = new Date()
                      const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
                      const currentMonth = now.getMonth()
                      const currentYear = now.getFullYear()

                      const dayOfWeek = (now.getDay() + 6) % 7 // 0 = Mon, 6 = Sun
                      const startOfWeek = new Date(now)
                      startOfWeek.setHours(0, 0, 0, 0)
                      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

                      const countInPeriods = (items: any[], dateKey: string) => {
                        let day = 0, week = 0, month = 0, year = 0;
                        (items || []).forEach(item => {
                          if (!item[dateKey]) return
                          const d = parseThaiDate(item[dateKey])
                          const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
                          const m = d.getMonth()
                          const yr = d.getFullYear()

                          if (dateStr === todayStr) day++
                          if (d >= startOfWeek && d <= now) week++
                          if (m === currentMonth && yr === currentYear) month++
                          if (yr === currentYear) year++
                        })
                        return { day, week, month, year }
                      }

                      const drv = countInPeriods(drivers, 'regisdate')
                      const pub = countInPeriods(pubs, 'regisdate')
                      const drvRep = countInPeriods(driverReports, 'reportdate')
                      const usrRep = countInPeriods(userReports, 'reportdate')

                      const periodStats = [
                        {
                          key: 'day' as const,
                          label: 'กิจกรรมวันนี้',
                          timeTag: 'วันนี้ (Today)',
                          total: drv.day + pub.day + drvRep.day + usrRep.day,
                          apps: drv.day + pub.day,
                          reports: drvRep.day + usrRep.day,
                          icon: Clock,
                          color: 'text-pink-600',
                          badgeBg: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
                          activeBorder: 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/40',
                        },
                        {
                          key: 'week' as const,
                          label: 'กิจกรรมสัปดาห์นี้',
                          timeTag: 'สัปดาห์นี้ (This Week)',
                          total: drv.week + pub.week + drvRep.week + usrRep.week,
                          apps: drv.week + pub.week,
                          reports: drvRep.week + usrRep.week,
                          icon: Calendar,
                          color: 'text-blue-600',
                          badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                          activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40',
                        },
                        {
                          key: 'month' as const,
                          label: 'กิจกรรมเดือนนี้',
                          timeTag: 'เดือนนี้ (This Month)',
                          total: drv.month + pub.month + drvRep.month + usrRep.month,
                          apps: drv.month + pub.month,
                          reports: drvRep.month + usrRep.month,
                          icon: TrendingUp,
                          color: 'text-indigo-600',
                          badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
                          activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40',
                        },
                        {
                          key: 'year' as const,
                          label: 'กิจกรรมปีนี้',
                          timeTag: 'ปีนี้ (This Year)',
                          total: drv.year + pub.year + drvRep.year + usrRep.year,
                          apps: drv.year + pub.year,
                          reports: drvRep.year + usrRep.year,
                          icon: BarChart3,
                          color: 'text-emerald-600',
                          badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                          activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
                        },
                      ]

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                          {periodStats.map((stat) => {
                            const IconComp = stat.icon
                            const isSelected = chartTimeframe === stat.key
                            return (
                              <div
                                key={stat.key}
                                onClick={() => setChartTimeframe(stat.key)}
                                className={`p-5 bg-white border rounded-2xl shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                                  isSelected ? stat.activeBorder : 'border-[#E2E8F0] hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className={`p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl ${stat.color}`}>
                                    <IconComp className="w-5 h-5" />
                                  </div>
                                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${stat.badgeBg}`}>
                                    {stat.timeTag}
                                  </span>
                                </div>
                                <div className="mt-4">
                                  <div className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">{stat.label}</div>
                                  <div className="text-3xl font-black font-manrope text-[#0F172A] mt-1">{stat.total} <span className="text-sm font-bold text-[#64748B]">รายการ</span></div>
                                  <div className="text-xs font-bold text-[#64748B] mt-2 flex items-center gap-2">
                                    <span className="text-blue-600 font-extrabold">สมัคร {stat.apps}</span>
                                    <span>•</span>
                                    <span className="text-red-500 font-extrabold">ร้องเรียน {stat.reports}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                )
              })()}
            </div>
            )}
          </div>
        )}

        {/* TAB: driver-app */}
        {activeTab === 'driver-app' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black font-manrope text-[#0F172A]">รายการอนุมัติพนักงานขับรถ (Driver Applications)</h2>
              <span className="text-sm font-bold text-[#64748B]">
                {statusFilter === 'รอดำเนินการ' ? 'รอดำเนินการพิจารณา' : statusFilter === 'All' ? 'รายการทั้งหมด' : statusFilter}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="md:col-span-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, username, อีเมล, เบอร์โทร, เลขบัตร..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-[#0F172A] outline-none w-full font-semibold"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0F172A] outline-none w-full cursor-pointer"
                  title="กรองตามวันที่ยื่นสมัคร"
                />
                {dateFilter && (
                  <button type="button" onClick={() => setDateFilter('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-[#0F172A] outline-none cursor-pointer shadow-xs"
                >
                  <option value="รอดำเนินการ">🟡 รอดำเนินการ (Pending)</option>
                  <option value="อนุมัติแล้ว">🟢 อนุมัติแล้ว (Approved)</option>
                  <option value="ปฏิเสธ">🔴 ปฏิเสธ (Rejected)</option>
                  <option value="All">📋 รายการทั้งหมด (All)</option>
                </select>
              </div>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-sm font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs font-black uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อ - นามสกุล</th>
                      <th className="p-4">อีเมล / เบอร์โทร</th>
                      <th className="p-4">วันที่สมัคร</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A] font-medium">
                    {drivers.filter(d => {
                      const q = searchQuery.toLowerCase().trim()
                      const matchSearch = !q || 
                        d.username.toLowerCase().includes(q) || 
                        `${d.firstname} ${d.lastname}`.toLowerCase().includes(q) ||
                        (d.email && d.email.toLowerCase().includes(q)) ||
                        (d.phoneno && d.phoneno.includes(q)) ||
                        (d.idcard && d.idcard.includes(q))
                      
                      const regStatus = String(d.registerstatus || '')
                      const matchStatus = 
                        statusFilter === 'All' ||
                        regStatus === statusFilter ||
                        (statusFilter === 'รอดำเนินการ' && (regStatus === 'รอดำเนินการ' || regStatus === 'pending')) ||
                        (statusFilter === 'อนุมัติแล้ว' && (regStatus === 'อนุมัติแล้ว' || regStatus === 'approved')) ||
                        (statusFilter === 'ปฏิเสธ' && (regStatus === 'ปฏิเสธ' || regStatus === 'rejected'))

                      const matchDate = !dateFilter || getThaiDateString(d.regisdate) === dateFilter

                      return matchSearch && matchStatus && matchDate
                    }).sort((a, b) => {
                      const isPendingA = a.registerstatus !== 'อนุมัติแล้ว' && a.registerstatus !== 'ปฏิเสธ'
                      const isPendingB = b.registerstatus !== 'อนุมัติแล้ว' && b.registerstatus !== 'ปฏิเสธ'
                      if (isPendingA && !isPendingB) return -1
                      if (!isPendingA && isPendingB) return 1
                      return new Date(b.regisdate || 0).getTime() - new Date(a.regisdate || 0).getTime()
                    }).map(driver => (
                      <tr key={driver.username} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-black text-[#0F172A] text-sm">{driver.username}</td>
                        <td className="p-4 font-bold text-sm">{driver.firstname} {driver.lastname}</td>
                        <td className="p-4">
                          <div className="text-[#64748B] text-sm font-semibold">{driver.email}</div>
                          <div className="text-xs font-mono text-[#94A3B8] font-bold mt-0.5">{driver.phoneno}</div>
                        </td>
                        <td className="p-4 text-sm font-semibold">{formatThaiDate(driver.regisdate)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${
                            driver.registerstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : driver.registerstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {driver.registerstatus === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : driver.registerstatus === 'ปฏิเสธ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = driver.registerstatus === 'อนุมัติแล้ว' || driver.registerstatus === 'ปฏิเสธ'
                            return (
                              <button
                                onClick={() => setSelectedDriver(driver)}
                                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#475569] shadow-xs'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                                }`}
                              >
                                {isProcessed ? 'ดูข้อมูล ➔' : 'ตรวจสอบข้อมูล ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-[#64748B] font-bold">ไม่มีคำขอสมัครคนขับในระบบขณะนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: pub-app */}
        {activeTab === 'pub-app' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black font-manrope text-[#0F172A]">รายการอนุมัติพาร์ทเนอร์สถานบันเทิง (Partner Venue Applications)</h2>
              <span className="text-sm font-bold text-[#64748B]">
                {statusFilter === 'รอดำเนินการ' ? 'รอดำเนินการพิจารณา' : statusFilter === 'All' ? 'รายการทั้งหมด' : statusFilter}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="md:col-span-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อร้าน, username, อีเมล, เบอร์โทร, เลขผู้เสียภาษี..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-[#0F172A] outline-none w-full font-semibold"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0F172A] outline-none w-full cursor-pointer"
                  title="กรองตามวันที่ยื่นสมัคร"
                />
                {dateFilter && (
                  <button type="button" onClick={() => setDateFilter('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-[#0F172A] outline-none cursor-pointer shadow-xs"
                >
                  <option value="รอดำเนินการ">🟡 รอดำเนินการ (Pending)</option>
                  <option value="อนุมัติแล้ว">🟢 อนุมัติแล้ว (Approved)</option>
                  <option value="ปฏิเสธ">🔴 ปฏิเสธ (Rejected)</option>
                  <option value="All">📋 รายการทั้งหมด (All)</option>
                </select>
              </div>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-sm font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs font-black uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อสถานประกอบการ</th>
                      <th className="p-4">อีเมล / เบอร์โทร</th>
                      <th className="p-4">วันที่สมัคร</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A] font-medium">
                    {pubs.filter(p => {
                      const q = searchQuery.toLowerCase().trim()
                      const matchSearch = !q || 
                        p.username.toLowerCase().includes(q) || 
                        p.pubname.toLowerCase().includes(q) ||
                        (p.pubemail && p.pubemail.toLowerCase().includes(q)) ||
                        (p.pubphone && p.pubphone.includes(q)) ||
                        (p.taxnumber && p.taxnumber.includes(q))
                      
                      const pubStatus = String(p.regisstatus || '')
                      const matchStatus = 
                        statusFilter === 'All' ||
                        pubStatus === statusFilter || 
                        (statusFilter === 'รอดำเนินการ' && (pubStatus === 'pending' || pubStatus === 'รอดำเนินการ')) ||
                        (statusFilter === 'อนุมัติแล้ว' && (pubStatus === 'approved' || pubStatus === 'อนุมัติแล้ว')) ||
                        (statusFilter === 'ปฏิเสธ' && (pubStatus === 'rejected' || pubStatus === 'ปฏิเสธ'))

                      const matchDate = !dateFilter || getThaiDateString(p.regisdate) === dateFilter

                      return matchSearch && matchStatus && matchDate
                    }).sort((a, b) => {
                      const isPendingA = a.regisstatus !== 'approved' && a.regisstatus !== 'rejected' && (a as any).regisstatus !== 'อนุมัติแล้ว' && (a as any).regisstatus !== 'ปฏิเสธ'
                      const isPendingB = b.regisstatus !== 'approved' && b.regisstatus !== 'rejected' && (b as any).regisstatus !== 'อนุมัติแล้ว' && (b as any).regisstatus !== 'ปฏิเสธ'
                      if (isPendingA && !isPendingB) return -1
                      if (!isPendingA && isPendingB) return 1
                      return new Date(b.regisdate || 0).getTime() - new Date(a.regisdate || 0).getTime()
                    }).map(pub => (
                      <tr key={pub.username} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-black text-[#0F172A] text-sm">{pub.username}</td>
                        <td className="p-4 font-bold text-sm">{pub.pubname}</td>
                        <td className="p-4">
                          <div className="text-[#64748B] text-sm font-semibold">{pub.pubemail}</div>
                          <div className="text-xs font-mono text-[#94A3B8] font-bold mt-0.5">{pub.pubphone}</div>
                        </td>
                        <td className="p-4 text-sm font-semibold">{formatThaiDate(pub.regisdate)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${
                            pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = pub.regisstatus === 'approved' || pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'อนุมัติแล้ว' || (pub as any).regisstatus === 'ปฏิเสธ'
                            return (
                              <button
                                onClick={() => setSelectedPub(pub)}
                                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#475569] shadow-xs'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                                }`}
                              >
                                {isProcessed ? 'ดูข้อมูล ➔' : 'ตรวจสอบข้อมูล ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {pubs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-[#64748B] font-bold">ไม่พบข้อมูลคำขอพาร์ทเนอร์สถานบันเทิงในระบบ</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: driver-report */}
        {activeTab === 'driver-report' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black font-manrope text-[#0F172A]">รายงานความประพฤติคนขับ (Driver Reports)</h2>
              <span className="text-sm font-bold text-[#64748B]">
                {statusFilter === 'รอดำเนินการ' ? 'รอดำเนินการตรวจสอบ' : statusFilter === 'All' ? 'รายการทั้งหมด' : statusFilter}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="md:col-span-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ, รายละเอียด, รหัสรายงาน, หรือ Booking ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-[#0F172A] outline-none w-full font-semibold"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0F172A] outline-none w-full cursor-pointer"
                  title="กรองตามวันที่แจ้งรายงาน"
                />
                {dateFilter && (
                  <button type="button" onClick={() => setDateFilter('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-[#0F172A] outline-none cursor-pointer shadow-xs"
                >
                  <option value="รอดำเนินการ">🟡 รอดำเนินการ (Pending)</option>
                  <option value="อนุมัติแล้ว">🟢 อนุมัติแล้ว (Approved)</option>
                  <option value="ปฏิเสธ">🔴 ปฏิเสธ (Rejected)</option>
                  <option value="All">📋 รายการทั้งหมด (All)</option>
                </select>
              </div>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-sm font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs font-black uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A] font-medium">
                    {driverReports.filter(r => {
                      const q = searchQuery.toLowerCase().trim()
                      const matchSearch = !q || 
                        (r.reporttype && r.reporttype.toLowerCase().includes(q)) || 
                        (r.reportdetail && r.reportdetail.toLowerCase().includes(q)) ||
                        String(r.driverreportid).includes(q) ||
                        String(r.request_id || '').includes(q) ||
                        String(r.reportindex || '').includes(q)
                      
                      const rawStatus = String(r.status || r.reportstatus || '').trim()
                      const isApproved = rawStatus === 'แก้ไขแล้ว' || rawStatus === 'อนุมัติแล้ว' || rawStatus === 'approved'
                      const isRejected = rawStatus === 'ปฏิเสธ' || rawStatus === 'ไม่อนุมัติ' || rawStatus === 'rejected'
                      const isPending = !isApproved && !isRejected

                      const matchStatus = 
                        statusFilter === 'All' ||
                        (statusFilter === 'อนุมัติแล้ว' && isApproved) ||
                        (statusFilter === 'ปฏิเสธ' && isRejected) ||
                        (statusFilter === 'รอดำเนินการ' && isPending)

                      const matchDate = !dateFilter || getThaiDateString(r.reportdate) === dateFilter

                      return matchSearch && matchStatus && matchDate
                    }).sort((a, b) => {
                      const rawA = String(a.status || a.reportstatus || '').trim()
                      const isPendingA = rawA !== 'แก้ไขแล้ว' && rawA !== 'อนุมัติแล้ว' && rawA !== 'approved' && rawA !== 'ปฏิเสธ' && rawA !== 'ไม่อนุมัติ' && rawA !== 'rejected'
                      const rawB = String(b.status || b.reportstatus || '').trim()
                      const isPendingB = rawB !== 'แก้ไขแล้ว' && rawB !== 'อนุมัติแล้ว' && rawB !== 'approved' && rawB !== 'ปฏิเสธ' && rawB !== 'ไม่อนุมัติ' && rawB !== 'rejected'
                      if (isPendingA && !isPendingB) return -1
                      if (!isPendingA && isPendingB) return 1
                      return new Date(b.reportdate || 0).getTime() - new Date(a.reportdate || 0).getTime()
                    }).map(report => {
                      const rawStatus = String(report.status || report.reportstatus || '').trim()
                      const isApproved = rawStatus === 'แก้ไขแล้ว' || rawStatus === 'อนุมัติแล้ว' || rawStatus === 'approved'
                      const isRejected = rawStatus === 'ปฏิเสธ' || rawStatus === 'ไม่อนุมัติ' || rawStatus === 'rejected'
                      const displayStatus = isApproved ? 'อนุมัติแล้ว' : isRejected ? 'ปฏิเสธ' : 'รอดำเนินการ'
                      const badgeStyle = isApproved 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                        : isRejected 
                        ? 'bg-red-500/10 border-red-500/30 text-red-600' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-600'

                      return (
                        <tr key={report.driverreportid} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-4 font-mono font-black text-[#0F172A] text-sm">{report.driverreportid}</td>
                          <td className="p-4 text-sm font-semibold">{formatThaiDate(report.reportdate)}</td>
                          <td className="p-4 font-bold text-sm text-[#0F172A]">{formatReportType(report.reporttype)}</td>
                          <td className="p-4 font-mono font-bold text-sm text-[#0F172A]">BOOKING-{report.request_id || report.reportindex || '—'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${badgeStyle}`}>
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {displayStatus}
                            </span>
                          </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' || report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                            return (
                              <button
                                onClick={() => {
                                  setSelectedReport(report)
                                  setSelectedReportType('driver')
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#475569] shadow-xs'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                                }`}
                              >
                                {isProcessed ? 'ดูข้อมูล ➔' : 'ตรวจสอบ ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                    {driverReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-[#64748B] font-bold">ไม่มีรายการร้องเรียนคนขับตามเงื่อนไขที่ค้นหา</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: user-report */}
        {activeTab === 'user-report' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black font-manrope text-[#0F172A]">รายงานความประพฤติผู้ใช้บริการ (Customer Reports)</h2>
              <span className="text-sm font-bold text-[#64748B]">
                {statusFilter === 'รอดำเนินการ' ? 'รอดำเนินการตรวจสอบ' : statusFilter === 'All' ? 'รายการทั้งหมด' : statusFilter}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              <div className="md:col-span-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ, รายละเอียด, รหัสรายงาน, หรือ Booking ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-[#0F172A] outline-none w-full font-semibold"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
                <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0F172A] outline-none w-full cursor-pointer"
                  title="กรองตามวันที่แจ้งรายงาน"
                />
                {dateFilter && (
                  <button type="button" onClick={() => setDateFilter('')} className="text-sm text-gray-400 hover:text-red-500 font-bold">✕</button>
                )}
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-[#0F172A] outline-none cursor-pointer shadow-xs"
                >
                  <option value="รอดำเนินการ">🟡 รอดำเนินการ (Pending)</option>
                  <option value="อนุมัติแล้ว">🟢 อนุมัติแล้ว (Approved)</option>
                  <option value="ปฏิเสธ">🔴 ปฏิเสธ (Rejected)</option>
                  <option value="All">📋 รายการทั้งหมด (All)</option>
                </select>
              </div>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-sm font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs font-black uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A] font-medium">
                    {userReports.filter(r => {
                      const q = searchQuery.toLowerCase().trim()
                      const matchSearch = !q || 
                        (r.reporttype && r.reporttype.toLowerCase().includes(q)) || 
                        (r.reportdetail && r.reportdetail.toLowerCase().includes(q)) ||
                        String(r.userreportid).includes(q) ||
                        String(r.request_id || '').includes(q)
                      
                      const rawStatus = String(r.status || r.reportstatus || '').trim()
                      const isApproved = rawStatus === 'แก้ไขแล้ว' || rawStatus === 'อนุมัติแล้ว' || rawStatus === 'approved'
                      const isRejected = rawStatus === 'ปฏิเสธ' || rawStatus === 'ไม่อนุมัติ' || rawStatus === 'rejected'
                      const isPending = !isApproved && !isRejected

                      const matchStatus = 
                        statusFilter === 'All' ||
                        (statusFilter === 'อนุมัติแล้ว' && isApproved) ||
                        (statusFilter === 'ปฏิเสธ' && isRejected) ||
                        (statusFilter === 'รอดำเนินการ' && isPending)

                      const matchDate = !dateFilter || getThaiDateString(r.reportdate) === dateFilter

                      return matchSearch && matchStatus && matchDate
                    }).sort((a, b) => {
                      const rawA = String(a.status || a.reportstatus || '').trim()
                      const isPendingA = rawA !== 'แก้ไขแล้ว' && rawA !== 'อนุมัติแล้ว' && rawA !== 'approved' && rawA !== 'ปฏิเสธ' && rawA !== 'ไม่อนุมัติ' && rawA !== 'rejected'
                      const rawB = String(b.status || b.reportstatus || '').trim()
                      const isPendingB = rawB !== 'แก้ไขแล้ว' && rawB !== 'อนุมัติแล้ว' && rawB !== 'approved' && rawB !== 'ปฏิเสธ' && rawB !== 'ไม่อนุมัติ' && rawB !== 'rejected'
                      if (isPendingA && !isPendingB) return -1
                      if (!isPendingA && isPendingB) return 1
                      return new Date(b.reportdate || 0).getTime() - new Date(a.reportdate || 0).getTime()
                    }).map(report => {
                      const rawStatus = String(report.status || report.reportstatus || '').trim()
                      const isApproved = rawStatus === 'แก้ไขแล้ว' || rawStatus === 'อนุมัติแล้ว' || rawStatus === 'approved'
                      const isRejected = rawStatus === 'ปฏิเสธ' || rawStatus === 'ไม่อนุมัติ' || rawStatus === 'rejected'
                      const displayStatus = isApproved ? 'อนุมัติแล้ว' : isRejected ? 'ปฏิเสธ' : 'รอดำเนินการ'
                      const badgeStyle = isApproved 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                        : isRejected 
                        ? 'bg-red-500/10 border-red-500/30 text-red-600' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-600'

                      return (
                        <tr key={report.userreportid} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-4 font-mono font-black text-[#0F172A] text-sm">{report.userreportid}</td>
                          <td className="p-4 text-sm font-semibold">{formatThaiDate(report.reportdate)}</td>
                          <td className="p-4 font-bold text-sm text-[#0F172A]">{formatReportType(report.reporttype)}</td>
                          <td className="p-4 font-mono font-bold text-sm text-[#0F172A]">BOOKING-{report.request_id || '—'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${badgeStyle}`}>
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {displayStatus}
                            </span>
                          </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' || report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                            return (
                              <button
                                onClick={() => {
                                  setSelectedReport(report)
                                  setSelectedReportType('user')
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#475569] shadow-xs'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                                }`}
                              >
                                {isProcessed ? 'ดูข้อมูล ➔' : 'ตรวจสอบ ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                    {userReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-[#64748B] font-bold">ไม่มีรายการร้องเรียนผู้ใช้บริการตามเงื่อนไขที่ค้นหา</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {}
      {selectedDriver && (() => {
        let docs: Record<string, string> = {}
        if (selectedDriver.regisimagepath) {
          try {
            const parsed = JSON.parse(selectedDriver.regisimagepath)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              docs = parsed
            } else if (typeof selectedDriver.regisimagepath === 'string') {
              docs = { profile: selectedDriver.regisimagepath }
            }
          } catch {
            docs = { profile: selectedDriver.regisimagepath }
          }
        }

        const carObj = Array.isArray(selectedDriver.drivercar) ? selectedDriver.drivercar[0] : selectedDriver.drivercar
        const carBrand = carObj?.carbrand || carObj?.car_brand || '—'
        const carModel = carObj?.carmodel || carObj?.car_model || '—'
        const carColor = carObj?.carcolor || carObj?.car_color || '—'
        const carPlate = carObj?.carplate || carObj?.carplateno || carObj?.carPlateNo || carObj?.car_plate_no || carObj?.car_plate || '—'
        const carImg = carObj?.carimagepath || carObj?.carImagePath || carObj?.car_image_path

        const docItems = [
          { label: '📸 รูปโปรไฟล์ใบหน้า', url: docs.profile },
          { label: '🚗 รูปถ่ายยานพาหนะ', url: carImg },
          { label: '🪪 ใบขับขี่', url: docs.driverLicense },
          { label: '⚖️ ประวัติอาชญากรรม', url: docs.criminalRecord },
          { label: '🏥 ใบรับรองแพทย์', url: docs.medicalCertificate },
          { label: '📜 อบรม 1: ขับขี่ปลอดภัย', url: docs.trainingCert1 },
          { label: '📜 อบรม 2: ปฐมพยาบาล', url: docs.trainingCert2 },
        ].filter(item => Boolean(item.url))

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-2xl font-black font-manrope text-[var(--color-text)]">พิจารณาคนขับ: @{selectedDriver.username}</h3>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">ยื่นสมัครเมื่อ: {formatThaiDate(selectedDriver.regisdate)}</p>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl font-bold">✕</button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">ชื่อ - นามสกุล</span>
                  <span className="font-bold text-base text-[var(--color-text)]">{selectedDriver.firstname} {selectedDriver.lastname}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เบอร์โทรศัพท์</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedDriver.phoneno}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">อีเมล</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{selectedDriver.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">หมายเลขบัตรประชาชน</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedDriver.idcard || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เลขบัญชีธนาคาร</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedDriver.bankaccountno || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เพศ</span>
                  <span className="font-bold text-base text-[var(--color-text)]">{selectedDriver.gender === 2 ? 'หญิง' : 'ชาย'}</span>
                </div>
                {carObj && (
                  <div className="md:col-span-2 pt-3 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-1.5">ข้อมูลยานพาหนะ</span>
                    <div className="flex flex-wrap gap-3 font-bold text-sm text-[var(--color-text)]">
                      <span className="px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">ยี่ห้อ: {carBrand}</span>
                      <span className="px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">รุ่น: {carModel}</span>
                      <span className="px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">สี: {carColor}</span>
                      <span className="px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30 rounded-xl font-mono">ทะเบียน: {carPlate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-base font-black text-[#2563EB] mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> ภาพถ่ายเอกสารและหลักฐานการสมัครทั้งหมด ({docItems.length} รายการ)
                </h4>
                {docItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {docItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(item.url!)}
                        className="group relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl overflow-hidden cursor-pointer hover:border-[#2563EB] transition-all shadow-sm"
                      >
                        <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2.5 text-xs font-extrabold text-[var(--color-text)] truncate text-center bg-[var(--color-card)] border-t border-[var(--color-border)]">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                    ไม่มีรูปภาพเอกสารในระบบ
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                {selectedDriver.registerstatus === 'อนุมัติแล้ว' ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>คำขอสมัครนี้ได้รับการอนุมัติเรียบร้อยแล้ว</span>
                  </div>
                ) : selectedDriver.registerstatus === 'ปฏิเสธ' ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <XCircle className="w-5 h-5" />
                    <span>คำขอสมัครนี้ถูกปฏิเสธแล้ว</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#64748B] font-semibold">
                    กรุณาตรวจสอบเอกสารและข้อมูลก่อนดำเนินการ
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {selectedDriver.registerstatus !== 'อนุมัติแล้ว' && selectedDriver.registerstatus !== 'ปฏิเสธ' ? (
                    <>
                      <button onClick={() => promptDriverReject(selectedDriver.username)} className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-sm font-extrabold cursor-pointer transition-all">
                        ปฏิเสธคำขอ
                      </button>
                      <button onClick={() => promptDriverApprove(selectedDriver.username)} className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-extrabold cursor-pointer shadow-sm transition-all">
                        อนุมัติคำขอคนขับ ✓
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedDriver(null)} className="px-6 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded-xl text-sm font-extrabold cursor-pointer transition-all">
                      ปิดหน้าต่าง
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL: PUB DETAIL */}
      {selectedPub && (() => {
        let parsedPubDocs: Record<string, string> = {}
        if (selectedPub.regisimagepath) {
          try {
            const parsed = JSON.parse(selectedPub.regisimagepath)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              parsedPubDocs = parsed
            }
          } catch {}
        }

        const licenseUrl =
          parsedPubDocs.license ||
          parsedPubDocs.licenseImage ||
          parsedPubDocs.regisImagePath ||
          parsedPubDocs.regisimagepath ||
          (selectedPub as any).licenseImagePath ||
          (selectedPub as any).licenseimagepath ||
          selectedPub.regisimagepath ||
          null

        const shopUrl =
          (selectedPub as any).pubimagepath ||
          (selectedPub as any).pubImagePath ||
          (selectedPub as any).pub_image_path ||
          (selectedPub as any).shopimagepath ||
          (selectedPub as any).shopImagePath ||
          (selectedPub as any).storefrontimagepath ||
          (selectedPub as any).storefrontImagePath ||
          (selectedPub as any).storefront ||
          (selectedPub as any).shop ||
          (selectedPub as any).image ||
          parsedPubDocs.pubimagepath ||
          parsedPubDocs.pubImagePath ||
          parsedPubDocs.shop ||
          parsedPubDocs.shopImage ||
          parsedPubDocs.storefront ||
          parsedPubDocs.storefrontImage ||
          null

        const pubDocItems = [
          { label: '📄 ใบอนุญาตประกอบการ', url: licenseUrl, placeholderIcon: '📄' },
          { label: '🏪 ภาพถ่ายหน้าร้าน / บรรยากาศสถานบันเทิง', url: shopUrl, placeholderIcon: '🏪' },
        ]

        const isPubApproved = selectedPub.regisstatus === 'approved' || (selectedPub as any).regisstatus === 'อนุมัติแล้ว'
        const isPubRejected = selectedPub.regisstatus === 'rejected' || (selectedPub as any).regisstatus === 'ปฏิเสธ'

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-2xl font-black font-manrope text-[var(--color-text)]">พิจารณาสถานบันเทิง: {selectedPub.pubname}</h3>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">Username: @{selectedPub.username} | ยื่นสมัครเมื่อ: {formatThaiDate(selectedPub.regisdate)}</p>
                </div>
                <button onClick={() => setSelectedPub(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl font-bold">✕</button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">ชื่อสถานประกอบการ</span>
                  <span className="font-bold text-base text-[var(--color-text)]">{selectedPub.pubname}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เบอร์โทรศัพท์ติดต่อ</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedPub.pubphone}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">อีเมล</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{selectedPub.pubemail}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เลขประจำตัวผู้เสียภาษี</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedPub.taxnumber || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เลขบัญชีธนาคาร</span>
                  <span className="font-bold text-base text-[var(--color-text)] font-mono">{selectedPub.bankaccountno} ({selectedPub.bankaccountname})</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold block mb-0.5">เวลาเปิด - ปิด</span>
                  <span className="font-bold text-base text-[var(--color-text)]">{selectedPub.pubopen} - {selectedPub.pubclose} น.</span>
                </div>
              </div>

              {/* Documents & Storefront Images */}
              <div>
                <h4 className="text-base font-black text-[#2563EB] mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> เอกสารและภาพถ่ายประกอบการสมัครสถานบันเทิง
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pubDocItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => item.url && setPreviewImageUrl(item.url)}
                      className={`group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm transition-all ${
                        item.url ? 'cursor-pointer hover:border-[#2563EB]' : 'opacity-80'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden flex items-center justify-center">
                        {item.url ? (
                          <>
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
                            <span className="text-4xl">{item.placeholderIcon}</span>
                            <span className="text-xs font-bold text-[var(--color-text-muted)]">
                              ไม่มีไฟล์แนบในระบบ
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-xs sm:text-sm font-extrabold text-[var(--color-text)] text-center bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center justify-center gap-1.5">
                        <span>{item.label}</span>
                        {item.url ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
                            แนบแล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold">
                            รอแนบ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                {isPubApproved ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>สถานบันเทิงนี้ได้รับการอนุมัติเรียบร้อยแล้ว</span>
                  </div>
                ) : isPubRejected ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <XCircle className="w-5 h-5" />
                    <span>คำขอพาร์ทเนอร์นี้ถูกปฏิเสธแล้ว</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#64748B] font-semibold">
                    กรุณาตรวจสอบเอกสารและใบอนุญาตก่อนอนุมัติ
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!isPubApproved && !isPubRejected ? (
                    <>
                      <button onClick={() => promptPubReject(selectedPub.username)} className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-sm font-extrabold cursor-pointer transition-all">
                        ปฏิเสธคำขอสถานบันเทิง
                      </button>
                      <button onClick={() => promptPubApprove(selectedPub.username)} className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-extrabold cursor-pointer shadow-sm transition-all">
                        อนุมัติคำขอสถานบันเทิง ✓
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedPub(null)} className="px-6 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded-xl text-sm font-extrabold cursor-pointer transition-all">
                      ปิดหน้าต่าง
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL: REPORT DETAIL */}
      {selectedReport && selectedReportType && (() => {
        let reportImgs: string[] = []
        if (selectedReport.reportimages && Array.isArray(selectedReport.reportimages) && selectedReport.reportimages.length > 0) {
          reportImgs = selectedReport.reportimages
        } else if (selectedReport.reportimagepath) {
          reportImgs = String(selectedReport.reportimagepath).split(',').map(s => s.trim()).filter(Boolean)
        }

        const isReportApproved = selectedReport.status === 'แก้ไขแล้ว' || selectedReport.status === 'อนุมัติแล้ว'
        const isReportRejected = selectedReport.status === 'ปฏิเสธ' || selectedReport.status === 'ไม่อนุมัติ'

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-2xl font-black font-manrope text-[var(--color-text)]">
                    รายละเอียดคำร้องเรียน ({selectedReportType === 'driver' ? 'คนขับรถ' : 'ผู้ใช้บริการ'})
                  </h3>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">
                    ID: {selectedReportType === 'driver' ? selectedReport.driverreportid : selectedReport.userreportid} | วันที่แจ้ง: {formatThaiDate(selectedReport.reportdate)}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl font-bold">✕</button>
              </div>

              {/* Detail Box */}
              <div className="flex flex-col gap-4 text-sm bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <span className="text-[var(--color-text-muted)] block font-mono text-xs font-bold uppercase">หัวข้อรายงาน</span>
                    <span className="font-bold text-[#0F172A] text-base mt-0.5 block">
                      {formatReportType(selectedReport.reporttype)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block font-mono text-xs font-bold uppercase text-right">อ้างอิงการจอง</span>
                    <span className="font-bold text-[var(--color-text)] text-base font-mono">BOOKING-{selectedReport.request_id || selectedReport.reportindex || '—'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[var(--color-text-muted)] block font-mono text-xs font-bold uppercase mb-1.5">รายละเอียดข้อความร้องเรียน</span>
                  <p className="p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] leading-relaxed text-sm font-medium">
                    {selectedReport.reportdetail || 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
              </div>

              {/* Images */}
              <div>
                <h4 className="text-base font-black text-red-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> ภาพถ่ายหลักฐานประกอบคำร้องเรียน ({reportImgs.length} ภาพ)
                </h4>
                {reportImgs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {reportImgs.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(imgUrl)}
                        className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden cursor-pointer hover:border-red-400 transition-all shadow-sm"
                      >
                        <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`หลักฐานที่ ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2.5 text-xs font-extrabold text-[var(--color-text)] text-center bg-[var(--color-card)] border-t border-[var(--color-border)] truncate">
                          ภาพหลักฐานที่ {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                    ไม่มีรูปภาพหลักฐานแนบในรายงานนี้
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                {isReportApproved ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>รายงานนี้ได้รับการอนุมัติ / แก้ไขเรียบร้อยแล้ว</span>
                  </div>
                ) : isReportRejected ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <XCircle className="w-5 h-5" />
                    <span>รายงานนี้ถูกปฏิเสธแล้ว</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#64748B] font-semibold">
                    กรุณาตรวจสอบหลักฐานและรายละเอียดก่อนดำเนินการ
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!isReportApproved && !isReportRejected ? (
                    <>
                      <button 
                        onClick={() => promptReportReject(selectedReportType === 'user' ? (selectedReport.userreportid || 0) : (selectedReport.driverreportid || 0), selectedReportType)} 
                        className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-sm font-extrabold cursor-pointer transition-all"
                      >
                        ปฏิเสธ / ลบรายงาน
                      </button>
                      <button 
                        onClick={() => promptReportApprove(selectedReportType === 'user' ? (selectedReport.userreportid || 0) : (selectedReport.driverreportid || 0), selectedReportType)} 
                        className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-extrabold cursor-pointer shadow-sm transition-all"
                      >
                        อนุมัติรายงาน ✓
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedReport(null)} className="px-6 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] rounded-xl text-sm font-extrabold cursor-pointer transition-all">
                      ปิดหน้าต่าง
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8 animate-fadeIn" onClick={() => setPreviewImageUrl(null)}>
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              ✕ ปิดหน้าต่าง
            </button>
            <img
              src={previewImageUrl}
              alt="รูปภาพขยาย"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Modal: Confirm Action */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-10 max-w-3xl sm:max-w-4xl w-full shadow-2xl flex flex-col gap-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 text-3xl">
              ⚠️
            </div>
            
            <div className="w-full">
              <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text)] mb-3 font-manrope whitespace-nowrap">
                {confirmModal.title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-semibold sm:whitespace-nowrap px-2">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center gap-4 justify-center pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-7 py-3 rounded-full border border-[var(--color-border)] text-sm font-extrabold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                onClick={() => {
                  const action = confirmModal.onConfirm
                  setConfirmModal(prev => ({ ...prev, isOpen: false }))
                  action()
                }}
                className={`px-8 py-3 rounded-full !text-white text-sm font-extrabold shadow-lg cursor-pointer transition-all ${
                  confirmModal.confirmBg?.includes('red')
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#2340A7] hover:bg-[#1D358F]'
                }`}
                style={{
                  backgroundColor: confirmModal.confirmBg?.includes('red') ? '#dc2626' : '#2340A7',
                  color: '#ffffff',
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <AlertModal
        isOpen={showLogoutModal}
        title="คุณต้องการออกจากระบบใช่หรือไม่?"
        message="เมื่อออกจากระบบ คุณจะต้องลงชื่อเข้าใช้งานใหม่อีกครั้งเพื่อทำรายการต่อ"
        type="confirm"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

    </div>
  )
}
