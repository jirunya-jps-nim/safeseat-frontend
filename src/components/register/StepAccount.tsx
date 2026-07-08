'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepAccount.tsx
// Form ขั้นตอนที่ 3 — สร้างบัญชีผู้ใช้งาน (รองรับสีตัวอักษร)
// ═══════════════════════════════════════════════════════════════

import React from 'react'
import Field from '@/components/ui/Field'
import { RegisterForm } from '@/types'

interface StepAccountProps {
  form: RegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputStyle: React.CSSProperties
  showPassword: boolean
  onTogglePassword: () => void
  termsAccepted: boolean
  onToggleTerms: () => void
  labelColor?: string // ส่งสีของ label เพื่อใช้ในธีมมืดและสว่าง
}

export default function StepAccount({
  form,
  onChange,
  inputStyle,
  showPassword,
  onTogglePassword,
  termsAccepted,
  onToggleTerms,
  labelColor,
}: StepAccountProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── ชื่อผู้ใช้งาน ── */}
      <Field label="ชื่อผู้ใช้งาน *" icon="👤" color={labelColor}>
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          style={inputStyle}
          placeholder="อักษรภาษาอังกฤษหรือตัวเลข 8-50 ตัว"
          maxLength={50}
          autoComplete="username"
        />
      </Field>

      {/* ── รหัสผ่าน (มีปุ่มแสดง/ซ่อน) ── */}
      <Field label="รหัสผ่าน *" icon="🔒" color={labelColor}>
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange}
            style={{ ...inputStyle, paddingRight: 44, marginBottom: 0 }}
            placeholder="อักษร/ตัวเลข/อักขระพิเศษ [!#_.] 8-50 ตัว"
            maxLength={50}
            autoComplete="new-password"
          />

          <button
            type="button"
            onClick={onTogglePassword}
            style={styles.eyeBtn}
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </Field>

      {/* ── Checkbox ยอมรับเงื่อนไข ── */}
      <label style={{ ...styles.checkboxRow, color: labelColor || '#475569' }}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={onToggleTerms}
          style={{ accentColor: '#4f46e5', width: 16, height: 16 }}
        />
        <span style={styles.checkboxText}>
          ฉันยอมรับ{' '}
          <span style={{ ...styles.checkboxLink, color: labelColor ? '#818cf8' : '#4f46e5' }}>เงื่อนไขการให้บริการ</span>
          {' '}และ{' '}
          <span style={{ ...styles.checkboxLink, color: labelColor ? '#818cf8' : '#4f46e5' }}>นโยบายความเป็นส่วนตัว</span>
        </span>
      </label>

      {/* ── Trust badge ── */}
      <div
        style={{
          ...styles.trustBadge,
          color: labelColor ? '#cbd5e1' : '#475569',
          background: labelColor ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
          border: labelColor ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
        }}
      >
        🔐 ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 12.5,
    cursor: 'pointer',
    marginBottom: 16,
    marginTop: 4,
  },
  checkboxText: { lineHeight: 1.5 },
  checkboxLink: { cursor: 'pointer', fontWeight: 500 },
  trustBadge: {
    textAlign: 'center',
    fontSize: 12,
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 4,
    fontWeight: 500,
  },
}
