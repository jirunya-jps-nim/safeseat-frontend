'use client'
// ═══════════════════════════════════════════════════════════════
// app/register/page.tsx
// หน้าสำหรับเลือกประเภทสมาชิกที่จะลงทะเบียน (Selector Page - Cohesive Light Theme)
// ═══════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { registerStyles as styles } from '@/lib/styles/registerStyles'

export default function RegisterSelectorPage() {
  const router = useRouter()

  return (
    <div style={styles.page}>
      {/* Background decoration circles */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      {/* Navbar */}
      <Navbar />

      {/* Main Selection Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative',
        zIndex: 5,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Title Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '45px',
          animation: 'fadeUp 0.4s ease both'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '14px',
            whiteSpace: 'nowrap', // ให้หัวข้อใหญ่เป็นบรรทัดเดียวกัน
          }}>
            เริ่มต้นสมัครสมาชิกกับ SafeSeat
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#475569',
            margin: '0 auto',
            lineHeight: 1.6,
            whiteSpace: 'nowrap', // ป้องกันคำตัดครึ่งคำ และให้อยู่บรรทัดเดียวกัน
          }}>
            เลือกประเภทบัญชีผู้ใช้ที่คุณต้องการ เพื่อเริ่มต้นลงทะเบียนเข้าสู่ระบบความปลอดภัยของเรา
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '860px',
          marginBottom: '45px',
          animation: 'fadeUp 0.5s ease both'
        }}>
          {/* Card 1: Pub Owner */}
          <div 
            onClick={() => router.push('/register/pub')}
            className="selector-card"
            style={{
              flex: '1 1 320px',
              maxWidth: '380px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '40px 30px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)',
            }}
          >
            {/* Icon Box */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              marginBottom: '24px',
            }}>
              🏪
            </div>
            
            {/* Title */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '14px',
              whiteSpace: 'nowrap', // ให้อยู่บรรทัดเดียวกัน
            }}>
              เจ้าของร้านค้า / สถานบันเทิง
            </h2>
            
            {/* Description - ตัดคำให้มีระเบียบ สวยงามและไม่ตัดครึ่งคำ */}
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '28px',
              flex: 1,
              maxWidth: '340px',
              wordBreak: 'keep-all', // ป้องกันการตัดอักษรกลางคำภาษาไทย
            }}>
              สำหรับร้านค้า บาร์ คาราโอเกะ หรือสถานบริการยามค่ำคืน ที่ต้องการเข้าร่วมระบบพาร์ทเนอร์ เพื่อส่งลูกค้ากลับบ้านอย่างปลอดภัย
            </p>
            
            {/* Button */}
            <button style={{
              width: '100%',
              background: '#4f46e5', // เปลี่ยนสีปุ่มให้ตรงกัน (สีน้ำเงินครามแบรนด์หลัก)
              border: 'none',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap', // ป้องกันข้อความในปุ่มแตกแถว
            }}>
              สมัครเป็นพาร์ทเนอร์ร้านค้า →
            </button>
          </div>

          {/* Card 2: Substitute Driver */}
          <div 
            onClick={() => router.push('/register/driver')}
            className="selector-card"
            style={{
              flex: '1 1 320px',
              maxWidth: '380px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0', // เปลี่ยนกรอบให้เท่ากันเป็นรูปแบบเดียวกับ Card 1
              padding: '40px 30px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)',
            }}
          >
            {/* Icon Box */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#f1f5f9', // ปรับไอคอนบล็อกให้มีสีและรูปแบบเดียวกับ Card 1
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              marginBottom: '24px',
            }}>
              🚗
            </div>
            
            {/* Title */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '14px',
              whiteSpace: 'nowrap', // ให้อยู่บรรทัดเดียวกัน
            }}>
              พนักงานขับรถแทน (คนขับ)
            </h2>
            
            {/* Description - ตัดคำให้มีระเบียบ สวยงามและไม่ตัดครึ่งคำ */}
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '28px',
              flex: 1,
              maxWidth: '340px',
              wordBreak: 'keep-all', // ป้องกันการตัดอักษรกลางคำภาษาไทย
            }}>
              สำหรับบุคคลทั่วไปที่ต้องการหารายได้เสริม ยื่นสมัครเป็นพนักงานขับรถสำรอง เพื่อบริการส่งลูกค้ากลับด้วยรถยนต์ของลูกค้าเอง
            </p>
            
            {/* Button */}
            <button style={{
              width: '100%',
              background: '#4f46e5', // ใช้ปุ่มสีครามแบรนด์หลัก รูปแบบและโทนเดียวกันเป๊ะ
              border: 'none',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap', // ป้องกันข้อความในปุ่มแตกแถว
            }}>
              สมัครเป็นคนขับ SafeSeat →
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeUp 0.6s ease both'
        }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>
            มีบัญชีอยู่แล้วในระบบ?{' '}
          </span>
          <button 
            onClick={() => router.push('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              padding: 0
            }}
          >
            เข้าสู่ระบบที่นี่
          </button>
        </div>
      </main>

      <Footer />

      {/* Custom Styles for Hover Effects */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Prompt', sans-serif; }

        .selector-card {
          border: 1px solid #e2e8f0 !important;
        }

        .selector-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.08) !important;
          border-color: #818cf8 !important;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}