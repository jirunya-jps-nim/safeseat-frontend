'use client'
// ═══════════════════════════════════════════════════════════════
// app/register/pub/page.tsx
// หน้าสมัครสมาชิกสำหรับเจ้าของสถานประกอบการ (Pub - Light Theme)
// รูปแบบเดียวกับหน้าสมัครคนขับ โดยใช้โครงสร้างธีมสว่าง สะอาดตา
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from 'react'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value })
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

  const handleNext = async (): Promise<void> => {
    setError('')
    if (step === 1) {
      if (!validateStep1(form, setError)) return
      
      setLoading(true)
      try {
        await api.post('/pub/check-email', { email: form.pubEmail })
      } catch (err: unknown) {
        const errorMessage =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response: { data?: { message?: string } } }).response?.data?.message
            : err instanceof Error
            ? err.message
            : undefined

        setError(errorMessage || 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล')
        setLoading(false)
        return
      }
      setLoading(false)
    }
    
    if (step === 2 && !validateStep2(form, licenseFile, shopImgFile, setError)) return
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

      alert('สมัครสมาชิกพาร์ทเนอร์ร้านค้าสำเร็จ!')
      router.push('/login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
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
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=700&q=80"
            alt="ร้านบาร์/ผับ ยามค่ำคืนพรีเมียม"
            style={styles.heroImage}
          />
          <div style={{
            ...styles.heroOverlay,
            background: 'linear-gradient(160deg, rgba(15,23,42,0.15) 0%, rgba(79,70,229,0.3) 100%)',
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
                  setForm(prev => ({
                    ...prev,
                    pubAddress: `พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    pubAddressLat: lat,
                    pubAddressLng: lng,
                  }))
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
                <button onClick={handleNext} style={styles.nextBtn}>
                  ถัดไป →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }
      `}</style>
    </div>
  )
}
