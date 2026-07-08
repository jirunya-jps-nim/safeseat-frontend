'use client'
// ═══════════════════════════════════════════════════════════════
// app/help/page.tsx
// หน้า "ศูนย์ช่วยเหลือ" (Help Center Page - Cohesive Light Theme)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'pub' | 'driver'
}

export default function HelpCenterPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'pub' | 'driver'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // รายการคำถามพบบ่อย (FAQs)
  const faqs: FAQItem[] = [
    {
      category: 'pub',
      question: 'ขั้นตอนการสมัครพาร์ทเนอร์ร้านค้า/สถานบันเทิง มีอะไรบ้าง?',
      answer: 'คุณสามารถสมัครโดยเตรียมเอกสารรูปใบอนุญาตประกอบการค้า และรูปภาพหน้าร้าน จากนั้นเข้าไปที่หน้า "สมัครเป็นพาร์ทเนอร์ร้านค้า" กรอกข้อมูล และปักหมุดแผนที่ให้ชัดเจน หลังจากกดยืนยันแล้ว ทางผู้ดูแลระบบจะใช้เวลาตรวจสอบและอนุมัติภายใน 1-3 วันทำการ'
    },
    {
      category: 'driver',
      question: 'เอกสารที่จำเป็นสำหรับการสมัครเป็นพนักงานขับรถสำรอง (คนขับ) คืออะไร?',
      answer: 'เอกสารที่ต้องใช้แนบในการสมัคร ได้แก่: 1. รูปถ่ายโปรไฟล์คนขับ, 2. รูปถ่ายรถยนต์คู่ใจ, 3. รูปถ่ายใบอนุญาตขับรถยนต์ (ใบขับขี่), 4. รูปถ่ายประวัติอาชญากรรม (ถ้ามี), และ 5. ใบรับรองแพทย์ไม่เกิน 1 เดือน เพื่อยืนยันความพร้อมของสุขภาพ'
    },
    {
      category: 'general',
      question: 'ระบบ SafeSeat มีขั้นตอนช่วยลดการเมาแล้วขับอย่างไร?',
      answer: 'SafeSeat จะมีส่วนเชื่อมต่อโดยให้ร้านค้าพาร์ทเนอร์อำนวยความสะดวกในการเรียกรถส่งผู้ใช้งาน หรือผู้ใช้ทั่วไปสามารถเรียกคนขับสำรองที่อยู่บริเวณใกล้เคียงเพื่อขับรถยนต์ส่วนตัวของผู้ใช้กลับบ้านอย่างปลอดภัย ไร้กังวลเรื่องด่านตรวจและอุบัติเหตุ'
    },
    {
      category: 'driver',
      question: 'หลังจากลงทะเบียนคนขับแล้ว จะตรวจสอบสถานะการสมัครได้อย่างไร?',
      answer: 'คุณสามารถตรวจสอบสถานะได้โดยคลิกเมนูเข้าสู่ระบบ (Login) ด้วยชื่อผู้ใช้งานและรหัสผ่านที่สมัครไว้ หากระบบยังไม่อนุมัติจะนำทางไปยังหน้า "เช็คสถานะการสมัคร" เพื่อแสดงขั้นตอนความคืบหน้าอย่างละเอียดแบบเรียลไทม์'
    },
    {
      category: 'pub',
      question: 'สถานประกอบการต้องการเพิ่มตำแหน่งที่ตั้งร้านค้าใหม่ ต้องทำอย่างไร?',
      answer: 'คุณสามารถเข้าสู่ระบบผ่านบัญชีผู้ใช้พาร์ทเนอร์ร้านค้า จากนั้นเลือกเมนูข้อมูลร้านค้า เพื่อปรับเปลี่ยนตำแหน่งหมุดบนแผนที่ผ่านระบบ Leaflet Map Picker ได้แบบเรียลไทม์ทันที'
    },
    {
      category: 'general',
      question: 'สามารถติดต่อฝ่ายสนับสนุนลูกค้าหรือทีมงานเทคนิคได้ทางใดบ้าง?',
      answer: 'หากพบปัญหาการใช้งาน สามารถติดต่อได้ทาง LINE ID: @safeseat_support หรือโทรศัพท์สายด่วน 02-123-4567 ในช่วงเวลาให้บริการ 18:00 น. - 04:00 น. ของทุกวัน'
    }
  ]

  // จัดกลุ่มและคัดกรองคำถามตามหมวดหมู่และช่องค้นหา
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div style={styles.page}>
      {/* วงกลมพื้นหลังตกแต่ง */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <Navbar />

      <main style={styles.main}>
        {/* ── ส่วนที่ 1: ส่วนค้นหาและหัวข้อใหญ่ ── */}
        <section style={styles.heroSection}>
          <div style={styles.badge}>💡 ศูนย์ช่วยเหลือ & บริการลูกค้า</div>
          <h1 style={styles.title}>เราพร้อมช่วยเหลือคุณ</h1>
          <p style={styles.subtitle}>ค้นหาคำถามที่คุณสงสัย หรือเลือกดูข้อมูลตามหัวข้อด้านล่าง</p>
          
          {/* แถบค้นหา */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="พิมพ์คำถาม หรือหัวข้อที่ต้องการค้นหา..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setOpenFaqIndex(null)
              }}
              style={styles.searchInput}
            />
          </div>
        </section>

        {/* ── ส่วนที่ 2: แท็บฟิลเตอร์แบ่งหมวดหมู่ ── */}
        <div style={styles.tabContainer}>
          <button 
            onClick={() => { setActiveCategory('all'); setOpenFaqIndex(null); }}
            style={{...styles.tabBtn, ...(activeCategory === 'all' ? styles.tabBtnActive : {})}}
          >
            📋 ทั้งหมด
          </button>
          <button 
            onClick={() => { setActiveCategory('general'); setOpenFaqIndex(null); }}
            style={{...styles.tabBtn, ...(activeCategory === 'general' ? styles.tabBtnActive : {})}}
          >
            👤 สำหรับลูกค้าทั่วไป
          </button>
          <button 
            onClick={() => { setActiveCategory('pub'); setOpenFaqIndex(null); }}
            style={{...styles.tabBtn, ...(activeCategory === 'pub' ? styles.tabBtnActive : {})}}
          >
            🏪 สำหรับร้านค้า / ผับ
          </button>
          <button 
            onClick={() => { setActiveCategory('driver'); setOpenFaqIndex(null); }}
            style={{...styles.tabBtn, ...(activeCategory === 'driver' ? styles.tabBtnActive : {})}}
          >
            🚗 สำหรับพนักงานขับรถ
          </button>
        </div>

        {/* ── ส่วนที่ 3: รายการ FAQ แบบ Accordion ── */}
        <section style={styles.faqSection}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={index} style={{...styles.faqItem, borderColor: isOpen ? '#818cf8' : '#e2e8f0'}}>
                  <div style={styles.faqHeader} onClick={() => toggleFaq(index)}>
                    <span style={styles.faqQuestion}>
                      <span style={{ color: '#4f46e5', marginRight: '8px' }}>Q:</span>
                      {faq.question}
                    </span>
                    <span style={{
                      ...styles.arrowIcon,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </span>
                  </div>
                  {isOpen && (
                    <div style={styles.faqContent}>
                      <p style={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div style={styles.noResults}>
              <span>📭</span>
              <p>ไม่พบหัวข้อคำถามที่ตรงกับข้อมูลค้นหาของคุณ</p>
            </div>
          )}
        </section>

        {/* ── ส่วนที่ 4: ช่องทางการติดต่อทีมงาน ── */}
        <section style={styles.contactSection}>
          <h2 style={styles.contactHeading}>หากยังไม่พบคำตอบที่คุณต้องการ?</h2>
          <p style={styles.contactSub}>คุณสามารถติดต่อเจ้าหน้าที่ฝ่ายดูแลลูกค้าได้โดยตรงตามช่องทางดังนี้</p>
          
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <span style={styles.contactCardIcon}>💚</span>
              <h3 style={styles.contactCardTitle}>LINE Official Account</h3>
              <p style={styles.contactCardText}>แอดไลน์เพื่อแชทถามฝ่ายดูแลลูกค้า</p>
              <span style={styles.contactValue}>@safeseat_support</span>
            </div>

            <div style={styles.contactCard}>
              <span style={styles.contactCardIcon}>📞</span>
              <h3 style={styles.contactCardTitle}>ฝ่ายบริการด่วน (Hotline)</h3>
              <p style={styles.contactCardText}>โทรสอบถามข้อมูลการเดินทางหรือปัญหาการใช้งาน</p>
              <span style={styles.contactValue}>02-123-4567 (18:00 - 04:00 น.)</span>
            </div>

            <div style={styles.contactCard}>
              <span style={styles.contactCardIcon}>✉️</span>
              <h3 style={styles.contactCardTitle}>ติดต่อทางอีเมล</h3>
              <p style={styles.contactCardText}>ส่งเอกสารแจ้งปัญหาระบบเพิ่มเติม</p>
              <span style={styles.contactValue}>support@safeseat.com</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* CSS Styles & Micro-Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e0e7ff 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: '-180px',
    right: '-120px',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-120px',
    left: '-160px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  main: {
    flex: 1,
    maxWidth: '920px',
    width: '100%',
    margin: '0 auto',
    padding: '50px 24px 70px',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },

  // ── Hero Section ──
  heroSection: {
    textAlign: 'center',
    animation: 'fadeUp 0.4s ease both',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-block',
    background: '#e0e7ff',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(79,70,229,0.2)',
    marginBottom: '18px',
  },
  title: {
    fontSize: '34px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#475569',
    marginBottom: '24px',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '560px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    fontSize: '18px',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '16px 20px 16px 50px',
    borderRadius: '14px',
    border: '1.5px solid #cbd5e1',
    fontSize: '14.5px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Prompt', sans-serif",
    transition: 'border-color 0.2s',
  },

  // ── Tab Filters ──
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    animation: 'fadeUp 0.5s ease both',
  },
  tabBtn: {
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
  },
  tabBtnActive: {
    background: '#4f46e5',
    color: '#ffffff',
    borderColor: '#4f46e5',
    boxShadow: '0 4px 12px rgba(79,70,229,0.15)',
  },

  // ── FAQ Items ──
  faqSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    animation: 'fadeUp 0.6s ease both',
  },
  faqItem: {
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
    transition: 'border-color 0.2s',
  },
  faqHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  faqQuestion: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: '12px',
    color: '#94a3b8',
    transition: 'transform 0.25s ease',
  },
  faqContent: {
    padding: '0 24px 20px',
    borderTop: '1px solid #f1f5f9',
    background: '#fafbfd',
  },
  faqAnswer: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.6,
    margin: '16px 0 0',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
    fontSize: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  // ── Contact Section ──
  contactSection: {
    textAlign: 'center',
    marginTop: '20px',
    animation: 'fadeUp 0.7s ease both',
  },
  contactHeading: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '8px',
  },
  contactSub: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '32px',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px',
  },
  contactCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '28px 12px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  contactCardIcon: {
    fontSize: '28px',
    marginBottom: '14px',
  },
  contactCardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '8px',
  },
  contactCardText: {
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '16px',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  },
  contactValue: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#4f46e5',
  },
}
