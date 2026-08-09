'use client'
// ═══════════════════════════════════════════════════════════════
// app/register/pub/page.tsx
// หน้าสมัครสมาชิกสำหรับเจ้าของสถานประกอบการ (Pub - Light Theme)
// รูปแบบเดียวกับหน้าสมัครคนขับ โดยใช้โครงสร้างธีมสว่าง สะอาดตา
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Shared Components ─────────────────────────────────────────
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

// ── Register Step Components ──────────────────────────────────
import StepShopInfo from '@/components/register/StepShopInfo'
import StepDocuments from '@/components/register/StepDocuments'
import StepAccount from '@/components/register/StepAccount'

// ── Services ──────────────────────────────────────────────────
import api from '@/services/api'

// ── Styles & Validation ───────────────────────────────────────
import { registerStyles as styles } from '@/lib/styles/registerStyles'
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateLicenseFile,
  validateShopImageFile,
} from '@/lib/validation/registerValidation'

// ── Types ─────────────────────────────────────────────────────
import { RegisterForm, StepConfig } from '@/types'

const STEPS: StepConfig[] = [
  { label: 'ข้อมูลร้าน',    icon: '🏪' },
  { label: 'เอกสาร & บัญชี', icon: '📄' },
  { label: 'บัญชีผู้ใช้',    icon: '🔐' },
]

const INITIAL_FORM: RegisterForm = {
  pubName: '', pubOpen: '18:00', pubClose: '00:00',
  pubEmail: '', pubPhone: '', pubAddress: '',
  taxNumber: '', bankAccountName: '', bankAccountNo: '',
  username: '', password: '',
}

export default function RegisterPubPage() {
  const router = useRouter()

  const [step, setStep] = useState<number>(1)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)

  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [shopImgFile, setShopImgFile] = useState<File | null>(null)

  const licenseRef = useRef<HTMLInputElement>(null)
  const shopImgRef = useRef<HTMLInputElement>(null)

  // Load pub draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pub_draft_form')
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm((prev: RegisterForm) => ({ ...prev, ...parsed }))
      }
    } catch (e) {
      console.error("Failed to load pub draft", e)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const updated = { ...form, [e.target.name]: e.target.value }
    setForm(updated)
    try {
      localStorage.setItem('pub_draft_form', JSON.stringify(updated))
    } catch {}
    setError('')
  }

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (!validateLicenseFile(file, setError)) {
      e.target.value = ''
      return
    }
    setLicenseFile(file)
    setError('')
  }

  const handleShopImgChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (!validateShopImageFile(file, setError)) {
      e.target.value = ''
      return
    }
    setShopImgFile(file)
    setError('')
  }

  const parseApiError = (err: unknown, defaultMsg: string): string => {
    if (typeof err === 'object' && err !== null) {
      if ('response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message) {
        return (err as { response: { data: { message: string } } }).response.data.message
      }
      if ('message' in err && (err as { message?: string }).message === 'Network Error') {
        return 'ไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์ได้ (Network Error) กรุณาตรวจสอบว่า Backend ทำงานอยู่หรือไม่'
      }
      if ('message' in err && typeof (err as { message?: string }).message === 'string') {
        return (err as { message: string }).message
      }
    }
    return defaultMsg
  }

  const handleNext = async (): Promise<void> => {
    setError('')
    if (step === 1) {
      if (!validateStep1(form, setError)) return
      
      setLoading(true)
      try {
        await api.post('/pub/check-email', { pubEmail: form.pubEmail, pubPhone: form.pubPhone })
      } catch (err: unknown) {
        setError(parseApiError(err, 'เกิดข้อผิดพลาดในการตรวจสอบอีเมลและเบอร์โทรศัพท์'))
        setLoading(false)
        return
      }
      setLoading(false)
    }
    
    if (step === 2) {
      if (!validateStep2(form, licenseFile, shopImgFile, setError)) return
      
      setLoading(true)
      try {
        await api.post('/pub/check-email', { taxNumber: form.taxNumber })
      } catch (err: unknown) {
        setError(parseApiError(err, 'เกิดข้อผิดพลาดในการตรวจสอบเลขผู้เสียภาษี'))
        setLoading(false)
        return
      }
      setLoading(false)
    }
    setStep(step + 1)
  }

  const handleBack = (): void => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep3(form, termsAccepted, setError)) return

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })

      if (licenseFile) fd.append('regisImagePath', licenseFile)
      if (shopImgFile)  fd.append('pubImagePath',  shopImgFile)

      await api.post('/pub/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      localStorage.removeItem('pub_draft_form')
      router.push('/login?registered=1')
    } catch (err: unknown) {
      setError(parseApiError(err, 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <Navbar />

      <div style={styles.main}>

        {/* ─── Hero Panel (Left 40% - Pub Bright Vibe) ─── */}
        <div style={styles.heroPanel}>
          <img
            src="/images/safeseat_futuristic_dashboard_preview.png"
            alt="Futuristic SafeSeat Dispatch System"
            style={{ ...styles.heroImage, opacity: 0.65 }}
          />
          <div style={{
            ...styles.heroOverlay,
            background: 'linear-gradient(160deg, rgba(5,7,20,0.85) 0%, rgba(124,58,237,0.4) 100%)',
          }} />
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>🏪 พาร์ทเนอร์สถานบริการ</div>
            <h1 style={styles.heroTitle}>
              ร่วมเป็นส่วนหนึ่ง<br />ของความปลอดภัย
            </h1>
            <p style={styles.heroDesc}>
              เชื่อมต่อกับแพลตฟอร์มที่ดูแลลูกค้าของคุณ<br />
              หลังจากปิดร้าน — ปลอดภัยทุกเส้นทาง
            </p>

            {/* Progress Steps ใน Hero */}
            <div style={styles.heroSteps}>
              {STEPS.map((s, i) => (
                <div key={i} style={styles.heroStep}>

                  <div
                    style={{
                      ...styles.heroStepDot,
                      backgroundColor:
                        step > i + 1  ? '#818cf8'
                        : step === i + 1 ? '#ffffff'
                        : 'rgba(255,255,255,0.25)',
                      border:
                        step === i + 1
                          ? '2px solid #818cf8'
                          : '2px solid transparent',
                    }}
                  >
                    {step > i + 1 ? (
                      <span style={{ fontSize: 12 }}>✓</span>
                    ) : (
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        ...styles.heroStepLabel,
                        color: step === i + 1 ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        fontWeight: step === i + 1 ? 600 : 400,
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={styles.heroStepNum}>ขั้นตอนที่ {i + 1}</div>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        ...styles.heroStepLine,
                        backgroundColor: step > i + 1 ? '#818cf8' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Form Panel (Right - Light Mode Form) ─── */}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>

            <div style={styles.formHeader}>
              <div style={styles.formIconWrap}>
                <span style={{ fontSize: 24 }}>{STEPS[step - 1].icon}</span>
              </div>
              <h2 style={styles.formTitle}>{STEPS[step - 1].label}</h2>
              <p style={styles.formSubtitle}>
                ขั้นตอนที่ {step} จาก {STEPS.length}
              </p>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(step / STEPS.length) * 100}%`,
                }}
              />
            </div>

            {/* ─── Render Step Component ─── */}
            {step === 1 && (
              <StepShopInfo
                form={form}
                onChange={handleChange}
                onPin={(lat: number, lng: number) => {
                  const updated = {
                    ...form,
                    pubAddress: `พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    pubAddressLat: lat,
                    pubAddressLng: lng,
                  }
                  setForm(updated)
                  try {
                    localStorage.setItem('pub_draft_form', JSON.stringify(updated))
                  } catch {}
                }}
                inputStyle={styles.input}
              />
            )}

            {step === 2 && (
              <StepDocuments
                form={form}
                onChange={handleChange}
                inputStyle={styles.input}
                licenseFile={licenseFile}
                shopImgFile={shopImgFile}
                licenseRef={licenseRef}
                shopImgRef={shopImgRef}
                onLicenseChange={handleLicenseChange}
                onShopImgChange={handleShopImgChange}
              />
            )}

            {step === 3 && (
              <StepAccount
                form={form}
                onChange={handleChange}
                inputStyle={styles.input}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                termsAccepted={termsAccepted}
                onToggleTerms={() => setTermsAccepted(!termsAccepted)}
              />
            )}

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            {/* ── Navigation Buttons ── */}
            <div style={styles.btnRow}>
              {step > 1 ? (
                <button onClick={handleBack} style={styles.backBtn}>
                  ← ย้อนกลับ
                </button>
              ) : (
                <button onClick={() => router.push('/register')} style={styles.backBtn}>
                  ← ย้อนกลับ
                </button>
              )}

              {step < STEPS.length ? (
                <button onClick={handleNext} style={styles.nextBtn} className="btn-invert-hover">
                  ถัดไป →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-invert-hover"
                  style={{ ...styles.nextBtn, opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? 'กำลังบันทึก...' : 'สมัครสมาชิก ✓'}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      <Footer />

      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&f[]=satoshi@700,500,400&display=swap"
      />
      <style>{`
        input:focus {
          border-color: #111111 !important;
          box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.1) !important;
        }
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
