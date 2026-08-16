'use client'

import React from 'react'
import PaperclipIcon from '@/components/ui/PaperclipIcon'

interface StepDriverTrainingProps {
  files: {
    trainingCert1: File | null
    trainingCert2: File | null
    trainingCert3?: File | null
    trainingCert4?: File | null
  }
  onFileSelect: (fieldName: string, file: File | null) => void
}

const TRAINING_COURSES = [
  {
    id: 1,
    title: '1. หลักสูตรการขับขี่ปลอดภัยอย่างปลอดภัยบนท้องถนน (Safe Driving)',
    provider: 'ระบบอบรมออนไลน์ DLT e-Learning (กรมการขนส่งทางบก)',
    link: 'https://www.dlt-elearning.com/',
    fieldName: 'trainingCert1',
    hint: 'ใบเกียรติบัตรคอร์สที่ 1 (JPG/PNG)'
  },
  {
    id: 2,
    title: '2. หลักสูตรการปฐมพยาบาลเบื้องต้นและการกู้ชีพขั้นพื้นฐาน (CPR & First Aid)',
    provider: 'ระบบอบรมออนไลน์สภากาชาดไทย (Thai Red Cross e-Learning)',
    link: 'https://learning.redcross.or.th/',
    fieldName: 'trainingCert2',
    hint: 'ใบเกียรติบัตรคอร์สที่ 2 (JPG/PNG)'
  }
]

export default function StepDriverTraining({
  files,
  onFileSelect,
}: StepDriverTrainingProps) {

  const handleFileChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFileSelect(fieldName, file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={styles.sectionHeader}>ส่วนที่ 5 : ประวัติการอบรมพนักงานขับรถ (2 หลักสูตรบังคับ)</h3>
        
        <div style={styles.infoBox}>
          <p style={styles.infoDesc}>
            💡 ผู้สมัครจะต้องผ่านหลักสูตรการอบรมความปลอดภัยทั้ง 2 หลักสูตรด้านล่างนี้ โดยท่านสามารถเข้าอบรมนอกเว็บไซต์กับหน่วยงานที่ระบบกำหนดไว้ และแนบไฟล์เกียรติบัตรการอบรม (ครบถ้วนทั้ง 2 ไฟล์) เพื่อยืนยันการสมัครสมาชิก
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
          {TRAINING_COURSES.map((course) => {
            const file = files[course.fieldName as keyof typeof files]
            const inputId = `input-${course.fieldName}`

            return (
              <div key={course.id} style={styles.courseItem}>
                {}
                <div style={styles.courseHeader}>
                  <div style={styles.courseMeta}>
                    <span style={styles.courseTitle}>{course.title}</span>
                    <span style={styles.courseProvider}>จัดโดย: {course.provider}</span>
                  </div>
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkBtn}
                  >
                    ไปอบรมนอกเว็บไซต์ ↗
                  </a>
                </div>

                {}
                <div style={{ marginTop: '8px' }}>
                  <label style={styles.label}>แนบเกียรติบัตรการอบรม *</label>
                  <div style={styles.uploadRow}>
                    <button
                      type="button"
                      style={styles.attachBtn}
                      onClick={() => document.getElementById(inputId)?.click()}
                      title="แนบเกียรติบัตร"
                    >
                      <PaperclipIcon size={16} color="#475569" />
                    </button>
                    <span style={styles.fileName}>
                      {file ? file.name : course.hint}
                    </span>
                  </div>
                  <input
                    id={inputId}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(course.fieldName, e)}
                  />
                </div>
              </div>
            )
          })}
        </div>
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
  infoBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  infoDesc: {
    fontSize: '12.5px',
    color: '#1e3a8a',
    lineHeight: 1.5,
    margin: 0,
    fontWeight: 500,
  },
  courseItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    flexWrap: 'wrap',
  },
  courseMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  courseTitle: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#0f172a',
  },
  courseProvider: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },
  linkBtn: {
    fontSize: '11.5px',
    color: '#fff',
    backgroundColor: '#2563eb',
    padding: '6px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#475569',
    marginBottom: '6px',
    fontWeight: 500,
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
