'use client'

// ═══════════════════════════════════════════════════════════════
// app/about/page.tsx — SafeSeat About Page (Thai Language)
// ═══════════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Shield, Car, Store, Smartphone, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Global Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-44 pb-24 flex flex-col gap-20">
        
        {/* ── Hero Header Section ── */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest font-manrope">
              วิสัยทัศน์ &amp; พันธกิจ
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-manrope tracking-tight leading-tight mb-6 text-[var(--color-text)]">
            เราออกแบบระบบเพื่อยกระดับความปลอดภัย{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8]">
              และความอุ่นใจ
            </span>{' '}
            ในทุกการเดินทางบนท้องถนน
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed font-light">
            SafeSeat คือแพลตฟอร์มสนับสนุนการป้องกันอุบัติเหตุจากการเมาแล้วขับด้วยบริการผู้ขับขี่แทน (Designated Driver Service)
            ที่เชื่อมโยงระหว่างผู้ใช้บริการ สถานบันเทิงพาร์ทเนอร์ และผู้ขับขี่แทนอย่างมีประสิทธิภาพด้วยเทคโนโลยีนำทางและ GPS เรียลไทม์
          </p>
        </section>

        {/* ── Vision & Mission Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-4 hover:border-[#7C3AED]/50 transition-all">
            <span className="text-xs font-mono font-bold tracking-widest text-[#7C3AED]">
              01 // วิสัยทัศน์ของเรา
            </span>
            <h2 className="text-2xl font-bold font-manrope text-[var(--color-text)]">
              การปฏิวัติความปลอดภัยทางถนน
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
              มุ่งมั่นที่จะเป็นส่วนหนึ่งในการลดอัตราการเกิดอุบัติเหตุทางถนนจากการขับขี่ขณะมึนเมา
              พร้อมยกระดับสังคมการสัญจรให้ปลอดภัยในค่ำคืนการพักผ่อนของทุกคนด้วยระบบการจองและติดตามเรียลไทม์
            </p>
          </div>

          <div className="p-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col gap-4 hover:border-[#7C3AED]/50 transition-all">
            <span className="text-xs font-mono font-bold tracking-widest text-[#7C3AED]">
              02 // พันธกิจของเรา
            </span>
            <h2 className="text-2xl font-bold font-manrope text-[var(--color-text)]">
              มาตรฐานสวัสดิภาพที่ไม่ประนีประนอม
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
              ส่งมอบบริการที่โปร่งใส ปลอดภัย และเชื่อถือได้ ควบคู่ไปกับการสร้างโอกาสและรายได้เสริมที่มั่นคงให้แก่ผู้ขับขี่แทน
              ที่ผ่านการตรวจสอบประวัติอาชญากรรมและการยืนยันตัวตนอย่างเข้มงวด
            </p>
          </div>
        </section>

        {/* ── Key Features Section ── */}
        <section className="flex flex-col gap-10">
          <div className="text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[#7C3AED] uppercase">ทำไมต้องเลือก SAFESEAT</span>
            <h2 className="text-3xl font-bold font-manrope text-[var(--color-text)] mt-2">มาตรฐานบริการของ SAFESEAT</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex items-start gap-4 shadow-md">
              <div className="p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-xl text-[#7C3AED] shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-manrope text-[var(--color-text)] mb-2">พนักงานขับรถผ่านการคัดกรอง</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  พนักงานขับรถสำรองทุกคนผ่านการตรวจสอบประวัติอาชญากรรม ประวัติการขับขี่ และมีใบอนุญาตขับขี่ถูกต้องตามกฎหมาย
                </p>
              </div>
            </div>

            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex items-start gap-4 shadow-md">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-manrope text-[var(--color-text)] mb-2">เครือข่ายพาร์ทเนอร์ร้านค้า</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  สถานบันเทิง ร้านอาหาร และผับ สามารถเรียกรถ ส่งงาน และตรวจสอบสถิติเรียลไทม์เพื่อดูแลสวัสดิภาพลูกค้าหน้าร้านได้อย่างไร้รอยต่อ
                </p>
              </div>
            </div>

            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex items-start gap-4 shadow-md">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-manrope text-[var(--color-text)] mb-2">ระบบติดตาม GPS เรียลไทม์</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  ระบบติดตามสถานะการเดินทางอย่างแม่นยำ พร้อมระบบแจ้งเตือนฉุกเฉินเพื่อให้ญาติหรือเจ้าของร้านอุ่นใจตลอดเส้นทาง
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="p-12 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#1D4ED8] rounded-3xl text-center text-white shadow-2xl flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold font-manrope">ร่วมเป็นส่วนหนึ่งของเครือข่ายความปลอดภัย</h2>
          <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed">
            ไม่ว่าคุณจะเป็นเจ้าของสถานบริการ หรือต้องการร่วมเป็นผู้ให้บริการขับรถแทน สมัครเป็นพาร์ทเนอร์กับ SafeSeat วันนี้
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3.5 bg-white text-[#7C3AED] font-bold text-xs tracking-wider uppercase rounded-full hover:bg-slate-100 transition-all shadow-lg cursor-pointer flex items-center gap-2"
          >
            สมัครใช้งานเลย <ArrowRight className="w-4 h-4" />
          </button>
        </section>

      </main>

      <Footer />
    </div>
  )
}
