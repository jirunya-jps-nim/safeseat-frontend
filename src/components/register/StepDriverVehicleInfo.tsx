'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepDriverVehicleInfo.tsx
// หน้าที่สองของการลงทะเบียนคนขับ (ข้อมูลยานพาหนะ + รูปถ่ายรถ + Checkbox นโยบาย) - Light Theme
// ═══════════════════════════════════════════════════════════════

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
      
      {/* ข้อมูลยานพาหนะ */}
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
              onChange={onChange}
              style={styles.input}
              placeholder="เช่น 1กข-1234"
            />
          </div>
        </div>
      </div>

      {/* แนบรูปภาพรถยนต์ */}
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

      {/* ยอมรับนโยบายข้อมูลส่วนตัว */}
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
    fontSize: '13px',
    fontWeight: 600,
    color: '#4f46e5',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '6px',
    marginBottom: '12px',
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
    color: '#475569',
    marginBottom: '6px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    padding: '6px 10px',
    borderRadius: '10px',
    height: '44px',
    boxSizing: 'border-box',
    width: '100%',
  },
  attachBtn: {
    backgroundColor: '#e2e8f0',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: '11px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: 500,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#4f46e5',
    cursor: 'pointer',
  },
}
