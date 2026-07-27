'use client'
// ═══════════════════════════════════════════════════════════════
// app/page.tsx
// หน้าแรกของระบบ SafeSeat (Home Page) - ตรงตาม Mockup Wireframe
// ═══════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import api from '@/services/api'

const SLIDES = [
  {
    title: 'SafeSeat แพลตฟอร์มป้องกันอุบัติเหตุเมาแล้วขับ',
    subtitle: 'ส่งคุณและรถยนต์กลับบ้านปลอดภัย ไร้กังวลเรื่องการเดินทางขากลับ',
    badge: '🛡️ มาตรฐานความปลอดภัยสูงสุด',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'บริการเรียกพนักงานขับรถแทน (Customer)',
    subtitle: 'คนขับมืออาชีพขับรถของคุณส่งถึงบ้าน ปลอดภัยและมั่นใจทุกเส้นทาง',
    badge: '📱 ปลอดภัยตลอดเส้นทางด้วยคนขับส่วนตัว',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'พาร์ทเนอร์ร้านค้าและสถานบันเทิง (Venues)',
    subtitle: 'เรียกรถให้ลูกค้ากลับบ้านปลอดภัย พร้อมสิทธิประโยชน์โปรโมทร้านค้า',
    badge: '🏪 ยกระดับภาพลักษณ์ความปลอดภัยของร้าน',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=900&auto=format&fit=crop',
  },
  {
    title: 'พนักงานขับรถแทน SafeSeat (Drivers)',
    subtitle: 'สร้างรายได้เสริมมั่นคง เลือกรับงานและวันเวลาได้อิสระตามต้องการ',
    badge: '💼 รายได้เสริมที่มั่นคง เวลางานยืดหยุ่น',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=900&auto=format&fit=crop',
  }
]

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
};

const decodeId = (input: string) => {
  const clean = input.replace('#', '').trim();
  if (!clean) return null;
  if (/^\d+$/.test(clean) && clean.length < 6) {
    return parseInt(clean, 10);
  }
  const offset = 100000000;
  const num = parseInt(clean.toLowerCase(), 36);
  if (isNaN(num)) return null;
  const decoded = num - offset;
  return decoded > 0 ? decoded : null;
};

export default function HomePage() {
  const router = useRouter()
  const [activeSlide, setActiveSlide] = useState(0)

  // Search states for customer / acquaintance tracking
  const [searchCode, setSearchCode] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  const handleSearchCode = async () => {
    const cleanInput = searchCode.replace('#', '').trim()
    if (!cleanInput) return
    setSearchError('')
    setSearching(true)

    const decodedId = decodeId(cleanInput)
    if (!decodedId) {
      setSearchError('❌ รหัสการเรียกไม่ถูกต้อง')
      setSearching(false)
      return
    }

    try {
      const res = await api.get(`/pub/service-request/${decodedId}`)
      if (res.data.success && res.data.data) {
        if (res.data.data.requestType === 'user') {
          // ถ้างานถูกสร้างขึ้นโดย User ให้ส่งไปหน้าติดตามผู้ใช้ทั่วไป (/trip) โดยใช้ไอดีตรงๆ
          router.push(`/trip?id=${decodedId}`)
        } else {
          // ถ้างานถูกสร้างขึ้นโดย Pub ให้ส่งไปหน้าติดตามทางผ่านร้านค้า (/tracking) โดยใช้รหัสบีบอัด
          const alphaCode = encodeId(decodedId)
          router.push(`/tracking?id=${alphaCode}`)
        }
      } else {
        setSearchError('❌ ไม่พบข้อมูลการบริการสำหรับรหัสนี้')
      }
    } catch (err) {
      setSearchError('❌ ไม่พบข้อมูลการบริการสำหรับรหัสนี้ หรือรหัสไม่ถูกต้อง')
    } finally {
      setSearching(false)
    }
  }

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length)
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRegisterClick = () => {
    router.push('/register')
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ── ส่วนที่ 1: Slideshow Banner (ความกว้างเท่าหน้าจอ, สูง 360px และใช้ภาพถ่ายจริงประกอบสไลด์) ── */}
      <section style={styles.sliderSection}>
        <div className="home-slider-container" style={styles.sliderContainerInline}>
          {/* Arrow Left */}
          <button onClick={prevSlide} className="arrow-btn" style={styles.arrowLeft} aria-label="Previous Slide">
            ◀
          </button>

          {/* Slide Layout */}
          <div className="home-slide-grid" style={styles.slideGridInline}>
            {/* Left side: Text Content */}
            <div className="home-slide-text" style={styles.slideTextContainerInline}>
              <div style={styles.slideBadge}>
                {SLIDES[activeSlide].badge}
              </div>
              <h2 style={styles.slideTitle}>
                {SLIDES[activeSlide].title}
              </h2>
              <p style={styles.slideSubtitle}>
                {SLIDES[activeSlide].subtitle}
              </p>
            </div>

            {/* Right side: Blended Photo */}
            <div className="home-slide-image" style={styles.slideImageContainerInline}>
              <div style={styles.imageGradientOverlay} />
              <img
                src={SLIDES[activeSlide].image}
                alt={SLIDES[activeSlide].title}
                style={styles.slideImage}
              />
            </div>
          </div>

          {/* Arrow Right */}
          <button onClick={nextSlide} className="arrow-btn" style={styles.arrowRight} aria-label="Next Slide">
            ▶
          </button>

          {/* Dot Indicators */}
          <div style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <div
                key={index}
                onClick={() => setActiveSlide(index)}
                style={{
                  ...styles.dot,
                  backgroundColor: index === activeSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                  width: index === activeSlide ? '24px' : '8px',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <main style={styles.main}>
        {/* ── ส่วนที่ 2: Logo & Main Slogan ── */}
        <section style={styles.sloganSection}>
          <div style={styles.logoBadge}>
            <span style={styles.logoBadgeIcon}>🛡️</span> SafeSeat
          </div>
          <h1 style={styles.sloganTitle}>
            แพลตฟอร์มสนับสนุนการป้องกันเมาแล้วขับด้วยบริการผู้ขับขี่แทน
          </h1>

          {/* ช่องค้นหารหัสการเรียกสำหรับผู้ใช้หรือคนรู้จัก */}
          <div style={{ width: '100%', maxWidth: 600, margin: '0 auto 28px', padding: '0 20px', textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              gap: 8,
              backgroundColor: '#ffffff',
              padding: 6,
              borderRadius: 16,
              border: searchError ? '2px solid #ef4444' : '2px solid #cbd5e1',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}>
              <input 
                type="text"
                placeholder="🔍 ใส่รหัสการเรียก (เช่น 1NJCHY) เพื่อค้นหาและติดตาม..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchCode(); }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '12px 12px 12px 16px',
                  fontSize: 14,
                  fontFamily: "'Prompt', sans-serif",
                  backgroundColor: 'transparent',
                  color: '#0f172a',
                }}
              />
              <button
                type="button"
                onClick={handleSearchCode}
                disabled={searching}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: searching ? 'not-allowed' : 'pointer',
                  fontFamily: "'Prompt', sans-serif",
                  transition: 'all 0.2s',
                  opacity: searching ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                }}
              >
                {searching ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </div>
            {searchError && (
              <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, textAlign: 'center', fontWeight: 600, margin: '10px 0 0' }}>
                {searchError}
              </p>
            )}
          </div>

          {/* ปุ่มลัดเพื่อนำทางไปลงทะเบียน */}
          <button onClick={handleRegisterClick} style={styles.registerCTA}>
            ร่วมโครงการกับเราวันนี้ →
          </button>
        </section>

        {/* ── ส่วนที่ 3: Section Tabs / Navigation (ผู้ใช้งาน / ผู้ประกอบการ / ผู้ขับขี่) ── */}
        <div className="home-section-tabs" style={styles.sectionTabsInline}>
          <div className="tab-btn" style={styles.tabItem} onClick={() => scrollToSection('user-section')}>ผู้ใช้งาน</div>
          <div className="tab-btn" style={styles.tabItem} onClick={() => scrollToSection('pub-section')}>ผู้ประกอบการสถานบันเทิง</div>
          <div className="tab-btn" style={styles.tabItem} onClick={() => scrollToSection('driver-section')}>ผู้ให้บริการขับรถ</div>
        </div>

        {/* ── ส่วนที่ 4: Cards Layout (2 คอลัมน์ด้านบน) ── */}
        <section className="home-two-col" style={styles.twoColumnGridInline}>
          {/* Card A: ผู้ใช้งาน */}
          <div id="user-section" style={{...styles.card, scrollMarginTop: '100px'}}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>ผู้ใช้งาน</h2>
              <span style={styles.greenDot}>●</span>
            </div>
            <ul style={styles.detailList}>
              <li style={styles.listItem}>📱 เรียกใช้งานสะดวก รวดเร็ว ผ่านทางเว็บแอปพลิเคชัน SafeSeat</li>
              <li style={styles.listItem}>🚗 พนักงานขับรถส่วนตัวเดินทางไปขับรถยนต์ของท่านส่งกลับถึงที่บ้านอย่างปลอดภัย</li>
              <li style={styles.listItem}>🛡️ อุ่นใจด้วยประกันอุบัติเหตุคุ้มครองรถยนต์และผู้โดยสารตลอดระยะการบริการ</li>
              <li style={styles.listItem}>💰 อัตราค่าบริการสมเหตุสมผล คำนวณตามระยะทางจริงอย่างโปร่งใส</li>
              <li style={styles.listItem}>⭐ พนักงานขับรถทุกคนผ่านการอบรมและตรวจสอบประวัติอาชญากรรมอย่างละเอียด</li>
              <li style={styles.listItem}>📞 บริการช่วยเหลือฉุกเฉินและติดต่อสอบถามปัญหาได้ตลอด 24 ชั่วโมง</li>
            </ul>
          </div>

          {/* Card B: ผู้ให้บริการขับรถ */}
          <div id="driver-section" style={{...styles.card, scrollMarginTop: '100px'}}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>ผู้ให้บริการขับรถ</h2>
              <span style={styles.greenDot}>●</span>
            </div>
            <ul style={styles.detailList}>
              <li style={styles.listItem}>💸 สร้างรายได้เสริมรายวัน รับเงินทันทีหลังเสร็จสิ้นการบริการในแต่ละงาน</li>
              <li style={styles.listItem}>⏰ กำหนดเวลาทำงานได้อิสระ เลือกรับงานตามวันและเวลาที่สะดวก</li>
              <li style={styles.listItem}>🛡️ คุ้มครองความปลอดภัยด้วยระบบสนับสนุนช่วยเหลือและแจ้งเหตุ SOS ฉุกเฉิน</li>
              <li style={styles.listItem}>📱 ระบบแอปพลิเคชันนำทางล้ำสมัย ช่วยวางแผนการเดินทางได้อย่างสะดวกแม่นยำ</li>
              <li style={styles.listItem}>🎓 ได้รับการฝึกอบรมการขับขี่ปลอดภัยและการบริการระดับมืออาชีพ</li>
              <li style={styles.listItem}>🤝 ชุมชนครอบครัวคนขับ SafeSeat ร่วมแชร์ประสบการณ์และช่วยเหลือซึ่งกันและกัน</li>
            </ul>
          </div>
        </section>

        {/* ── ส่วนที่ 5: Card C: ผู้ประกอบการสถานบันเทิง (เต็มความกว้างพร้อม 3 รูป) ── */}
        <section id="pub-section" style={{...styles.fullWidthSection, scrollMarginTop: '100px'}}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>ผู้ประกอบการสถานบันเทิง</h2>
              <span style={styles.greenDot}>●</span>
            </div>
            <p style={styles.cardSubText}>
              รายละเอียดการเข้าร่วมเป็นร้านค้าพาร์ทเนอร์เพื่ออำนวยความสะดวกในระบบ และสิทธิประโยชน์ในการส่งลูกค้ากลับบ้านอย่างปลอดภัย
            </p>

            {/* แถวแสดงข้อมูลพาร์ทเนอร์ร้านค้า 3 คอลัมน์ */}
            <div className="home-pic-grid3" style={styles.picGrid3Inline}>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=600&auto=format&fit=crop" 
                  alt="ระบบการจองที่หน้าร้าน" 
                  style={styles.cardHeaderImage} 
                />
                <div style={styles.picTitle}>ระบบการจองที่หน้าร้าน</div>
                <div style={styles.picLabel}>มีแท็บเล็ตและระบบจองบริการให้ที่หน้าร้าน เพื่ออำนวยความสะดวกในการเรียกรถให้ลูกค้าได้ทันที</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/tracking_mockup.png" 
                  alt="ระบบตรวจสอบสถานะลูกค้า" 
                  style={styles.cardHeaderImage} 
                />
                <div style={styles.picTitle}>ระบบตรวจสอบสถานะลูกค้า</div>
                <div style={styles.picLabel}>สามารถติดตามการเดินทางกลับบ้านของลูกค้าได้ผ่านแดชบอร์ด เพื่อความอุ่นใจและใส่ใจในความปลอดภัยของลูกค้า</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop" 
                  alt="โปรโมทและคะแนนสะสม" 
                  style={styles.cardHeaderImage} 
                />
                <div style={styles.picTitle}>โปรโมทและคะแนนสะสม</div>
                <div style={styles.picLabel}>โปรโมทร้านค้าพันธมิตรบนแอปพลิเคชัน SafeSeat พร้อมรับคะแนนสะสมแลกสิทธิประโยชน์พิเศษมากมาย</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ส่วนที่ 6: Section Information (6 คอลัมน์/ช่อง) ── */}
        <section style={styles.fullWidthSection}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Information</h2>
              <span style={styles.greenDot}>●</span>
            </div>

            {/* ข้อมูลประโยชน์และการทำงานของแพลตฟอร์ม 6 ช่อง */}
            <div className="home-info-grid6" style={styles.infoGrid6Inline}>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/prevent_accidents.png" 
                  alt="ป้องกันอุบัติเหตุ" 
                  style={styles.cardHeaderImageSmall} 
                />
                <div style={styles.picTitle}>ป้องกันอุบัติเหตุ</div>
                <div style={styles.picLabel}>ร่วมเป็นส่วนสำคัญในการลดอัตราการเกิดอุบัติเหตุบนท้องถนนจากการเมาแล้วขับ เพื่อความปลอดภัยของชีวิตและทรัพย์สิน</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/law_checkpoint.png" 
                  alt="หลีกเลี่ยงกฎหมาย" 
                  style={styles.cardHeaderImageSmall} 
                />
                <div style={styles.picTitle}>หลีกเลี่ยงกฎหมาย</div>
                <div style={styles.picLabel}>ลดความเสี่ยงจากการโดนด่านตรวจวัดปริมาณแอลกอฮอล์ ถูกยึดใบขับขี่ หรือถูกดำเนินคดีทางกฎหมายที่มีโทษรุนแรง</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/car_parked_home.png" 
                  alt="รถจอดปลอดภัยที่บ้าน" 
                  style={styles.cardHeaderImageSmall} 
                />
                <div style={styles.picTitle}>รถจอดปลอดภัยที่บ้าน</div>
                <div style={styles.picLabel}>ไม่ต้องเป็นห่วงรถยนต์ส่วนตัวทิ้งไว้ข้ามคืนที่สถานบันเทิง มีคนขับรถพาทั้งตัวคุณและรถยนต์ของคุณส่งถึงบ้านอย่างอุ่นใจ</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/driver_profile_check.png" 
                  alt="คัดกรองประวัติคนขับ" 
                  style={{ ...styles.cardHeaderImageSmall, objectPosition: 'center bottom' }} 
                />
                <div style={styles.picTitle}>คัดกรองประวัติคนขับ</div>
                <div style={styles.picLabel}>คนขับรถทดแทนทุกคนผ่านการตรวจสอบประวัติอาชญากรรมโดยตรงจากหน่วยงานภาครัฐ เพื่อความปลอดภัยสูงสุดของผู้รับบริการ</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/gps_navigation_phone.png" 
                  alt="ติดตามเรียลไทม์ GPS" 
                  style={styles.cardHeaderImageSmall} 
                />
                <div style={styles.picTitle}>ติดตามเรียลไทม์ GPS</div>
                <div style={styles.picLabel}>ระบบ GPS ประสิทธิภาพสูงสำหรับการแสดงพิกัดแบบเรียลไทม์ ช่วยให้คุณระบุตำแหน่งของรถยนต์และผู้ขับรถได้ตลอดเวลา</div>
              </div>
              <div className="info-pic-box" style={styles.picBoxCustom}>
                <img 
                  src="/images/sos_emergency_button.png" 
                  alt="ปุ่ม SOS ช่วยเหลือ" 
                  style={styles.cardHeaderImageSmall} 
                />
                <div style={styles.picTitle}>ปุ่ม SOS ช่วยเหลือ</div>
                <div style={styles.picLabel}>ฟังก์ชันความปลอดภัยอัจฉริยะ ปุ่ม SOS สำหรับส่งพิกัดแจ้งเหตุฉุกเฉินไปยังทีมสนับสนุนทันทีเมื่อเกิดสถานการณ์ผิดปกติ</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }
        
        .arrow-btn {
          transition: all 0.2s ease;
        }
        .arrow-btn:hover {
          background-color: rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.05) translateY(-50%);
        }
        
        .tab-btn {
          border-bottom: 2px solid transparent !important;
          transition: all 0.2s ease !important;
        }
        .tab-btn:hover {
          color: #4f46e5 !important;
          border-color: #cbd5e1 !important;
        }
        
        .info-pic-box {
          transition: all 0.3s ease;
        }
        .info-pic-box:hover {
          transform: translateY(-4px);
          border-color: #cbd5e1 !important;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '36px 24px 72px',
    boxSizing: 'border-box',
  },
  sliderSection: {
    width: '100%',
    marginBottom: '48px',
    userSelect: 'none',
  },
  sliderContainer: {
    width: '100%',
    height: '380px',
    backgroundColor: '#0b0f1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#ffffff',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  slideGrid: {
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slideTextContainer: {
    width: '52%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    paddingLeft: '64px',
    zIndex: 3,
  },
  slideImageContainer: {
    width: '48%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  imageGradientOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #0b0f1a 0%, rgba(11, 15, 26, 0.55) 55%, rgba(11, 15, 26, 0) 100%)',
    zIndex: 2,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.8,
  },
  slideBadge: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(129, 140, 248, 0.35)',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '18px',
    color: '#c7d2fe',
    letterSpacing: '0.2px',
  },
  slideTitle: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 12px',
    lineHeight: 1.35,
    letterSpacing: '-0.4px',
  },
  slideSubtitle: {
    fontSize: '15px',
    fontWeight: 400,
    margin: 0,
    lineHeight: 1.65,
    color: 'rgba(255, 255, 255, 0.75)',
    maxWidth: '480px',
  },
  arrowLeft: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    zIndex: 10,
    transition: 'background 150ms ease, transform 150ms ease',
  },
  arrowRight: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    zIndex: 10,
    transition: 'background 150ms ease, transform 150ms ease',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '18px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '6px',
    zIndex: 5,
  },
  dot: {
    height: '6px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 250ms ease',
  },
  sloganSection: {
    textAlign: 'center',
    marginBottom: '52px',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#eef2ff',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: 600,
    padding: '5px 14px',
    borderRadius: '20px',
    marginBottom: '16px',
    border: '1px solid #c7d2fe',
  },
  logoBadgeIcon: {
    fontSize: '15px',
  },
  sloganTitle: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.4,
    marginBottom: '20px',
    letterSpacing: '-0.5px',
  },
  registerCTA: {
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    padding: '11px 26px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
    transition: 'background 150ms ease, box-shadow 150ms ease',
  },
  sectionTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '36px',
  },
  tabItem: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '36px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '10px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.2px',
  },
  greenDot: {
    color: '#10b981',
    fontSize: '16px',
  },
  detailList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.65,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  fullWidthSection: {
    width: '100%',
    marginBottom: '36px',
  },
  cardSubText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
    lineHeight: 1.6,
  },
  picGrid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
  },
  picBoxCustom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
    boxSizing: 'border-box',
    transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
  },
  iconWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '4px',
  },
  iconWrapperSmall: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '2px',
  },
  picTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.1px',
  },
  picLabel: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  infoGrid6: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px 20px',
  },
  cardHeaderImage: {
    width: '100%',
    height: '136px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '12px',
  },
  cardHeaderImageSmall: {
    width: '100%',
    height: '126px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '10px',
  },
}