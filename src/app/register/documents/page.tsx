'use client'
// ═══════════════════════════════════════════════════════════════
// app/register/documents/page.tsx
// หน้าแสดงตัวอย่างเอกสารการสมัครสมาชิก (Example Documents Page - Cohesive Light Theme)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

interface DocumentStep {
  title: string
  detailsTitle: string
  intro: string
  requirements: string[]
  imageSrc: string
  imageLabel: string
}

const DOCUMENT_STEPS: DocumentStep[] = [
  {
    title: 'ขั้นตอนที่ 1 รูปโปรไฟล์',
    detailsTitle: 'รูปโปรไฟล์',
    intro: 'ลักษณะของรูปโปรไฟล์ที่ดี:',
    requirements: [
      'รูปถ่ายหน้าตรง ใบหน้าชัดเจน',
      'ไม่มีบุคคล สัตว์ และ/หรือสิ่งของอยู่ในพื้นหลัง',
      'ไม่สวมเครื่องประดับบดบังใบหน้า (หมวก, แว่นกันแดด)',
      'แต่งกายเหมาะสม สุภาพเรียบร้อย',
      'เป็นรูปที่ไม่มีอายุเกิน 6 เดือน'
    ],
    imageSrc: '/images/profile_sample.png',
    imageLabel: 'ตัวอย่างรูปโปรไฟล์ :'
  },
  {
    title: 'ขั้นตอนที่ 2 บัตรประจำตัวประชาชน',
    detailsTitle: 'บัตรประจำตัวประชาชน',
    intro: 'ลักษณะของบัตรประจำตัวประชาชนที่ถูกต้อง:',
    requirements: [
      'บัตรประจำตัวประชาชนอยู่ในสภาพสมบูรณ์และไม่หมดอายุ',
      'ไม่แก้ไขและตกแต่งรูป',
      'เห็นข้อมูลชัดเจนและครบถ้วน',
      'หากท่านแนบสำเนาบัตรประชาชน กรุณาขีดฆ่าหรือปิดบังข้อมูลศาสนาหรือหมู่เลือด (ถ้ามี) หากท่านไม่ได้ขีดฆ่าหรือปิดบังข้อมูลดังกล่าว ขอสงวนสิทธิ์ดำเนินการขีดฆ่าแทน เพื่อความเป็นส่วนตัวทางข้อมูลบุคคล'
    ],
    imageSrc: '/images/id_card_sample.png',
    imageLabel: 'ตัวอย่างรูปบัตรประจำตัวประชาชนที่ถูกต้อง :'
  },
  {
    title: 'ขั้นตอนที่ 3 ใบขับขี่',
    detailsTitle: 'ใบขับขี่',
    intro: 'ลักษณะของใบขับขี่ที่ถูกต้อง:',
    requirements: [
      'ต้องเป็นใบขับขี่รถยนต์ส่วนบุคคลชั่วคราว (มีอายุมากกว่า 1 ปีขึ้นไป) หรือใบขับขี่ส่วนบุคคลตลอดชีพเท่านั้น',
      'ข้อมูลในใบขับขี่ต้องตรงกับบัตรประจำตัวประชาชน',
      'ใบขับขี่อยู่ในสภาพสมบูรณ์และไม่หมดอายุ',
      'ไม่แก้ไขและตกแต่งรูปภาพ',
      'เห็นรายละเอียดข้อมูลชัดเจนและครบถ้วน'
    ],
    imageSrc: '/images/driver_license_sample.png',
    imageLabel: 'ตัวอย่างรูปใบขับขี่ที่ถูกต้อง :'
  },
  {
    title: 'ขั้นตอนที่ 4 ข้อมูลรถยนต์',
    detailsTitle: 'ข้อมูลรถยนต์',
    intro: 'ลักษณะของข้อมูลรถยนต์ที่ถูกต้อง:',
    requirements: [
      'กรณีที่ผู้สมัครเป็นเจ้าของรถ ข้อมูลทะเบียนรถและเอกสารคู่มือจดทะเบียนรถยนต์ที่ถูกต้องควรมีลักษณะดังต่อไปนี้:',
      'ชื่อในเอกสารต้องตรงกับชื่อ-นามสกุลของผู้สมัคร',
      'ข้อมูลเลขตัวถัง เลขเครื่องยนต์ และป้ายทะเบียนตรงกับสภาพรถจริง',
      'รูปภาพเห็นหน้ารวมข้อมูลชัดเจน ครบถ้วน ไม่มีการตัดต่อตกแต่งรูป'
    ],
    imageSrc: '/images/car_book_sample.png',
    imageLabel: 'ตัวอย่างรูปเล่มทะเบียนรถยนต์ที่ถูกต้อง :'
  },
  {
    title: 'ขั้นตอนที่ 5 พ.ร.บ. รถยนต์',
    detailsTitle: 'พ.ร.บ. รถยนต์',
    intro: 'ลักษณะของข้อมูล พ.ร.บ. ที่ถูกต้อง:',
    requirements: [
      'พ.ร.บ. รถยนต์และเอกสารต่อภาษีประจำปีต้องอยู่ในสภาพสมบูรณ์และไม่หมดอายุการใช้งาน',
      'ข้อมูลป้ายแสดงความเสียหาย (พ.ร.บ.) หรือใบเสร็จเห็นข้อมูลชัดเจนและครบถ้วน',
      'ไม่ดัดแปลง แก้ไข หรือตกแต่งรูปภาพใดๆ'
    ],
    imageSrc: '/images/tax_sticker_sample.png',
    imageLabel: 'ตัวอย่างรูป พ.ร.บ. ที่ถูกต้อง :'
  },
  {
    title: 'ขั้นตอนที่ 6 ข้อมูลบัญชีธนาคาร',
    detailsTitle: 'ข้อมูลบัญชีธนาคาร',
    intro: 'รูปหน้าแรกของสมุดบัญชีธนาคาร:',
    requirements: [
      'หากไม่ส่งข้อมูลบัญชีธนาคารจะไม่สามารถถอนเงินรายได้ออกจากระบบ SafeSeat ได้ โดยสมุดบัญชีที่ถูกต้องควรมีลักษณะดังต่อไปนี้:',
      'ชื่อเจ้าของบัญชีธนาคารต้องตรงกับชื่อผู้สมัครรับบริการอย่างถูกต้อง',
      'ต้องเป็นสมุดบัญชีธนาคารกสิกรไทย (KBank) เท่านั้น เพื่อความสะดวกในการโอนเงินรายได้เข้าระบบ',
      'ภาพถ่ายเห็นข้อมูลชัดเจน (ชื่อบัญชี และเลขบัญชีธนาคาร)',
      'ไม่แก้ไขและตกแต่งรูปภาพเอกสาร'
    ],
    imageSrc: '/images/bank_book_sample.png',
    imageLabel: 'ตัวอย่างข้อมูลบัญชีธนาคารที่ถูกต้อง :'
  }
]

export default function ExampleDocumentsPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = DOCUMENT_STEPS[activeStepIndex]

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        {/* Left Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>ขั้นตอนการสมัคร</div>
          <ul style={styles.sidebarList}>
            {DOCUMENT_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex
              return (
                <li
                  key={index}
                  onClick={() => setActiveStepIndex(index)}
                  style={{
                    ...styles.sidebarItem,
                    ...(isActive ? styles.sidebarItemActive : styles.sidebarItemInactive)
                  }}
                >
                  {step.title}
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Right Content Area */}
        <section style={styles.contentArea}>
          <h1 style={styles.contentTitle}>{currentStep.detailsTitle}</h1>

          {/* Description Box */}
          <div style={styles.descriptionBox}>
            <p style={styles.introText}>{currentStep.intro}</p>
            <ul style={styles.requirementsList}>
              {currentStep.requirements.map((req, idx) => (
                <li key={idx} style={styles.requirementItem}>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Image Display Area */}
          <div style={styles.imageSection}>
            <h2 style={styles.imageLabel}>{currentStep.imageLabel}</h2>
            <div style={styles.imageContainer}>
              <img
                src={currentStep.imageSrc}
                alt={currentStep.detailsTitle}
                style={styles.sampleImage}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '1200px',
    margin: '30px auto 60px',
    boxSizing: 'border-box',
    gap: '24px',
    padding: '0 20px',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#f1f5f9',
    borderRadius: '16px',
    padding: '24px 16px',
    height: 'fit-content',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  sidebarHeader: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#4f46e5',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  sidebarList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarItem: {
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  sidebarItemActive: {
    backgroundColor: '#ffffff',
    color: '#22c55e', // เขียวสดใสตามต้นแบบ
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    border: '1px solid #e2e8f0',
  },
  sidebarItemInactive: {
    color: '#4f46e5', // สีม่วง/น้ำเงินตามต้นแบบเมื่อไม่ได้เลือก
    backgroundColor: 'transparent',
    border: '1px solid transparent',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px 40px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  contentTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#22c55e', // สีเขียวเด่นชัด
    margin: 0,
  },
  descriptionBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
  },
  introText: {
    fontSize: '14.5px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 12px',
  },
  requirementsList: {
    paddingLeft: '20px',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  requirementItem: {
    fontSize: '13.5px',
    color: '#475569',
    lineHeight: 1.6,
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  imageLabel: {
    fontSize: '14.5px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  sampleImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
}
