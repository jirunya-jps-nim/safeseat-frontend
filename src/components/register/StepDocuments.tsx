'use client'

import React from 'react'
import Field from '@/components/ui/Field'
import { RegisterForm } from '@/types'

interface StepDocumentsProps {
  form: RegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputStyle: React.CSSProperties
  licenseFile: File | null
  shopImgFile: File | null
  licenseRef: React.RefObject<HTMLInputElement | null>
  shopImgRef: React.RefObject<HTMLInputElement | null>
  onLicenseChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onShopImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  labelColor?: string 
}

export default function StepDocuments({
  form, onChange, inputStyle,
  licenseFile, shopImgFile,
  licenseRef, shopImgRef,
  onLicenseChange, onShopImgChange,
  labelColor,
}: StepDocumentsProps) {
  
  const hintColor = labelColor ? '#94a3b8' : '#64748b'
  const uploadBorderColor = labelColor 
    ? (licenseFile ? '#818cf8' : 'rgba(255, 255, 255, 0.2)')
    : (licenseFile ? '#4f46e5' : '#cbd5e1')
  const uploadBg = labelColor
    ? (licenseFile ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)')
    : (licenseFile ? '#f5f3ff' : '#f8fafc')

  const shopUploadBorderColor = labelColor 
    ? (shopImgFile ? '#818cf8' : 'rgba(255, 255, 255, 0.2)')
    : (shopImgFile ? '#4f46e5' : '#cbd5e1')
  const shopUploadBg = labelColor
    ? (shopImgFile ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)')
    : (shopImgFile ? '#f5f3ff' : '#f8fafc')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {}
      <div style={{ ...styles.uploadLabel, color: labelColor || '#475569' }}>
        แนบหลักฐานใบอนุญาตประกอบการ *{' '}
        <span style={{ ...styles.uploadHint, color: hintColor }}>(PDF / JPG / PNG, ไม่เกิน 10 MB)</span>
      </div>

      <div
        style={{
          ...styles.uploadBox,
          borderColor: uploadBorderColor,
          background: uploadBg,
        }}
        onClick={() => licenseRef.current?.click()}
      >
        <span style={styles.uploadIcon}>{licenseFile ? '✅' : '📂'}</span>
        <span style={styles.uploadText}>
          {licenseFile ? (
            <>
              <strong style={{ color: labelColor ? '#818cf8' : '#4f46e5' }}>{licenseFile.name}</strong>
              <br />
              <span style={{ color: hintColor }}>
                {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </>
          ) : (
            'คลิกเพื่อเลือกไฟล์ PDF / JPG / PNG'
          )}
        </span>

        <input
          ref={licenseRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={onLicenseChange}
        />
      </div>

      {}
      <div style={{ ...styles.uploadLabel, color: labelColor || '#475569' }}>
        แนบรูปภาพหน้าร้าน *{' '}
        <span style={{ ...styles.uploadHint, color: hintColor }}>(JPG / PNG, ไม่เกิน 10 MB)</span>
      </div>

      <div
        style={{
          ...styles.uploadBox,
          borderColor: shopUploadBorderColor,
          background: shopUploadBg,
        }}
        onClick={() => shopImgRef.current?.click()}
      >
        <span style={styles.uploadIcon}>{shopImgFile ? '✅' : '🖼️'}</span>
        <span style={styles.uploadText}>
          {shopImgFile ? (
            <>
              <strong style={{ color: labelColor ? '#818cf8' : '#4f46e5' }}>{shopImgFile.name}</strong>
              <br />
              <span style={{ color: hintColor }}>
                {(shopImgFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </>
          ) : (
            'คลิกเพื่อเลือกไฟล์ JPG / PNG'
          )}
        </span>
        <input
          ref={shopImgRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={onShopImgChange}
        />
      </div>

      {}
      <Field label="เลขที่ผู้เสียภาษี * (13 หลัก)" icon="🔢" color={labelColor}>
        <input
          name="taxNumber"
          value={form.taxNumber}
          onChange={onChange}
          style={inputStyle}
          placeholder="1234567890123"
          maxLength={13}
          inputMode="numeric"
        />
      </Field>

      <Field label="ชื่อบัญชีธนาคาร *" icon="🏦" color={labelColor}>
        <input
          name="bankAccountName"
          value={form.bankAccountName}
          onChange={onChange}
          style={inputStyle}
          placeholder="ชื่อที่ปรากฏบนบัญชี"
        />
      </Field>

      <Field label="เลขที่บัญชี *" icon="💳" color={labelColor}>
        <input
          name="bankAccountNo"
          value={form.bankAccountNo}
          onChange={onChange}
          style={inputStyle}
          placeholder="เลขบัญชีธนาคาร"
          inputMode="numeric"
        />
      </Field>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  uploadLabel: { fontSize: 12.5, fontWeight: 500, marginBottom: 6 },
  uploadHint:  { fontSize: 11, fontWeight: 400 },
  uploadBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '16px',
    marginBottom: 14,
    borderRadius: 10,
    cursor: 'pointer',
    borderWidth: '1.5px',
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    transition: 'border-color 0.2s, background 0.2s',
  },
  uploadIcon: { fontSize: 22 },
  uploadText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center' as const,
    lineHeight: 1.6,
  },
}
