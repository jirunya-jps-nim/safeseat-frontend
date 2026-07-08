// ═══════════════════════════════════════════════════════════════
// components/ui/Field.tsx
// Generic wrapper สำหรับ form field (รองรับการปรับแต่งสีเพื่อการแสดงผลธีมมืด/สว่าง)
// ═══════════════════════════════════════════════════════════════

import React from 'react'

interface FieldProps {
  label: string             // ข้อความ label เช่น "ชื่อสถานประกอบการ *"
  icon: string              // emoji icon เช่น "🏪"
  children: React.ReactNode // input หรือ element ใดก็ได้ที่อยู่ข้างใน
  color?: string            // กำหนดสีของข้อความ label เอง (เช่น สำหรับธีมมืด)
}

export default function Field({ label, icon, children, color }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ ...styles.label, color: color || '#475569' }}>
        {icon} {label}
      </label>
      {children}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 500,
    marginBottom: 6,
  },
}
