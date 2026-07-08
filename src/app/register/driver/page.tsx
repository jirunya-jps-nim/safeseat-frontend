'use client'
// ═══════════════════════════════════════════════════════════════
// app/register/driver/page.tsx
// หน้าสมัครสมาชิกสำหรับคนขับรถสำรอง (Driver - Unified Light Theme)
// รูปแบบเดียวกับหน้าสมัครพาร์ทเนอร์ร้านค้า (Pub) โดยใช้ธีมสีสว่าง
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Shared Components ─────────────────────────────────────────
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

// ── Register Step Components ──────────────────────────────────
import {
  StepDriverPersonalInfo,
  StepDriverVehicleInfo,
  StepDriverDocuments,
  StepDriverTraining,
} from '@/components/register'

// ── Services ──────────────────────────────────────────────────
import api from '@/services/api'

// ── Styles & Validation ───────────────────────────────────────
import { registerStyles as styles } from '@/lib/styles/registerStyles'
import {
  validateDriverStep1,
  validateDriverStep2,
  validateDriverFile,
} from '@/lib/validation/driverRegisterValidation'

// ── Types ─────────────────────────────────────────────────────
import { DriverRegisterForm, StepConfig } from '@/types'

const STEPS: StepConfig[] = [
  { label: 'ข้อมูลส่วนตัว & บัญชี', icon: '👤' },
  { label: 'ข้อมูลยานพาหนะ',   icon: '🚗' },
  { label: 'เอกสารประกอบการสมัคร', icon: '📄' },
  { label: 'การอบรม', icon: '🎓' },
]

const INITIAL_DRIVER_FORM: DriverRegisterForm = {
  firstName: '',
  lastName: '',
  idCard: '',
  email: '',
  bankAccountNo: '',
  gender: '',
  phoneNo: '',
  carBrand: '',
  carModel: '',
  carColor: '',
  carPlate: '',
  driverSkills: [],
  username: '',
  password: '',
}

export default function RegisterDriverPage() {
  const router = useRouter()

  const [step, setStep] = useState<number>(1)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)
  const [trainingAccepted, setTrainingAccepted] = useState<boolean>(false)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)

  const [form, setForm] = useState<DriverRegisterForm>(INITIAL_DRIVER_FORM)

  const [files, setFiles] = useState<{
    regisImagePath: File | null
    carImagePath: File | null
    driverLicensePath: File | null
    criminalRecordPath: File | null
    medicalCertificatePath: File | null
    trainingCert1: File | null
    trainingCert2: File | null
    trainingCert3: File | null
    trainingCert4: File | null
  }>({
    regisImagePath: null,
    carImagePath: null,
    driverLicensePath: null,
    criminalRecordPath: null,
    medicalCertificatePath: null,
    trainingCert1: null,
    trainingCert2: null,
    trainingCert3: null,
    trainingCert4: null,
  })

  const [previews, setPreviews] = useState<{
    profile: string | null
    car: string | null
    license: string | null
  }>({
    profile: null,
    car: null,
    license: null,
  })

  const profileRef = useRef<HTMLInputElement>(null)
  const carRef = useRef<HTMLInputElement>(null)
  const licenseRef = useRef<HTMLInputElement>(null)
  const criminalRef = useRef<HTMLInputElement>(null)
  const medicalRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (files.regisImagePath) {
      const url = URL.createObjectURL(files.regisImagePath)
      setPreviews((prev) => ({ ...prev, profile: url }))
      return () => URL.revokeObjectURL(url)
    }
  }, [files.regisImagePath])

  useEffect(() => {
    if (files.carImagePath) {
      const url = URL.createObjectURL(files.carImagePath)
      setPreviews((prev) => ({ ...prev, car: url }))
      return () => URL.revokeObjectURL(url)
    }
  }, [files.carImagePath])

  useEffect(() => {
    if (files.driverLicensePath) {
      const url = URL.createObjectURL(files.driverLicensePath)
      setPreviews((prev) => ({ ...prev, license: url }))
      return () => URL.revokeObjectURL(url)
    }
  }, [files.driverLicensePath])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleToggleSkill = (skill: string): void => {
    const currentSkills = [...form.driverSkills]
    if (currentSkills.includes(skill)) {
      setForm({
        ...form,
        driverSkills: currentSkills.filter((s) => s !== skill),
      })
    } else {
      setForm({
        ...form,
        driverSkills: [...currentSkills, skill],
      })
    }
    setError('')
  }

  const handleFileSelect = (fieldName: string, file: File | null): void => {
    if (!file) return

    let label = ''
    switch (fieldName) {
      case 'regisImagePath':
        label = 'รูปภาพใบหน้าตนเอง'
        break
      case 'carImagePath':
        label = 'รูปภาพรถยนต์'
        break
      case 'driverLicensePath':
        label = 'รูปภาพใบขับขี่'
        break
      case 'criminalRecordPath':
        label = 'รูปประวัติอาชญากรรม'
        break
      case 'medicalCertificatePath':
        label = 'ใบรับรองแพทย์'
        break
    }

    if (!validateDriverFile(file, label, setError)) {
      return
    }

    setFiles((prev) => ({ ...prev, [fieldName]: file }))
    setError('')
  }

  const handleNext = (): void => {
    setError('')

    if (step === 1) {
      if (!validateDriverStep1(form, setError)) return
      if (!form.password) {
        setError('กรุณากรอกรหัสผ่าน')
        return
      }
      if (!/^[a-zA-Z0-9!#_.]{6,50}$/.test(form.password)) {
        setError('รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข และอักขระพิเศษ [!#_.] เท่านั้น ความยาว 6 - 50 ตัวอักษร และต้องไม่มีช่องว่าง')
        return
      }
      if (!files.regisImagePath) {
        setError('กรุณาแนบรูปภาพใบหน้าตนเอง')
        return
      }
      if (form.driverSkills.length === 0) {
        setError('กรุณาเลือกความสามารถในการขับรถอย่างน้อย 1 ประเภท')
        return
      }
    }

    if (step === 2) {
      if (!validateDriverStep2(form, setError)) return
      if (!files.carImagePath) {
        setError('กรุณาแนบรูปภาพรถยนต์ของคุณ')
        return
      }
      if (!termsAccepted) {
        setError('กรุณายอมรับนโยบายข้อมูลส่วนตัวก่อนดำเนินการต่อ')
        return
      }
    }

    if (step === 3) {
      if (!files.driverLicensePath) {
        setError('กรุณาแนบรูปภาพใบขับขี่')
        return
      }
      if (!files.criminalRecordPath) {
        setError('กรุณาแนบประวัติอาชญากรรม')
        return
      }
      if (!files.medicalCertificatePath) {
        setError('กรุณาแนบใบรับรองแพทย์ตรวจสุขภาพ')
        return
      }
    }

    setStep(step + 1)
  }

  const handleBack = (): void => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (): Promise<void> => {
    setError('')

    if (!files.driverLicensePath) {
      setError('กรุณาแนบรูปภาพใบขับขี่')
      return
    }
    if (!files.criminalRecordPath) {
      setError('กรุณาแนบประวัติอาชญากรรม')
      return
    }
    if (!files.medicalCertificatePath) {
      setError('กรุณาแนบใบรับรองแพทย์ตรวจสุขภาพ')
      return
    }
    if (!files.trainingCert1) {
      setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 1')
      return
    }
    if (!files.trainingCert2) {
      setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 2')
      return
    }
    if (!files.trainingCert3) {
      setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 3')
      return
    }
    if (!files.trainingCert4) {
      setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 4')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()

      fd.append('firstName', form.firstName)
      fd.append('lastName', form.lastName)
      fd.append('phoneNo', form.phoneNo)
      fd.append('idCard', form.idCard)
      fd.append('email', form.email)
      fd.append('gender', form.gender)
      fd.append('bankAccountNo', form.bankAccountNo)
      fd.append('carBrand', form.carBrand)
      fd.append('carModel', form.carModel)
      fd.append('carColor', form.carColor)
      fd.append('carPlate', form.carPlate)
      
      fd.append('username', form.phoneNo)
      fd.append('password', form.password)

      form.driverSkills.forEach((skill) => {
        fd.append('driverSkills', skill)
      })

      fd.append('regisImagePath', files.regisImagePath!)
      fd.append('carImagePath', files.carImagePath!)
      fd.append('driverLicensePath', files.driverLicensePath!)
      fd.append('criminalRecordPath', files.criminalRecordPath!)
      fd.append('medicalCertificatePath', files.medicalCertificatePath!)
      fd.append('trainingCert1Path', files.trainingCert1!)
      fd.append('trainingCert2Path', files.trainingCert2!)
      fd.append('trainingCert3Path', files.trainingCert3!)
      fd.append('trainingCert4Path', files.trainingCert4!)

      const response = await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data && response.data.success) {
        setIsRegistered(true)
      } else {
        setError(response.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน')
      }
    } catch (err: unknown) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response: { data?: { error?: string; message?: string } } }).response?.data?.error || 
            (err as { response: { data?: { error?: string; message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : undefined

      setError(errorMessage || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <div style={styles.page}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.bgCircle3} />

        <Navbar showLoginButton={false} />

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          zIndex: 5,
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '24px',
            padding: '50px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeUp 0.5s ease both',
          }}>
            {/* success tick animated wrapper */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              color: '#137333',
              marginBottom: '28px',
              boxShadow: '0 8px 16px rgba(19, 115, 51, 0.1)',
            }}>
              ✓
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '16px',
            }}>
              ส่งใบสมัครพาร์ทเนอร์คนขับสำเร็จ! 🎉
            </h1>
            
            <p style={{
              fontSize: '15px',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px',
            }}>
              ข้อมูลสมัครสมาชิกพนักงานขับรถของคุณได้รับการส่งเข้าสู่ระบบแล้ว คุณสามารถติดตามสถานะการพิจารณาใบสมัครของคุณได้โดยการเข้าสู่ระบบผ่านหน้าเว็บไซต์
            </p>

            {/* Crucial Driver Login Notice Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '580px',
              textAlign: 'left',
              marginBottom: '36px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '12px',
              }}>
                📱 ขั้นตอนการเข้าสู่ระบบสำหรับคนขับ
              </h3>
              <p style={{
                fontSize: '14.5px',
                color: '#475569',
                lineHeight: 1.6,
                margin: 0,
              }}>
                การรับงาน การเปิดระบบ และการทำงานทั้งหมดของคนขับจะใช้งานผ่าน{' '}
                <strong style={{ color: '#4f46e5' }}>แอปพลิเคชัน SafeSeat บนมือถือ (Mobile App)</strong>{' '}
                เท่านั้น (บนเว็บไซต์จะใช้สำหรับการเช็คสถานะการสมัครเท่านั้น)
              </p>
              
              <div style={{
                display: 'flex',
                gap: 16,
                marginTop: '20px',
                flexWrap: 'wrap',
              }}>
                {/* Mock Download Badges */}
                <div style={{
                  background: '#000000',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #334155',
                }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase' }}>Get it on</div>
                    <div style={{ fontWeight: 600 }}>Google Play</div>
                  </div>
                </div>

                <div style={{
                  background: '#000000',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #334155',
                }}>
                  <span style={{ fontSize: 18 }}>🍏</span>
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase' }}>Download on the</div>
                    <div style={{ fontWeight: 600 }}>App Store</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: 16,
              width: '100%',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                }}
              >
                🏠 กลับสู่หน้าหลัก
              </button>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <Navbar />

      {/* Main Layout: หน้าสมัครคนขับ มีรูปแบบเดียวกันกับหน้าสมัครผับ */}
      <div style={styles.main}>

        {/* ─── Hero Panel (Left 40% - Driver Bright Vibe) ─── */}
        <div style={styles.heroPanel}>
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=700&q=80"
            alt="บริการขับรถยนต์ส่วนบุคคล"
            style={styles.heroImage}
          />
          {/* Overlay อ่อนโยนเพื่อให้เข้ากับภาพขับรถ */}
          <div style={{
            ...styles.heroOverlay,
            background: 'linear-gradient(160deg, rgba(16,185,129,0.15) 0%, rgba(79,70,229,0.3) 100%)',
          }} />
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>🚗 สมัครเป็นคนขับ SafeSeat</div>
            <h1 style={styles.heroTitle}>
              สร้างรายได้เสริม<br />จากการบริการขับรถ
            </h1>
            <p style={styles.heroDesc}>
              ให้บริการขับขี่แทนลูกค้าด้วยรถของลูกค้าเอง<br />
              ร่วมงานกันอย่างเป็นมืออาชีพและปลอดภัย
            </p>

            {/* Progress Steps ใน Hero */}
            <div style={styles.heroSteps}>
              {STEPS.map((s, i) => (
                <div key={i} style={styles.heroStep}>

                  <div
                    style={{
                      ...styles.heroStepDot,
                      backgroundColor:
                        step > i + 1  ? '#10b981' // ผ่านแล้ว → สีเขียวมรกต
                        : step === i + 1 ? '#ffffff' // ปัจจุบัน → ขาว
                        : 'rgba(255,255,255,0.25)', // ยังไม่ถึง
                      border:
                        step === i + 1
                          ? '2px solid #10b981'
                          : '2px solid transparent',
                      color: step === i + 1 ? '#111827' : '#ffffff',
                    }}
                  >
                    {step > i + 1 ? (
                      <span style={{ fontSize: 12, color: '#ffffff' }}>✓</span>
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
                        backgroundColor: step > i + 1 ? '#10b981' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Form Panel (Right) ─── */}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>

            {/* Header ฟอร์ม */}
            <div style={styles.formHeader}>
              <div style={styles.formIconWrap}>
                <span style={{ fontSize: 24 }}>{STEPS[step - 1].icon}</span>
              </div>
              <h2 style={styles.formTitle}>{STEPS[step - 1].label}</h2>
              <p style={styles.formSubtitle}>
                ขั้นตอนที่ {step} จาก {STEPS.length}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  width: `${(step / STEPS.length) * 100}%`,
                }}
              />
            </div>

            {/* Step Content */}
            {step === 1 && (
              <StepDriverPersonalInfo
                form={form}
                onChange={handleChange}
                onToggleSkill={handleToggleSkill}
                profileFile={files.regisImagePath}
                profileRef={profileRef}
                onProfileChange={(e) => handleFileSelect('regisImagePath', e.target.files?.[0] || null)}
              />
            )}

            {step === 2 && (
              <StepDriverVehicleInfo
                form={form}
                onChange={handleChange}
                carFile={files.carImagePath}
                carRef={carRef}
                onCarChange={(e) => handleFileSelect('carImagePath', e.target.files?.[0] || null)}
                termsAccepted={termsAccepted}
                onToggleTerms={() => setTermsAccepted(!termsAccepted)}
              />
            )}

            {step === 3 && (
              <StepDriverDocuments
                files={files}
                onFileSelect={handleFileSelect}
                refs={{
                  licenseRef,
                  criminalRef,
                  medicalRef,
                }}
              />
            )}

            {step === 4 && (
              <StepDriverTraining
                files={files}
                onFileSelect={handleFileSelect}
              />
            )}

            {error && <div style={styles.errorBox}>⚠️ {error}</div>}

            {/* Navigation Row */}
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
                <button onClick={handleNext} style={{ ...styles.nextBtn, backgroundColor: '#10b981' }}>
                  ถัดไป →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ ...styles.nextBtn, backgroundColor: '#10b981', opacity: loading ? 0.75 : 1 }}
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

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
