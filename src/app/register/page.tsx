'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Store, Car, ArrowRight } from 'lucide-react'

export default function RegisterSelectorPage() {
  const router = useRouter()

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-48 pb-24 flex flex-col items-center gap-12">
        
        {}
        <div className="text-center flex flex-col items-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest font-manrope">
              PARTNER REGISTRATION PORTAL
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-manrope tracking-tight leading-tight mb-4 text-[var(--color-text)] whitespace-nowrap">
            CHOOSE YOUR{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8]">
              PARTNERSHIP
            </span>{' '}
            PATH.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed font-light whitespace-nowrap">
            เลือกประเภทการลงทะเบียนเพื่อเข้าร่วมกับ SafeSeat ไม่ว่าคุณจะเป็นเจ้าของสถานบริการ หรือผู้ให้บริการขับรถแทน
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {}
          <div
            onClick={() => router.push('/register/pub')}
            className="group p-8 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-xl flex flex-col gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-[#7C3AED] flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform">
              <Store className="w-7 h-7 text-[#7C3AED]" />
            </div>

            <span className="text-xs font-mono font-bold tracking-widest text-[#7C3AED]">
              PORTAL 
            </span>
            <h2 className="text-2xl font-bold font-manrope text-[var(--color-text)]">
              Venue Partner
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light flex-1">
              สำหรับร้านค้า บาร์ คาราโอเกะ หรือสถานบันเทิงยามค่ำคืน ที่ต้องการเชื่อมต่อระบบเรียกคนขับแทน เพื่อดูแลสวัสดิภาพลูกค้าหน้าร้าน
            </p>

            <button className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
              REGISTER VENUE <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {}
          <div
            onClick={() => router.push('/register/driver')}
            className="group p-8 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[#7C3AED] rounded-2xl shadow-xl flex flex-col gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform">
              <Car className="w-7 h-7 text-blue-500" />
            </div>

            <span className="text-xs font-mono font-bold tracking-widest text-[#7C3AED]">
              PORTAL 
            </span>
            <h2 className="text-2xl font-bold font-manrope text-[var(--color-text)]">
              Designated Driver
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light flex-1">
              สำหรับพนักงานขับรถมืออาชีพที่ต้องการสร้างรายได้เสริมที่มั่นคง ปลอดภัย พร้อมเลือกเวลาและพื้นที่ในการรับงานได้อย่างอิสระ
            </p>

            <button className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
              JOIN AS DRIVER <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {}
        <div className="text-center text-sm text-[var(--color-text-muted)]">
          <span>มีบัญชีผู้ใช้ในระบบอยู่แล้ว? </span>
          <button
            onClick={() => router.push('/login')}
            className="text-[#7C3AED] font-bold underline ml-1 hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            เข้าสู่ระบบที่นี่ →
          </button>
        </div>

      </main>

      <Footer />
    </div>
  )
}