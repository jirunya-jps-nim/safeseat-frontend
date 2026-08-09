'use client'

// ═══════════════════════════════════════════════════════════════
// app/login/page.tsx — SafeSeat Login Page
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import api from '@/services/api'
import { loginStyles as styles } from '@/lib/styles/loginStyles'
import { validateLogin } from '@/lib/validation/loginValidation'
import { LoginForm } from '@/types'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [role, setRole] = useState<'pub' | 'driver' | 'admin'>('pub')
  const [toast, setToast] = useState<string>('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      showToast('สมัครสำเร็จแล้ว! กรุณารอการตรวจสอบและอนุมัติจากทีม SafeSeat')
    }
    // Reset form fields on page mount and unmount
    setForm({ username: '', password: '' })
    setError('')
    return () => {
      setForm({ username: '', password: '' })
      setError('')
    }
  }, [searchParams])

  const handleRoleChange = (newRole: 'pub' | 'driver' | 'admin') => {
    setRole(newRole)
    setForm({ username: '', password: '' })
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateLogin(form, setError, role)) return

    setLoading(true)
    try {
      if (role === 'pub') {
        const res = await api.post('/pub/login', form)
        const userData = res.data.data
        localStorage.setItem('pub_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })

        if (userData.regisstatus === 'approved' || userData.regisstatus === 'อนุมัติแล้ว') {
          router.push('/pub/dashboard')
        } else {
          router.push('/status')
        }
      } else if (role === 'driver') {
        const res = await api.post('/auth/login', form)
        const userData = res.data
        localStorage.setItem('driver_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })

        if (userData.registerstatus === 'อนุมัติแล้ว') {
          showToast('คุณได้รับการอนุมัติแล้ว สามารถเริ่มงานได้ที่แอปพลิเคชันบนมือถือ (Mobile App)')
        } else {
          router.push('/driver-status')
        }
      } else if (role === 'admin') {
        const res = await api.post('/admin/login', form)
        const userData = res.data.data
        localStorage.setItem('admin_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Navbar showLoginButton={false} />
      <FloatingNav />

      {toast && (
        <div style={{
          position: 'fixed',
          top: 84,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #7C3AED, #1D4ED8)',
          color: '#ffffff',
          padding: '13px 28px',
          borderRadius: 999,
          fontSize: 13.5,
          fontWeight: 700,
          boxShadow: '0 8px 28px rgba(124, 58, 237, 0.40)',
          whiteSpace: 'nowrap',
        }}>
          ✅ {toast}
        </div>
      )}

      {/* Main Layout */}
      <div style={styles.container}>

        {/* ─── Hero Panel (Left 45%) ─── */}
        <div style={styles.heroPanel}>
          <div style={styles.heroOverlay} />
          <img
            src="/images/safeseat_futuristic_dashboard_preview.png"
            alt="Futuristic SafeSeat Dispatch System"
            style={{ ...styles.heroImage, opacity: 0.65 }}
          />
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>🛡️ SAFESEAT DISPATCH SYSTEM</div>
            <h1 style={styles.heroTitle}>
              ไม่ดื่มแล้วขับ<br />ให้เราพาคุณถึงบ้าน
            </h1>
            <p style={styles.heroDesc}>
              บริการผู้ขับขี่แทน พร้อมรับทุกที่ทุกเวลา<br />
              ปลอดภัย — โปร่งใส — เชื่อถือได้
            </p>
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
                onClick={() => handleRoleChange('pub')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'pub' ? styles.roleBtnActive : {}),
                }}
              >
                🏪 ร้านค้า
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'driver' ? styles.roleBtnActive : {}),
                }}
              >
                🚗 คนขับ
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'admin' ? styles.roleBtnActive : {}),
                }}
              >
                🛡️ ผู้ดูแลระบบ
              </button>
            </div>

            {/* Input: Username */}
            <div style={styles.fieldGroup} key={`username-${role}`}>
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
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  autoComplete="off"
                  maxLength={role === 'driver' ? 10 : role === 'admin' ? 30 : 50}
                />
              </div>
            </div>

            {/* Input: Password */}
            <div style={styles.fieldGroup} key={`password-${role}`}>
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
                  autoComplete="new-password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  type="button"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner} />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ →'
              )}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>หรือ</span>
              <div style={styles.dividerLine} />
            </div>

            <p style={styles.registerText}>
              ยังไม่มีบัญชี?{' '}
              <span
                onClick={() => router.push('/register')}
                style={styles.registerLink}
              >
                สมัครสมาชิกฟรี
              </span>
            </p>

            <div style={styles.trustBadge}>
              <span>🔐 ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย 100%</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}