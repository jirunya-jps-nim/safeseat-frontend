'use client'

// ═══════════════════════════════════════════════════════════════
// app/admin/dashboard/page.tsx — SafeSeat Admin Dashboard (Royal Cyber)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import AlertModal from '@/components/ui/AlertModal'
import { Shield, Car, Store, AlertTriangle, User, LogOut, CheckCircle2, XCircle, Search, Calendar, Filter, RefreshCw, ChevronRight, Eye, FileText, Check, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
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

  // ── States ──────────────────────────────────────────────────
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Data lists
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [pubs, setPubs] = useState<PubData[]>([])
  const [driverReports, setDriverReports] = useState<ReportData[]>([])
  const [userReports, setUserReports] = useState<ReportData[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // ── Toast State ──────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Modals for Detail Viewing
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null)
  const [selectedPub, setSelectedPub] = useState<PubData | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [selectedReportType, setSelectedReportType] = useState<'driver' | 'user' | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

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

  // ── Auth Check ──────────────────────────────────────────────
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

  // ── Data Fetching ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await api.get('/admin/stats')
      if (res.data && res.data.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const sortItems = <T extends Record<string, any>>(items: T[], statusKey: string, dateKey: string): T[] => {
    return [...items].sort((a, b) => {
      const aStatus = String(a[statusKey] || '').toLowerCase()
      const bStatus = String(b[statusKey] || '').toLowerCase()
      const aPending = aStatus === 'รอดำเนินการ' || aStatus === 'pending' || aStatus === 'กำลังดำเนินการ'
      const bPending = bStatus === 'รอดำเนินการ' || bStatus === 'pending' || bStatus === 'กำลังดำเนินการ'
      
      if (aPending && !bPending) return -1
      if (!aPending && bPending) return 1

      const dateA = a[dateKey] ? new Date(a[dateKey]).getTime() : 0
      const dateB = b[dateKey] ? new Date(b[dateKey]).getTime() : 0
      return dateA - dateB
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
          // Filter out rejected drivers
          const validDrivers = payload.filter((d: DriverData) => d.registerstatus !== 'ปฏิเสธ' && (d as any).registerstatus !== 'rejected')
          setDrivers(sortItems(validDrivers, 'registerstatus', 'regisdate'))
        }
        else if (tab === 'pub-app') {
          // Filter out rejected pubs
          const validPubs = payload.filter((p: PubData) => p.regisstatus !== 'rejected' && (p as any).regisstatus !== 'ปฏิเสธ')
          setPubs(sortItems(validPubs, 'regisstatus', 'regisdate'))
        }
        else if (tab === 'driver-report') {
          const mapped = payload.map((item: any) => ({
            ...item,
            status: item.status || item.reportstatus || 'รอดำเนินการ'
          }))
          // Filter out rejected driver reports
          const validDriverReports = mapped.filter((r: ReportData) => r.status !== 'ปฏิเสธ' && r.status !== 'ไม่อนุมัติ')
          setDriverReports(sortItems(validDriverReports, 'status', 'reportdate'))
        }
        else if (tab === 'user-report') {
          const mapped = payload.map((item: any) => ({
            ...item,
            status: item.status || item.reportstatus || 'รอดำเนินการ'
          }))
          // Filter out rejected user reports
          const validUserReports = mapped.filter((r: ReportData) => r.status !== 'ปฏิเสธ' && r.status !== 'ไม่อนุมัติ')
          setUserReports(sortItems(validUserReports, 'status', 'reportdate'))
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

  // ── Handle Approvals & Status Updates ───────────────────────
  const handleDriverStatus = async (username: string, newStatus: 'อนุมัติแล้ว' | 'ปฏิเสธ') => {
    setActionLoading(true)
    try {
      const res = await api.put(`/admin/drivers/${username}/status`, { status: newStatus })
      if (res.data && res.data.success) {
        if (newStatus === 'ปฏิเสธ') {
          showToast(`ปฏิเสธและลบคำขอสมัครคนขับของ @${username} ออกจากระบบเรียบร้อยแล้ว`)
          setDrivers(prev => prev.filter(d => d.username !== username))
        } else {
          showToast(`อนุมัติคำขอสมัครคนขับ @${username} เรียบร้อยแล้ว`)
          fetchTabData('driver-app')
        }
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
        if (newStatus === 'rejected') {
          showToast(`ปฏิเสธและลบคำขอสมัครพาร์ทเนอร์ร้านค้า @${username} ออกจากระบบเรียบร้อยแล้ว`)
          setPubs(prev => prev.filter(p => p.username !== username))
        } else {
          showToast(`อนุมัติคำขอพาร์ทเนอร์ร้านค้า @${username} เรียบร้อยแล้ว`)
          fetchTabData('pub-app')
        }
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
        if (newStatus === 'ปฏิเสธ' || newStatus === 'ไม่อนุมัติ') {
          showToast('ปฏิเสธและลบรายการรายงานออกจากระบบเรียบร้อยแล้ว')
          if (type === 'driver') setDriverReports(prev => prev.filter(r => r.driverreportid !== reportId))
          else setUserReports(prev => prev.filter(r => r.userreportid !== reportId))
        } else {
          showToast('อัปเดตสถานะรายงานสำเร็จ')
          fetchTabData(type === 'driver' ? 'driver-report' : 'user-report')
        }
        setSelectedReport(null)
        fetchStats()
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะรายงานได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }
  const [confirmRejectModal, setConfirmRejectModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const promptDriverReject = (username: string) => {
    setConfirmRejectModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธการสมัครคนขับ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอสมัครของคนขับ @${username}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      onConfirm: () => handleDriverStatus(username, 'ปฏิเสธ')
    })
  }

  const promptPubReject = (username: string) => {
    setConfirmRejectModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธการสมัครพาร์ทเนอร์ร้านค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอสมัครของร้านค้า @${username}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
      onConfirm: () => handlePubStatus(username, 'rejected')
    })
  }

  const promptReportReject = (reportId: number, type: 'driver' | 'user') => {
    const label = type === 'driver' ? `รายงานคนขับ #DRV-${reportId}` : `รายงานลูกค้า #USR-${reportId}`
    setConfirmRejectModal({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธรายการรายงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธ ${label}? (สถานะจะถูกเปลี่ยนเป็น "ปฏิเสธ")`,
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

      {/* ── 1. Left Sidebar ── */}
      <aside className="w-full md:w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] p-6 flex flex-col justify-between shrink-0 shadow-xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-manrope text-[var(--color-text)]">SafeSeat Admin</h2>
              <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest font-mono">Control Center</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <Shield className="w-4 h-4" /> ภาพรวมระบบ (Home)
            </button>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-4 px-2">การอนุมัติคำขอ</span>

            <button
              onClick={() => setActiveTab('driver-app')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'driver-app'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4" /> พิจารณาคนขับรถ
              </div>
              {stats && stats.drivers.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500 text-white font-bold">{stats.drivers.pending}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pub-app')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'pub-app'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4" /> พิจารณาร้านค้า
              </div>
              {stats && stats.pubs.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500 text-white font-bold">{stats.pubs.pending}</span>
              )}
            </button>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-4 px-2">รายงานความประพฤติ</span>

            <button
              onClick={() => setActiveTab('driver-report')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'driver-report'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" /> รายงานคนขับ
              </div>
              {stats && stats.driverReports.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">{stats.driverReports.pending}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('user-report')}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'user-report'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" /> รายงานลูกค้า
              </div>
              {stats && stats.userReports.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500 text-white font-bold">{stats.userReports.pending}</span>
              )}
            </button>
          </nav>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 mt-6">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>@{adminUser?.username}</span>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── 2. Main Content Area ── */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-[var(--color-text-muted)]">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-[#7C3AED] font-manrope uppercase tracking-wider">
              {activeTab === 'home' && 'ภาพรวมระบบ'}
              {activeTab === 'driver-app' && 'พิจารณาอนุมัติคนขับ'}
              {activeTab === 'pub-app' && 'พิจารณาอนุมัติร้านค้า'}
              {activeTab === 'driver-report' && 'รายงานความประพฤติคนขับ'}
              {activeTab === 'user-report' && 'รายงานความประพฤติลูกค้า'}
            </span>
          </div>
          <button onClick={handleLogout} className="px-4 py-1.5 border border-red-500/30 text-red-500 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer">
            ออกจากระบบ ➔
          </button>
        </div>

        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8">
            <div className="p-8 bg-gradient-to-r from-[#7C3AED]/15 via-purple-600/10 to-[#1D4ED8]/15 border border-[#7C3AED]/30 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-extrabold font-manrope text-[var(--color-text)]">ยินดีต้อนรับกลับ, Administrator 👋</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">ศูนย์กลางการควบคุม ตรวจสอบและบริหารจัดการระบบ SafeSeat แบบเรียลไทม์</p>
            </div>

            {loadingStats ? (
              <div className="p-12 text-center text-xs font-bold text-[var(--color-text-muted)]">กำลังโหลดสถิติระบบ...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => setActiveTab('driver-app')} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-lg cursor-pointer transition-all flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">การสมัครเป็นพนักงานขับรถ</span>
                    <div className="text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{stats?.drivers.total} รายการ</div>
                    <div className="text-xs font-bold text-blue-500 mt-1">รอพิจารณา {stats?.drivers.pending} รายการ ➔</div>
                  </div>
                  <div className="p-4 bg-[#7C3AED]/15 text-[#7C3AED] rounded-2xl">
                    <Car className="w-8 h-8" />
                  </div>
                </div>

                <div onClick={() => setActiveTab('pub-app')} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-lg cursor-pointer transition-all flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">การสมัครพาร์ทเนอร์ร้านค้า</span>
                    <div className="text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{stats?.pubs.total} ร้านค้า</div>
                    <div className="text-xs font-bold text-cyan-500 mt-1">รอพิจารณา {stats?.pubs.pending} ร้านค้า ➔</div>
                  </div>
                  <div className="p-4 bg-cyan-500/15 text-cyan-500 rounded-2xl">
                    <Store className="w-8 h-8" />
                  </div>
                </div>

                <div onClick={() => setActiveTab('driver-report')} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-lg cursor-pointer transition-all flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">รายงานความประพฤติคนขับ</span>
                    <div className="text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{stats?.driverReports.total} รายงาน</div>
                    <div className="text-xs font-bold text-rose-500 mt-1">รอแก้ไข {stats?.driverReports.pending} รายการ ➔</div>
                  </div>
                  <div className="p-4 bg-rose-500/15 text-rose-500 rounded-2xl">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                </div>

                <div onClick={() => setActiveTab('user-report')} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-lg cursor-pointer transition-all flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">รายงานความประพฤติลูกค้า</span>
                    <div className="text-3xl font-extrabold font-manrope text-[var(--color-text)] mt-1">{stats?.userReports.total} รายงาน</div>
                    <div className="text-xs font-bold text-pink-500 mt-1">รอแก้ไข {stats?.userReports.pending} รายการ ➔</div>
                  </div>
                  <div className="p-4 bg-pink-500/15 text-pink-500 rounded-2xl">
                    <User className="w-8 h-8" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DRIVER APPLICATIONS */}
        {activeTab === 'driver-app' && (
          <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">รายการอนุมัติพนักงานขับรถ (Driver Applications)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                <Search className="w-4 h-4 text-[#7C3AED]" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-text)] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text)] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อ - นามสกุล</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">วันที่สมัคร</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
                    {drivers.filter(d => {
                      const matchSearch = d.username.toLowerCase().includes(searchQuery.toLowerCase()) || `${d.firstname} ${d.lastname}`.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchStatus = statusFilter === 'All' || d.registerstatus === statusFilter
                      return matchSearch && matchStatus
                    }).map(driver => (
                      <tr key={driver.username} className="hover:bg-[var(--color-card-hover)] transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--color-text)]">#{driver.username}</td>
                        <td className="p-4 font-bold">{driver.firstname} {driver.lastname}</td>
                        <td className="p-4 text-[var(--color-text-muted)]">{driver.email}</td>
                        <td className="p-4">{formatThaiDate(driver.regisdate)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            driver.registerstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : driver.registerstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {driver.registerstatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
                          >
                            ตรวจสอบข้อมูล ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)] font-bold">ไม่มีคำขอสมัครคนขับในระบบขณะนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUB APPLICATIONS */}
        {activeTab === 'pub-app' && (
          <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">รายการอนุมัติพาร์ทเนอร์ร้านค้า (Partner Venue Applications)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                <Search className="w-4 h-4 text-[#7C3AED]" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อร้าน หรือ username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-text)] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text)] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-4">Username</th>
                      <th className="p-4">ชื่อสถานประกอบการ</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">เบอร์โทรศัพท์</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
                    {pubs.filter(p => {
                      const matchSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.pubname.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchStatus = statusFilter === 'All' || 
                        p.regisstatus === statusFilter || 
                        (statusFilter === 'รอดำเนินการ' && (p.regisstatus === 'pending' || p.regisstatus === 'รอดำเนินการ')) ||
                        (statusFilter === 'อนุมัติแล้ว' && (p.regisstatus === 'approved' || p.regisstatus === 'อนุมัติแล้ว')) ||
                        (statusFilter === 'ปฏิเสธ' && (p.regisstatus === 'rejected' || p.regisstatus === 'ปฏิเสธ'))
                      return matchSearch && matchStatus
                    }).map(pub => (
                      <tr key={pub.username} className="hover:bg-[var(--color-card-hover)] transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--color-text)]">#{pub.username}</td>
                        <td className="p-4 font-bold">{pub.pubname}</td>
                        <td className="p-4 text-[var(--color-text-muted)]">{pub.pubemail}</td>
                        <td className="p-4 font-mono">{pub.pubphone}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {pub.regisstatus === 'approved' || (pub as any).regisstatus === 'อนุมัติแล้ว' ? 'อนุมัติแล้ว' : pub.regisstatus === 'rejected' || (pub as any).regisstatus === 'ปฏิเสธ' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedPub(pub)}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
                          >
                            ตรวจสอบข้อมูล ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pubs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)] font-bold">ไม่พบข้อมูลคำขอพาร์ทเนอร์ร้านค้าในระบบ</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DRIVER REPORTS */}
        {activeTab === 'driver-report' && (
          <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">รายงานความประพฤติคนขับ (Driver Reports)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                <Search className="w-4 h-4 text-[#7C3AED]" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ รายละเอียด หรือ ID รายงาน..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-text)] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text)] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
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
                      <tr key={report.driverreportid} className="hover:bg-[var(--color-card-hover)] transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--color-text)]">#DRV-{report.driverreportid}</td>
                        <td className="p-4">{formatThaiDate(report.reportdate)}</td>
                        <td className="p-4 font-bold text-red-400">{report.reporttype}</td>
                        <td className="p-4 font-mono">#BOOKING-{report.reportindex || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            report.status === 'แก้ไขแล้ว' || report.status === 'อนุมัติแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {report.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReport(report)
                              setSelectedReportType('driver')
                            }}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
                          >
                            ตรวจสอบ ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                    {driverReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)] font-bold">ไม่มีรายการร้องเรียนคนขับตามเงื่อนไขที่ค้นหา</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USER REPORTS */}
        {activeTab === 'user-report' && (
          <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-bold font-manrope text-[var(--color-text)]">รายงานความประพฤติลูกค้า (Customer Reports)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                <Search className="w-4 h-4 text-[#7C3AED]" />
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ รายละเอียด หรือ ID รายงาน..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-text)] outline-none w-full font-semibold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text)] outline-none"
              >
                <option value="All">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ (Pending)</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
                <option value="ปฏิเสธ">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            {loadingData ? (
              <div className="p-12 text-center text-xs font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-4">Report ID</th>
                      <th className="p-4">วันที่แจ้ง</th>
                      <th className="p-4">หัวข้อรายงาน</th>
                      <th className="p-4">รหัสอ้างอิงการจอง</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4 text-right">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
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
                      <tr key={report.userreportid} className="hover:bg-[var(--color-card-hover)] transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--color-text)]">#USR-{report.userreportid}</td>
                        <td className="p-4">{formatThaiDate(report.reportdate)}</td>
                        <td className="p-4 font-bold text-pink-400">{report.reporttype}</td>
                        <td className="p-4 font-mono">#BOOKING-{report.request_id || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : report.status === 'ปฏิเสธ' || report.status === 'ไม่อนุมัติ'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {report.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReport(report)
                              setSelectedReportType('user')
                            }}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
                          >
                            ตรวจสอบ ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                    {userReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)] font-bold">ไม่มีรายการร้องเรียนลูกค้าตามเงื่อนไขที่ค้นหา</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Driver Detail Modal */}
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

        const docItems = [
          { label: '📸 รูปโปรไฟล์ใบหน้า', url: docs.profile },
          { label: '🚗 รูปถ่ายยานพาหนะ', url: (selectedDriver.drivercar as any)?.carimagepath || (selectedDriver.drivercar as any)?.carImagePath },
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

              {/* Driver Text Info */}
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
                {selectedDriver.drivercar && (
                  <div className="md:col-span-2 pt-2 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">ข้อมูลยานพาหนะ</span>
                    <div className="flex flex-wrap gap-3 font-semibold text-xs text-[var(--color-text)]">
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">ยี่ห้อ: {selectedDriver.drivercar.carbrand}</span>
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">รุ่น: {selectedDriver.drivercar.carmodel}</span>
                      <span className="px-2.5 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">สี: {selectedDriver.drivercar.carcolor}</span>
                      <span className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/30 rounded-md font-mono">ทะเบียน: {selectedDriver.drivercar.carplateno}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* All Uploaded Images Gallery */}
              <div>
                <h4 className="text-sm font-bold text-[#7C3AED] mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> ภาพถ่ายเอกสารและหลักฐานการสมัครทั้งหมด ({docItems.length} รายการ)
                </h4>
                {docItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {docItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(item.url!)}
                        className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:border-[#7C3AED] transition-all shadow-sm"
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button onClick={() => promptDriverReject(selectedDriver.username)} className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-full text-xs font-bold cursor-pointer transition-colors">
                  ปฏิเสธคำขอ
                </button>
                <button onClick={() => handleDriverStatus(selectedDriver.username, 'อนุมัติแล้ว')} className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:opacity-90 text-white rounded-full text-xs font-bold cursor-pointer shadow-md transition-opacity">
                  อนุมัติคำขอคนขับ ✓
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Pub Detail Modal */}
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

              {/* Pub Text Details */}
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

              {/* Pub Images Gallery */}
              <div>
                <h4 className="text-sm font-bold text-[#7C3AED] mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> เอกสารและภาพถ่ายประกอบการสมัครร้านค้า ({pubDocItems.length} รายการ)
                </h4>
                {pubDocItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {pubDocItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(item.url!)}
                        className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:border-[#7C3AED] transition-all shadow-sm"
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button onClick={() => promptPubReject(selectedPub.username)} className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-full text-xs font-bold cursor-pointer transition-colors">
                  ปฏิเสธคำขอร้านค้า
                </button>
                <button onClick={() => handlePubStatus(selectedPub.username, 'approved')} className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:opacity-90 text-white rounded-full text-xs font-bold cursor-pointer shadow-md transition-opacity">
                  อนุมัติคำขอร้านค้า ✓
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Report Detail Modal */}
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

              {/* Report Info */}
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

              {/* Evidence Images Gallery */}
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

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button 
                  onClick={() => promptReportReject(selectedReportType === 'user' ? (selectedReport.userreportid || 0) : (selectedReport.driverreportid || 0), selectedReportType)} 
                  className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-full text-xs font-bold cursor-pointer transition-colors"
                >
                  ปฏิเสธ / ลบรายงาน
                </button>
                {selectedReportType === 'user' ? (
                  <button onClick={() => handleReportStatus(selectedReport.userreportid || 0, 'user', 'อนุมัติแล้ว')} className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:opacity-90 text-white rounded-full text-xs font-bold cursor-pointer shadow-md transition-opacity">
                    อนุมัติรายงาน ✓
                  </button>
                ) : (
                  <button onClick={() => handleReportStatus(selectedReport.driverreportid || 0, 'driver', 'แก้ไขแล้ว')} className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:opacity-90 text-white rounded-full text-xs font-bold cursor-pointer shadow-md transition-opacity">
                    ทำเครื่องหมายแก้ไขเสร็จสิ้น ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Fullscreen Image Preview Lightbox */}
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

      {/* Confirm Reject Modal */}
      {confirmRejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-card)] border border-red-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-center">
            
            {/* Warning Icon and Title on the same line */}
            <div className="flex items-center justify-center gap-2.5">
              <span className="text-2xl leading-none">⚠️</span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-snug whitespace-nowrap">
                {confirmRejectModal.title}
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-medium px-2">
              {confirmRejectModal.message}
            </p>

            <div className="flex items-center gap-3 justify-center pt-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setConfirmRejectModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors whitespace-nowrap"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                onClick={() => {
                  const action = confirmRejectModal.onConfirm
                  setConfirmRejectModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })
                  action()
                }}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer transition-all whitespace-nowrap"
              >
                ยืนยันการปฏิเสธ (Confirm Reject)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
