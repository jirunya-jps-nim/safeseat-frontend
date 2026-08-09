'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import api from '@/services/api'
import { ArrowRight, Search, Shield, Zap, Car, Star, Bot, Code, Layers, Check, User } from 'lucide-react'

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

  // Real-time tracking code search states
  const [searchCode, setSearchCode] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  const handleSearchCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanInput = searchCode.replace('#', '').trim()
    if (!cleanInput) return
    setSearchError('')
    setSearching(true)

    const decodedId = decodeId(cleanInput)
    if (!decodedId) {
      setSearchError('❌ ไม่พบรหัสบริการนี้ กรุณาตรวจสอบอีกครั้ง')
      setSearching(false)
      return
    }

    try {
      const res = await api.get(`/pub/service-request/${decodedId}`)
      if (res.data.success && res.data.data) {
        if (res.data.data.requestType === 'user') {
          router.push(`/trip?id=${decodedId}`)
        } else {
          const alphaCode = encodeId(decodedId)
          router.push(`/tracking?id=${alphaCode}`)
        }
      } else {
        setSearchError('❌ ไม่พบข้อมูลบริการสำหรับรหัสนี้')
      }
    } catch (err) {
      setSearchError('❌ ไม่พบข้อมูลการบริการสำหรับรหัสนี้ หรือรหัสไม่ถูกต้อง')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* ── Global Starfield & Grid Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--color-bg)] transition-colors duration-300">
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-violet-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Top Blur Header Mask */}
      <div className="gradient-blur"></div>

      {/* Navbar & Floating Controls */}
      <Navbar />

      <main className="relative z-10">
        
        {/* ═══════════════════════════════════════════════════════════════
            1. HERO SECTION: ROYAL PURPLE-BLUE DESIGNED FOR SAFE NIGHTS
            ═══════════════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-48 pb-20 px-6">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Live Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-md backdrop-blur-md mb-8 animate-fade-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7C3AED]"></span>
              </span>
              <span className="text-xs font-bold text-[#7C3AED] tracking-wide font-manrope">
                SafeSeat 2.0 พร้อมให้บริการครอบคลุมทั่วประเทศแล้ววันนี้
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#7C3AED]" />
            </div>

            {/* Purple-Blue Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter font-manrope leading-[1.15] mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="block text-[var(--color-text)]">
                บริการผู้ขับขี่แทนมืออาชีพ
              </span>
              <span className="block text-[var(--color-text)] mt-2">
                เพื่อทุกค่ำคืนที่{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#1D4ED8] inline-block relative">
                  ปลอดภัย
                  <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#7C3AED] opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base md:text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto mb-10 leading-relaxed font-normal animate-fade-up" style={{ animationDelay: '0.2s' }}>
               SafeSeat ผสานระบบนำทาง GPS เรียลไทม์เข้ากับคนขับมืออาชีพที่ผ่านการตรวจสอบประวัติ เพื่อส่งคุณและรถยนต์ส่วนตัวของคุณกลับบ้านอย่างปลอดภัย ไร้กังวลเรื่องอุบัติเหตุและด่านตรวจ
            </p>

            {/* Integrated Tracking Code Search Box */}
            <div className="max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <form onSubmit={handleSearchCode} className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full shadow-[0_10px_35px_rgba(124,58,237,0.18)] backdrop-blur-xl">
                <div className="flex-1 flex items-center gap-3 px-5 py-2 w-full">
                  <Search className="w-5 h-5 text-[#7C3AED]" />
                  <input
                    type="text"
                    placeholder="ป้อนรหัสติดตามบริการ (เช่น #55 หรือ 55)..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white font-bold text-xs tracking-wider uppercase rounded-full transition-all shadow-lg hover:shadow-[0_0_25px_rgba(124,58,237,0.7)] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  {searching ? 'กำลังค้นหา...' : 'ติดตามสถานะ'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {searchError && <p className="mt-3 text-xs text-red-500 font-bold">{searchError}</p>}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <button 
                onClick={() => router.push('/register')}
                className="shiny-cta group cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2 text-[var(--color-text)] font-bold">
                  เริ่มสมัครใช้งานระบบ <ArrowRight className="w-4 h-4 text-[#7C3AED] transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <button 
                onClick={() => router.push('/register/pub')}
                className="group px-6 py-3.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] font-bold hover:bg-[var(--color-card-hover)] transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4 text-[#7C3AED]" />
                สำหรับพาร์ทเนอร์ร้านค้า
              </button>

              <button 
                onClick={() => router.push('/register/driver')}
                className="group px-6 py-3.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] font-bold hover:bg-[var(--color-card-hover)] transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Car className="w-4 h-4 text-[#7C3AED]" />
                สำหรับพาร์ทเนอร์คนขับ
              </button>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            2. BENTO GRID: THE OPERATING SYSTEM FOR MODERN SAFE NIGHTLIFE
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center max-w-5xl mx-auto animate-fade-up">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight font-manrope mb-6 whitespace-nowrap">
                ระบบปฏิบัติการเพื่อความปลอดภัย{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8]">
                  ยามค่ำคืนยุคใหม่
                </span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-normal whitespace-nowrap">
                ยุติความเสี่ยงการขับขี่ขณะมึนเมา ด้วยแพลตฟอร์มคนขับรถแทนที่ผ่านการตรวจสอบประวัติ พร้อมระบบติดตาม GPS เรียลไทม์
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Main Feature Bento Card (Left Panel - 4 cols - Static Card) */}
              <div className="lg:col-span-4 group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-6 inline-flex p-3.5 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/40 text-[#7C3AED]">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] font-manrope mb-4 tracking-tight">การจัดส่งงานคนขับอัตโนมัติ</h3>
                    <p className="text-[var(--color-text-muted)] text-base sm:text-lg leading-relaxed font-normal">เชื่อมต่อสถานบันเทิงและร้านค้าพาร์ทเนอร์กับคนขับรถมืออาชีพใกล้เคียงในทันที ผ่านการตรวจสอบประวัติอาชญากรรม คำนวณเส้นทางอัตโนมัติ และมีประกันภัยคุ้มครองทุกการเดินทาง</p>
                  </div>
                </div>
              </div>

              {/* Right Side Cards Container (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Bento Feature 2: Code Export & Tracking (Static Card) */}
                <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-2xl shadow-md">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-500">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] font-manrope mb-2">แชร์รหัสติดตามสถานะเรียลไทม์</h3>
                      <p className="text-[var(--color-text-muted)] text-sm sm:text-base font-normal leading-relaxed">แชร์รหัสการเดินทาง (#10000001) ให้กับครอบครัวหรือคนใกล้ชิด เพื่อติดตามพิกัดการเดินทางกลับบ้านของคุณสดๆ</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Feature 3 & Feature 4 (Static Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  
                  {/* Bento Feature 3: Smart SOS Iteration (Static Card) */}
                  <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-2xl shadow-md flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex p-3 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-500">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] font-manrope mb-2 leading-snug">ปุ่มแจ้งเหตุฉุกเฉิน Smart SOS</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">เชื่อมต่อสายด่วนฉุกเฉินพร้อมส่งพิกัด GPS แม่นยำทันทีที่เกิดเหตุ</p>
                    </div>
                  </div>

                  {/* Bento Feature 4: Verified Driver Pipeline (Static Card) */}
                  <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-2xl shadow-md flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-500">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] font-manrope mb-2 leading-snug">เครือข่ายคนขับคัดกรองเข้มงวด</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">ผ่านการตรวจสอบประวัติอาชญากรรมและส่งเสริมรายได้ที่มั่นคง</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════════
            3. ROYAL PURPLE-BLUE TESTIMONIAL BANNER
            ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#1D4ED8] py-20 px-6 my-12 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 text-yellow-300 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold font-manrope leading-tight">
              "SafeSeat ยกระดับความปลอดภัยให้แก่ลูกค้าของร้านเราอย่างสมบูรณ์แบบ เรื่องที่เคยเป็นความเสี่ยงสูง กลายเป็นเรื่องง่ายและอุ่นใจในไม่กี่นาที"
            </h3>
          </div>
        </div>


        {/* ═══════════════════════════════════════════════════════════════
            4. SERVICE TIERS & PRICING GRID (3 CARDS: Personal, Venue, Driver)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 bg-[var(--color-bg)] relative border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] font-manrope mb-4">แพ็กเกจและประเภทบริการ</h2>
              <p className="text-[var(--color-text-muted)] font-normal">เลือกแพ็กเกจบริการที่ตอบโจทย์ความต้องการของคุณหรือสถานประกอบการ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Personal Ride */}
              <div className="p-8 border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[#7C3AED]/60 transition-all rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">บริการขับรถส่วนบุคคล</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับบุคคลทั่วไปที่ต้องการคนขับรถสำรองขับรถส่วนตัวกลับบ้าน</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">฿</span>
                    <span className="text-5xl font-extrabold text-[var(--color-text)]">350</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/เริ่มต้น</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> 1 คนขับประจำเที่ยวรถ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> รหัสติดตามสถานะ GPS เรียลไทม์
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> ประกันภัยคุ้มครองยานพาหนะ
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/tracking')}
                  className="w-full py-3.5 px-4 bg-[var(--color-surface)] hover:bg-[#7C3AED]/20 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  ติดตามสถานะการเดินทาง
                </button>
              </div>

              {/* Pro Partner Venue (Recommended Highlight) */}
              <div className="relative p-8 border-2 border-[#7C3AED] bg-[var(--color-card)] shadow-[0_0_45px_rgba(124,58,237,0.25)] rounded-2xl flex flex-col justify-between scale-105 z-10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  แนะนำสำหรับสถานบันเทิง
                </div>
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">พาร์ทเนอร์สถานบริการ</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับร้านอาหาร ผับ บาร์ คาราโอเกะ ที่ดูแลรถลูกค้าหน้าร้าน</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">฿</span>
                    <span className="text-5xl font-extrabold text-[var(--color-text)]">0</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/ไม่มีค่าแรกเข้า</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> ระบบเรียกคนขับผ่านแท็บเล็ต/QR
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> จัดส่งคนขับถึงร้านเป็นลำดับแรก
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> แดชบอร์ดตรวจสอบสถิติเรียลไทม์
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> ประชาสัมพันธ์ร้านค้าบนเครือข่าย
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/register/pub')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  สมัครพาร์ทเนอร์ร้านค้า
                </button>
              </div>

              {/* Driver Card Restored */}
              <div className="p-8 border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[#7C3AED]/60 transition-all rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">พนักงานขับรถสำรอง</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับพนักงานขับรถมืออาชีพที่ต้องการสร้างรายได้เสริมที่มั่นคง</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">รายได้</span>
                    <span className="text-4xl font-extrabold text-[var(--color-text)]">ยืดหยุ่น</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/ถอนเงินได้ทุกวัน</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> เลือกรอบและเวลาทำงานอิสระ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> ปุ่มแจ้งเหตุฉุกเฉินคุ้มครองคนขับ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#7C3AED]" /> โอนเงินรายได้เข้าบัญชีทุกวัน
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/register/driver')}
                  className="w-full py-3.5 px-4 bg-[var(--color-surface)] hover:bg-[#7C3AED]/20 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  สมัครเป็นพนักงานขับรถ
                </button>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}