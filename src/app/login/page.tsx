'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import api from '@/services/api'
import { loginStyles as styles } from '@/lib/styles/loginStyles'
import { validateLogin } from '@/lib/validation/loginValidation'
import { LoginForm } from '@/types'
import { Eye, EyeOff } from 'lucide-react'

// หน้าเข้าสู่ระบบ (สำหรับ พาร์ทเนอร์สถานบันเทิง, พนักงานขับรถ, และ ผู้ดูแลระบบ)
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // สถานะฟอร์มและบทบาทผู้ใช้งาน
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
    setError('')
    try {
      if (role === 'pub') {
        const res = await api.post('/pub/login', form)
        if (!res.data || res.data.success === false || res.status >= 400) {
          setError(res.data?.error || res.data?.message || 'ไม่พบข้อมูลผู้ใช้งานในระบบ หรือชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง')
          setLoading(false)
          return
        }
        const userData = res.data.data
        if (!userData || !userData.username) {
          setError('ไม่พบข้อมูลผู้ใช้งานในระบบ')
          setLoading(false)
          return
        }
        const token = res.data.token || userData?.token
        if (token) localStorage.setItem('token', token)
        localStorage.setItem('pub_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })

        if (userData.regisstatus === 'approved' || userData.regisstatus === 'อนุมัติแล้ว') {
          router.push('/pub/dashboard')
        } else {
          router.push('/status')
        }
      } else if (role === 'driver') {
        const res = await api.post('/auth/login', form)
        if (!res.data || res.data.success === false || res.data.error || res.status >= 400) {
          setError(res.data?.error || res.data?.message || 'ไม่พบข้อมูลผู้ใช้งานในระบบ หรือเบอร์โทรศัพท์/รหัสผ่านไม่ถูกต้อง')
          setLoading(false)
          return
        }
        const userData = res.data
        if (!userData || (!userData.username && !userData.phoneno && !userData.driverid && !userData.id)) {
          setError('ไม่พบข้อมูลผู้ใช้งานในระบบ')
          setLoading(false)
          return
        }
        const token = res.data.token || userData?.token
        if (token) localStorage.setItem('token', token)
        localStorage.setItem('driver_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })

        if (userData.registerstatus === 'อนุมัติแล้ว') {
          showToast('คุณได้รับการอนุมัติแล้ว สามารถเริ่มงานได้ที่แอปพลิเคชันบนมือถือ (Mobile App)')
        } else {
          router.push('/driver-status')
        }
      } else if (role === 'admin') {
        const res = await api.post('/admin/login', form)
        if (!res.data || res.data.success === false || res.status >= 400) {
          setError(res.data?.error || res.data?.message || 'ไม่พบข้อมูลผู้ดูแลระบบ หรือชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง')
          setLoading(false)
          return
        }
        const userData = res.data.data
        if (!userData) {
          setError('ไม่พบข้อมูลผู้ดูแลระบบในระบบ')
          setLoading(false)
          return
        }
        const token = res.data.token
        if (token) localStorage.setItem('token', token)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        setForm({ username: '', password: '' })
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'ไม่พบข้อมูลในระบบ หรือเกิดข้อผิดพลาดในการเข้าสู่ระบบ')
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
          background: 'linear-gradient(135deg, #2340A7, #2563EB)',
          color: '#ffffff',
          padding: '13px 28px',
          borderRadius: 999,
          fontSize: 13.5,
          fontWeight: 700,
          boxShadow: '0 8px 28px rgba(35, 64, 167, 0.40)',
          whiteSpace: 'nowrap',
        }}>
          ✅ {toast}
        </div>
      )}

      {}
      <div style={styles.container}>

        {}
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

        {}
        <div style={styles.formPanel}>
          <div style={styles.formInner}>

            {}
            <div style={{ ...styles.formHeader, textAlign: 'center' }}>
              <h2 style={{ ...styles.formTitle, fontSize: '32px', fontWeight: 900, textAlign: 'center' }}>เข้าสู่ระบบ</h2>
              <p style={{ ...styles.formSubtitle, textAlign: 'center', marginTop: '6px' }}>
                ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>

            {}
            <div style={styles.roleToggleContainer}>
              <button
                type="button"
                onClick={() => handleRoleChange('pub')}
                style={{
                  ...styles.roleBtn,
                  ...(role === 'pub' ? styles.roleBtnActive : {}),
                }}
              >
                🏪 สถานบันเทิง
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

            {}
            <div style={styles.fieldGroup} key={`username-${role}`}>
              <label style={styles.label}>
                {role === 'driver' ? 'เบอร์โทรศัพท์ (ชื่อผู้ใช้งาน)' : role === 'admin' ? 'ชื่อผู้ดูแลระบบ (USERNAME)' : 'ชื่อผู้ใช้งาน'}
              </label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  {role === 'driver' ? '📱' : role === 'admin' ? '🛡️' : '👤'}
                </span>
                <input
                  name="username"
                  placeholder={
                    role === 'driver' 
                      ? 'กรุณากรอกเบอร์โทรศัพท์' 
                      : role === 'admin'
                      ? 'กรุณากรอกชื่อผู้ดูแลระบบ'
                      : 'กรุณากรอกชื่อผู้ใช้งาน'
                  }
                  value={form.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  autoComplete="off"
                  maxLength={role === 'driver' ? 10 : 50}
                  inputMode={role === 'driver' ? 'numeric' : 'text'}
                />
              </div>
            </div>

            {}
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
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
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