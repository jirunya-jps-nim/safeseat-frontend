'use client'
// ═══════════════════════════════════════════════════════════════
// app/login/page.tsx
// หน้าเข้าสู่ระบบสำหรับเจ้าของสถานประกอบการ (Pub)
//
// การทำงาน:
//  1. ผู้ใช้กรอก username + password
//  2. กด "เข้าสู่ระบบ" หรือ Enter
//  3. validate ข้อมูล → POST /pub/login
//  4. เก็บข้อมูล user ลง localStorage → redirect ไป /dashboard
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Shared Components ─────────────────────────────────────────
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

// ── Services ──────────────────────────────────────────────────
import api from '@/services/api' // Axios instance ชี้ไป localhost:5000/api

// ── Styles & Validation ───────────────────────────────────────
import { loginStyles as styles } from '@/lib/styles/loginStyles'
import { validateLogin } from '@/lib/validation/loginValidation'

// ── Types ─────────────────────────────────────────────────────
import { LoginForm } from '@/types'

export default function LoginPage() {
  // useRouter: ใช้ navigate ไปหน้าอื่นโดยไม่ reload
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────
  // form: เก็บค่าที่ผู้ใช้พิมพ์ใน input แบบ controlled component
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  // error: ข้อความ error ที่แสดงใต้ form ('' = ไม่มี error)
  const [error, setError] = useState<string>('')
  // loading: true ขณะรอ API ตอบกลับ (แสดง spinner + ปิด button)
  const [loading, setLoading] = useState<boolean>(false)
  // showPassword: toggle แสดง/ซ่อนรหัสผ่าน
  const [showPassword, setShowPassword] = useState<boolean>(false)
  // role: เลือกว่าจะเข้าสู่ระบบในฐานะ Pub, Driver หรือ Admin
  const [role, setRole] = useState<'pub' | 'driver' | 'admin'>('pub')

  // ── Handler: เมื่อพิมพ์ใน input ───────────────────────────────
  // ใช้ [e.target.name] เป็น key เพื่อ update field ที่ถูกต้องใน form object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('') // ล้าง error ทุกครั้งที่พิมพ์
  }

  // ── Handler: กด Enter ใน input ──────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSubmit() // submit เมื่อกด Enter
  }

  // ── Handler: Submit Login ────────────────────────────────────
  const handleSubmit = async (): Promise<void> => {
    if (!validateLogin(form, setError, role)) return

    setLoading(true)
    try {
      if (role === 'pub') {
        const res = await api.post('/pub/login', form)
        const userData = res.data.data
        localStorage.setItem('pub_user', JSON.stringify(userData))

        if (userData.regisstatus === 'approved') {
          router.push('/pub/dashboard')
        } else {
          router.push('/status')
        }
      } else if (role === 'driver') {
        // Driver login
        const res = await api.post('/auth/login', form)
        // Data structure returned by driver login is direct user object
        const userData = res.data
        localStorage.setItem('driver_user', JSON.stringify(userData))

        if (userData.registerstatus === 'อนุมัติแล้ว') {
          // If approved, show alert (in a real app, might redirect to a specific page or show modal)
          alert('คุณได้รับการอนุมัติแล้ว สามารถเริ่มงานได้ที่แอปพลิเคชันบนมือถือ (Mobile App)')
        } else {
          router.push('/driver-status')
        }
      } else if (role === 'admin') {
        // Admin login
        const res = await api.post('/admin/login', form)
        const userData = res.data.data
        localStorage.setItem('admin_user', JSON.stringify(userData))
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }


  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* วงกลมตกแต่งพื้นหลัง — ใช้ radial-gradient สร้าง glow effect */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      {/* Navbar: ซ่อนปุ่ม "เข้าสู่ระบบ" เพราะอยู่ในหน้านี้แล้ว */}
      <Navbar showLoginButton={false} />

      {/* Main Layout: แบ่ง 2 คอลัมน์ — Hero ซ้าย + Form ขวา */}
      <div style={styles.container}>

        {/* ─── Hero Panel (Left 45%) ─── */}
        <div style={styles.heroPanel}>
          {/* Gradient overlay ทับรูปภาพเพื่อให้ข้อความอ่านออก */}
          <div style={styles.heroOverlay} />
          {/* รูปภาพพื้นหลัง */}
          <img
            src="/hero-login.png"
            alt="บริการผู้ให้บริการขับขี่แทนและสถานประกอบการ"
            style={styles.heroImage}
          />
          {/* Content ทับบนรูป (position:absolute zIndex:2) */}
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>🛡️ ปลอดภัยทุกเส้นทาง</div>
            <h1 style={styles.heroTitle}>
              ไม่ดื่มแล้วขับ<br />ให้เราพาคุณถึงบ้าน
            </h1>
            <p style={styles.heroDesc}>
              บริการผู้ขับขี่แทน พร้อมรับทุกที่ทุกเวลา<br />
              ปลอดภัย — โปร่งใส — เชื่อถือได้
            </p>
            {/* Stat bar แสดงตัวเลขน่าสนใจ */}
            <div style={styles.heroStats}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>50K+</span>
                <span style={styles.statLabel}>เดินทางปลอดภัย</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>4.9★</span>
                <span style={styles.statLabel}>คะแนนผู้ใช้</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>24/7</span>
                <span style={styles.statLabel}>พร้อมให้บริการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Form Panel (Right flex:1) ─── */}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>

            {/* Form Header */}
            <div style={styles.formHeader}>
              <div style={styles.formIconWrap}>
                <span style={{ fontSize: 28 }}>🔐</span>
              </div>
              <h2 style={styles.formTitle}>เข้าสู่ระบบ</h2>
              <p style={styles.formSubtitle}>
                ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>

            {/* ── Role Toggle ── */}
            <div style={styles.roleToggleContainer}>
              <button
                type="button"
                onClick={() => setRole('pub')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'pub' ? styles.roleBtnActive : {}),
                }}
              >
                🏪 ร้านค้า
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'driver' ? styles.roleBtnActive : {}),
                }}
              >
                🚗 คนขับ
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'admin' ? styles.roleBtnActive : {}),
                }}
              >
                🛡️ ผู้ดูแลระบบ
              </button>
            </div>

            {/* Input: ชื่อผู้ใช้ */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {role === 'driver' ? 'เบอร์โทรศัพท์ (ชื่อผู้ใช้งาน)' : role === 'admin' ? 'ชื่อผู้ดูแลระบบ (username)' : 'ชื่อผู้ใช้งาน'}
              </label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  {role === 'driver' ? '📱' : role === 'admin' ? '🛡️' : '👤'}
                </span>
                <input
                  name="username"
                  placeholder={
                    role === 'driver' 
                      ? 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก' 
                      : role === 'admin'
                      ? 'กรุณากรอกชื่อผู้ดูแลระบบ 6-30 ตัวอักษร'
                      : 'กรุณากรอกชื่อผู้ใช้งาน'
                  }
                  value={form.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown} // กด Enter = submit
                  style={styles.input}
                  autoComplete="username"
                  maxLength={role === 'driver' ? 10 : role === 'admin' ? 30 : 50}
                />
              </div>
            </div>


            {/* Input: รหัสผ่าน (พร้อมปุ่มตา) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>รหัสผ่าน</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  style={{ ...styles.input, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                {/* ปุ่มตา toggle แสดง/ซ่อนรหัสผ่าน */}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  type="button"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {/* แสดง error box เมื่อมี error (short-circuit evaluation) */}
            {error && (
              <div style={styles.errorBox}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* ปุ่ม Submit — disabled เมื่อ loading เพื่อป้องกันกด 2 ครั้ง */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {/* แสดง spinner หรือข้อความตาม loading state */}
              {loading ? (
                <>
                  <span style={styles.spinner} /> {/* CSS animation spin */}
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ →'
              )}
            </button>

            {/* Divider ── หรือ ── */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>หรือ</span>
              <div style={styles.dividerLine} />
            </div>

            {/* ลิงก์สมัครสมาชิก */}
            <p style={styles.registerText}>
              ยังไม่มีบัญชี?{' '}
              <span
                onClick={() => router.push('/register')}
                style={styles.registerLink}
              >
                สมัครสมาชิกฟรี
              </span>
            </p>

            {/* Trust badge */}
            <div style={styles.trustBadge}>
              <span>🔐 ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย 100%</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Inline CSS สำหรับ animation และ Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }

        input:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15) !important;
        }

        /* animation สำหรับ spinner */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* animation เมื่อ page โหลด */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// Add these styles to the bottom
Object.assign(styles, {
  formInner: {
    width: '100%',
    maxWidth: 480, // Expanded to give roles toggle room and look cleaner
    padding: '32px 40px',
  },
  roleToggleContainer: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '6px',
    borderRadius: '14px',
    marginBottom: '24px',
    gap: '6px',
    width: '100%',
  },
  roleBtn: {
    flex: 1,
    padding: '12px 14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  },
  roleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    boxShadow: '0 4px 12px rgba(79,70,229,0.12)',
  }
})