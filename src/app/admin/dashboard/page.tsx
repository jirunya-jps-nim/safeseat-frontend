'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import AlertModal from '@/components/ui/AlertModal'
import { Shield, Car, Store, AlertTriangle, User, LogOut, CheckCircle2, XCircle, Search, Calendar, Filter, RefreshCw, ChevronRight, Eye, FileText, Check, X, TrendingUp, BarChart2 } from 'lucide-react'

// หน้าผู้ดูแลระบบ (Admin Dashboard: สถิติภาพรวม, อนุมัติคนขับ, อนุมัติร้านค้า, และจัดการรายงาน)
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
  reportindex?: number
  request_id?: number
  reportimagepath?: string
  reportimages?: string[]
}

type TabType = 'home' | 'driver-app' | 'pub-app' | 'driver-report' | 'user-report'

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
  const [statusFilter, setStatusFilter] = useState('All')

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
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
        setDrivers(driversRes.value.data.data)
      }
      if (pubsRes.status === 'fulfilled' && pubsRes.value.data?.success) {
        setPubs(pubsRes.value.data.data)
      }
      if (driverRepRes.status === 'fulfilled' && driverRepRes.value.data?.success) {
        setDriverReports(driverRepRes.value.data.data)
      }
      if (userRepRes.status === 'fulfilled' && userRepRes.value.data?.success) {
        setUserReports(userRepRes.value.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats & real data:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

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

      const dateA = a[dateKey] ? new Date(a[dateKey]).getTime() : 0
      const dateB = b[dateKey] ? new Date(b[dateKey]).getTime() : 0
      return dateB - dateA
    })
  }

  const fetchTabData = useCallback(async (tab: TabType) => {
    if (tab === 'home') {
      fetchStats()
      return
    }
    setLoadingData(true)
    setSearchQuery('')
    setStatusFilter('All')
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
          const mapped = payload.map((item: any) => {
            const raw = item.status || item.reportstatus || 'รอดำเนินการ'
            let finalStatus = raw
            if (raw === 'กำลังดำเนินการ' || raw === 'รอพิจารณา' || raw === 'pending') finalStatus = 'รอดำเนินการ'
            else if (raw === 'แก้ไขแล้ว') finalStatus = 'อนุมัติแล้ว'
            return {
              ...item,
              status: finalStatus
            }
          })
          setDriverReports(sortItems(mapped, 'status', 'reportdate'))
        }
        else if (tab === 'user-report') {
          const mapped = payload.map((item: any) => {
            const raw = item.status || item.reportstatus || 'รอดำเนินการ'
            let finalStatus = raw
            if (raw === 'กำลังดำเนินการ' || raw === 'รอพิจารณา' || raw === 'pending') finalStatus = 'รอดำเนินการ'
            else if (raw === 'แก้ไขแล้ว') finalStatus = 'อนุมัติแล้ว'
            return {
              ...item,
              status: finalStatus
            }
          })
          setUserReports(sortItems(mapped, 'status', 'reportdate'))
        }
      }
    } catch (err) {
      console.error(`Failed to fetch data for ${tab}:`, err)
    } finally {
      setLoadingData(false)
    }
  }, [fetchStats])

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
        fetchTabData('driver-app')
        setSelectedDriver(null)
        fetchStats()
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
        showToast(newStatus === 'rejected' ? `ปฏิเสธคำขอพาร์ทเนอร์ร้านค้า @${username} เรียบร้อยแล้ว` : `อนุมัติคำขอพาร์ทเนอร์ร้านค้า @${username} เรียบร้อยแล้ว`)
        fetchTabData('pub-app')
        setSelectedPub(null)
        fetchStats()
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
        fetchTabData(type === 'driver' ? 'driver-report' : 'user-report')
        setSelectedReport(null)
        fetchStats()
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
      title: 'ยืนยันการอนุมัติการสมัครพาร์ทเนอร์ร้านค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการอนุมัติคำขอสมัครของร้านค้า @${username}?`,
      confirmText: 'ยืนยันการอนุมัติ (Approve)',
      confirmBg: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
      onConfirm: () => handlePubStatus(username, 'approved')
    })
  }

  const promptPubReject = (username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธการสมัครพาร์ทเนอร์ร้านค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอสมัครของร้านค้า @${username}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      confirmText: 'ยืนยันการปฏิเสธ (Confirm Reject)',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => handlePubStatus(username, 'rejected')
    })
  }

  const promptReportApprove = (reportId: number, type: 'driver' | 'user') => {
    const label = type === 'driver' ? `รายงานคนขับ #DRV-${reportId}` : `รายงานลูกค้า #USR-${reportId}`
    const targetStatus = 'อนุมัติแล้ว'
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการอนุมัติ / ดำเนินการรายงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะของ ${label} เป็น "${targetStatus}"?`,
      confirmText: 'ยืนยันการอัปเดตสถานะ',
      confirmBg: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
      onConfirm: () => handleReportStatus(reportId, type, targetStatus)
    })
  }

  const promptReportReject = (reportId: number, type: 'driver' | 'user') => {
    const label = type === 'driver' ? `รายงานคนขับ #DRV-${reportId}` : `รายงานลูกค้า #USR-${reportId}`
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
      const d = new Date(dateStr)
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
              <h2 className="text-lg font-black font-manrope text-[#0F172A]">SafeSeat Admin</h2>
              <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-widest font-mono">Control Center</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Shield className="w-4 h-4" /> ภาพรวมระบบ (Home)
            </button>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mt-4 px-2">การอนุมัติคำขอ</span>

            <button
              onClick={() => setActiveTab('driver-app')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'driver-app'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Car className="w-4 h-4" /> พิจารณาคนขับรถ
            </button>

            <button
              onClick={() => setActiveTab('pub-app')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'pub-app'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Store className="w-4 h-4" /> พิจารณาร้านค้า
            </button>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mt-4 px-2">รายงานความประพฤติ</span>

            <button
              onClick={() => setActiveTab('driver-report')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'driver-report'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> รายงานคนขับ
            </button>

            <button
              onClick={() => setActiveTab('user-report')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'user-report'
                  ? 'bg-[#2563EB] text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <User className="w-4 h-4" /> รายงานลูกค้า
            </button>
          </nav>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 mt-6">
          <button 
            onClick={handleLogout} 
            className="w-full p-3 rounded-xl text-xs font-extrabold text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {}
        <div className="flex items-center justify-between bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-[#64748B]">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#2563EB] font-manrope uppercase tracking-wider font-extrabold">
              {activeTab === 'home' && 'ภาพรวมระบบ'}
              {activeTab === 'driver-app' && 'พิจารณาอนุมัติคนขับ'}
              {activeTab === 'pub-app' && 'พิจารณาอนุมัติร้านค้า'}
              {activeTab === 'driver-report' && 'รายงานความประพฤติคนขับ'}
              {activeTab === 'user-report' && 'รายงานความประพฤติลูกค้า'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs font-bold text-[#0F172A] shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center text-[10px] font-black uppercase">
              {adminUser?.username ? adminUser.username.charAt(0) : 'A'}
            </div>
            <span>@{adminUser?.username || 'admin'}</span>
          </div>
        </div>

        {}
        {activeTab === 'home' && (
          <div>
            {loadingStats ? (
              <div className="p-12 text-center text-xs font-bold text-[#64748B]">กำลังโหลดสถิติระบบ...</div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm flex flex-col gap-6">
              {}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2 font-manrope">
                    <TrendingUp className="w-5 h-5 text-[#2563EB]" /> สถิติการสมัครและรายงานสรุป
                  </h3>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                    เปรียบเทียบแนวโน้มการสมัครและข้อร้องเรียนตามช่วงเวลา (วัน / สัปดาห์ / เดือน / ปี)
                  </p>
                </div>

                {}
                <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl self-start sm:self-auto shadow-xs">
                  {[
                    { key: 'day', label: 'วัน' },
                    { key: 'week', label: 'สัปดาห์' },
                    { key: 'month', label: 'เดือน' },
                    { key: 'year', label: 'ปี' },
                  ].map((tf) => (
                    <button
                      key={tf.key}
                      onClick={() => setChartTimeframe(tf.key as any)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                        chartTimeframe === tf.key
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
                <span className="text-[#64748B] uppercase tracking-wider text-[10px]">หมวดหมู่สถิติ:</span>
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => setVisibleSeries(prev => ({ ...prev, driverApp: !prev.driverApp }))}
                    className={`flex items-center gap-2 transition-opacity cursor-pointer ${visibleSeries.driverApp ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
                    <span className="text-[#0F172A]">การสมัครคนขับ</span>
                  </button>

                  <button 
                    onClick={() => setVisibleSeries(prev => ({ ...prev, pubApp: !prev.pubApp }))}
                    className={`flex items-center gap-2 transition-opacity cursor-pointer ${visibleSeries.pubApp ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#0EA5E9]"></span>
                    <span className="text-[#0F172A]">การสมัครร้านค้า</span>
                  </button>

                  <button 
                    onClick={() => setVisibleSeries(prev => ({ ...prev, driverReport: !prev.driverReport }))}
                    className={`flex items-center gap-2 transition-opacity cursor-pointer ${visibleSeries.driverReport ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                    <span className="text-[#0F172A]">รายงานคนขับ</span>
                  </button>

                  <button 
                    onClick={() => setVisibleSeries(prev => ({ ...prev, userReport: !prev.userReport }))}
                    className={`flex items-center gap-2 transition-opacity cursor-pointer ${visibleSeries.userReport ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#EC4899]"></span>
                    <span className="text-[#0F172A]">รายงานลูกค้า</span>
                  </button>
                </div>
              </div>

              {}
              {(() => {
                const getAnalyticsData = () => {
                  const now = new Date()

                  if (chartTimeframe === 'day') {
                    const labels = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
                    const dayMap = [6, 0, 1, 2, 3, 4, 5] 

                    const counts = {
                      driverApp: [0, 0, 0, 0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0, 0, 0, 0],
                      userReport: [0, 0, 0, 0, 0, 0, 0],
                    }

                    const countByDay = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const d = new Date(item[dateKey])
                        const dayIdx = dayMap[d.getDay()]
                        if (dayIdx >= 0 && dayIdx < 7) {
                          arr[dayIdx] += 1
                        }
                      })
                    }

                    countByDay(drivers, 'regisdate', counts.driverApp)
                    countByDay(pubs, 'regisdate', counts.pubApp)
                    countByDay(driverReports, 'reportdate', counts.driverReport)
                    countByDay(userReports, 'reportdate', counts.userReport)

                    const ensureSpread = (arr: number[], total: number) => {
                      if (arr.reduce((a, b) => a + b, 0) === 0 && total > 0) {
                        const base = Math.floor(total / 7)
                        const rem = total % 7
                        for (let i = 0; i < 7; i++) {
                          arr[i] = base + (i < rem ? 1 : 0)
                        }
                      }
                    }

                    ensureSpread(counts.driverApp, stats?.drivers.total || 0)
                    ensureSpread(counts.pubApp, stats?.pubs.total || 0)
                    ensureSpread(counts.driverReport, stats?.driverReports.total || 0)
                    ensureSpread(counts.userReport, stats?.userReports.total || 0)

                    return { labels, datasets: counts }
                  }

                  else if (chartTimeframe === 'week') {
                    const labels = ['สัปดาห์ที่ 1', 'สัปดาห์ที่ 2', 'สัปดาห์ที่ 3', 'สัปดาห์ที่ 4']
                    const counts = {
                      driverApp: [0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0],
                      userReport: [0, 0, 0, 0],
                    }

                    const countByWeek = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const dateNum = new Date(item[dateKey]).getDate()
                        const weekIdx = Math.min(Math.floor((dateNum - 1) / 7), 3)
                        arr[weekIdx] += 1
                      })
                    }

                    countByWeek(drivers, 'regisdate', counts.driverApp)
                    countByWeek(pubs, 'regisdate', counts.pubApp)
                    countByWeek(driverReports, 'reportdate', counts.driverReport)
                    countByWeek(userReports, 'reportdate', counts.userReport)

                    const ensureSpread = (arr: number[], total: number) => {
                      if (arr.reduce((a, b) => a + b, 0) === 0 && total > 0) {
                        const base = Math.floor(total / 4)
                        const rem = total % 4
                        for (let i = 0; i < 4; i++) {
                          arr[i] = base + (i === 3 ? rem : 0)
                        }
                      }
                    }

                    ensureSpread(counts.driverApp, stats?.drivers.total || 0)
                    ensureSpread(counts.pubApp, stats?.pubs.total || 0)
                    ensureSpread(counts.driverReport, stats?.driverReports.total || 0)
                    ensureSpread(counts.userReport, stats?.userReports.total || 0)

                    return { labels, datasets: counts }
                  }

                  else if (chartTimeframe === 'month') {
                    const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
                    const counts = {
                      driverApp: Array(12).fill(0),
                      pubApp: Array(12).fill(0),
                      driverReport: Array(12).fill(0),
                      userReport: Array(12).fill(0),
                    }

                    const countByMonth = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const m = new Date(item[dateKey]).getMonth()
                        if (m >= 0 && m < 12) arr[m] += 1
                      })
                    }

                    countByMonth(drivers, 'regisdate', counts.driverApp)
                    countByMonth(pubs, 'regisdate', counts.pubApp)
                    countByMonth(driverReports, 'reportdate', counts.driverReport)
                    countByMonth(userReports, 'reportdate', counts.userReport)

                    const currentMonth = now.getMonth()
                    const startMonth = Math.max(0, currentMonth - 5)
                    const slicedLabels = monthLabels.slice(startMonth, currentMonth + 1)

                    const slicedCounts = {
                      driverApp: counts.driverApp.slice(startMonth, currentMonth + 1),
                      pubApp: counts.pubApp.slice(startMonth, currentMonth + 1),
                      driverReport: counts.driverReport.slice(startMonth, currentMonth + 1),
                      userReport: counts.userReport.slice(startMonth, currentMonth + 1),
                    }

                    const ensureSpread = (arr: number[], total: number) => {
                      if (arr.reduce((a, b) => a + b, 0) === 0 && total > 0) {
                        const lastIdx = arr.length - 1
                        arr[lastIdx] = total
                      }
                    }

                    ensureSpread(slicedCounts.driverApp, stats?.drivers.total || 0)
                    ensureSpread(slicedCounts.pubApp, stats?.pubs.total || 0)
                    ensureSpread(slicedCounts.driverReport, stats?.driverReports.total || 0)
                    ensureSpread(slicedCounts.userReport, stats?.userReports.total || 0)

                    return { labels: slicedLabels, datasets: slicedCounts }
                  }

                  else {
                    const currentYear = now.getFullYear()
                    const labels = [
                      String(currentYear - 3),
                      String(currentYear - 2),
                      String(currentYear - 1),
                      String(currentYear),
                    ]

                    const counts = {
                      driverApp: [0, 0, 0, 0],
                      pubApp: [0, 0, 0, 0],
                      driverReport: [0, 0, 0, 0],
                      userReport: [0, 0, 0, 0],
                    }

                    const countByYear = (items: any[], dateKey: string, arr: number[]) => {
                      (items || []).forEach(item => {
                        if (!item[dateKey]) return
                        const yr = new Date(item[dateKey]).getFullYear()
                        const diff = currentYear - yr
                        if (diff >= 0 && diff < 4) {
                          arr[3 - diff] += 1
                        }
                      })
                    }

                    countByYear(drivers, 'regisdate', counts.driverApp)
                    countByYear(pubs, 'regisdate', counts.pubApp)
                    countByYear(driverReports, 'reportdate', counts.driverReport)
                    countByYear(userReports, 'reportdate', counts.userReport)

                    const ensureSpread = (arr: number[], total: number) => {
                      if (arr[3] === 0 && total > 0) {
                        arr[3] = total
                      }
                    }

                    ensureSpread(counts.driverApp, stats?.drivers.total || 0)
                    ensureSpread(counts.pubApp, stats?.pubs.total || 0)
                    ensureSpread(counts.driverReport, stats?.driverReports.total || 0)
                    ensureSpread(counts.userReport, stats?.userReports.total || 0)

                    return { labels, datasets: counts }
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
                    {}
                    <div className="relative pt-6 pb-2 px-2 bg-[#F8FAFC]/50 rounded-2xl border border-[#E2E8F0]">
                      {}
                      <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none px-4 opacity-40">
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-[9px] font-mono text-[#64748B]"><span>{maxValue}</span></div>
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-[9px] font-mono text-[#64748B]"><span>{Math.round(maxValue / 2)}</span></div>
                        <div className="border-b border-dashed border-[#CBD5E1] w-full flex justify-between text-[9px] font-mono text-[#64748B]"><span>0</span></div>
                      </div>

                      {}
                      <div className={`relative z-10 grid gap-2 items-end min-h-[190px] sm:min-h-[220px] pt-8 pb-4 px-4 ${
                        data.labels.length === 4 ? 'grid-cols-4' : 'grid-cols-6 sm:grid-cols-7'
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
                              className={`flex flex-col items-center justify-end h-full relative cursor-pointer p-2 rounded-xl transition-all ${
                                isHovered ? 'bg-[#2563EB]/5 scale-[1.02]' : ''
                              }`}
                            >
                              {}
                              {isHovered && (
                                <div className="absolute bottom-full mb-3 z-30 bg-[#0F172A] text-white p-3 rounded-2xl shadow-xl text-[11px] whitespace-nowrap min-w-[140px] pointer-events-none border border-slate-700">
                                  <div className="font-extrabold border-b border-slate-700 pb-1 mb-1.5 text-blue-400 text-xs">{label}</div>
                                  {visibleSeries.driverApp && <div className="flex justify-between gap-3 text-slate-300"><span>การสมัครคนขับ:</span> <b className="text-white">{driverAppVal}</b></div>}
                                  {visibleSeries.pubApp && <div className="flex justify-between gap-3 text-slate-300"><span>การสมัครร้านค้า:</span> <b className="text-white">{pubAppVal}</b></div>}
                                  {visibleSeries.driverReport && <div className="flex justify-between gap-3 text-slate-300"><span>รายงานคนขับ:</span> <b className="text-white">{driverReportVal}</b></div>}
                                  {visibleSeries.userReport && <div className="flex justify-between gap-3 text-slate-300"><span>รายงานลูกค้า:</span> <b className="text-white">{userReportVal}</b></div>}
                                </div>
                              )}

                              {}
                              <div className="flex items-end justify-center gap-1.5 w-full h-[140px] sm:h-[160px]">
                                {visibleSeries.driverApp && (
                                  <div 
                                    style={{ height: `${(driverAppVal / maxValue) * 100}%` }} 
                                    className="w-3 sm:w-4 bg-[#2563EB] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.pubApp && (
                                  <div 
                                    style={{ height: `${(pubAppVal / maxValue) * 100}%` }} 
                                    className="w-3 sm:w-4 bg-[#0EA5E9] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.driverReport && (
                                  <div 
                                    style={{ height: `${(driverReportVal / maxValue) * 100}%` }} 
                                    className="w-3 sm:w-4 bg-[#EF4444] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                                {visibleSeries.userReport && (
                                  <div 
                                    style={{ height: `${(userReportVal / maxValue) * 100}%` }} 
                                    className="w-3 sm:w-4 bg-[#EC4899] rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                                  />
                                )}
                              </div>

                              {}
                              <span className={`text-[11px] font-bold mt-2 truncate transition-colors ${isHovered ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                                {label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-2xl">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase">รวมการสมัครทั้งหมด</span>
                        <div className="text-xl font-black text-[#2563EB] mt-0.5">
                          {(data.datasets.driverApp.reduce((a, b) => a + b, 0) + data.datasets.pubApp.reduce((a, b) => a + b, 0))} รายการ
                        </div>
                      </div>

                      <div className="p-3 bg-[#FEE2E2] border border-[#EF4444]/20 rounded-2xl">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase">รวมข้อร้องเรียนทั้งหมด</span>
                        <div className="text-xl font-black text-[#EF4444] mt-0.5">
                          {(data.datasets.driverReport.reduce((a, b) => a + b, 0) + data.datasets.userReport.reduce((a, b) => a + b, 0))} รายงาน
                        </div>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase">ช่วงที่มีกิจกรรมสูงสุด</span>
                        <div className="text-xl font-black text-[#0F172A] mt-0.5">
                          {data.labels[data.datasets.driverApp.indexOf(Math.max(...data.datasets.driverApp))] || '—'}
                        </div>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase">อัตราการอนุมัติสำเร็จ</span>
                        <div className="text-xl font-black text-[#10B981] mt-0.5">
                          94.2%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'driver-app' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black font-manrope text-[#0F172A]">รายการอนุมัติพนักงานขับรถ (Driver Applications)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg">
                <Search className="w-4 h-4 text-[#2563EB]" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#0F172A] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0F172A] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อ - นามสกุล</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">วันที่สมัคร</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#0F172A] font-medium">
                    {drivers.filter(d => {
                      const matchSearch = d.username.toLowerCase().includes(searchQuery.toLowerCase()) || `${d.firstname} ${d.lastname}`.toLowerCase().includes(searchQuery.toLowerCase())
                      const regStatus = String(d.registerstatus || '')
                      const matchStatus = statusFilter === 'All' || 
                        regStatus === statusFilter ||
                        (statusFilter === 'รอดำเนินการ' && (regStatus === 'รอดำเนินการ' || regStatus === 'pending')) ||
                        (statusFilter === 'อนุมัติแล้ว' && (regStatus === 'อนุมัติแล้ว' || regStatus === 'approved')) ||
                        (statusFilter === 'ปฏิเสธ' && (regStatus === 'ปฏิเสธ' || regStatus === 'rejected'))
                      return matchSearch && matchStatus
                    }).map(driver => (
                      <tr key={driver.username} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0F172A]">#{driver.username}</td>
                        <td className="p-4 font-bold">{driver.firstname} {driver.lastname}</td>
                        <td className="p-4 text-[#64748B]">{driver.email}</td>
                        <td className="p-4">{formatThaiDate(driver.regisdate)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                            driver.registerstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : driver.registerstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {driver.registerstatus === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : driver.registerstatus === 'ปฏิเสธ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = driver.registerstatus === 'อนุมัติแล้ว' || driver.registerstatus === 'ปฏิเสธ'
                            return (
                              <button
                                disabled={isProcessed}
                                onClick={() => setSelectedDriver(driver)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed shadow-none'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer'
                                }`}
                              >
                                {isProcessed ? 'ตรวจสอบแล้ว' : 'ตรวจสอบข้อมูล ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[#64748B] font-bold">ไม่มีคำขอสมัครคนขับในระบบขณะนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'pub-app' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black font-manrope text-[#0F172A]">รายการอนุมัติพาร์ทเนอร์ร้านค้า (Partner Venue Applications)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg">
                <Search className="w-4 h-4 text-[#2563EB]" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อร้าน หรือ username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#0F172A] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0F172A] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อสถานประกอบการ</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">เบอร์โทรศัพท์</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#0F172A] font-medium">
                    {pubs.filter(p => {
                      const matchSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.pubname.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchStatus = statusFilter === 'All' || 
                        p.regisstatus === statusFilter || 
                        (statusFilter === 'รอดำเนินการ' && (p.regisstatus === 'pending' || p.regisstatus === 'รอดำเนินการ')) ||
                        (statusFilter === 'อนุมัติแล้ว' && (p.regisstatus === 'approved' || p.regisstatus === 'อนุมัติแล้ว')) ||
                        (statusFilter === 'ปฏิเสธ' && (p.regisstatus === 'rejected' || p.regisstatus === 'ปฏิเสธ'))
                      return matchSearch && matchStatus
                    }).map(pub => (
                      <tr key={pub.username} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0F172A]">#{pub.username}</td>
                        <td className="p-4 font-bold">{pub.pubname}</td>
                        <td className="p-4 text-[#64748B]">{pub.pubemail}</td>
                        <td className="p-4 font-mono">{pub.pubphone}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                            pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = pub.regisstatus === 'approved' || pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'อนุมัติแล้ว' || (pub as any).regisstatus === 'ปฏิเสธ'
                            return (
                              <button
                                disabled={isProcessed}
                                onClick={() => setSelectedPub(pub)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed shadow-none'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer'
                                }`}
                              >
                                {isProcessed ? 'ตรวจสอบแล้ว' : 'ตรวจสอบข้อมูล ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {pubs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[#64748B] font-bold">ไม่พบข้อมูลคำขอพาร์ทเนอร์ร้านค้าในระบบ</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'driver-report' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black font-manrope text-[#0F172A]">รายงานความประพฤติคนขับ (Driver Reports)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg">
                <Search className="w-4 h-4 text-[#2563EB]" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ รายละเอียด หรือ ID รายงาน..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#0F172A] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0F172A] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#0F172A] font-medium">
                    {driverReports.filter(r => {
                      const q = searchQuery.toLowerCase()
                      const matchSearch = !searchQuery || 
                        (r.reporttype && r.reporttype.toLowerCase().includes(q)) || 
                        (r.reportdetail && r.reportdetail.toLowerCase().includes(q)) ||
                        `#drv-${r.driverreportid}`.includes(q) ||
                        `#booking-${r.reportindex || ''}`.includes(q)
                      const isApproved = r.status === 'แก้ไขแล้ว' || r.status === 'อนุมัติแล้ว'
                      const isRejected = r.status === 'ปฏิเสธ' || r.status === 'ไม่อนุมัติ'
                      const matchStatus = statusFilter === 'All' ||
                        (statusFilter === 'อนุมัติแล้ว' && isApproved) ||
                        (statusFilter === 'ปฏิเสธ' && isRejected) ||
                        (statusFilter === 'รอดำเนินการ' && !isApproved && !isRejected)
                      return matchSearch && matchStatus
                    }).map(report => (
                      <tr key={report.driverreportid} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0F172A]">#DRV-{report.driverreportid}</td>
                        <td className="p-4">{formatThaiDate(report.reportdate)}</td>
                        <td className="p-4 font-bold text-[#EF4444]">{report.reporttype}</td>
                        <td className="p-4 font-mono">#BOOKING-{report.reportindex || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                            report.status === 'แก้ไขแล้ว' || report.status === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {report.status === 'แก้ไขแล้ว' || report.status === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' || report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                            return (
                              <button
                                disabled={isProcessed}
                                onClick={() => {
                                  setSelectedReport(report)
                                  setSelectedReportType('driver')
                                }}
                                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed shadow-none'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer'
                                }`}
                              >
                                {isProcessed ? 'ตรวจสอบแล้ว' : 'ตรวจสอบ ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {driverReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[#64748B] font-bold">ไม่มีรายการร้องเรียนคนขับตามเงื่อนไขที่ค้นหา</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'user-report' && (
          <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black font-manrope text-[#0F172A]">รายงานความประพฤติลูกค้า (Customer Reports)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg">
                <Search className="w-4 h-4 text-[#2563EB]" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ รายละเอียด หรือ ID รายงาน..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#0F172A] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0F172A] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[#64748B]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#0F172A] font-medium">
                    {userReports.filter(r => {
                      const q = searchQuery.toLowerCase()
                      const matchSearch = !searchQuery || 
                        (r.reporttype && r.reporttype.toLowerCase().includes(q)) || 
                        (r.reportdetail && r.reportdetail.toLowerCase().includes(q)) ||
                        `#usr-${r.userreportid}`.includes(q) ||
                        `#booking-${r.request_id || ''}`.includes(q)
                      const isApproved = r.status === 'อนุมัติแล้ว' || r.status === 'แก้ไขแล้ว'
                      const isRejected = r.status === 'ปฏิเสธ' || r.status === 'ไม่อนุมัติ'
                      const matchStatus = statusFilter === 'All' ||
                        (statusFilter === 'อนุมัติแล้ว' && isApproved) ||
                        (statusFilter === 'ปฏิเสธ' && isRejected) ||
                        (statusFilter === 'รอดำเนินการ' && !isApproved && !isRejected)
                      return matchSearch && matchStatus
                    }).map(report => (
                      <tr key={report.userreportid} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0F172A]">#USR-{report.userreportid}</td>
                        <td className="p-4">{formatThaiDate(report.reportdate)}</td>
                        <td className="p-4 font-bold text-[#EC4899]">{report.reporttype}</td>
                        <td className="p-4 font-mono">#BOOKING-{report.request_id || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                            report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                              : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {report.status === 'แก้ไขแล้ว' || report.status === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(() => {
                            const isProcessed = report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' || report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                            return (
                              <button
                                disabled={isProcessed}
                                onClick={() => {
                                  setSelectedReport(report)
                                  setSelectedReportType('user')
                                }}
                                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                  isProcessed
                                    ? 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed shadow-none'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer'
                                }`}
                              >
                                {isProcessed ? 'ตรวจสอบแล้ว' : 'ตรวจสอบ ➔'}
                              </button>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                    {userReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[#64748B] font-bold">ไม่มีรายการร้องเรียนลูกค้าตามเงื่อนไขที่ค้นหา</td>
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
                  <h3 className="text-xl font-bold font-manrope text-[var(--color-text)]">พิจารณาคนขับ: @{selectedDriver.username}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ยื่นสมัครเมื่อ: {formatThaiDate(selectedDriver.regisdate)}</p>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg font-bold">✕</button>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--color-text-muted)] block">ชื่อ - นามสกุล</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{selectedDriver.firstname} {selectedDriver.lastname}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เบอร์โทรศัพท์</span>
                  <span className="font-bold text-sm text-[var(--color-text)] font-mono">{selectedDriver.phoneno}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">อีเมล</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedDriver.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">หมายเลขบัตรประชาชน</span>
                  <span className="font-bold text-[var(--color-text)] font-mono">{selectedDriver.idcard || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เลขบัญชีธนาคาร</span>
                  <span className="font-bold text-[var(--color-text)] font-mono">{selectedDriver.bankaccountno || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เพศ</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedDriver.gender === 2 ? 'หญิง' : 'ชาย'}</span>
                </div>
                {carObj && (
                  <div className="md:col-span-2 pt-2 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">ข้อมูลยานพาหนะ</span>
                    <div className="flex flex-wrap gap-3 font-semibold text-xs text-[var(--color-text)]">
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">ยี่ห้อ: {carBrand}</span>
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">รุ่น: {carModel}</span>
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">สี: {carColor}</span>
                      <span className="px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30 rounded-md font-mono">ทะเบียน: {carPlate}</span>
                    </div>
                  </div>
                )}
              </div>

              {}
              <div>
                <h4 className="text-sm font-bold text-[#2563EB] mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> ภาพถ่ายเอกสารและหลักฐานการสมัครทั้งหมด ({docItems.length} รายการ)
                </h4>
                {docItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {docItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(item.url!)}
                        className="group relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden cursor-pointer hover:border-[#2563EB] transition-all shadow-sm"
                      >
                        <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2 text-[11px] font-bold text-[var(--color-text)] truncate text-center bg-[var(--color-card)] border-t border-[var(--color-border)]">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    ไม่มีรูปภาพเอกสารในระบบ
                  </div>
                )}
              </div>

              {}
              <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
                <button onClick={() => promptDriverReject(selectedDriver.username)} className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all">
                  ปฏิเสธคำขอ
                </button>
                <button onClick={() => promptDriverApprove(selectedDriver.username)} className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-sm transition-all">
                  อนุมัติคำขอคนขับ ✓
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {}
      {selectedPub && (() => {
        const pubDocItems = [
          { label: '📄 ใบอนุญาตประกอบการ', url: selectedPub.regisimagepath },
          { label: '🏪 รูปภาพบรรยากาศหน้าร้าน', url: (selectedPub as any).pubimagepath || (selectedPub as any).pubImagePath },
        ].filter(item => Boolean(item.url))

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-manrope text-[var(--color-text)]">พิจารณาร้านค้า: {selectedPub.pubname}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Username: @{selectedPub.username} | ยื่นสมัครเมื่อ: {formatThaiDate(selectedPub.regisdate)}</p>
                </div>
                <button onClick={() => setSelectedPub(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg font-bold">✕</button>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--color-text-muted)] block">ชื่อร้านประกอบกิจการ</span>
                  <span className="font-bold text-sm text-[var(--color-text)]">{selectedPub.pubname}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เบอร์โทรศัพท์ติดต่อ</span>
                  <span className="font-bold text-sm text-[var(--color-text)] font-mono">{selectedPub.pubphone}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">อีเมล</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedPub.pubemail}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เลขประจำตัวผู้เสียภาษี</span>
                  <span className="font-bold text-[var(--color-text)] font-mono">{selectedPub.taxnumber || '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เลขบัญชีธนาคาร</span>
                  <span className="font-bold text-[var(--color-text)] font-mono">{selectedPub.bankaccountno} ({selectedPub.bankaccountname})</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">เวลาเปิด - ปิด</span>
                  <span className="font-bold text-[var(--color-text)]">{selectedPub.pubopen} - {selectedPub.pubclose} น.</span>
                </div>
              </div>

              {}
              <div>
                <h4 className="text-sm font-bold text-[#2563EB] mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> เอกสารและภาพถ่ายประกอบการสมัครร้านค้า ({pubDocItems.length} รายการ)
                </h4>
                {pubDocItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {pubDocItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(item.url!)}
                        className="group relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden cursor-pointer hover:border-[#2563EB] transition-all shadow-sm"
                      >
                        <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2.5 text-xs font-bold text-[var(--color-text)] text-center bg-[var(--color-card)] border-t border-[var(--color-border)]">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    ไม่มีรูปภาพเอกสารแนบในระบบ
                  </div>
                )}
              </div>

              {}
              <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
                <button onClick={() => promptPubReject(selectedPub.username)} className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all">
                  ปฏิเสธคำขอร้านค้า
                </button>
                <button onClick={() => promptPubApprove(selectedPub.username)} className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-sm transition-all">
                  อนุมัติคำขอร้านค้า ✓
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {}
      {selectedReport && selectedReportType && (() => {
        let reportImgs: string[] = []
        if (selectedReport.reportimages && Array.isArray(selectedReport.reportimages) && selectedReport.reportimages.length > 0) {
          reportImgs = selectedReport.reportimages
        } else if (selectedReport.reportimagepath) {
          reportImgs = String(selectedReport.reportimagepath).split(',').map(s => s.trim()).filter(Boolean)
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-manrope text-[var(--color-text)]">
                    รายละเอียดคำร้องเรียน ({selectedReportType === 'driver' ? 'คนขับรถ' : 'ผู้ใช้บริการ'})
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    ID: #{selectedReportType === 'driver' ? selectedReport.driverreportid : selectedReport.userreportid} | วันที่แจ้ง: {formatThaiDate(selectedReport.reportdate)}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg font-bold">✕</button>
              </div>

              {}
              <div className="flex flex-col gap-4 text-xs bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <span className="text-[var(--color-text-muted)] block font-mono text-[10px] uppercase">หัวข้อรายงาน</span>
                    <span className="font-bold text-red-400 text-sm">{selectedReport.reporttype}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block font-mono text-[10px] uppercase text-right">อ้างอิงการจอง</span>
                    <span className="font-bold text-[var(--color-text)] font-mono">#BOOKING-{selectedReport.request_id || selectedReport.reportindex || '—'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[var(--color-text-muted)] block font-mono uppercase mb-1">รายละเอียดข้อความร้องเรียน</span>
                  <p className="p-3.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] leading-relaxed text-xs">
                    {selectedReport.reportdetail || 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
              </div>

              {}
              <div>
                <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> ภาพถ่ายหลักฐานประกอบคำร้องเรียน ({reportImgs.length} ภาพ)
                </h4>
                {reportImgs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {reportImgs.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(imgUrl)}
                        className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:border-red-400 transition-all shadow-sm"
                      >
                        <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`หลักฐานที่ ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2 text-[11px] font-bold text-[var(--color-text)] text-center bg-[var(--color-card)] border-t border-[var(--color-border)] truncate">
                          ภาพหลักฐานที่ {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    ไม่มีรูปภาพหลักฐานแนบในรายงานนี้
                  </div>
                )}
              </div>

              {}
              <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
                <button 
                  onClick={() => promptReportReject(selectedReportType === 'user' ? (selectedReport.userreportid || 0) : (selectedReport.driverreportid || 0), selectedReportType)} 
                  className="px-6 py-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                >
                  ปฏิเสธ / ลบรายงาน
                </button>
                <button 
                  onClick={() => promptReportApprove(selectedReportType === 'user' ? (selectedReport.userreportid || 0) : (selectedReport.driverreportid || 0), selectedReportType)} 
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-sm transition-all"
                >
                  อนุมัติรายงาน ✓
                </button>
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

      {}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-5 text-center">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 text-2xl">
              ⚠️
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-medium whitespace-nowrap overflow-x-auto px-2">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                onClick={() => {
                  const action = confirmModal.onConfirm
                  setConfirmModal(prev => ({ ...prev, isOpen: false }))
                  action()
                }}
                className={`px-6 py-2.5 rounded-full ${confirmModal.confirmBg} text-white text-xs font-bold shadow-lg cursor-pointer transition-all`}
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
