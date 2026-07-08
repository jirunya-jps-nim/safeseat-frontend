'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepDriverDocuments.tsx
// หน้าที่สามของการลงทะเบียนคนขับ (แนบหลักฐานใบขับขี่ ประวัติอาชญากรรม และใบรับรองแพทย์) - Light Theme
// ═══════════════════════════════════════════════════════════════

import React from 'react'

interface StepDriverDocumentsProps {
  files: {
    driverLicensePath: File | null
    criminalRecordPath: File | null
    medicalCertificatePath: File | null
  }
  onFileSelect: (fieldName: string, file: File | null) => void
  refs: {
    licenseRef: React.RefObject<HTMLInputElement | null>
    criminalRef: React.RefObject<HTMLInputElement | null>
    medicalRef: React.RefObject<HTMLInputElement | null>
  }
}

export default function StepDriverDocuments({
  files,
  onFileSelect,
  refs,
}: StepDriverDocumentsProps) {

  const renderFileRow = (
    fieldName: string,
    label: string,
    hint: string,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={styles.label}>
          {label} * <span style={styles.hintText}>{hint}</span>
        </label>
        <div style={styles.uploadRow}>
          <button
            type="button"
            style={styles.attachBtn}
            onClick={() => inputRef.current?.click()}
            title="แนบไฟล์"
          >
            📎
          </button>
          <span style={styles.fileName}>
            {file ? file.name : 'ยังไม่ได้เลือกไฟล์'}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null
            onFileSelect(fieldName, selectedFile)
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 4 : เอกสารประกอบการสมัคร</h3>
        
        {renderFileRow(
          'driverLicensePath',
          'แนบใบขับขี่รถยนต์',
          '',
          files.driverLicensePath,
          refs.licenseRef
        )}

        {renderFileRow(
          'criminalRecordPath',
          'แนบประวัติอาชญากรรม',
          '(ตรวจสอบประวัติอาชญากรรม)',
          files.criminalRecordPath,
          refs.criminalRef
        )}

        {renderFileRow(
          'medicalCertificatePath',
          'ใบรับรองแพทย์ตรวจสุขภาพ',
          '(ภายใน 1 เดือนก่อนยื่นสมัคร)',
          files.medicalCertificatePath,
          refs.medicalRef
        )}
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
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#475569',
    marginBottom: '6px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  hintText: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 400,
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
    fontSize: '12px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
