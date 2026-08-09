'use client'
// ═══════════════════════════════════════════════════════════════
// app/status/page.tsx
// หน้า View Registration Status
//
// การทำงาน:
//  1. อ่าน username จาก localStorage (pub_user)
//  2. GET /api/pub/status/:username → ดึงข้อมูลสถานะ
//  3. แสดง Progress Stepper 3 ขั้น:
//       ส่งเอกสารแล้ว → รอดำเนินการ → อนุมัติ / ปฏิเสธ
//  4. แสดงรายละเอียดร้าน + วันที่สมัคร
//
// regisstatus ที่ backend ส่งมา:
//  'pending'  → รอการพิจารณา
//  'approved' → อนุมัติแล้ว
//  'rejected' → ปฏิเสธ
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Shared Components ─────────────────────────────────────────
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

// ── Services ─────────────────────────────────────────────────
import api from '@/services/api'

// ── Styles ───────────────────────────────────────────────────
import { statusStyles as styles } from '@/lib/styles/statusStyles'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface StatusData {
  regisstatus: 'pending' | 'approved' | 'rejected'
  regisdate: string
  pubname: string
  pubemail: string
  pubphone: string
  regisimagepath?: string
}

// ─────────────────────────────────────────────────────────────
// Stepper config — 3 ขั้นตอนการลงทะเบียน
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'ส่งเอกสารเรียบร้อยแล้ว', icon: '📄' },
  { label: 'รอดำเนินการ',             icon: '⏳' },
  { label: 'ผลการพิจารณา',            icon: '✅' },
]

// ─────────────────────────────────────────────────────────────
// Helper: แปลง regisstatus → active step index (0-based)
// pending  → step 1 (รอดำเนินการ)
// approved → step 2 (ผ่านแล้ว)
// rejected → step 2 (ไม่ผ่าน)
// ─────────────────────────────────────────────────────────────
function getActiveStep(status: string | undefined): number {
  if (status === 'approved' || status === 'อนุมัติแล้ว' || status === 'rejected' || status === 'ปฏิเสธ') return 2
  if (status === 'pending' || status === 'รอดำเนินการ') return 1
  return 0
}

// ─────────────────────────────────────────────────────────────
// Helper: config สีและข้อความตาม status
// ─────────────────────────────────────────────────────────────
function getStatusConfig(status: string | undefined) {
  switch (status) {
    case 'approved':
    case 'อนุมัติแล้ว':
      return {
        icon: '🎉',
        title: 'ยินดีด้วย! ร้านของคุณได้รับการอนุมัติแล้ว',
        desc: 'คุณสามารถเริ่มใช้งานระบบ SafeSeat ได้ทันที ลูกค้าของคุณจะปลอดภัยทุกเส้นทาง',
        bannerBg: 'rgba(16,185,129,0.12)',
        bannerBorder: 'rgba(16,185,129,0.35)',
        titleColor: '#34d399',
        dotActive: '#10b981',
        dotDone: '#10b981',
        lineDone: '#10b981',
      }
    case 'rejected':
    case 'ปฏิเสธ':
      return {
        icon: '❌',
        title: 'ขออภัย — คำขอลงทะเบียนไม่ผ่านการพิจารณา',
        desc: 'กรุณาตรวจสอบเอกสารให้ครบถ้วนและถูกต้อง แล้วสมัครใหม่อีกครั้ง หรือติดต่อทีมงาน',
        bannerBg: 'rgba(239,68,68,0.12)',
        bannerBorder: 'rgba(239,68,68,0.35)',
        titleColor: '#f87171',
        dotActive: '#ef4444',
        dotDone: '#ef4444',
        lineDone: '#ef4444',
      }
    case 'pending':
    case 'รอดำเนินการ':
    default:
      return {
        icon: '⏳',
        title: 'อยู่ระหว่างการพิจารณา',
        desc: 'ทีมงานกำลังตรวจสอบเอกสารของคุณ โดยปกติใช้เวลา 1–3 วันทำการ กรุณารอสักครู่',
        bannerBg: 'rgba(245,158,11,0.12)',
        bannerBorder: 'rgba(245,158,11,0.35)',
        titleColor: '#fbbf24',
        dotActive: '#f59e0b',
        dotDone: '#6366f1',
        lineDone: '#6366f1',
      }
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: format วันที่ไทย
// ─────────────────────────────────────────────────────────────
function formatDateThai(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ═══════════════════════════════════════════════════════════════
// StatusPage Component
// ═══════════════════════════════════════════════════════════════
export default function StatusPage() {
  const router = useRouter()

  // ── State ─────────────────────────────────────────────────
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [username, setUsername]     = useState<string>('')
  const [loading, setLoading]       = useState<boolean>(true)
  const [error, setError]           = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // ── Fetch status จาก Backend ─────────────────────────────
  const fetchStatus = useCallback(async (user: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const res = await api.get(`/pub/status/${user}`)
      setStatusData(res.data.data)
    } catch (err: unknown) {
      // ดึง message จาก axios error หรือ Error object
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : undefined
      setError(msg || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // ── onMount: อ่าน username จาก localStorage ─────────────
  useEffect(() => {
    const stored = localStorage.getItem('pub_user')
    if (!stored) {
      // ยังไม่ login → ไปหน้า login
      router.push('/login')
      return
    }
    try {
      const parsed = JSON.parse(stored) as { username?: string }
      const user = parsed.username ?? ''
      
      if (user) {
        // ป้องกัน Error: Calling setState synchronously within an effect...
        // โดยใช้ Promise เพื่อหน่วงเวลาทั้ง setUsername และ fetchStatus ไปที่ Microtask Queue
        Promise.resolve().then(() => {
          setUsername(user)
          fetchStatus(user)
        })
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
  }, [router, fetchStatus])

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = () => {
    const isConfirmed = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
    if (isConfirmed) {
      localStorage.removeItem('pub_user')
      router.push('/login')
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  const activeStep  = getActiveStep(statusData?.regisstatus)
  const statusCfg   = getStatusConfig(statusData?.regisstatus)

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Background glow circles */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      {/* Navbar — ซ่อนปุ่ม login (user login อยู่แล้ว) */}
      <Navbar showLoginButton={false} />

      {/* Main Content */}
      <main style={styles.main}>

        {/* ── Page Header ─────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div style={styles.pageBadge}>
            📋 สถานะการสมัคร
          </div>
          <h1 style={styles.pageTitle}>View Registration Status</h1>
          <p style={styles.pageSubtitle}>
            ติดตามสถานะการพิจารณาใบสมัครของคุณ
          </p>
        </div>

        {/* ── Card ────────────────────────────────────────── */}
        <div style={styles.card}>

          {/* Greeting */}
          <p style={styles.greeting}>
            สวัสดี {loading ? '...' : (statusData?.pubname || username)} 👋
          </p>
          <p style={styles.greetingSub}>
            {loading
              ? 'กำลังโหลดข้อมูล...'
              : `@${username} · ตรวจสอบสถานะการสมัครด้านล่าง`}
          </p>

          {/* ── Stepper ──────────────────────────────────── */}
          <div style={styles.stepper}>
            {STEPS.map((step, i) => {
              const isDone    = activeStep > i
              const isActive  = activeStep === i
              const isLast    = i === STEPS.length - 1
              // สี dot
              const dotBg =
                isDone    ? statusCfg.dotDone
                : isActive ? statusCfg.dotActive
                : 'rgba(51,65,85,0.8)'
              const dotColor  = isDone || isActive ? '#fff' : '#475569'
              const dotBorder = isActive
                ? `2px solid ${statusCfg.dotActive}`
                : isDone
                ? 'none'
                : '2px solid rgba(71,85,105,0.6)'

              // สี line ถัดไป
              const nextLineBg = activeStep > i ? statusCfg.lineDone : 'rgba(51,65,85,0.6)'

              return (
                <div key={i} style={styles.stepItem}>
                  {/* Dot row (dot + line) */}
                  <div style={styles.stepDotWrapper}>
                    {/* Connector line ก่อน dot (ยกเว้น step แรก) */}
                    {i > 0 && (
                      <div
                        style={{
                          ...styles.stepLine,
                          backgroundColor: activeStep >= i ? statusCfg.lineDone : 'rgba(51,65,85,0.6)',
                        }}
                      />
                    )}

                    {/* Dot */}
                    <div
                      style={{
                        ...styles.stepDot,
                        backgroundColor: dotBg,
                        color: dotColor,
                        border: dotBorder,
                        boxShadow: isActive
                          ? `0 0 14px ${statusCfg.dotActive}60`
                          : isDone
                          ? `0 0 8px ${statusCfg.dotDone}40`
                          : 'none',
                      }}
                    >
                      {isDone ? '✓' : step.icon}
                    </div>

                    {/* Connector line หลัง dot (ยกเว้น step สุดท้าย) */}
                    {!isLast && (
                      <div
                        style={{
                          ...styles.stepLine,
                          backgroundColor: nextLineBg,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      ...styles.stepLabel,
                      color: isActive
                        ? '#0f172a'
                        : isDone
                        ? '#475569'
                        : '#94a3b8',
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ── Error ────────────────────────────────────── */}
          {error && !loading && (
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}

          {/* ── Loading skeleton ─────────────────────────── */}
          {loading && (
            <div>
              <div style={{
                ...styles.skeletonLine,
                height: 64,
                borderRadius: 14,
                marginBottom: 24,
              }} />
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                marginBottom: 28,
              }}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} style={{
                    ...styles.skeletonLine,
                    height: 58,
                    borderRadius: 12,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Status banner ────────────────────────────── */}
          {!loading && statusData && (
            <>
              <div style={{
                ...styles.statusBanner,
                backgroundColor: statusCfg.bannerBg,
                borderColor: statusCfg.bannerBorder,
              }}>
                <span style={styles.statusIcon}>{statusCfg.icon}</span>
                <div style={styles.statusTextWrap}>
                  <div style={{ ...styles.statusTitle, color: statusCfg.titleColor }}>
                    {statusCfg.title}
                  </div>
                  <div style={{ ...styles.statusDesc, color: statusCfg.titleColor }}>
                    {statusCfg.desc}
                  </div>
                </div>
              </div>

              {/* ── Info grid ─────────────────────────────── */}
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>ชื่อร้าน / สถานประกอบการ</div>
                  <div style={styles.infoValue}>{statusData.pubname || '—'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>อีเมล</div>
                  <div style={styles.infoValue}>{statusData.pubemail || '—'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>เบอร์โทรศัพท์</div>
                  <div style={styles.infoValue}>{statusData.pubphone || '—'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>วันที่สมัคร</div>
                  <div style={styles.infoValue}>
                    {statusData.regisdate ? formatDateThai(statusData.regisdate) : '—'}
                  </div>
                </div>
                <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                  <div style={styles.infoLabel}>สถานะปัจจุบัน</div>
                  <div style={{
                    ...styles.infoValue,
                    color: statusCfg.titleColor,
                    fontWeight: 700,
                    fontSize: 16,
                  }}>
                    {statusData.regisstatus === 'pending'  && '⏳ รอการพิจารณา (Pending)'}
                    {statusData.regisstatus === 'approved' && '✅ อนุมัติแล้ว (Approved)'}
                    {statusData.regisstatus === 'rejected' && '❌ ไม่ผ่านการพิจารณา (Rejected)'}
                  </div>
                </div>
              </div>

              <div style={styles.divider} />
            </>
          )}

          {/* ── Action Buttons ───────────────────────────── */}
          {!loading && (
            <div style={{ ...styles.btnRow, justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
              <button
                id="btn-refresh"
                onClick={() => fetchStatus(username, true)}
                disabled={refreshing}
                style={{
                  ...styles.refreshBtn,
                  opacity: refreshing ? 0.75 : 1,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  width: '100%',
                  maxWidth: '220px',
                }}
              >
                {refreshing && <span style={styles.spinner} />}
                {refreshing ? 'กำลังโหลด...' : '🔄 รีเฟรช'}
              </button>

              {((statusData as any)?.regisstatus === 'rejected' || (statusData as any)?.regisstatus === 'ปฏิเสธ') && (
                <button
                  onClick={() => {
                    if (statusData) {
                      const draft = {
                        pubName: statusData.pubname || '',
                        pubEmail: statusData.pubemail || '',
                        pubPhone: statusData.pubphone || '',
                        username: username,
                      }
                      localStorage.setItem('pub_draft_form', JSON.stringify(draft))
                    }
                    router.push('/register/pub')
                  }}
                  style={{
                    ...styles.refreshBtn,
                    background: 'linear-gradient(135deg, #7C3AED, #1D4ED8)',
                    color: '#ffffff',
                    border: 'none',
                    width: '100%',
                    maxWidth: '240px',
                    fontWeight: 700,
                  }}
                >
                  ✏️ แก้ไขข้อมูลและยื่นสมัครใหม่
                </button>
              )}
            </div>
          )}

        </div>
        {/* /card */}

        {/* Help note */}
        {!loading && (
          <p style={{
            fontSize: 13,
            color: '#475569',
            textAlign: 'center',
            margin: 0,
          }}>
            มีปัญหา? ติดต่อทีมงาน SafeSeat ได้ที่{' '}
            <span style={{ color: '#818cf8', cursor: 'pointer' }}>
              support@safeseat.app
            </span>
          </p>
        )}

      </main>

      <Footer />

      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&f[]=satoshi@700,500,400&display=swap"
      />
      <style>{`
        .btn-invert-hover {
          transition: all 0.2s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .btn-invert-hover:hover {
          background-color: #111111 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  )
}
