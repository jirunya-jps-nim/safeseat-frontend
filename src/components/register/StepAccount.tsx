'use client'

import React from 'react'
import Field from '@/components/ui/Field'
import { RegisterForm } from '@/types'
import { Eye, EyeOff } from 'lucide-react'

interface StepAccountProps {
  form: RegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputStyle: React.CSSProperties
  showPassword: boolean
  onTogglePassword: () => void
  termsAccepted: boolean
  onToggleTerms: () => void
  labelColor?: string 
  errorMessage?: string
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
  errorMessage,
}: StepAccountProps) {
  const isUsernameError = errorMessage?.includes('ชื่อผู้ใช้')
  const isPasswordError = errorMessage?.includes('รหัสผ่าน')
  const isTermsError = errorMessage?.includes('เงื่อนไข') || errorMessage?.includes('นโยบาย')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {}
      <Field label="ชื่อผู้ใช้งาน *" icon="👤" color={labelColor}>
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          style={{
            ...inputStyle,
            borderColor: isUsernameError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isUsernameError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="อักษรภาษาอังกฤษหรือตัวเลข 8-50 ตัว"
          maxLength={50}
          autoComplete="off"
        />
        {isUsernameError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      {}
      <Field label="รหัสผ่าน *" icon="🔒" color={labelColor}>
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={onChange}
            style={{
              ...inputStyle,
              paddingRight: 44,
              marginBottom: 0,
              borderColor: isPasswordError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
              backgroundColor: isPasswordError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
            }}
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
            {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
          </button>
        </div>
        {isPasswordError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      {}
      <label style={{
        ...styles.checkboxRow,
        color: isTermsError ? '#ef4444' : (labelColor || '#475569'),
        padding: isTermsError ? '8px' : '0',
        borderRadius: isTermsError ? '8px' : '0',
        backgroundColor: isTermsError ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
      }}>
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
      {isTermsError && (
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '-10px', marginBottom: '14px', display: 'block' }}>
          ⚠️ {errorMessage}
        </span>
      )}

      {}
      <div
        style={{
          ...styles.trustBadge,
          color: labelColor ? '#cbd5e1' : '#475569',
          backgroundColor: labelColor ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
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
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 14.5,
    cursor: 'pointer',
    marginBottom: 18,
    marginTop: 6,
  },
  checkboxText: { lineHeight: 1.5 },
  checkboxLink: { cursor: 'pointer', fontWeight: 600 },
  trustBadge: {
    textAlign: 'center',
    fontSize: 13.5,
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 4,
    fontWeight: 500,
  },
}
