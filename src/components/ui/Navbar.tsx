'use client'
// ═══════════════════════════════════════════════════════════════
// components/ui/Navbar.tsx
// Navbar ที่ใช้ร่วมกันทั้งหน้า Login, Register และ Home (สีเข้มข้น ตัวหนังสือชัดเจน)
// รองรับ Mobile ด้วย Hamburger Menu
// ═══════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  showLoginButton?: boolean
}

export default function Navbar({ showLoginButton = true }: NavbarProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav style={styles.navbar}>
      {/* ── โลโก้ SafeSeat ── */}
      <div style={styles.logo} onClick={() => { closeMobile(); router.push('/') }}>
        <span style={styles.logoIcon}>🛡️</span>
        <span style={styles.logoText}>
          Safe<span style={styles.logoAccent}>Seat</span>
        </span>
      </div>

      {/* ── Hamburger Toggle (mobile only) ── */}
      <button
        className="navbar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* ── เมนูด้านขวา ── */}
      <div className={`nav-links-wrapper${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Close button inside mobile overlay */}
        <button className="nav-close-btn" onClick={closeMobile} style={{ display: 'none' }}>
          ✕
        </button>

        <div
          style={styles.dropdownContainer}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span style={styles.navLink} onClick={() => { closeMobile(); router.push('/register') }}>
            สมัครเป็นพาร์ทเนอร์ <span style={{ fontSize: '10px', marginLeft: '2px', verticalAlign: 'middle' }}>▼</span>
          </span>
          {showDropdown && (
            <div style={styles.dropdownMenu}>
              <div
                className="nav-dropdown-item"
                style={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false)
                  closeMobile()
                  router.push('/register/documents')
                }}
              >
                ตัวอย่างเอกสารการสมัคร
              </div>
              <div
                className="nav-dropdown-item"
                style={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false)
                  closeMobile()
                  router.push('/register/driver')
                }}
              >
                ผู้ให้บริการขับรถ
              </div>
              <div
                className="nav-dropdown-item"
                style={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false)
                  closeMobile()
                  router.push('/register/pub')
                }}
              >
                ผู้ประกอบการสถานบันเทิง
              </div>
            </div>
          )}
        </div>

        <span style={styles.navLink} className="nav-link-hover" onClick={() => { closeMobile(); router.push('/about') }}>เกี่ยวกับเรา</span>
        <span style={styles.navLink} className="nav-link-hover" onClick={() => { closeMobile(); router.push('/help') }}>ศูนย์ช่วยเหลือ</span>

        {showLoginButton && (
          <button
            onClick={() => { closeMobile(); router.push('/login') }}
            style={styles.navLoginBtn}
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>

      <style>{`
        .nav-dropdown-item {
          padding: 10px 16px;
          color: #cbd5e1 !important;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          border-radius: 6px;
          margin: 0 4px;
        }
        .nav-dropdown-item:hover {
          background-color: rgba(79, 70, 229, 0.2) !important;
          color: #ffffff !important;
        }
        .nav-link-hover:hover {
          color: #818cf8 !important;
        }
        /* Show close button only in mobile overlay */
        @media (max-width: 768px) {
          .nav-close-btn {
            display: block !important;
          }
          .nav-links-wrapper {
            font-size: 18px !important;
          }
          .nav-links-wrapper span, .nav-links-wrapper button {
            font-size: 18px !important;
          }
        }
      `}</style>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 40px',
    backgroundColor: '#0b0f19',
    borderBottom: '1px solid #1e293b',
    position: 'relative',
    zIndex: 10,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontWeight: 700,
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  logoAccent: { color: '#818cf8' },
  navLink: {
    cursor: 'pointer',
    color: '#e2e8f0',
    fontSize: 14.5,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  dropdownContainer: {
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '12px',
    marginBottom: '-12px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0b0f19',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '6px 0',
    marginTop: '6px',
    width: '200px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.15)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownItem: {
    cursor: 'pointer',
    textAlign: 'left',
  },
  navLoginBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    border: 'none',
    color: '#fff',
    padding: '8px 22px',
    borderRadius: 24,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
  },
}
