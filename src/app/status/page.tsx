'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeContext'

import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

import api from '@/services/api'

import { statusStyles as styles } from '@/lib/styles/statusStyles'

interface StatusData {
  regisstatus: 'pending' | 'approved' | 'rejected'
  regisdate: string
  pubname: string
  pubemail: string
  pubphone: string
  regisimagepath?: string
}

const STEPS = [
  { label: 'ส่งเอกสารเรียบร้อยแล้ว', icon: '📄' },
  { label: 'รอดำเนินการ',             icon: '⏳' },
  { label: 'ผลการพิจารณา',            icon: '✅' },
]

function getActiveStep(status: string | undefined): number {
  if (status === 'approved' || status === 'อนุมัติแล้ว' || status === 'rejected' || status === 'ปฏิเสธ') return 2
  if (status === 'pending' || status === 'รอดำเนินการ') return 1
  return 0
}

function getStatusConfig(status: string | undefined, isDark: boolean = true) {
  switch (status) {
    case 'approved':
    case 'อนุมัติแล้ว':
      return {
        icon: '🎉',
        title: 'ยินดีด้วย! สถานบันเทิงของคุณได้รับการอนุมัติแล้ว',
        desc: 'คุณสามารถเริ่มใช้งานระบบ SafeSeat ได้ทันที ลูกค้าของคุณจะปลอดภัยทุกเส้นทาง',
        bannerBg: isDark
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.20) 0%, rgba(5, 150, 105, 0.12) 100%)'
          : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        bannerBorder: isDark ? 'rgba(52, 211, 153, 0.5)' : '#10B981',
        iconBg: isDark ? 'rgba(52, 211, 153, 0.25)' : '#D1FAE5',
        titleColor: isDark ? '#34D399' : '#065F46',
        descColor: isDark ? '#A7F3D0' : '#047857',
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
        bannerBg: isDark
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.20) 0%, rgba(185, 28, 28, 0.12) 100%)'
          : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
        bannerBorder: isDark ? 'rgba(248, 113, 113, 0.5)' : '#EF4444',
        iconBg: isDark ? 'rgba(248, 113, 113, 0.25)' : '#FEE2E2',
        titleColor: isDark ? '#F87171' : '#991B1B',
        descColor: isDark ? '#FCA5A5' : '#B91C1C',
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
        bannerBg: isDark
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.14) 100%)'
          : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        bannerBorder: isDark ? 'rgba(251, 191, 36, 0.5)' : '#F59E0B',
        iconBg: isDark ? 'rgba(251, 191, 36, 0.25)' : '#FDE68A',
        titleColor: isDark ? '#FDE047' : '#92400E',
        descColor: isDark ? '#FEF08A' : '#78350F',
        dotActive: '#f59e0b',
        dotDone: '#6366f1',
        lineDone: '#6366f1',
      }
  }
}

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

export default function StatusPage() {
  const router = useRouter()

  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [username, setUsername]     = useState<string>('')
  const [loading, setLoading]       = useState<boolean>(true)
  const [error, setError]           = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchStatus = useCallback(async (user: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const res = await api.get(`/pub/status/${user}`)
      setStatusData(res.data.data)
    } catch (err: unknown) {
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

  useEffect(() => {
    const stored = localStorage.getItem('pub_user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const parsed = JSON.parse(stored) as { username?: string }
      const user = parsed.username ?? ''
      
      if (user) {
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

  const handleLogout = () => {
    const isConfirmed = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
    if (isConfirmed) {
      localStorage.removeItem('pub_user')
      router.push('/login')
    }
  }

  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const activeStep  = getActiveStep(statusData?.regisstatus)
  const statusCfg   = getStatusConfig(statusData?.regisstatus, isDark)

  return (
    <div style={styles.page}>
      {}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      {}
      <Navbar showLoginButton={false} />

      {}
      <main style={styles.main}>

        {}
        <div style={styles.pageHeader}>
          <div style={styles.pageBadge}>
            📋 สถานะการสมัคร
          </div>
          <h1 style={styles.pageTitle}>View Registration Status</h1>
          <p style={styles.pageSubtitle}>
            ติดตามสถานะการพิจารณาใบสมัครของคุณ
          </p>
        </div>

        {}
        <div style={styles.card}>

          {}
          <p style={styles.greeting}>
            สวัสดี {loading ? '...' : (statusData?.pubname || username)} 👋
          </p>
          <p style={{
            ...styles.greetingSub,
            color: isDark ? '#cbd5e1' : '#334155',
          }}>
            {loading
              ? 'กำลังโหลดข้อมูล...'
              : `@${username} · ตรวจสอบสถานะการสมัครด้านล่าง`}
          </p>

          {}
          <div style={styles.stepper}>
            {STEPS.map((step, i) => {
              const isDone    = activeStep > i
              const isActive  = activeStep === i
              const isLast    = i === STEPS.length - 1
              const dotBg =
                isDone    ? statusCfg.dotDone
                : isActive ? statusCfg.dotActive
                : isDark ? 'rgba(51,65,85,0.8)' : '#E2E8F0'
              const dotColor  = isDone || isActive ? '#fff' : (isDark ? '#cbd5e1' : '#64748B')
              const dotBorder = isActive
                ? `2px solid ${statusCfg.dotActive}`
                : isDone
                ? 'none'
                : `2px solid ${isDark ? 'rgba(71,85,105,0.6)' : '#CBD5E1'}`

              const nextLineBg = activeStep > i ? statusCfg.lineDone : (isDark ? 'rgba(51,65,85,0.6)' : '#E2E8F0')

              return (
                <div key={i} style={styles.stepItem}>
                  {}
                  <div style={styles.stepDotWrapper}>
                    {}
                    {i > 0 && (
                      <div
                        style={{
                          ...styles.stepLine,
                          backgroundColor: activeStep >= i ? statusCfg.lineDone : (isDark ? 'rgba(51,65,85,0.6)' : '#E2E8F0'),
                        }}
                      />
                    )}

                    {}
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

                    {}
                    {!isLast && (
                      <div
                        style={{
                          ...styles.stepLine,
                          backgroundColor: nextLineBg,
                        }}
                      />
                    )}
                  </div>

                  {}
                  <span
                    style={{
                      ...styles.stepLabel,
                      color: isActive
                        ? (isDark ? '#ffffff' : '#0F172A')
                        : isDone
                        ? (isDark ? '#a7f3d0' : '#047857')
                        : (isDark ? '#cbd5e1' : '#475569'),
                      fontWeight: isActive ? 700 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {}
          {error && !loading && (
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}

          {}
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

          {}
          {!loading && statusData && (
            <>
              <div style={{
                ...styles.statusBanner,
                background: statusCfg.bannerBg,
                border: `1px solid ${statusCfg.bannerBorder}`,
                boxShadow: isDark
                  ? '0 8px 24px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 4px 16px rgba(0, 0, 0, 0.05)',
                borderRadius: 16,
                padding: '22px 26px',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                marginBottom: '32px', 
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: statusCfg.iconBg,
                  border: `1px solid ${statusCfg.bannerBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  flexShrink: 0,
                  boxShadow: isDark ? '0 0 16px rgba(245, 158, 11, 0.3)' : 'none',
                }}>
                  {statusCfg.icon}
                </div>
                <div style={styles.statusTextWrap}>
                  <div style={{ ...styles.statusTitle, color: statusCfg.titleColor, fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                    {statusCfg.title}
                  </div>
                  <div style={{ ...styles.statusDesc, color: statusCfg.descColor, fontSize: 13.5, lineHeight: 1.6, opacity: 1, fontWeight: 500 }}>
                    {statusCfg.desc}
                  </div>
                </div>
              </div>

              {}
              <div style={styles.infoGrid}>
                <div style={{
                  ...styles.infoItem,
                  backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
                }}>
                  <div style={{ ...styles.infoLabel, color: isDark ? '#94a3b8' : '#475569' }}>
                    ชื่อสถานบันเทิง / สถานประกอบการ
                  </div>
                  <div style={{ ...styles.infoValue, color: isDark ? '#ffffff' : '#0F172A' }}>
                    {statusData.pubname || '—'}
                  </div>
                </div>
                <div style={{
                  ...styles.infoItem,
                  backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
                }}>
                  <div style={{ ...styles.infoLabel, color: isDark ? '#94a3b8' : '#475569' }}>
                    อีเมล
                  </div>
                  <div style={{ ...styles.infoValue, color: isDark ? '#ffffff' : '#0F172A' }}>
                    {statusData.pubemail || '—'}
                  </div>
                </div>
                <div style={{
                  ...styles.infoItem,
                  backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
                }}>
                  <div style={{ ...styles.infoLabel, color: isDark ? '#94a3b8' : '#475569' }}>
                    เบอร์โทรศัพท์
                  </div>
                  <div style={{ ...styles.infoValue, color: isDark ? '#ffffff' : '#0F172A' }}>
                    {statusData.pubphone || '—'}
                  </div>
                </div>
                <div style={{
                  ...styles.infoItem,
                  backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
                }}>
                  <div style={{ ...styles.infoLabel, color: isDark ? '#94a3b8' : '#475569' }}>
                    วันที่สมัคร
                  </div>
                  <div style={{ ...styles.infoValue, color: isDark ? '#ffffff' : '#0F172A' }}>
                    {statusData.regisdate ? formatDateThai(statusData.regisdate) : '—'}
                  </div>
                </div>
                <div style={{
                  ...styles.infoItem,
                  gridColumn: '1 / -1',
                  backgroundColor: isDark ? 'var(--color-surface)' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'var(--color-border)' : '#E2E8F0'}`,
                }}>
                  <div style={{ ...styles.infoLabel, color: isDark ? '#94a3b8' : '#475569' }}>
                    สถานะปัจจุบัน
                  </div>
                  <div style={{
                    ...styles.infoValue,
                    color: statusCfg.titleColor,
                    fontWeight: 700,
                    fontSize: 16,
                  }}>
                    {((statusData as any)?.regisstatus === 'pending' || (statusData as any)?.regisstatus === 'รอดำเนินการ' || (statusData as any)?.regisstatus === 'รอการพิจารณา' || !(statusData as any)?.regisstatus) && '⏳ รอการพิจารณา (Pending)'}
                    {((statusData as any)?.regisstatus === 'approved' || (statusData as any)?.regisstatus === 'อนุมัติแล้ว') && '✅ อนุมัติแล้ว (Approved)'}
                    {((statusData as any)?.regisstatus === 'rejected' || (statusData as any)?.regisstatus === 'ปฏิเสธ') && '❌ ไม่ผ่านการพิจารณา (Rejected)'}
                  </div>
                </div>
              </div>

              <div style={styles.divider} />
            </>
          )}

          {}
          {!loading && ((statusData as any)?.regisstatus === 'rejected' || (statusData as any)?.regisstatus === 'ปฏิเสธ') && (
            <div style={{ ...styles.btnRow, justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
              <button
                onClick={() => {
                  if (statusData) {
                    const s = statusData as any
                    const draft = {
                      pubName: s.pubname || '',
                      pubEmail: s.pubemail || '',
                      pubPhone: s.pubphone || '',
                      pubOpen: s.pubopen || '18:00',
                      pubClose: s.pubclose || '00:00',
                      pubAddress: s.pubaddress || (s.pubaddresslat ? `พิกัด: ${s.pubaddresslat}, ${s.pubaddresslng}` : ''),
                      pubAddressLat: s.pubaddresslat ?? undefined,
                      pubAddressLng: s.pubaddresslng ?? undefined,
                      taxNumber: s.taxnumber || '',
                      bankAccountNo: s.bankaccountno || '',
                      bankAccountName: s.bankaccountname || '',
                      username: username,
                    }
                    localStorage.setItem('pub_draft_form', JSON.stringify(draft))
                  }
                  router.push('/register/pub')
                }}
                style={{
                  ...styles.refreshBtn,
                  background: 'linear-gradient(135deg, #2340A7, #2563EB)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  padding: '12px 24px',
                }}
              >
                ✏️ แก้ไขข้อมูลและยื่นสมัครใหม่
              </button>
            </div>
          )}

        </div>
        {}

        {}
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
