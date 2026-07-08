'use client'
// ═══════════════════════════════════════════════════════════════
// app/about/page.tsx
// หน้า "เกี่ยวกับเรา" (About Us Page - Cohesive Light Theme)
// ═══════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      {/* วงกลมตกแต่งพื้นหลัง (Decorative glow) */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <Navbar />

      <main style={styles.main}>
        {/* ── ส่วนที่ 1: Hero Section ── */}
        <section style={styles.heroSection}>
          <div style={styles.badge}>🛡️ เกี่ยวกับเรา</div>
          <h1 style={styles.title}>
            เราออกแบบระบบเพื่อชีวิตและ<br />
            ความปลอดภัยของทุกคนบนท้องถนน
          </h1>
          <p style={styles.subtitle}>
            SafeSeat คือแพลตฟอร์มสนับสนุนการป้องกันอุบัติเหตุจากการเมาแล้วขับ<br />
            ด้วยบริการผู้ขับขี่แทน (Replacement Driver Service) ที่เชื่อมโยงสถานบันเทิงและลูกค้าอย่างมีประสิทธิภาพ
          </p>
        </section>

        {/* ── ส่วนที่ 2: Content Grid ── */}
        <section style={styles.contentGrid}>
          {/* การ์ดวิสัยทัศน์ */}
          <div style={styles.card}>
            <div style={styles.iconContainer}>🎯</div>
            <h2 style={styles.cardTitle}>วิสัยทัศน์ของเรา (Our Vision)</h2>
            <p style={styles.cardDesc}>
              มุ่งมั่นที่จะเป็นส่วนหนึ่งในการลดอัตราการเกิดอุบัติเหตุทางถนนจากการขับขี่ขณะมึนเมา 
              และสร้างสังคมการสัญจรที่ปลอดภัยในค่ำคืนการพักผ่อนของทุกคน
            </p>
          </div>

          {/* การ์ดพันธกิจ */}
          <div style={styles.card}>
            <div style={styles.iconContainer}>🤝</div>
            <h2 style={styles.cardTitle}>พันธกิจของเรา (Our Mission)</h2>
            <p style={styles.cardDesc}>
              ยกระดับมาตรฐานความปลอดภัยโดยส่งมอบบริการที่เชื่อถือได้ ปลอดภัย และโปร่งใส 
              พร้อมสร้างรายได้เสริมให้กับพนักงานขับรถที่มีประสิทธิภาพและผ่านการตรวจสอบประวัติอย่างเข้มงวด
            </p>
          </div>
        </section>

        {/* ── ส่วนที่ 3: Key Features Section ── */}
        <section style={styles.featuresSection}>
          <h2 style={styles.sectionHeading}>เหตุผลที่ต้องเลือกใช้บริการ SafeSeat</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🚗</div>
              <div>
                <h3 style={styles.featureTitle}>คนขับมืออาชีพที่ไว้วางใจได้</h3>
                <p style={styles.featureText}>พนักงานขับรถสำรองทุกคนได้รับการตรวจสอบประวัติอาชญากรรมและใบขับขี่อย่างเข้มข้น</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🏪</div>
              <div>
                <h3 style={styles.featureTitle}>ระบบพาร์ทเนอร์ร้านค้าที่ลื่นไหล</h3>
                <p style={styles.featureText}>สถานบันเทิงสามารถเรียกพนักงานขับรถ ส่งงาน และเช็คประวัติการเดินทางได้อย่างง่ายดาย</p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>📲</div>
              <div>
                <h3 style={styles.featureTitle}>การติดตามและสถานะเรียลไทม์</h3>
                <p style={styles.featureText}>ตรวจสอบประวัติ รายละเอียดการจอง และเช็คขั้นตอนการอนุมัติได้แบบนาทีต่อนาที</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ส่วนที่ 4: CTA Section ── */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>มาร่วมสร้างค่ำคืนที่ปลอดภัยร่วมกับเรา</h2>
            <p style={styles.ctaDesc}>ไม่ว่าคุณจะเป็นเจ้าของสถานบริการ หรือผู้ให้บริการขับรถแทน สมัครเข้าร่วมเป็นพาร์ทเนอร์กับเราได้แล้ววันนี้</p>
            <button style={styles.ctaBtn} onClick={() => router.push('/register')}>
              เริ่มต้นลงทะเบียนฟรี →
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* CSS Animation & Hover Interactivity */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
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
    top: '-150px',
    left: '-150px',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle3: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '550px',
    height: '550px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  main: {
    flex: 1,
    maxWidth: '1000px',
    width: '100%',
    margin: '0 auto',
    padding: '60px 24px',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
  },

  // ── Hero Section ──
  heroSection: {
    textAlign: 'center',
    animation: 'fadeUp 0.4s ease both',
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
    lineHeight: 1.4,
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#475569',
    lineHeight: 1.7,
    margin: '0 auto',
    maxWidth: '720px',
  },

  // ── Content Grid ──
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    animation: 'fadeUp 0.5s ease both',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '36px 30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconContainer: {
    fontSize: '36px',
    marginBottom: '18px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '12px',
  },
  cardDesc: {
    fontSize: '14.5px',
    color: '#475569',
    lineHeight: 1.6,
  },

  // ── Features Section ──
  featuresSection: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '40px 36px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
    animation: 'fadeUp 0.6s ease both',
  },
  sectionHeading: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '32px',
    textAlign: 'center',
  },
  featuresGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  featureItem: {
    display: 'flex',
    gap: '18px',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: '24px',
    background: 'rgba(79,70,229,0.08)',
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '15.5px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '6px',
  },
  featureText: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.5,
  },

  // ── CTA Section ──
  ctaSection: {
    animation: 'fadeUp 0.7s ease both',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '24px',
    padding: '44px 30px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(79,70,229,0.2)',
  },
  ctaTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  ctaDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14.5px',
    marginBottom: '24px',
  },
  ctaBtn: {
    background: '#ffffff',
    color: '#4f46e5',
    border: 'none',
    padding: '13px 32px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}
