'use client'

// ═══════════════════════════════════════════════════════════════
// app/register/documents/page.tsx
// SafeSeat Example Documents Page — Royal Purple-Blue Edition
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'

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
    title: '01 / รูปโปรไฟล์',
    detailsTitle: '01 — PROFILE PHOTO REQUIREMENT',
    intro: 'ลักษณะของรูปโปรไฟล์ที่ถูกต้อง:',
    requirements: [
      'รูปถ่ายหน้าตรง ใบหน้าชัดเจน',
      'ไม่มีบุคคล สัตว์ และ/หรือสิ่งของอยู่ในพื้นหลัง',
      'ไม่สวมเครื่องประดับบดบังใบหน้า (หมวก, แว่นกันแดด)',
      'แต่งกายเหมาะสม สุภาพเรียบร้อย',
      'เป็นรูปที่ไม่มีอายุเกิน 6 เดือน'
    ],
    imageSrc: '/images/profile_sample.png',
    imageLabel: 'ตัวอย่างรูปโปรไฟล์ที่ถูกต้อง :'
  },
  {
    title: '02 / บัตรประชาชน',
    detailsTitle: '02 — NATIONAL ID CARD REQUIREMENT',
    intro: 'ลักษณะของบัตรประจำตัวประชาชนที่ถูกต้อง:',
    requirements: [
      'บัตรประจำตัวประชาชนอยู่ในสภาพสมบูรณ์และไม่หมดอายุ',
      'ไม่แก้ไขและตกแต่งรูปภาพ',
      'เห็นข้อมูลชัดเจนและครบถ้วน',
      'หากแนบสำเนาบัตรประชาชน กรุณาปิดบังข้อมูลศาสนาหรือหมู่เลือดเพื่อความเป็นส่วนตัวของข้อมูลบุคคล'
    ],
    imageSrc: '/images/id_card_sample.png',
    imageLabel: 'ตัวอย่างรูปบัตรประจำตัวประชาชนที่ถูกต้อง :'
  },
  {
    title: '03 / บัญชีธนาคาร',
    detailsTitle: '03 — BANK ACCOUNT BOOK REQUIREMENT',
    intro: 'รูปหน้าแรกของสมุดบัญชีธนาคาร:',
    requirements: [
      'ชื่อเจ้าของบัญชีธนาคารต้องตรงกับชื่อผู้สมัครรับบริการอย่างถูกต้อง',
      'ต้องเป็นสมุดบัญชีธนาคารกสิกรไทย (KBank) เท่านั้น เพื่อความสะดวกในการโอนเงินรายได้เข้าระบบ',
      'ภาพถ่ายเห็นข้อมูลชัดเจน (ชื่อบัญชี และเลขบัญชีธนาคาร)',
      'ไม่แก้ไขและตกแต่งรูปภาพเอกสาร'
    ],
    imageSrc: '/images/bank_book_sample.png',
    imageLabel: 'ตัวอย่างข้อมูลบัญชีธนาคารที่ถูกต้อง :'
  },
  {
    title: '04 / ข้อมูลรถยนต์',
    detailsTitle: '04 — VEHICLE REGISTRATION REQUIREMENT',
    intro: 'ลักษณะของข้อมูลยานพาหนะและป้ายทะเบียนที่ถูกต้อง:',
    requirements: [
      'ข้อมูลยี่ห้อ รุ่น สี และป้ายทะเบียนต้องตรงกับสภาพรถจริงที่ใช้ให้บริการ',
      'รูปถ่ายตัวรถเห็นป้ายทะเบียนชัดเจน สมบูรณ์ ครบถ้วน',
      'รูปภาพไม่มีการตัดต่อ ตกแต่ง หรือปิดบังแผ่นป้ายทะเบียน'
    ],
    imageSrc: '/images/car_book_sample.png',
    imageLabel: 'ตัวอย่างรูปเล่มทะเบียนรถยนต์และป้ายทะเบียนที่ถูกต้อง :'
  },
  {
    title: '05 / พ.ร.บ. รถยนต์',
    detailsTitle: '05 — COMPULSORY INSURANCE (พ.ร.บ.)',
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
    title: '06 / ใบขับขี่รถยนต์',
    detailsTitle: '06 — DRIVER LICENSE REQUIREMENT',
    intro: 'ลักษณะของใบขับขี่ที่ถูกต้อง:',
    requirements: [
      'ต้องเป็นใบขับขี่รถยนต์ส่วนบุคคลชั่วคราว (มีอายุมากกว่า 1 ปีขึ้นไป) หรือใบขับขี่ส่วนบุคคลตลอดชีพเท่านั้น',
      'ข้อมูลในใบขับขี่ต้องตรงกับบัตรประจำตัวประชาชน',
      'ใบขับขี่อยู่ในสภาพสมบูรณ์และไม่หมดอายุ',
      'ไม่แก้ไขและตกแต่งรูปภาพ เห็นรายละเอียดข้อมูลชัดเจน'
    ],
    imageSrc: '/images/driver_license_sample.png',
    imageLabel: 'ตัวอย่างรูปใบขับขี่ที่ถูกต้อง :'
  }
]

export default function ExampleDocumentsPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = DOCUMENT_STEPS[activeStepIndex]

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-44 pb-24 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shrink-0 h-fit shadow-xl">
          <div className="text-xs font-bold tracking-widest text-[#7C3AED] border-b border-[var(--color-border)] pb-3 mb-4 font-manrope">
            REGISTRATION STEPS
          </div>
          <ul className="flex flex-col gap-2">
            {DOCUMENT_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex
              return (
                <li
                  key={index}
                  onClick={() => setActiveStepIndex(index)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  {step.title}
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Right Content Area */}
        <section className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
          <h1 className="text-2xl font-bold font-manrope text-[var(--color-text)] tracking-tight">
            {currentStep.detailsTitle}
          </h1>

          {/* Description Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <p className="text-sm font-bold text-[var(--color-text)] mb-3">{currentStep.intro}</p>
            <ul className="pl-5 space-y-2 list-disc text-xs text-[var(--color-text-muted)] leading-relaxed">
              {currentStep.requirements.map((req, idx) => (
                <li key={idx}>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Image Display Area */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-[var(--color-text)]">{currentStep.imageLabel}</h2>
            <div className="flex justify-center items-center border border-[var(--color-border)] rounded-xl p-6 bg-[var(--color-surface)] overflow-hidden">
              <img
                src={currentStep.imageSrc}
                alt={currentStep.detailsTitle}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
