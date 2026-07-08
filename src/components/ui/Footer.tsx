// ═══════════════════════════════════════════════════════════════
// components/ui/Footer.tsx
// Footer ที่ใช้ร่วมกันทั้งหน้า Login, Register และ Home (สีเข้มข้น ตัวหนังสือชัดเจน)
// ═══════════════════════════════════════════════════════════════

import React from 'react'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      {/* ── ข้อความ Copyright ── */}
      <span style={styles.copyrightText}>© 2026 Safe Seat Application. All rights reserved.</span>

      {/* ── Links นโยบาย ── */}
      <span style={styles.footerLinks}>
        <span style={styles.footerLink}>นโยบายความเป็นส่วนตัว</span>
        <span style={{ color: '#818cf8', margin: '0 8px' }}>·</span>
        <span style={styles.footerLink}>ข้อกำหนดการใช้บริการ</span>
      </span>
    </footer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#0b0f19', // สีพื้นหลังเข้มเหมือน Navbar เพื่อความเป็นเอกภาพ
    borderTop: '1px solid #1e293b',
    fontSize: 12.5,
    position: 'relative',
    zIndex: 5,
  },
  copyrightText: {
    color: '#cbd5e1', // เปลี่ยนเป็นสี Slate-300 เพื่อให้อ่านง่าย ชัดเจน
  },
  footerLinks: { display: 'flex', alignItems: 'center' },
  footerLink: {
    color: '#cbd5e1', // เปลี่ยนเป็นสี Slate-300 อ่านง่ายขึ้น
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
}
