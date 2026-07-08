'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepDriverAccount.tsx
// ฟอร์มขั้นตอนที่ 4 สำหรับลงทะเบียนคนขับ — ข้อมูลบัญชีผู้ใช้งาน
// ═══════════════════════════════════════════════════════════════

import React from 'react'
import Field from '@/components/ui/Field'
import { DriverRegisterForm } from '@/types'

interface StepDriverAccountProps {
  form: DriverRegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputStyle: React.CSSProperties
  showPassword: boolean
  onTogglePassword: () => void
  termsAccepted: boolean
  onToggleTerms: () => void
}

export default function StepDriverAccount({
  form,
  onChange,
  inputStyle,
  showPassword,
  onTogglePassword,
  termsAccepted,
  onToggleTerms,
}: StepDriverAccountProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── ชื่อผู้ใช้งาน (Username) ── */}
      <Field label="ชื่อผู้ใช้งาน (หากเว้นว่าง ระบบจะใช้เบอร์โทรศัพท์แทน)" icon="👤">
        <input
          name="username"
          value={form.username || ''}
          onChange={onChange}
          style={inputStyle}
          placeholder="ภาษาอังกฤษ ตัวเลข หรือขีดล่าง 2-50 ตัว"
          maxLength={50}
          autoComplete="username"
        />
      </Field>

      {/* ── รหัสผ่าน (Password) ── */}
      <Field label="รหัสผ่าน *" icon="🔒">
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange}
            style={{ ...inputStyle, paddingRight: 44, marginBottom: 0 }}
            placeholder="อังกฤษ/ตัวเลข/อักขระพิเศษ [!#_.] 6-50 ตัว"
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
      <label style={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={onToggleTerms}
          style={{ accentColor: '#6366f1', width: 16, height: 16 }}
        />
        <span style={styles.checkboxText}>
          ฉันยอมรับ{' '}
          <span style={styles.checkboxLink}>เงื่อนไขการให้บริการ</span>
          {' '}และ{' '}
          <span style={styles.checkboxLink}>นโยบายความเป็นส่วนตัว</span>
          {' '}ในการสมัครเป็นคนขับรถร่วมทางกับ SafeSeat
        </span>
      </label>

      {/* ── Trust badge ── */}
      <div style={styles.trustBadge}>
        🛡️ ข้อมูลบัตรประชาชนและประวัติของคุณจะถูกจัดเก็บเป็นความลับสูงสุด
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
    color: '#94a3b8',
    cursor: 'pointer',
    marginBottom: 16,
    marginTop: 4,
  },
  checkboxText: { lineHeight: 1.5 },
  checkboxLink: { color: '#818cf8', cursor: 'pointer', fontWeight: 500 },
  trustBadge: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 4,
  },
}
