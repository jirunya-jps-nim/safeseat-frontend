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
  errorMessage?: string
}

export default function StepDocuments({
  form, onChange, inputStyle,
  licenseFile, shopImgFile,
  licenseRef, shopImgRef,
  onLicenseChange, onShopImgChange,
  labelColor,
  errorMessage,
}: StepDocumentsProps) {
  
  const isLicenseError = errorMessage?.includes('ใบอนุญาต')
  const isShopImgError = errorMessage?.includes('รูปภาพ') || errorMessage?.includes('รูปหน้าร้าน')
  const isTaxError = errorMessage?.includes('ผู้เสียภาษี')
  const isBankNameError = errorMessage?.includes('ชื่อบัญชี')
  const isBankNoError = (errorMessage?.includes('เลขที่บัญชี') || errorMessage?.includes('เลขบัญชี') || errorMessage?.includes('บัญชีธนาคาร')) && !errorMessage?.includes('ชื่อบัญชี')

  const hintColor = labelColor ? '#94a3b8' : '#64748b'
  const uploadBorderColor = isLicenseError
    ? '#ef4444'
    : labelColor 
      ? (licenseFile ? '#818cf8' : 'rgba(255, 255, 255, 0.2)')
      : (licenseFile ? '#4f46e5' : '#cbd5e1')
  const uploadBg = isLicenseError
    ? 'rgba(239, 68, 68, 0.05)'
    : labelColor
      ? (licenseFile ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)')
      : (licenseFile ? '#f5f3ff' : '#f8fafc')

  const shopUploadBorderColor = isShopImgError
    ? '#ef4444'
    : labelColor 
      ? (shopImgFile ? '#818cf8' : 'rgba(255, 255, 255, 0.2)')
      : (shopImgFile ? '#4f46e5' : '#cbd5e1')
  const shopUploadBg = isShopImgError
    ? 'rgba(239, 68, 68, 0.05)'
    : labelColor
      ? (shopImgFile ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)')
      : (shopImgFile ? '#f5f3ff' : '#f8fafc')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {}
      <div style={{ ...styles.uploadLabel, color: isLicenseError ? '#ef4444' : (labelColor || '#475569') }}>
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
      {isLicenseError && (
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '-10px', marginBottom: '14px', display: 'block' }}>
          ⚠️ {errorMessage}
        </span>
      )}

      {}
      <div style={{ ...styles.uploadLabel, color: isShopImgError ? '#ef4444' : (labelColor || '#475569') }}>
        แนบรูปภาพหน้าสถานบันเทิง *{' '}
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
      {isShopImgError && (
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '-10px', marginBottom: '14px', display: 'block' }}>
          ⚠️ {errorMessage}
        </span>
      )}

      {}
      <Field label="เลขที่ผู้เสียภาษี *" icon="🔢" color={labelColor}>
        <input
          name="taxNumber"
          value={form.taxNumber}
          onChange={onChange}
          autoComplete="off"
          style={{
            ...inputStyle,
            borderColor: isTaxError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isTaxError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="เลขประจำตัวผู้เสียภาษี"
          maxLength={13}
          inputMode="numeric"
        />
        {isTaxError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      <Field label="เลขบัญชีธนาคารกสิกรไทย *" icon="💳" color={labelColor}>
        <input
          name="bankAccountNo"
          value={form.bankAccountNo}
          onChange={onChange}
          autoComplete="off"
          style={{
            ...inputStyle,
            borderColor: isBankNoError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isBankNoError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="เลขบัญชีธนาคารกสิกรไทย"
          maxLength={12}
          inputMode="numeric"
        />
        {isBankNoError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  uploadLabel: { fontSize: 15.5, fontWeight: 600, marginBottom: 7 },
  uploadHint:  { fontSize: 13, fontWeight: 400 },
  uploadBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '18px',
    marginBottom: 16,
    borderRadius: 12,
    cursor: 'pointer',
    borderWidth: '1.5px',
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    transition: 'border-color 0.2s, background 0.2s',
  },
  uploadIcon: { fontSize: 24 },
  uploadText: {
    fontSize: 14.5,
    color: '#94a3b8',
    textAlign: 'center' as const,
    lineHeight: 1.6,
  },
}
