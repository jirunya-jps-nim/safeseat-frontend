'use client'

import React from 'react'
import PaperclipIcon from '@/components/ui/PaperclipIcon'

interface StepDriverVehicleInfoProps {
  form: {
    carBrand: string
    carModel: string
    carColor: string
    carPlate: string
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  carFile: File | null
  carRef: React.RefObject<HTMLInputElement | null>
  onCarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  termsAccepted: boolean
  onToggleTerms: () => void
}

export default function StepDriverVehicleInfo({
  form,
  onChange,
  carFile,
  carRef,
  onCarChange,
  termsAccepted,
  onToggleTerms,
}: StepDriverVehicleInfoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {}
      <div>
        <h3 style={styles.sectionHeader}>ข้อมูลยานพาหนะผู้ให้บริการขับรถ</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ยี่ห้อรถ (Brand) *</label>
            <input
              name="carBrand"
              value={form.carBrand}
              onChange={onChange}
              style={styles.input}
              placeholder="เช่น Toyota"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>รุ่นรถ (Model) *</label>
            <input
              name="carModel"
              value={form.carModel}
              onChange={onChange}
              style={styles.input}
              placeholder="เช่น Camry"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>สีรถ (Color) *</label>
            <input
              name="carColor"
              value={form.carColor}
              onChange={onChange}
              style={styles.input}
              placeholder="เช่น ดำ"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ทะเบียนรถ (Plate) *</label>
            <input
              name="carPlate"
              value={form.carPlate}
              onChange={(e) => {
                const val = e.target.value
                if (/^[ก-๙0-9\s.-]*$/.test(val)) {
                  onChange(e)
                }
              }}
              style={styles.input}
              placeholder="เช่น 1กข 1234 หรือ กข 1234 เชียงใหม่"
            />
          </div>
        </div>
      </div>

      {}
      <div>
        <label style={styles.label}>แนบรูปภาพรถยนต์ *</label>
        <div style={styles.uploadRow}>
          <button
            type="button"
            style={styles.attachBtn}
            onClick={() => carRef.current?.click()}
            title="แนบรูปภาพ"
          >
            <PaperclipIcon size={16} color="#475569" />
          </button>
          <span style={styles.fileName}>
            {carFile ? carFile.name : 'รูปถ่ายไม่เกิน 10 MB (JPG/PNG)'}
          </span>
        </div>
        <input
          ref={carRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={onCarChange}
        />
      </div>

      {}
      <div style={{ marginTop: '10px' }}>
        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={onToggleTerms}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>
            ยอมรับนโยบายข้อมูลส่วนตัว
          </span>
        </label>
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
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '15px',
    color: 'var(--color-text)',
    fontWeight: 600,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#2340A7',
    cursor: 'pointer',
  },
}
