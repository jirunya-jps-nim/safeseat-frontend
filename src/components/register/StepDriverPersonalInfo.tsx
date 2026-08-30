'use client'

import React, { useState } from 'react'
import PaperclipIcon from '@/components/ui/PaperclipIcon'
import { Eye, EyeOff } from 'lucide-react'

interface StepDriverPersonalInfoProps {
  form: {
    firstName: string
    lastName: string
    idCard: string
    email: string
    bankAccountNo: string
    gender: string
    phoneNo: string
    password: string
    driverSkills: string[]
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onToggleSkill: (skill: string) => void
  profileFile: File | null
  profileRef: React.RefObject<HTMLInputElement | null>
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  errorMessage?: string
}

export default function StepDriverPersonalInfo({
  form,
  onChange,
  onToggleSkill,
  profileFile,
  profileRef,
  onProfileChange,
  errorMessage,
}: StepDriverPersonalInfoProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const isIdCardError = errorMessage?.includes('บัตรประชาชน')
  const isEmailError = errorMessage?.includes('อีเมล')
  const isPhoneError = errorMessage?.includes('โทรศัพท์')
  const isBankError = errorMessage?.includes('บัญชี') || errorMessage?.includes('กสิกร')
  const isFirstNameError = errorMessage?.includes('ชื่อ') && !errorMessage?.includes('นามสกุล') && !errorMessage?.includes('บัญชี') && !errorMessage?.includes('ผู้ใช้')
  const isLastNameError = errorMessage?.includes('นามสกุล')
  const isPasswordError = errorMessage?.includes('รหัสผ่าน')
  const isProfileError = errorMessage?.includes('รูปภาพ')
  const isGenderError = errorMessage?.includes('เพศ')
  const isSkillError = errorMessage?.includes('ความสามารถ') || errorMessage?.includes('ขับรถ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {}
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 1 : ข้อมูลส่วนตัวผู้ให้บริการขับรถ</h3>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อ (Firstname) *</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              autoComplete="off"
              style={{
                ...styles.input,
                borderColor: isFirstNameError ? '#ef4444' : 'var(--color-border)',
                backgroundColor: isFirstNameError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              }}
              placeholder="ชื่อ (ภาษาไทยหรืออังกฤษ)"
            />
            {isFirstNameError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>นามสกุล (Lastname) *</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              autoComplete="off"
              style={{
                ...styles.input,
                borderColor: isLastNameError ? '#ef4444' : 'var(--color-border)',
                backgroundColor: isLastNameError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              }}
              placeholder="นามสกุล (ภาษาไทยหรืออังกฤษ)"
            />
            {isLastNameError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
        </div>

        <div style={{ ...styles.grid2, marginTop: '12px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>หมายเลขบัตรประชาชน *</label>
            <input
              name="idCard"
              value={form.idCard}
              onChange={onChange}
              autoComplete="off"
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                }
              }}
              maxLength={13}
              inputMode="numeric"
              style={{
                ...styles.input,
                borderColor: isIdCardError ? '#ef4444' : 'var(--color-border)',
                backgroundColor: isIdCardError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              }}
              placeholder="13 หลัก (ตัวเลขเท่านั้น)"
            />
            {isIdCardError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>เลขบัญชีกสิกรไทย (ตัวเลขเท่านั้น) *</label>
            <input
              name="bankAccountNo"
              value={form.bankAccountNo}
              onChange={onChange}
              autoComplete="off"
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                }
              }}
              maxLength={12}
              inputMode="numeric"
              style={{
                ...styles.input,
                borderColor: isBankError ? '#ef4444' : 'var(--color-border)',
                backgroundColor: isBankError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              }}
              placeholder="10 - 12 หลัก (เฉพาะตัวเลข)"
            />
            {isBankError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={styles.label}>อีเมล (email) *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              ...styles.input,
              borderColor: isEmailError ? '#ef4444' : 'var(--color-border)',
              backgroundColor: isEmailError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
            }}
            placeholder="example@email.com"
          />
          {isEmailError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
        </div>
      </div>

      {}
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 2 : ข้อมูลการเข้าสู่ระบบ</h3>
        
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>เบอร์โทรศัพท์มือถือ *</label>
            <input
              name="phoneNo"
              value={form.phoneNo}
              onChange={onChange}
              autoComplete="off"
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                }
              }}
              maxLength={10}
              inputMode="numeric"
              style={{
                ...styles.input,
                borderColor: isPhoneError ? '#ef4444' : 'var(--color-border)',
                backgroundColor: isPhoneError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              }}
              placeholder="กรุณากรอกเบอร์โทรศัพท์ (10 หลัก)"
            />
            {isPhoneError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>รหัสผ่าน (password) *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                style={{
                  ...styles.input,
                  paddingRight: '42px',
                  borderColor: isPasswordError ? '#ef4444' : 'var(--color-border)',
                  backgroundColor: isPasswordError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
                }}
                placeholder="อักษร/ตัวเลข/อักขระพิเศษ [!#_.] 8-50 ตัว"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b',
                  padding: '4px',
                }}
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isPasswordError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
        </div>

        <div style={{ ...styles.grid2, marginTop: '12px', alignItems: 'flex-start' }}>
          {}
          <div style={{ flex: 1, ...styles.inputGroup }}>
            <label style={styles.label}>แนบรูปภาพใบหน้าตนเอง *</label>
            <div style={{
              ...styles.uploadRow,
              borderColor: isProfileError ? '#ef4444' : 'var(--color-border)',
              backgroundColor: isProfileError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
            }}>
              <button
                type="button"
                style={styles.attachBtn}
                onClick={() => profileRef.current?.click()}
                title="แนบรูปภาพ"
              >
                <PaperclipIcon size={16} color="#475569" />
              </button>
              <span style={styles.fileName}>
                {profileFile ? profileFile.name : 'รูปถ่ายไม่เกิน 10 MB (JPG/PNG)'}
              </span>
            </div>
            {isProfileError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
            <input
              ref={profileRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={onProfileChange}
            />
          </div>

          {}
          <div style={{ minWidth: '170px', width: 'fit-content', ...styles.inputGroup }}>
            <label style={styles.label}>เพศ *</label>
            <div style={{
              ...styles.radioGroup,
              borderColor: isGenderError ? '#ef4444' : 'var(--color-border)',
              backgroundColor: isGenderError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
            }}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="1"
                  checked={form.gender === '1'}
                  onChange={onChange}
                  style={styles.radio}
                />
                ชาย
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="2"
                  checked={form.gender === '2'}
                  onChange={onChange}
                  style={styles.radio}
                />
                หญิง
              </label>
            </div>
            {isGenderError && <span style={styles.fieldErrorText}>⚠️ {errorMessage}</span>}
          </div>
        </div>
      </div>

      {}
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 3 : ความสามารถในการขับรถยนต์ (Driving Skills) *</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          เลือกประเภทรถยนต์ที่คุณสามารถให้บริการขับขี่ได้ (สามารถเลือกได้มากกว่า 1 ประเภท)
        </p>
        {isSkillError && (
          <div style={{ ...styles.fieldErrorText, marginBottom: '10px', fontSize: '13.5px' }}>
            ⚠️ {errorMessage}
          </div>
        )}
        <div style={styles.skillGrid}>
          <label style={{
            ...styles.skillCard,
            borderColor: isSkillError ? '#ef4444' : (form.driverSkills.includes('Auto') || form.driverSkills.includes('Autometric') ? '#2340A7' : 'var(--color-border)'),
            backgroundColor: form.driverSkills.includes('Auto') || form.driverSkills.includes('Autometric') ? 'rgba(35, 64, 167, 0.08)' : 'var(--color-surface)'
          }}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Auto') || form.driverSkills.includes('Autometric')}
              onChange={() => onToggleSkill('Auto')}
              style={styles.checkbox}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--color-text)' }}>🚗 เกียร์อัตโนมัติ (Auto)</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>รถยนต์เกียร์ออโต้ทั่วไป</div>
            </div>
          </label>

          <label style={{
            ...styles.skillCard,
            borderColor: isSkillError ? '#ef4444' : (form.driverSkills.includes('Manual') ? '#2340A7' : 'var(--color-border)'),
            backgroundColor: form.driverSkills.includes('Manual') ? 'rgba(35, 64, 167, 0.08)' : 'var(--color-surface)'
          }}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Manual')}
              onChange={() => onToggleSkill('Manual')}
              style={styles.checkbox}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--color-text)' }}>🕹️ เกียร์ธรรมดา (Manual)</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>รถยนต์เกียร์กระปุก / มีคลัตช์</div>
            </div>
          </label>

          <label style={{
            ...styles.skillCard,
            borderColor: isSkillError ? '#ef4444' : (form.driverSkills.includes('Electric') || form.driverSkills.includes('EV') ? '#2340A7' : 'var(--color-border)'),
            backgroundColor: form.driverSkills.includes('Electric') || form.driverSkills.includes('EV') ? 'rgba(35, 64, 167, 0.08)' : 'var(--color-surface)'
          }}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Electric') || form.driverSkills.includes('EV')}
              onChange={() => onToggleSkill('Electric')}
              style={styles.checkbox}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--color-text)' }}>⚡ รถยนต์ไฟฟ้า (Electric / EV)</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>รถยนต์พลังงานไฟฟ้า 100%</div>
            </div>
          </label>
        </div>
      </div>
      
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sectionHeader: {
    fontSize: '15.5px',
    fontWeight: 700,
    color: '#2340A7',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '8px',
    marginBottom: '14px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
  },
  label: {
    display: 'block',
    fontSize: '15px',
    color: 'var(--color-text)',
    marginBottom: '7px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '6px 12px',
    borderRadius: '12px',
    height: '48px',
    boxSizing: 'border-box',
    width: '100%',
  },
  attachBtn: {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0 16px',
    cursor: 'pointer',
    fontSize: '14.5px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  radioGroup: {
    display: 'flex',
    gap: '14px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '6px 14px',
    borderRadius: '12px',
    height: '48px',
    alignItems: 'center',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14.5px',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  radio: {
    width: '18px',
    height: '18px',
    accentColor: '#2340A7',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '24px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '12px 18px',
    borderRadius: '12px',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#2340A7',
    cursor: 'pointer',
  },
  skillGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  skillCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1.5px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  fieldErrorText: {
    fontSize: '12px',
    color: '#ef4444',
    fontWeight: 600,
    marginTop: '4px',
    display: 'block',
  },
}
