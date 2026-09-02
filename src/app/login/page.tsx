'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import api from '@/services/api'
import { validateLogin } from '@/lib/validation/loginValidation'
import { LoginForm } from '@/types'
import { Eye, EyeOff, User, Phone, ShieldCheck, Lock, ArrowRight, Building2, Car, Shield } from 'lucide-react'
import { useTheme } from '@/components/ThemeContext'

// หน้าเข้าสู่ระบบ (สำหรับ พาร์ทเนอร์สถานบันเทิง, พนักงานขับรถ, และ ผู้ดูแลระบบ)
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
        router.push('/driver-status')
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
    <div className={`min-h-screen w-full font-inter flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-[#080C1B] text-white' : 'bg-white text-[#0F172A]'
    }`}>
      <Navbar showLoginButton={false} />
      <FloatingNav />

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white px-7 py-3.5 rounded-full text-sm font-bold shadow-xl whitespace-nowrap animate-fade-down">
          ✅ {toast}
        </div>
      )}

      {/* Full Screen Dual-Panel Container */}
      <div className="w-full flex-1 min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* =========================================================================
            LEFT PANEL: HERO & BRANDING ARTWORK (FULL SCREEN EDGE-TO-EDGE)
            ========================================================================= */}
        <div className={`lg:col-span-6 xl:col-span-7 pt-32 pb-16 px-8 sm:px-14 lg:px-16 xl:px-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r relative overflow-hidden transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-[#050714] via-[#090D1E] to-[#0B132B] border-slate-800/80 text-white' 
            : 'bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF]/70 border-slate-200 text-[#0F172A]'
        }`}>
          
          {/* Visual Route & House Vector Graphic Backdrop */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-25 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none" preserveAspectRatio="none">
              {/* Curved Road */}
              <path
                d="M 600 550 C 420 500, 320 320, 200 220 C 140 170, 100 140, 40 120"
                stroke="#2340A7"
                strokeWidth="36"
                strokeLinecap="round"
                className={isDark ? 'opacity-25' : 'opacity-10'}
              />
              <path
                d="M 600 550 C 420 500, 320 320, 200 220 C 140 170, 100 140, 40 120"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeDasharray="10 10"
                className={isDark ? 'opacity-80' : 'opacity-60'}
              />
            </svg>
          </div>

          {/* Top Brand Badge & Slogan */}
          <div className="relative z-10 max-w-xl">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md mb-8 border ${
              isDark 
                ? 'bg-slate-900/90 border-blue-900/40' 
                : 'bg-white/95 border-blue-200/90 shadow-sm'
            }`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className={`text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-[#1D358F]'}`}>
                ระบบบริการผู้ขับขี่แทน SafeSeat
              </span>
            </div>

            {/* Main Slogan */}
            <h2 className={`text-4xl sm:text-5xl lg:text-[54px] font-black font-manrope leading-[1.18] tracking-tight ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}>
              ดื่มแล้วอย่าขับ<br />
              <span className={`text-transparent bg-clip-text ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300' 
                  : 'bg-gradient-to-r from-[#1D358F] via-[#2563EB] to-[#0044C9]'
              }`}>
                ให้เราพาคุณกลับบ้าน
              </span>
            </h2>

            <p className={`text-base sm:text-lg mt-6 leading-relaxed font-medium max-w-lg ${
              isDark ? 'text-slate-300' : 'text-[#475569]'
            }`}>
              บริการผู้ขับขี่แทน พร้อมรับทุกที่ทุกเวลา คัดกรองคนขับทุกคนอย่างเข้มงวด และติดตามเส้นทางแบบเรียลไทม์ตลอดการเดินทาง
            </p>
          </div>

          {/* Bottom Stats Metrics */}
          <div className={`relative z-10 mt-16 pt-8 border-t grid grid-cols-3 gap-6 max-w-xl ${
            isDark ? 'border-slate-800' : 'border-slate-200/90'
          }`}>
            <div>
              <div className={`text-2xl sm:text-3xl font-black font-manrope ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                50,000+
              </div>
              <div className={`text-xs sm:text-sm font-semibold mt-1 ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`}>
                เดินทางปลอดภัยแล้ว
              </div>
            </div>
            <div className={`border-l pl-6 ${isDark ? 'border-slate-800' : 'border-slate-200/90'}`}>
              <div className={`text-2xl sm:text-3xl font-black font-manrope ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                4.9 ★
              </div>
              <div className={`text-xs sm:text-sm font-semibold mt-1 ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`}>
                คะแนนความพึงพอใจ
              </div>
            </div>
            <div className={`border-l pl-6 ${isDark ? 'border-slate-800' : 'border-slate-200/90'}`}>
              <div className={`text-2xl sm:text-3xl font-black font-manrope ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                24/7
              </div>
              <div className={`text-xs sm:text-sm font-semibold mt-1 ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`}>
                พร้อมให้บริการ
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RIGHT PANEL: AUTHENTICATION FORM (FULL SCREEN EDGE-TO-EDGE)
            ========================================================================= */}
        <div className={`lg:col-span-6 xl:col-span-5 pt-32 pb-16 px-8 sm:px-14 lg:px-12 xl:px-16 flex flex-col justify-center items-center transition-colors duration-300 ${
          isDark ? 'bg-[#080C1B] text-white' : 'bg-white text-[#0F172A]'
        }`}>
          <div className="w-full max-w-md">
            
            {/* Form Title & Subtitle */}
            <div className="mb-8 text-left">
              <h1 className={`text-3xl sm:text-4xl font-black font-manrope tracking-tight ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                เข้าสู่ระบบ
              </h1>
              <p className={`text-sm mt-2 font-medium ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`}>
                ยินดีต้อนรับกลับ กรอกข้อมูลเพื่อเข้าใช้งาน
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className={`flex p-1.5 rounded-2xl mb-7 border ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800' 
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => handleRoleChange('pub')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'pub'
                    ? 'bg-[#2340A7] text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>สถานบันเทิง</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'driver'
                    ? 'bg-[#2340A7] text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>คนขับ</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-[#2340A7] text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>ผู้ดูแลระบบ</span>
              </button>
            </div>

            {/* Input: Username / Phone */}
            <div className="mb-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-300' : 'text-[#334155]'
              }`}>
                {role === 'driver' ? 'เบอร์โทรศัพท์ (ชื่อผู้ใช้งาน)' : role === 'admin' ? 'ชื่อผู้ดูแลระบบ (USERNAME)' : 'ชื่อผู้ใช้งาน'}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#94A3B8]">
                  {role === 'driver' ? <Phone className="w-4 h-4" /> : role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </span>
                <input
                  name="username"
                  type={role === 'driver' ? 'tel' : 'text'}
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
                  autoComplete="off"
                  maxLength={role === 'driver' ? 10 : 50}
                  className={`w-full border rounded-xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2340A7]/20 transition-all ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-[#2340A7]' 
                      : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#2340A7]'
                  }`}
                />
              </div>
            </div>

            {/* Input: Password */}
            <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-slate-300' : 'text-[#334155]'
              }`}>
                รหัสผ่าน
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                  className={`w-full border rounded-xl py-3.5 pl-11 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2340A7]/20 transition-all ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-[#2340A7]' 
                      : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#2340A7]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 cursor-pointer transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0F172A]'
                  }`}
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Box */}
            {error && (
              <div className={`mb-6 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                isDark 
                  ? 'bg-red-950/40 border-red-900/60 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ color: '#ffffff' }}
              className="w-full py-4 rounded-xl !text-white font-black text-sm tracking-wide bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1D4ED8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <span className="text-xs text-[#94A3B8] font-bold">หรือ</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>

            {/* Register Link */}
            <p className={`text-center text-xs font-semibold ${
              isDark ? 'text-slate-400' : 'text-[#64748B]'
            }`}>
              ยังไม่มีบัญชี?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className={`font-bold hover:underline cursor-pointer ${
                  isDark ? 'text-blue-400' : 'text-[#2340A7]'
                }`}
              >
                สมัครสมาชิกฟรี
              </button>
            </p>

            {/* Trust Badge */}
            <div className="mt-8 text-center text-[11px] font-semibold text-[#94A3B8]">
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