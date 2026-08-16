'use client'

import React from 'react'
import PaperclipIcon from '@/components/ui/PaperclipIcon'

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
}

export default function StepDriverPersonalInfo({
  form,
  onChange,
  onToggleSkill,
  profileFile,
  profileRef,
  onProfileChange,
}: StepDriverPersonalInfoProps) {

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
              style={styles.input}
              placeholder="ชื่อ (ภาษาไทยหรืออังกฤษ)"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>นามสกุล (Lastname) *</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              style={styles.input}
              placeholder="นามสกุล (ภาษาไทยหรืออังกฤษ)"
            />
          </div>
        </div>

        <div style={{ ...styles.grid2, marginTop: '12px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>หมายเลขบัตรประชาชน *</label>
            <input
              name="idCard"
              value={form.idCard}
              onChange={onChange}
              maxLength={13}
              inputMode="numeric"
              style={styles.input}
              placeholder="13 หลัก"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>เลขบัญชีกสิกรไทย *</label>
            <input
              name="bankAccountNo"
              value={form.bankAccountNo}
              onChange={onChange}
              maxLength={12}
              inputMode="numeric"
              style={styles.input}
              placeholder="12 หลัก"
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={styles.label}>อีเมล (email) *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            style={styles.input}
            placeholder="example@email.com"
          />
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
              maxLength={10}
              inputMode="numeric"
              style={styles.input}
              placeholder="08XXXXXXXX"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>รหัสผ่าน (password) *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              style={styles.input}
              placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
            />
          </div>
        </div>

        <div style={{ ...styles.grid2, marginTop: '12px', alignItems: 'flex-start' }}>
          {}
          <div style={{ flex: 1, ...styles.inputGroup }}>
            <label style={styles.label}>แนบรูปภาพใบหน้าตนเอง *</label>
            <div style={styles.uploadRow}>
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
            <input
              ref={profileRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={onProfileChange}
            />
          </div>

          {}
          <div style={{ width: '130px', ...styles.inputGroup }}>
            <label style={styles.label}>เพศ *</label>
            <div style={styles.radioGroup}>
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
          </div>
        </div>
      </div>

      {}
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 3 : ความสามารถในการขับรถยนต์</h3>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Autometric')}
              onChange={() => onToggleSkill('Autometric')}
              style={styles.checkbox}
            />
            Autometric
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Manual')}
              onChange={() => onToggleSkill('Manual')}
              style={styles.checkbox}
            />
            Manual
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.driverSkills.includes('Electric')}
              onChange={() => onToggleSkill('Electric')}
              style={styles.checkbox}
            />
            Electric
          </label>
        </div>
      </div>
      
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#7C3AED',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '6px',
    marginBottom: '12px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginBottom: '6px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '14px',
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
    padding: '6px 10px',
    borderRadius: '10px',
    height: '44px',
    boxSizing: 'border-box',
    width: '100%',
  },
  attachBtn: {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '0 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  radioGroup: {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '6px 12px',
    borderRadius: '10px',
    height: '44px',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  radio: {
    accentColor: '#7C3AED',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '24px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '10px 16px',
    borderRadius: '8px',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontWeight: 500,
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#7C3AED',
  },
}
