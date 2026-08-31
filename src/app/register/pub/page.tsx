'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

import StepShopInfo from '@/components/register/StepShopInfo'
import StepDocuments from '@/components/register/StepDocuments'
import StepAccount from '@/components/register/StepAccount'

import api from '@/services/api'

import { registerStyles as styles } from '@/lib/styles/registerStyles'
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateLicenseFile,
  validateShopImageFile,
} from '@/lib/validation/registerValidation'

import { RegisterForm, StepConfig } from '@/types'

const STEPS: StepConfig[] = [
  { label: 'ข้อมูลสถานบันเทิง',    icon: '🏪' },
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

  useEffect(() => {
    // Clear saved draft from localStorage on reload or fresh mount so form is always reset
    localStorage.removeItem('pub_draft_form')

    const handleBeforeUnload = () => {
      localStorage.removeItem('pub_draft_form')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const updated = { ...form, [e.target.name]: e.target.value }
    setForm(updated)
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
      if ('response' in err && (err as { response?: { data?: { error?: string; message?: string } | string } }).response?.data) {
        const resData = (err as { response: { data: { error?: string; message?: string } | string } }).response.data
        if (typeof resData === 'string') return resData
        return resData.error || resData.message || defaultMsg
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
      if (!validateStep1(form, setError)) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      
      setLoading(true)
      try {
        const res = await api.post('/pub/check-email', { 
          pubName: form.pubName, 
          pubEmail: form.pubEmail, 
          pubPhone: form.pubPhone 
        })
        if (res.status >= 400 || res.data?.success === false || res.data?.error) {
          setError(res.data?.error || res.data?.message || 'ชื่อสถานประกอบการ อีเมล หรือหมายเลขโทรศัพท์นี้ถูกใช้งานแล้วในระบบ')
          setLoading(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
      } catch (err: unknown) {
        setError(parseApiError(err, 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ'))
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setLoading(false)
    }
    
    if (step === 2) {
      if (!validateStep2(form, licenseFile, shopImgFile, setError)) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      
      setLoading(true)
      try {
        const res = await api.post('/pub/check-email', { 
          taxNumber: form.taxNumber, 
          bankAccountNo: form.bankAccountNo 
        })
        if (res.status >= 400 || res.data?.success === false || res.data?.error) {
          setError(res.data?.error || res.data?.message || 'เลขผู้เสียภาษีหรือเลขบัญชีธนาคารนี้ถูกใช้งานแล้วในระบบ')
          setLoading(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
      } catch (err: unknown) {
        setError(parseApiError(err, 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ'))
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setLoading(false)
    }
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = (): void => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async (): Promise<void> => {
    setError('')

    // Validate Step 1
    if (!validateStep1(form, setError)) {
      setStep(1)
      return
    }

    // Validate Step 2
    if (!validateStep2(form, licenseFile, shopImgFile, setError)) {
      setStep(2)
      return
    }

    // Validate Step 3
    if (!validateStep3(form, termsAccepted, setError)) {
      setStep(3)
      return
    }

    setLoading(true)
    try {
      // Check username duplicate before uploading
      const userCheck = await api.post('/pub/check-email', { username: form.username })
      if (userCheck.status >= 400 || userCheck.data?.success === false || userCheck.data?.error) {
        setError(userCheck.data?.error || userCheck.data?.message || 'ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ')
        setLoading(false)
        setStep(3)
        return
      }

      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })

      if (licenseFile) fd.append('regisImagePath', licenseFile)
      if (shopImgFile)  fd.append('pubImagePath',  shopImgFile)

      const res = await api.post('/pub/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data && res.data.success) {
        localStorage.removeItem('pub_draft_form')
        router.push('/login?registered=1')
      } else {
        const msg = res.data?.error || res.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง'
        setError(msg)
        if (msg.includes('อีเมล') || msg.includes('โทรศัพท์') || msg.includes('ร้าน') || msg.includes('แผนที่') || msg.includes('ปักหมุด')) {
          setStep(1)
        } else if (msg.includes('ผู้เสียภาษี') || msg.includes('บัญชี') || msg.includes('ใบอนุญาต') || msg.includes('รูปหน้าร้าน')) {
          setStep(2)
        } else if (msg.includes('ชื่อผู้ใช้') || msg.includes('รหัสผ่าน') || msg.includes('เงื่อนไข')) {
          setStep(3)
        }
      }
    } catch (err: unknown) {
      const msg = parseApiError(err, 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง')
      setError(msg)
      if (msg.includes('อีเมล') || msg.includes('โทรศัพท์') || msg.includes('ร้าน') || msg.includes('แผนที่') || msg.includes('ปักหมุด')) {
        setStep(1)
      } else if (msg.includes('ผู้เสียภาษี') || msg.includes('บัญชี') || msg.includes('ใบอนุญาต') || msg.includes('รูปหน้าร้าน')) {
        setStep(2)
      } else if (msg.includes('ชื่อผู้ใช้') || msg.includes('รหัสผ่าน') || msg.includes('เงื่อนไข')) {
        setStep(3)
      }
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

        {}
        <div style={styles.heroPanel}>
          <img
            src="/images/safeseat_futuristic_dashboard_preview.png"
            alt="Futuristic SafeSeat Dispatch System"
            style={{ ...styles.heroImage, opacity: 0.65 }}
          />
          <div style={{
            ...styles.heroOverlay,
            background: 'linear-gradient(160deg, rgba(5,7,20,0.85) 0%, rgba(35,64,167,0.4) 100%)',
          }} />
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>🏪 พาร์ทเนอร์สถานบริการ</div>
            <h1 style={styles.heroTitle}>
              ร่วมเป็นส่วนหนึ่ง<br />ของความปลอดภัย
            </h1>
            <p style={styles.heroDesc}>
              เชื่อมต่อกับแพลตฟอร์มที่ดูแลผู้ใช้บริการของคุณ<br />
              หลังจากปิดสถานบันเทิง — ปลอดภัยทุกเส้นทาง
            </p>

            {}
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

        {}
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

            {error && (
              <div style={{ ...styles.errorBox, marginBottom: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            {}
            {step === 1 && (
              <StepShopInfo
                form={form}
                onChange={handleChange}
                onPin={(lat: number, lng: number, label?: string) => {
                  const updated = {
                    ...form,
                    pubAddress: label || `พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    pubAddressLat: lat,
                    pubAddressLng: lng,
                  }
                  setForm(updated)
                }}
                inputStyle={styles.input}
                errorMessage={error}
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
                errorMessage={error}
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
                errorMessage={error}
              />
            )}

            {}
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
