'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import AlertModal from './AlertModal'
import { useTheme } from '../ThemeContext'
import { Shield } from 'lucide-react'

interface NavbarProps {
  showLoginButton?: boolean
}

// แถบเมนูนำทางหลักของเว็บไซต์ (Navigation Bar)
export default function Navbar({ showLoginButton = true }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pubUser, setPubUser] = useState<any>(null)
  const [driverUser, setDriverUser] = useState<any>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('pub_user')
      if (userStr) {
        try {
          setPubUser(JSON.parse(userStr))
        } catch {
          setPubUser(null)
        }
      } else {
        setPubUser(null)
      }

      const driverStr = localStorage.getItem('driver_user')
      if (driverStr) {
        try {
          setDriverUser(JSON.parse(driverStr))
        } catch {
          setDriverUser(null)
        }
      } else {
        setDriverUser(null)
      }
    }
  }, [pathname])

  const closeMobile = () => setMobileOpen(false)
  const openLogoutModal = () => setShowLogoutModal(true)
  const closeLogoutModal = () => setShowLogoutModal(false)
  
  const confirmLogout = () => {
    localStorage.removeItem('pub_user')
    localStorage.removeItem('driver_user')
    setPubUser(null)
    setDriverUser(null)
    router.push('/login')
    closeLogoutModal()
  }

  const handleLogout = () => openLogoutModal()
  const isPubRoute = pathname?.startsWith('/pub')
  const isDriverRoute = pathname?.startsWith('/driver-status')

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 pt-6 px-4">
        <nav className="max-w-5xl mx-auto flex items-center justify-between bg-[var(--color-card)]/90 backdrop-blur-xl border border-[var(--color-border)] rounded-full px-6 py-3 shadow-[0_10px_30px_rgba(35,64,167,0.12)] transition-all">
          
          {}
          <div 
            onClick={() => { closeMobile(); router.push(pubUser ? '/pub/dashboard' : (driverUser ? '/driver-status' : '/')) }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-5 h-5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] rounded-sm rotate-45 group-hover:rotate-180 transition-transform duration-500 shadow-[0_0_15px_rgba(35,64,167,0.7)]"></div>
            <span className="text-lg font-bold font-manrope tracking-tight text-[var(--color-text)]">
              Safe<span className="text-[#2340A7]">Seat</span>
            </span>
            {(pubUser || driverUser) && (
              <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white">
                {pubUser ? 'VENUE' : 'DRIVER'}
              </span>
            )}
          </div>

          {}
          <div className="hidden md:flex items-center gap-8">
            {pubUser || driverUser || isPubRoute || isDriverRoute ? (
              <>
                {pubUser && (
                  <button
                    onClick={() => { closeMobile(); router.push('/pub/dashboard') }}
                    className={`text-sm font-semibold hover:text-[#2340A7] transition-colors cursor-pointer ${pathname === '/pub/dashboard' ? 'text-[#2340A7] font-bold' : 'text-[var(--color-text-muted)]'}`}
                  >
                    🏠 หน้าหลักสถานบันเทิง
                  </button>
                )}
                {driverUser && (
                  <button
                    onClick={() => { closeMobile(); router.push('/driver-status') }}
                    className={`text-sm font-semibold hover:text-[#2340A7] transition-colors cursor-pointer ${pathname === '/driver-status' ? 'text-[#2340A7] font-bold' : 'text-[var(--color-text-muted)]'}`}
                  >
                    📋 สถานะการสมัคร
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => { closeMobile(); router.push('/') }}
                  className={`text-sm font-semibold hover:text-[#2340A7] transition-colors cursor-pointer ${pathname === '/' ? 'text-[var(--color-text)] font-bold' : 'text-[var(--color-text-muted)]'}`}
                >
                  หน้าแรก
                </button>

                {}
                <div ref={dropdownRef} className="relative cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`text-sm font-semibold transition-colors flex items-center gap-1 py-1 cursor-pointer focus:outline-none ${showDropdown ? 'text-[#2340A7] font-bold' : 'text-[var(--color-text-muted)] hover:text-[#2340A7]'}`}
                  >
                    พาร์ทเนอร์ &amp; บริการ <span className={`text-[10px] transition-transform duration-200 ${showDropdown ? 'rotate-180 text-[#2340A7]' : ''}`}>▼</span>
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full left-0 w-60 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-2 shadow-2xl z-50 flex flex-col mt-2 animate-fade-up">
                      <button
                        onClick={() => { setShowDropdown(false); closeMobile(); router.push('/register/documents') }}
                        className="px-4 py-2.5 text-left text-xs font-bold text-[var(--color-text)] hover:text-[#2340A7] hover:bg-[var(--color-card-hover)] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        📄 คู่มือการเตรียมเอกสาร
                      </button>
                      <button
                        onClick={() => { setShowDropdown(false); closeMobile(); router.push('/register/driver') }}
                        className="px-4 py-2.5 text-left text-xs font-bold text-[var(--color-text)] hover:text-[#2340A7] hover:bg-[var(--color-card-hover)] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        🚗 สมัครเป็นพนักงานขับรถ
                      </button>
                      <button
                        onClick={() => { setShowDropdown(false); closeMobile(); router.push('/register/pub') }}
                        className="px-4 py-2.5 text-left text-xs font-bold text-[var(--color-text)] hover:text-[#2340A7] hover:bg-[var(--color-card-hover)] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        🏪 สมัครพาร์ทเนอร์สถานบันเทิง
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { closeMobile(); router.push('/about') }}
                  className={`text-sm font-semibold hover:text-[#2340A7] transition-colors cursor-pointer ${pathname === '/about' ? 'text-[var(--color-text)] font-bold' : 'text-[var(--color-text-muted)]'}`}
                >
                  เกี่ยวกับเรา
                </button>
                <button
                  onClick={() => { closeMobile(); router.push('/help') }}
                  className={`text-sm font-semibold hover:text-[#2340A7] transition-colors cursor-pointer ${pathname === '/help' ? 'text-[var(--color-text)] font-bold' : 'text-[var(--color-text-muted)]'}`}
                >
                  ความปลอดภัย &amp; ช่วยเหลือ
                </button>
              </>
            )}
          </div>

          {}
          <div className="flex items-center gap-3">
            {pubUser || driverUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="theme-switch-btn focus:outline-none"
                  title={`สลับเป็นโหมด ${theme === 'dark' ? 'สว่าง' : 'มืด'}`}
                  aria-label="Toggle Theme"
                >
                  <div className="theme-switch-thumb shadow-md">
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </div>
                </button>
                <span className="hidden md:inline-block text-xs font-semibold px-3 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-card-hover)]">
                  {pubUser ? `🏪 ${pubUser?.pubname || pubUser?.username}` : `🚗 ${driverUser?.firstname || driverUser?.username}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-xs font-bold text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  ออกจากระบบ ➔
                </button>
              </div>
            ) : (
              showLoginButton && (
                <div className="flex items-center gap-3">
                  {}
                  <button
                    onClick={toggleTheme}
                    className="theme-switch-btn focus:outline-none"
                    title={`สลับเป็นโหมด ${theme === 'dark' ? 'สว่าง' : 'มืด'}`}
                    aria-label="Toggle Theme"
                  >
                    <div className="theme-switch-thumb shadow-md">
                      {theme === 'dark' ? '🌙' : '☀️'}
                    </div>
                  </button>

                  {}
                  <button
                    onClick={() => { closeMobile(); router.push('/login') }}
                    style={{ color: '#ffffff' }}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] !text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(35,64,167,0.4)]"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              )
            )}

            {}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[var(--color-text)] text-xl p-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {}
        {mobileOpen && (
          <div className="md:hidden max-w-5xl mx-auto mt-2 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-3 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => { closeMobile(); router.push('/') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              หน้าแรก
            </button>
            <button
              onClick={() => { closeMobile(); router.push('/about') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              เกี่ยวกับเรา
            </button>
            <button
              onClick={() => { closeMobile(); router.push('/register/documents') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              📄 คู่มือการเตรียมเอกสาร
            </button>
            <button
              onClick={() => { closeMobile(); router.push('/register/driver') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              🚗 สมัครเป็นพนักงานขับรถ
            </button>
            <button
              onClick={() => { closeMobile(); router.push('/register/pub') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              🏪 สมัครพาร์ทเนอร์สถานบันเทิง
            </button>
            <button
              onClick={() => { closeMobile(); router.push('/help') }}
              className="text-left text-sm font-semibold text-[var(--color-text)] py-1.5 cursor-pointer"
            >
              ความปลอดภัย &amp; ช่วยเหลือ
            </button>
          </div>
        )}
      </header>

      {}
      <AlertModal
        isOpen={showLogoutModal}
        title="คุณต้องการออกจากระบบใช่หรือไม่?"
        message="เมื่อออกจากระบบ คุณจะต้องลงชื่อเข้าใช้งานใหม่อีกครั้งเพื่อทำรายการต่อ"
        type="confirm"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </>
  )
}
