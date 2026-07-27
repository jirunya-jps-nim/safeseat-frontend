'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

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
  regisimagepath: string // Stringified JSON structure containing doc urls
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
  regisstatus: 'pending' | 'approved' | 'rejected'
  regisdate: string
  regisimagepath?: string
}

interface ReportData {
  driverreportid?: number
  userreportid?: number
  reportdate: string
  reporttype: string
  reportdetail: string
  status: 'กำลังดำเนินการ' | 'แก้ไขแล้ว' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ'
  reportindex?: number // For driverreport
  request_id?: number // For userreport
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
  const [dateFilter, setDateFilter] = useState('')
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

  const [actionLoading, setActionLoading] = useState(false)

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

  const fetchTabData = useCallback(async (tab: TabType) => {
    if (tab === 'home') {
      fetchStats()
      return
    }
    setLoadingData(true)
    setSearchQuery('')
    setStatusFilter('All')
    setDateFilter('')
    try {
      let endpoint = ''
      if (tab === 'driver-app') endpoint = '/admin/drivers'
      else if (tab === 'pub-app') endpoint = '/admin/pubs'
      else if (tab === 'driver-report') endpoint = '/admin/driver-reports'
      else if (tab === 'user-report') endpoint = '/admin/user-reports'

      const res = await api.get(endpoint)
      if (res.data && res.data.success) {
        const payload = res.data.data
        if (tab === 'driver-app') setDrivers(payload)
        else if (tab === 'pub-app') setPubs(payload)
        else if (tab === 'driver-report') setDriverReports(payload)
        else if (tab === 'user-report') {
          const mapped = payload.map((item: any) => ({
            ...item,
            status: item.status || item.reportstatus
          }))
          setUserReports(mapped)
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
        showToast(`เปลี่ยนสถานะคนขับเป็น "${newStatus}" เรียบร้อยแล้ว`)
        setSelectedDriver(null)
        fetchTabData('driver-app')
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
        const thaiStatus = newStatus === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'
        showToast(`เปลี่ยนสถานะสถานประกอบการเป็น "${thaiStatus}" เรียบร้อยแล้ว`)
        setSelectedPub(null)
        fetchTabData('pub-app')
        fetchStats()
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReportStatus = async (reportId: number, type: 'driver' | 'user', newStatus: 'กำลังดำเนินการ' | 'แก้ไขแล้ว' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ') => {
    setActionLoading(true)
    try {
      const endpoint = type === 'driver'
        ? `/admin/driver-reports/${reportId}/status`
        : `/admin/user-reports/${reportId}/status`
      const res = await api.put(endpoint, { status: newStatus })
      if (res.data && res.data.success) {
        showToast('อัปเดตสถานะรายงานสำเร็จ')
        setSelectedReport(null)
        fetchTabData(type === 'driver' ? 'driver-report' : 'user-report')
        fetchStats()
      }
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'ไม่สามารถอัปเดตสถานะรายงานได้', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Logout ──────────────────────────────────────────────────
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('admin_user')
      router.push('/login')
    }
  }

  // ── Rendering Helper for Images in Driver Modal ────────────
  const parseDriverImages = (imagePathStr: string) => {
    try {
      const parsed = JSON.parse(imagePathStr)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
      return {}
    } catch {
      return { profile: imagePathStr }
    }
  }

  // ── Helper: Format Thai Date ────────────────────────────────
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
    <div style={styles.dashboardContainer}>
      {/* Background neon glows */}
      <div style={styles.bgGlowPurple} />
      <div style={styles.bgGlowCyan} />

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeUp 0.3s ease',
          maxWidth: 360,
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ─── 1. Left Sidebar (Premium Control Finish) ─── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.adminShieldWrapper}>
            <span style={styles.adminShieldIcon}>🛡️</span>
          </div>
          <h2 style={styles.sidebarAdminTitle}>SafeSeat Admin</h2>
          <p style={styles.sidebarAdminRole}>System Administrator</p>
        </div>

        <nav style={styles.sidebarNav}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'home' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>📊</span>
            หน้าแรก
          </button>

          <div style={styles.navGroupLabel}>การจัดการข้อมูลสมัคร</div>

          <button
            onClick={() => setActiveTab('driver-app')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'driver-app' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>🚗</span>
            พิจารณาคนขับรถ
            {stats && stats.drivers.pending > 0 && (
              <span style={styles.badgePending}>{stats.drivers.pending}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pub-app')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'pub-app' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>🏪</span>
            พิจารณาร้านค้า
            {stats && stats.pubs.pending > 0 && (
              <span style={styles.badgePending}>{stats.pubs.pending}</span>
            )}
          </button>

          <div style={styles.navGroupLabel}>รายงานความประพฤติ</div>

          <button
            onClick={() => setActiveTab('driver-report')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'driver-report' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>🚨</span>
            รายงานความประพฤติคนขับ
            {stats && stats.driverReports.pending > 0 && (
              <span style={styles.badgeReportPending}>{stats.driverReports.pending}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('user-report')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'user-report' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>👤</span>
            รายงานความประพฤติลูกค้า
            {stats && stats.userReports.pending > 0 && (
              <span style={styles.badgeReportPending}>{stats.userReports.pending}</span>
            )}
          </button>
        </nav>

      </aside>

      {/* ─── 2. Main Content Area ─── */}
      <div style={styles.mainContainer}>
        {/* Main Content Header */}
        <header style={styles.header}>
          <div style={styles.breadcrumb}>
            <span style={styles.crumbParent}>Admin</span>
            <span style={styles.crumbDivider}>‣</span>
            <span style={styles.crumbCurrent}>
              {activeTab === 'home' && 'หน้าแรก'}
              {activeTab === 'driver-app' && 'พิจารณาตรวจสอบคนขับรถ'}
              {activeTab === 'pub-app' && 'พิจารณาตรวจสอบร้านค้า / สถานบันเทิง'}
              {activeTab === 'driver-report' && 'รายงานความประพฤติคนขับ'}
              {activeTab === 'user-report' && 'รายงานความประพฤติลูกค้า'}
            </span>
          </div>

          <div style={styles.headerRight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(79, 70, 229, 0.2)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                @{adminUser?.username}
              </span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              ออกจากระบบ
            </button>
          </div>
        </header>

        {/* Main Content Inner */}
        <main style={styles.mainContent}>

          {/* ═════════════════════════════════════════════════════════
              TAB: HOME (Dashboard Overview)
              ═════════════════════════════════════════════════════════ */}
          {activeTab === 'home' && (
            <div style={styles.homeTabContainer}>
              <div style={styles.welcomeBanner}>
                <h2 style={styles.welcomeTitle}>Welcome Back, System Administrator! 👋</h2>
                <p style={styles.welcomeDesc}>
                  ยินดีต้อนรับเข้าสู่ระบบจัดการและควบคุมระบบ SafeSeat ในระบบมีข้อมูลสมัครงานและการร้องเรียนดังสถิติด้านล่าง
                </p>
              </div>

              {loadingStats ? (
                <div style={styles.skeletonGrid}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={styles.skeletonCard} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* ── Section 1: ข้อมูลสมัครสมาชิก ── */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📝</span> การจัดการข้อมูลสมัครสมาชิก
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {/* Card: Driver Applications */}
                      <div onClick={() => setActiveTab('driver-app')} style={{ ...styles.statCard, borderColor: '#6366f1' }}>
                        <div style={styles.statCardHeader}>
                          <span style={{ ...styles.statIconBadge, backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>🚗</span>
                          <span style={styles.statCardLabel}>การสมัครเป็นคนขับรถ</span>
                        </div>
                        <div style={styles.statNumberGroup}>
                          <span style={styles.statMainNumber}>{stats?.drivers.total}</span>
                          <span style={{ ...styles.statSubNumber, color: '#38bdf8' }}>รอพิจารณา {stats?.drivers.pending} รายการ</span>
                        </div>
                        <div style={styles.statCardFooter}>คลิกเพื่อพิจารณาและอนุมัติบัญชีคนขับทั้งหมด ➔</div>
                      </div>

                      {/* Card: Pub Applications */}
                      <div onClick={() => setActiveTab('pub-app')} style={{ ...styles.statCard, borderColor: '#06b6d4' }}>
                        <div style={styles.statCardHeader}>
                          <span style={{ ...styles.statIconBadge, backgroundColor: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>🏪</span>
                          <span style={styles.statCardLabel}>การสมัครร้านค้า / สถานบันเทิง</span>
                        </div>
                        <div style={styles.statNumberGroup}>
                          <span style={styles.statMainNumber}>{stats?.pubs.total}</span>
                          <span style={{ ...styles.statSubNumber, color: '#22d3ee' }}>รอพิจารณา {stats?.pubs.pending} ร้านค้า</span>
                        </div>
                        <div style={styles.statCardFooter}>คลิกเพื่อพิจารณาและอนุมัติร้านค้าทั้งหมด ➔</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: รายงานความประพฤติ ── */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🚨</span> รายงานความประพฤติและการร้องเรียน
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {/* Card: Driver Reports */}
                      <div onClick={() => setActiveTab('driver-report')} style={{ ...styles.statCard, borderColor: '#f43f5e' }}>
                        <div style={styles.statCardHeader}>
                          <span style={{ ...styles.statIconBadge, backgroundColor: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>🚨</span>
                          <span style={styles.statCardLabel}>รายงานความประพฤติคนขับ</span>
                        </div>
                        <div style={styles.statNumberGroup}>
                          <span style={styles.statMainNumber}>{stats?.driverReports.total}</span>
                          <span style={{ ...styles.statSubNumber, color: '#f43f5e' }}>รอแก้ไข {stats?.driverReports.pending} รายงาน</span>
                        </div>
                        <div style={styles.statCardFooter}>คลิกเพื่อจัดการรายงานความประพฤติทั้งหมด ➔</div>
                      </div>

                      {/* Card: User Reports */}
                      <div onClick={() => setActiveTab('user-report')} style={{ ...styles.statCard, borderColor: '#ec4899' }}>
                        <div style={styles.statCardHeader}>
                          <span style={{ ...styles.statIconBadge, backgroundColor: 'rgba(236,72,153,0.12)', color: '#ec4899' }}>👤</span>
                          <span style={styles.statCardLabel}>รายงานความประพฤติลูกค้า</span>
                        </div>
                        <div style={{ ...styles.statNumberGroup, marginBottom: 8 }}>
                          <span style={styles.statMainNumber}>{stats?.userReports.total}</span>
                          <span style={{ ...styles.statSubNumber, color: '#ec4899' }}>รอแก้ไข {stats?.userReports.pending} รายงาน</span>
                        </div>
                        <div style={styles.statCardFooter}>คลิกเพื่อจัดการรายงานความประพฤติทั้งหมด ➔</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB: DRIVER APPLICATIONS (พิจารณาอนุมัติคนขับ)
              ═════════════════════════════════════════════════════════ */}
          {activeTab === 'driver-app' && (
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>Driver Application Registration Management</h2>

              {/* Filters Box */}
              <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Search :</label>
                  <input
                    type="text"
                    placeholder="search driverId, name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.filterInput}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Date :</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    style={styles.filterInput}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Status :</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="All">All Statuses</option>
                    <option value="รอดำเนินการ">Pending (รอดำเนินการ)</option>
                    <option value="อนุมัติแล้ว">Approved (อนุมัติแล้ว)</option>
                    <option value="ปฏิเสธ">Rejected (ปฏิเสธ)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Tabs list inside table */}
              <div style={styles.tableTabRow}>
                <button
                  onClick={() => setStatusFilter('All')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'All' ? styles.tableTabActive : {}) }}
                >
                  All Applications ({drivers.length})
                </button>
                <button
                  onClick={() => setStatusFilter('รอดำเนินการ')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'รอดำเนินการ' ? styles.tableTabActive : {}) }}
                >
                  Pending ({drivers.filter(d => d.registerstatus === 'รอดำเนินการ').length})
                </button>
                <button
                  onClick={() => setStatusFilter('อนุมัติแล้ว')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'อนุมัติแล้ว' ? styles.tableTabActive : {}) }}
                >
                  Approved ({drivers.filter(d => d.registerstatus === 'อนุมัติแล้ว').length})
                </button>
              </div>

              {/* Table Data */}
              {loadingData ? (
                <div style={styles.skeletonTable}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={styles.skeletonRow} />
                  ))}
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Username (Phone)</th>
                        <th style={styles.th}>Driver Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Date Registered</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers
                        .filter(d => {
                          const matchesSearch =
                            d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            `${d.firstname} ${d.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.email.toLowerCase().includes(searchQuery.toLowerCase())

                          const matchesStatus = statusFilter === 'All' || d.registerstatus === statusFilter

                          const matchesDate = !dateFilter || d.regisdate.startsWith(dateFilter)

                          return matchesSearch && matchesStatus && matchesDate
                        })
                        .map(driver => (
                          <tr key={driver.username} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: 600 }}>#{driver.username}</td>
                            <td style={styles.td}>{driver.firstname} {driver.lastname}</td>
                            <td style={styles.td}>{driver.email}</td>
                            <td style={styles.td}>{formatThaiDate(driver.regisdate)}</td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusDot,
                                backgroundColor:
                                  driver.registerstatus === 'อนุมัติแล้ว' ? '#10b981' :
                                    driver.registerstatus === 'ปฏิเสธ' ? '#ef4444' : '#fbbf24'
                              }} />
                              {driver.registerstatus === 'อนุมัติแล้ว' && 'อนุมัติแล้ว'}
                              {driver.registerstatus === 'ปฏิเสธ' && 'ปฏิเสธคำขอ'}
                              {driver.registerstatus === 'รอดำเนินการ' && 'รอดำเนินการ'}
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={() => setSelectedDriver(driver)}
                                style={styles.viewDetailBtn}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      {drivers.length === 0 && (
                        <tr>
                          <td colSpan={6} style={styles.tdNoData}>ไม่มีข้อมูลการสมัครเข้าทำงานของคนขับรถ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB: PUB & RESTAURANT APPLICATIONS (พิจารณาอนุมัติร้านค้า)
              ═════════════════════════════════════════════════════════ */}
          {activeTab === 'pub-app' && (
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>Pub & Restaurant Application Registration Management</h2>

              {/* Filters Box */}
              <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Search :</label>
                  <input
                    type="text"
                    placeholder="search pub name, username..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.filterInput}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Status :</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="All">All Statuses</option>
                    <option value="pending">Pending (รอการพิจารณา)</option>
                    <option value="approved">Approved (อนุมัติแล้ว)</option>
                    <option value="rejected">Rejected (ไม่ผ่านการอนุมัติ)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Tabs list inside table */}
              <div style={styles.tableTabRow}>
                <button
                  onClick={() => setStatusFilter('All')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'All' ? styles.tableTabActive : {}) }}
                >
                  All Restaurants ({pubs.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'pending' ? styles.tableTabActive : {}) }}
                >
                  Pending ({pubs.filter(p => p.regisstatus === 'pending').length})
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  style={{ ...styles.tableTab, ...(statusFilter === 'approved' ? styles.tableTabActive : {}) }}
                >
                  Approved ({pubs.filter(p => p.regisstatus === 'approved').length})
                </button>
              </div>

              {/* Table Data */}
              {loadingData ? (
                <div style={styles.skeletonTable}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={styles.skeletonRow} />
                  ))}
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Username</th>
                        <th style={styles.th}>Pub / Restaurant Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pubs
                        .filter(p => {
                          const matchesSearch =
                            p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.pubname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.pubemail.toLowerCase().includes(searchQuery.toLowerCase())

                          const matchesStatus = statusFilter === 'All' || p.regisstatus === statusFilter

                          const matchesDate = !dateFilter || p.regisdate.startsWith(dateFilter)

                          return matchesSearch && matchesStatus && matchesDate
                        })
                        .map(pub => (
                          <tr key={pub.username} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: 600 }}>#{pub.username}</td>
                            <td style={styles.td}>{pub.pubname}</td>
                            <td style={styles.td}>{pub.pubemail}</td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusDot,
                                backgroundColor:
                                  pub.regisstatus === 'approved' ? '#10b981' :
                                    pub.regisstatus === 'rejected' ? '#ef4444' : '#fbbf24'
                              }} />
                              {pub.regisstatus === 'approved' && 'อนุมัติแล้ว'}
                              {pub.regisstatus === 'rejected' && 'ไม่ผ่านการอนุมัติ'}
                              {pub.regisstatus === 'pending' && 'รอพิจารณา'}
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={() => setSelectedPub(pub)}
                                style={styles.viewDetailBtn}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      {pubs.length === 0 && (
                        <tr>
                          <td colSpan={5} style={styles.tdNoData}>ไม่มีข้อมูลการสมัครประกอบกิจการร้านค้าในระบบ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB: DRIVER REPORTS (รายงานความประพฤติคนขับ)
              ═════════════════════════════════════════════════════════ */}
          {activeTab === 'driver-report' && (
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>Driver Behavior & Conduct Reports</h2>

              {/* Table Data */}
              {loadingData ? (
                <div style={styles.skeletonTable}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={styles.skeletonRow} />
                  ))}
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Report ID</th>
                        <th style={styles.th}>Report Date</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Booking Request ID</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverReports.map(report => (
                        <tr key={report.driverreportid} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 600 }}>#R-DRV-{report.driverreportid}</td>
                          <td style={styles.td}>{formatThaiDate(report.reportdate)}</td>
                          <td style={styles.td}>{report.reporttype}</td>
                          <td style={styles.td}>#BOOKING-{report.reportindex || '—'}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusDot,
                              backgroundColor: report.status === 'แก้ไขแล้ว' ? '#10b981' : '#f43f5e'
                            }} />
                            {report.status}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => {
                                setSelectedReport(report)
                                setSelectedReportType('driver')
                              }}
                              style={styles.viewDetailBtn}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {driverReports.length === 0 && (
                        <tr>
                          <td colSpan={6} style={styles.tdNoData}>ไม่มีการร้องเรียนการแจ้งความประพฤติคนขับในระบบขณะนี้</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB: USER REPORTS (รายงานความประพฤติลูกค้า)
              ═════════════════════════════════════════════════════════ */}
          {activeTab === 'user-report' && (
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>Customer Conduct Reports</h2>

              {/* Table Data */}
              {loadingData ? (
                <div style={styles.skeletonTable}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={styles.skeletonRow} />
                  ))}
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Report ID</th>
                        <th style={styles.th}>Report Date</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Booking Request ID</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReports.map(report => (
                        <tr key={report.userreportid} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 600 }}>#R-USR-{report.userreportid}</td>
                          <td style={styles.td}>{formatThaiDate(report.reportdate)}</td>
                          <td style={styles.td}>{report.reporttype}</td>
                          <td style={styles.td}>#BOOKING-{report.request_id || '—'}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusDot,
                              backgroundColor: report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' ? '#10b981' :
                                              report.status === 'ไม่อนุมัติ' ? '#ef4444' : '#fbbf24'
                            }} />
                            <span style={{
                              fontWeight: 600,
                              color: report.status === 'อนุมัติแล้ว' || report.status === 'แก้ไขแล้ว' ? '#10b981' :
                                     report.status === 'ไม่อนุมัติ' ? '#ef4444' : '#d97706'
                            }}>
                              {report.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => {
                                setSelectedReport(report)
                                setSelectedReportType('user')
                              }}
                              style={styles.viewDetailBtn}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {userReports.length === 0 && (
                        <tr>
                          <td colSpan={6} style={styles.tdNoData}>ไม่มีการร้องเรียนประวัติความประพฤติลูกค้าในระบบขณะนี้</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ═════════════════════════════════════════════════════════
          MODAL: DRIVER DETAILS & REVIEW (อนุมัติ/ปฏิเสธ คนขับ)
          ═════════════════════════════════════════════════════════ */}
      {selectedDriver && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>พิจารณาใบสมัครคนขับ: @{selectedDriver.username}</h3>
              <button onClick={() => setSelectedDriver(null)} style={styles.modalCloseBtn}>✕</button>
            </div>

            {/* Content Body */}
            <div style={styles.modalBodyTwoCol}>
              {/* Profile details */}
              <div style={styles.modalDetailsCol}>
                <h4 style={styles.sectionTitle}>ข้อมูลส่วนบุคคลของคนขับ</h4>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>ชื่อ-นามสกุล</span>
                    <span style={styles.detailValue}>{selectedDriver.firstname} {selectedDriver.lastname}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เพศ</span>
                    <span style={styles.detailValue}>{selectedDriver.gender === 1 ? 'ชาย' : 'หญิง'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เบอร์โทรศัพท์</span>
                    <span style={styles.detailValue}>{selectedDriver.phoneno}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>อีเมล</span>
                    <span style={styles.detailValue}>{selectedDriver.email}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เลขบัตรประชาชน</span>
                    <span style={styles.detailValue}>{selectedDriver.idcard}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เลขบัญชีธนาคาร</span>
                    <span style={styles.detailValue}>{selectedDriver.bankaccountno}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>วันที่สมัครเข้าทำงาน</span>
                    <span style={styles.detailValue}>{formatThaiDate(selectedDriver.regisdate)}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>สถานะปัจจุบัน</span>
                    <span style={{
                      ...styles.detailValue,
                      color:
                        selectedDriver.registerstatus === 'อนุมัติแล้ว' ? '#10b981' :
                          selectedDriver.registerstatus === 'ปฏิเสธ' ? '#ef4444' : '#fbbf24',
                      fontWeight: 700
                    }}>
                      {selectedDriver.registerstatus}
                    </span>
                  </div>
                </div>

                {selectedDriver.drivercar ? (
                  <>
                    <h4 style={styles.sectionTitle}>ข้อมูลยานพาหนะของคนขับ</h4>
                    <div style={styles.detailGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>ยี่ห้อรถยนต์</span>
                        <span style={styles.detailValue}>{selectedDriver.drivercar.carbrand}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>รุ่นรถยนต์</span>
                        <span style={styles.detailValue}>{selectedDriver.drivercar.carmodel}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>สีรถยนต์</span>
                        <span style={styles.detailValue}>{selectedDriver.drivercar.carcolor}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>เลขทะเบียนรถ</span>
                        <span style={styles.detailValue}>{selectedDriver.drivercar.carplateno}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={styles.warningInfoBox}>
                    ⚠️ ไม่พบข้อมูลยานพาหนะของคนขับรายนี้
                  </div>
                )}
              </div>

              {/* Documents uploads */}
              <div style={styles.modalDocsCol}>
                <h4 style={styles.sectionTitle}>เอกสารหลักฐานประกอบสมัครงาน</h4>
                {selectedDriver.regisimagepath ? (
                  <div style={styles.docsPreviewContainer}>
                    {/* Render ID Card */}
                    <div style={styles.docImageBlock}>
                      <span style={styles.docImageTitle}>📄 1. บัตรประจำตัวประชาชน / ID Card</span>
                      <img
                        src={parseDriverImages(selectedDriver.regisimagepath).profile || '/id_card_sample_1779780992637.png'}
                        alt="ID Card"
                        style={styles.docImage}
                      />
                    </div>
                    {/* Render License */}
                    <div style={styles.docImageBlock}>
                      <span style={styles.docImageTitle}>🪪 2. ใบอนุญาตขับขี่รถยนต์ / Driver License</span>
                      <img
                        src={parseDriverImages(selectedDriver.regisimagepath).driverLicense || '/driver_license_sample_1779780889940.png'}
                        alt="Driver License"
                        style={styles.docImage}
                      />
                    </div>
                    {/* Render Tax */}
                    <div style={styles.docImageBlock}>
                      <span style={styles.docImageTitle}>🏷️ 3. ป้ายภาษีรถยนต์ / Tax Sticker</span>
                      <img
                        src={parseDriverImages(selectedDriver.regisimagepath).medicalCertificate || '/tax_sticker_sample_1779781212366.png'}
                        alt="Tax Sticker"
                        style={styles.docImage}
                      />
                    </div>
                    {/* Render Bank Book */}
                    <div style={styles.docImageBlock}>
                      <span style={styles.docImageTitle}>🏦 4. สมุดบัญชีธนาคาร / Bank Book</span>
                      <img
                        src={parseDriverImages(selectedDriver.regisimagepath).criminalRecord || '/bank_book_sample_1779781264995.png'}
                        alt="Bank Book"
                        style={styles.docImage}
                      />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#64748b' }}>ไม่มีการอัปโหลดไฟล์หลักฐานเอกสาร</p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => setSelectedDriver(null)}
                style={styles.modalCancelBtn}
                disabled={actionLoading}
              >
                ย้อนกลับ
              </button>

              {selectedDriver.registerstatus === 'รอดำเนินการ' && (
                <div style={styles.modalBtnGroup}>
                  <button
                    onClick={() => handleDriverStatus(selectedDriver.username, 'ปฏิเสธ')}
                    style={styles.modalRejectBtn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'กำลังบันทึก...' : 'ปฏิเสธคำขอ (Reject)'}
                  </button>
                  <button
                    onClick={() => handleDriverStatus(selectedDriver.username, 'อนุมัติแล้ว')}
                    style={styles.modalApproveBtn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'กำลังบันทึก...' : 'อนุมัติรับคนขับรถ (Approve)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: PUB DETAILS & REVIEW (อนุมัติ/ปฏิเสธ ร้านประกอบการ)
          ═════════════════════════════════════════════════════════ */}
      {selectedPub && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>พิจารณาใบสมัครร้านค้า: @{selectedPub.username}</h3>
              <button onClick={() => setSelectedPub(null)} style={styles.modalCloseBtn}>✕</button>
            </div>

            {/* Content Body */}
            <div style={styles.modalBodyTwoCol}>
              <div style={styles.modalDetailsCol}>
                <h4 style={styles.sectionTitle}>ข้อมูลผู้ประกอบการ & พิกัดร้านค้า</h4>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>ชื่อร้านประกอบกิจการ</span>
                    <span style={styles.detailValue}>{selectedPub.pubname}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เบอร์โทรศัพท์ติดต่อ</span>
                    <span style={styles.detailValue}>{selectedPub.pubphone}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>อีเมลติดต่อ</span>
                    <span style={styles.detailValue}>{selectedPub.pubemail}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เลขผู้เสียภาษี 13 หลัก</span>
                    <span style={styles.detailValue}>{selectedPub.taxnumber}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เวลาเปิดทำการ</span>
                    <span style={styles.detailValue}>{selectedPub.pubopen} น.</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เวลาปิดทำการ</span>
                    <span style={styles.detailValue}>{selectedPub.pubclose} น.</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>ชื่อบัญชีผู้รับโอนเงิน</span>
                    <span style={styles.detailValue}>{selectedPub.bankaccountname}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>เลขบัญชีธนาคาร</span>
                    <span style={styles.detailValue}>{selectedPub.bankaccountno}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>วันที่ยื่นส่งเอกสาร</span>
                    <span style={styles.detailValue}>{formatThaiDate(selectedPub.regisdate)}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>สถานะใบคำขอสมัคร</span>
                    <span style={{
                      ...styles.detailValue,
                      color:
                        selectedPub.regisstatus === 'approved' ? '#10b981' :
                          selectedPub.regisstatus === 'rejected' ? '#ef4444' : '#fbbf24',
                      fontWeight: 700
                    }}>
                      {selectedPub.regisstatus === 'approved' && 'อนุมัติแล้ว'}
                      {selectedPub.regisstatus === 'rejected' && 'ไม่ผ่านการอนุมัติ'}
                      {selectedPub.regisstatus === 'pending' && 'รอการพิจารณา (Pending)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Store License / storefront */}
              <div style={styles.modalDocsCol}>
                <h4 style={styles.sectionTitle}>ใบอนุญาตประกอบกิจการ / ภาพถ่ายหน้าร้าน</h4>
                <div style={styles.docsPreviewContainer}>
                  <div style={styles.docImageBlock}>
                    <span style={styles.docImageTitle}>📄 ใบอนุญาตจดทะเบียนสถานบริการ / Store License</span>
                    <img
                      src={selectedPub.regisimagepath || '/driver_license_sample_1779780889940.png'}
                      alt="Store License"
                      style={styles.docImage}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => setSelectedPub(null)}
                style={styles.modalCancelBtn}
                disabled={actionLoading}
              >
                ย้อนกลับ
              </button>

              {selectedPub.regisstatus === 'pending' && (
                <div style={styles.modalBtnGroup}>
                  <button
                    onClick={() => handlePubStatus(selectedPub.username, 'rejected')}
                    style={styles.modalRejectBtn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'กำลังบันทึก...' : 'ปฏิเสธ (Reject)'}
                  </button>
                  <button
                    onClick={() => handlePubStatus(selectedPub.username, 'approved')}
                    style={styles.modalApproveBtn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'กำลังบันทึก...' : 'อนุมัติคำขอร้านค้า (Approve)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: REPORT DETAILS & RESOLVE (แก้ไข/ปรับปรุงสถานะรายงาน)
          ═════════════════════════════════════════════════════════ */}
      {selectedReport && selectedReportType && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardMedium}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                รายละเอียดรายงานร้องเรียนความประพฤติ (Role: {selectedReportType === 'driver' ? 'คนขับรถ' : 'ลูกค้า'})
              </h3>
              <button onClick={() => {
                setSelectedReport(null)
                setSelectedReportType(null)
              }} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.reportDetailBox}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>ประเภทการร้องเรียน</span>
                  <span style={{ ...styles.detailValue, fontWeight: 700, color: '#f43f5e', fontSize: 16 }}>
                    {selectedReport.reporttype}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>รายละเอียดปัญหา / พฤติกรรมที่พบ</span>
                  <span style={{ ...styles.detailValue, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', lineHeight: 1.6 }}>
                    {selectedReport.reportdetail || 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>รหัสอ้างอิงการจอง (Booking ID)</span>
                  <span style={styles.detailValue}>
                    {selectedReportType === 'driver' ? `#BOOKING-${selectedReport.reportindex}` : `#BOOKING-${selectedReport.request_id}`}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>วันที่แจ้งรายงานความประพฤติ</span>
                  <span style={styles.detailValue}>{formatThaiDate(selectedReport.reportdate)}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>สถานะการประสานงานของ Admin</span>
                  <span style={{
                    ...styles.detailValue,
                    color: selectedReport.status === 'อนุมัติแล้ว' || selectedReport.status === 'แก้ไขแล้ว' ? '#10b981' :
                           selectedReport.status === 'ไม่อนุมัติ' ? '#ef4444' : '#fbbf24',
                    fontWeight: 700
                  }}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => {
                  setSelectedReport(null)
                  setSelectedReportType(null)
                }}
                style={styles.modalCancelBtn}
                disabled={actionLoading}
              >
                ปิดหน้าต่าง
              </button>

              {selectedReport.status === 'กำลังดำเนินการ' && (
                selectedReportType === 'user' ? (
                  <div style={styles.modalBtnGroup}>
                    <button
                      onClick={() => handleReportStatus(selectedReport.userreportid || 0, 'user', 'ไม่อนุมัติ')}
                      style={styles.modalRejectBtn}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'กำลังอัปเดต...' : 'ไม่อนุมัติ (Reject)'}
                    </button>
                    <button
                      onClick={() => handleReportStatus(selectedReport.userreportid || 0, 'user', 'อนุมัติแล้ว')}
                      style={styles.modalApproveBtn}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'กำลังอัปเดต...' : 'อนุมัติ (Approve)'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleReportStatus(selectedReport.driverreportid || 0, 'driver', 'แก้ไขแล้ว')}
                    style={styles.modalApproveBtn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'กำลังอัปเดต...' : 'ทำเครื่องหมายว่า "แก้ไขเสร็จสิ้นแล้ว"'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles declared inside standard React styles object to prevent Tailwind dependencies */}
      <style>{`
        body {
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  )
}

// ── Shared Premium Visual System Styles ───────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },
  // Background cyber lights
  bgGlowPurple: {
    display: 'none',
  },
  bgGlowCyan: {
    display: 'none',
  },

  // ─── Sidebar Styles ───
  sidebar: {
    width: '300px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 5,
  },
  sidebarHeader: {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
  },
  adminShieldWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  adminShieldIcon: {
    fontSize: '32px',
  },
  sidebarAdminTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px',
  },
  sidebarAdminRole: {
    fontSize: '13px',
    color: '#4f46e5',
    fontWeight: 500,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sidebarNav: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto',
  },
  navGroupLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    margin: '20px 0 6px 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    color: '#1e293b',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    position: 'relative',
    width: '100%',
  },
  navIcon: {
    fontSize: '18px',
    marginRight: '14px',
  },
  navItemActive: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontWeight: 600,
    boxShadow: 'inset 4px 0 0 #4f46e5',
  },
  badgePending: {
    position: 'absolute',
    right: '16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  badgeReportPending: {
    position: 'absolute',
    right: '16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  adminInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },

  // ─── Main Contents Layout Styles ───
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
    position: 'relative',
    overflowY: 'auto',
    height: '100vh',
  },
  header: {
    padding: '24px 40px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  crumbParent: {
    fontSize: '14px',
    color: '#334155',
    fontWeight: 500,
  },
  crumbDivider: {
    fontSize: '12px',
    color: '#cbd5e1',
  },
  crumbCurrent: {
    fontSize: '14px',
    color: '#4f46e5',
    fontWeight: 600,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logoTitle: {
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#4f46e5',
    margin: 0,
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    color: '#dc2626',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  mainContent: {
    padding: '40px',
    flex: 1,
  },

  // ─── TAB: HOME (สถิติแผงควบคุม) ───
  homeTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  welcomeBanner: {
    padding: '32px',
    borderRadius: '20px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  welcomeDesc: {
    fontSize: '15px',
    color: '#475569',
    margin: 0,
    lineHeight: 1.6,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  statCardLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  statNumberGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  statMainNumber: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.1,
  },
  statSubNumber: {
    fontSize: '13px',
    marginTop: '6px',
    fontWeight: 500,
  },
  statCardFooter: {
    fontSize: '12px',
    color: '#94a3b8',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    marginTop: '6px',
    fontWeight: 500,
  },

  // ─── TABLES AND CONTROLS PANEL ───
  panelCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 24px 0',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '28px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
  },
  filterInput: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  filterSelect: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  tableTabRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  tableTab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
  },
  tableTabActive: {
    color: '#4f46e5',
    fontWeight: 600,
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '16px 20px',
    borderBottom: '2px solid #e2e8f0',
    color: '#334155',
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#1e293b',
  },
  statusDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  viewDetailBtn: {
    backgroundColor: 'rgba(79,70,229,0.06)',
    color: '#4f46e5',
    border: '1px solid rgba(79,70,229,0.2)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tdNoData: {
    padding: '40px',
    textAlign: 'center',
    color: '#1e293b',
    fontSize: '15px',
  },

  // ─── MODAL DIALOGS ───
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15,23,42,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modalCardLarge: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  modalCardMedium: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  modalBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalBodyTwoCol: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    backgroundColor: '#ffffff',
  },
  modalDetailsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalDocsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0',
    borderBottom: '1px solid rgba(79,70,229,0.2)',
    paddingBottom: '8px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px 24px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
  },
  detailValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: 500,
  },
  warningInfoBox: {
    padding: '12px 16px',
    backgroundColor: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: '10px',
    color: '#d97706',
    fontSize: '13px',
    fontWeight: 500,
  },
  docsPreviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '12px',
  },
  docImageBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  docImageTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
  },
  docImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  modalFooter: {
    padding: '24px 32px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  modalCancelBtn: {
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalBtnGroup: {
    display: 'flex',
    gap: '16px',
  },
  modalRejectBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalApproveBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  reportDetailBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Skeletons
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  skeletonCard: {
    height: '160px',
    backgroundColor: '#e2e8f0',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    animation: 'pulse 1.5s infinite',
  },
  skeletonTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skeletonRow: {
    height: '48px',
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite',
  }
}
