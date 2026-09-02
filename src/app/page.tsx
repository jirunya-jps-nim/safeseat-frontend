'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import api from '@/services/api'
import { useTheme } from '@/components/ThemeContext'
import { ArrowRight, Search, Shield, Zap, Car, Star, Bot, Code, Layers, Check, User, MapPin, Clock, ShieldCheck, Sparkles, PhoneCall, CheckCircle2 } from 'lucide-react'

// แผนที่จริงแบบ Interactive แสดงสถานบันเทิงจริงในเชียงใหม่
const ChiangMaiHeroMap = dynamic(() => import('@/components/ui/ChiangMaiHeroMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center border border-slate-200 dark:border-slate-800">
      <span className="text-xs font-bold text-slate-400">กำลังโหลดแผนที่เชียงใหม่...</span>
    </div>
  )
})

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  return String(id);
};

const decodeId = (input: string) => {
  const clean = input.replace('#', '').trim();
  if (!clean) return null;
  const num = parseInt(clean, 10);
  return isNaN(num) ? null : num;
};

// หน้าหลักเว็บไซต์ SafeSeat (Landing Page) & ระบบค้นหาติดตามการเดินทางเรียลไทม์
export default function HomePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // สถานะค้นหารหัสติดตามการเดินทาง
  const [searchCode, setSearchCode] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [multipleMatches, setMultipleMatches] = useState<any[] | null>(null)

  // ค้นหารหัสบริการและเปิดแท็บใหม่ติดตามสถานะ
  const handleSearchCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanInput = searchCode.replace('#', '').trim()
    if (!cleanInput) return
    setSearchError('')
    setSearching(true)
    setMultipleMatches(null)

    const decodedId = decodeId(cleanInput)
    if (!decodedId) {
      setSearchError('❌ ไม่พบรหัสบริการนี้ กรุณาตรวจสอบอีกครั้ง')
      setSearching(false)
      return
    }

    try {
      const res = await api.get(`/pub/service-request/${decodedId}`)
      if (res.data.success) {
        if (res.data.isMultiple && res.data.matches && res.data.matches.length > 0) {
          setMultipleMatches(res.data.matches)
        } else if (res.data.data) {
          const targetUrl = res.data.data.requestType === 'user' ? `/trip?id=${decodedId}` : `/tracking?id=${decodedId}`
          window.open(targetUrl, '_blank')
        } else {
          setSearchError('❌ ไม่พบข้อมูลบริการสำหรับรหัสนี้')
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
      
      {/* Background Gradients & Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--color-bg)] transition-colors duration-300">
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[#2340A7]/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(35,64,167,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(35,64,167,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Top Gradient Blur */}
      <div className="gradient-blur"></div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10">
        
        {/* =========================================================================
            SECTION 1: HERO & REALTIME TRACKING SEARCH (2-COLUMN WHITE THEME LAYOUT)
            ========================================================================= */}
        <section className={`relative min-h-[90vh] flex items-center justify-center pt-32 sm:pt-36 pb-20 px-6 sm:px-10 lg:px-12 overflow-hidden transition-colors duration-500 ${
          isDark 
            ? 'bg-[#050714]' 
            : 'bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#EFF6FF]/60'
        }`}>
          
          {/* Subtle Background Glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {isDark ? (
              <>
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#2340A7]/15 rounded-full blur-[140px]"></div>
                <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]"></div>
              </>
            ) : (
              <>
                <div className="absolute top-10 left-10 w-[550px] h-[550px] bg-blue-100/50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-indigo-50/60 rounded-full blur-[140px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(35,64,167,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(35,64,167,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_90%)]"></div>
              </>
            )}
          </div>

          <div className="max-w-7xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: HERO HEADLINE & SEARCH */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Main Headline (3-Line Layout from screenshot) */}
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-[58px] font-black tracking-tight font-manrope leading-[1.18] mb-6 animate-fade-up ${
                isDark 
                  ? 'text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]' 
                  : 'text-[#0F172A]'
              }`} style={{ animationDelay: '0.1s' }}>
                <span className="block font-black">
                  ทุกค่ำคืน
                </span>
                <span className="block font-black mt-1">
                  มีคนขับพากลับบ้านอย่าง
                </span>
                <span className={`block mt-1 font-black text-transparent bg-clip-text ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300' 
                    : 'bg-gradient-to-r from-[#1D358F] via-[#2563EB] to-[#0044C9]'
                }`}>
                  ปลอดภัย
                </span>
              </h1>

              {/* Sub-headline */}
              <p className={`text-sm sm:text-base md:text-lg max-w-xl mb-8 leading-relaxed font-medium animate-fade-up ${
                isDark 
                  ? 'text-slate-300' 
                  : 'text-[#334155]'
              }`} style={{ animationDelay: '0.2s' }}>
                ผู้ขับขี่แทนมืออาชีพที่ผ่านการตรวจสอบประวัติ นำทางด้วย GPS แบบเรียลไทม์ ส่งคุณและรถของคุณกลับถึงบ้าน โดยไม่ต้องกังวลเรื่องด่านตรวจหรืออุบัติเหตุ
              </p>

              {/* Live Tracking Search Box */}
              <div className="w-full max-w-xl mb-7 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <form onSubmit={handleSearchCode} className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl sm:rounded-full backdrop-blur-2xl border transition-all ${
                  isDark 
                    ? 'bg-slate-900/90 border-white/20 shadow-[0_15px_45px_rgba(0,0,0,0.6)]' 
                    : 'bg-white border-slate-300/90 shadow-[0_10px_35px_rgba(35,64,167,0.12)] hover:border-blue-400'
                }`}>
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                    <Search className={`w-5 h-5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-[#2340A7]'}`} />
                    <input
                      type="text"
                      placeholder="ป้อนรหัสติดตามบริการ..."
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      style={{ background: 'transparent', backgroundColor: 'transparent', boxShadow: 'none' }}
                      className={`w-full !bg-transparent text-sm focus:outline-none font-bold border-none ${
                        isDark ? 'text-white placeholder-slate-400' : 'text-[#0F172A] placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching}
                    style={{ color: '#ffffff' }}
                    className={`w-full sm:w-auto px-7 py-3.5 !text-white font-extrabold text-sm tracking-wide rounded-xl sm:rounded-full transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                      isDark 
                        ? 'bg-gradient-to-r from-[#2563EB] to-cyan-600 hover:from-[#1D4ED8] hover:to-cyan-700 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]' 
                        : 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1D4ED8] hover:shadow-[0_4px_18px_rgba(35,64,167,0.35)]'
                    }`}
                  >
                    <span style={{ color: '#ffffff' }}>{searching ? 'กำลังค้นหา...' : 'ติดตามสถานะ'}</span>
                    <ArrowRight className="w-4 h-4 text-white" style={{ color: '#ffffff' }} />
                  </button>
                </form>

                {/* Helper Example Code Tag */}
                <div className={`mt-3.5 flex flex-wrap items-center gap-2 text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-[#475569]'
                }`}>
                  <span>ตัวอย่างรหัสบริการ:</span>
                  <span className={`px-3 py-0.5 rounded-lg font-black font-mono shadow-xs border ${
                    isDark 
                      ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-300' 
                      : 'bg-blue-50 border-blue-200 text-[#1D358F]'
                  }`}>
                    79
                  </span>
                </div>

                {searchError && <p className="mt-3 text-sm text-red-600 font-black">{searchError}</p>}
              </div>

              {/* CTA Button */}
              <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <button 
                  onClick={() => router.push('/register')}
                  className={`px-6 py-3.5 rounded-2xl border font-black text-sm transition-all duration-300 flex items-center gap-2.5 shadow-md cursor-pointer group ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-[#0F172A] hover:bg-slate-50 hover:border-slate-400 hover:shadow-lg'
                  }`}
                >
                  <span>เริ่มสมัครใช้งานระบบ</span>
                  <ArrowRight className="w-4 h-4 text-[#2340A7] transition-transform group-hover:translate-x-1" />
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: REAL CHIANG MAI INTERACTIVE MAP WITH AUTHENTIC ENTERTAINMENT VENUES */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end animate-fade-up min-h-[440px] sm:min-h-[480px] lg:min-h-[500px]" style={{ animationDelay: '0.2s' }}>
              <ChiangMaiHeroMap />
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 2: SAFE SERVICE JOURNEY (3 STEPS WITH CINEMATIC PHOTO)
            ========================================================================= */}
        <section className="py-24 px-6 relative border-t border-[var(--color-border)] bg-[var(--color-surface)]/40">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center max-w-5xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2340A7] text-xs font-bold uppercase tracking-wider mb-4">
                <Shield className="w-3.5 h-3.5" /> ขั้นตอนการเดินทางที่อุ่นใจ
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-text)] tracking-tight font-manrope sm:whitespace-nowrap">
                3 ขั้นตอนง่ายๆ ส่งคุณและรถยนต์กลับถึงบ้าน{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2340A7] to-[#2563EB]">
                  อย่างปลอดภัย
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Cinematic Safe Arrival Photo */}
              <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl group">
                <img 
                  src="/images/safeseat_service_journey.png" 
                  alt="Safe arrival and car handover by verified professional driver" 
                  className="w-full h-full min-h-[380px] max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/90 text-white rounded-full text-xs font-extrabold w-fit mb-2 shadow-md backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ส่งมอบรถยนต์ถึงบ้านอย่างปลอดภัย
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black font-manrope">อุ่นใจทุกเส้นทาง ไร้กังวลเรื่องอุบัติเหตุและด่านตรวจ</h4>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">คนขับผ่านการคัดกรองประวัติอาชญากรรม 100% พร้อมประกันภัยคุ้มครองยานพาหนะ</p>
                </div>
              </div>

              {/* Right Column: 3 Step Cards */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                
                {/* Step 1 */}
                <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[#2340A7]/50 transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2340A7]/10 text-[#2340A7] border border-[#2340A7]/20 flex items-center justify-center font-black text-xl shrink-0 font-manrope">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--color-text)] font-manrope flex items-center gap-2">
                      แจ้งสถานบันเทิงหรือกรอกรหัสเรียกคนขับ
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium leading-relaxed">
                      เพียงแจ้งพนักงานร้าน หรือสแกน QR หน้าร้านเพื่อส่งคำขอพนักงานขับรถแทน โดยไม่ต้องดาวน์โหลดแอปพลิเคชันให้ยุ่งยาก
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[#2340A7]/50 transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-black text-xl shrink-0 font-manrope">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--color-text)] font-manrope flex items-center gap-2">
                      ติดตามคนขับและแชร์รหัสการเดินทางแบบเรียลไทม์
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium leading-relaxed">
                      ดูพิกัดคนขับที่กำลังเดินทางมาถึงร้าน ตรวจสอบรูปถ่าย ทะเบียนรถ และแชร์ลิงก์ติดตามสถานะให้คนใกล้ชิดได้ทันที
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[#2340A7]/50 transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-black text-xl shrink-0 font-manrope">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--color-text)] font-manrope flex items-center gap-2">
                      คนขับพาส่งถึงบ้านพร้อมส่งมอบกุญแจรถยนต์
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium leading-relaxed">
                      พักผ่อนบนรถส่วนตัวของคุณอย่างสบายใจ คนขับมืออาชีพจะขับรถยนต์ไปจอดที่บ้านคุณอย่างเรียบร้อยและปลอดภัย 100%
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 3: FEATURES & ECOSYSTEM BENTO GRID
            ========================================================================= */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center max-w-5xl mx-auto animate-fade-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-text)] tracking-tight font-manrope mb-4 sm:whitespace-nowrap">
                ระบบปฏิบัติการเพื่อความปลอดภัย{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2340A7] to-[#2563EB]">
                  ยามค่ำคืนยุคใหม่
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
                ยุติความเสี่ยงการขับขี่ขณะมึนเมา ด้วยแพลตฟอร์มคนขับรถแทนที่ผ่านการตรวจสอบประวัติ พร้อมระบบติดตาม GPS เรียลไทม์
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Feature 1: Large Bento */}
              <div className="lg:col-span-5 group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-6 inline-flex p-3.5 rounded-2xl bg-[#2340A7]/15 border border-[#2340A7]/40 text-[#2340A7]">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] font-manrope mb-4 tracking-tight">การจัดส่งงานคนขับอัตโนมัติ</h3>
                    <p className="text-[var(--color-text-muted)] text-base sm:text-lg leading-relaxed font-normal">
                      เชื่อมต่อสถานบันเทิงพาร์ทเนอร์กับคนขับรถมืออาชีพใกล้เคียงในทันที ผ่านการตรวจสอบประวัติอาชญากรรม คำนวณเส้นทางอัตโนมัติ และมีประกันภัยคุ้มครองทุกการเดินทาง
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 & Sub features */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                
                {/* Horizontal Bento */}
                <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-3xl shadow-md flex flex-col justify-between">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="mb-4 inline-flex p-3 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-500 w-fit">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text)] font-manrope mb-2">แชร์รหัสติดตามสถานะเรียลไทม์</h3>
                      <p className="text-[var(--color-text-muted)] text-sm sm:text-base font-normal leading-relaxed">
                        แชร์รหัสการเดินทาง (#10000001) ให้กับครอบครัวหรือคนใกล้ชิด เพื่อติดตามพิกัดการเดินทางกลับบ้านของคุณแบบสดๆ ผ่านหน้าเว็บ
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2 Small Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                  
                  <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-3xl shadow-md flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex p-3 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-500 w-fit">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[var(--color-text)] font-manrope mb-2 leading-snug">ปุ่มแจ้งเหตุฉุกเฉิน Smart SOS</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">
                        เชื่อมต่อสายด่วนฉุกเฉินพร้อมส่งพิกัด GPS แม่นยำทันทีที่เกิดเหตุ เพื่อความปลอดภัยสูงสุด
                      </p>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden p-8 border border-[var(--color-border)] bg-[var(--color-card)] rounded-3xl shadow-md flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-500 w-fit">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[var(--color-text)] font-manrope mb-2 leading-snug">เครือข่ายคนขับคัดกรองเข้มงวด</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">
                        ตรวจสอบประวัติอาชญากรรม ใบอนุญาตขับขี่ และมีมาตรฐานบริการสุภาพ มารยาทดีเยี่ยม
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: TESTIMONIAL BANNER
            ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#2340A7] via-[#1D358F] to-[#2563EB] py-20 px-6 my-12 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 text-yellow-300 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold font-manrope leading-tight">
              "SafeSeat ยกระดับความปลอดภัยให้แก่ผู้ใช้บริการของสถานบันเทิงเราอย่างสมบูรณ์แบบ เรื่องที่เคยเป็นความเสี่ยงสูง กลายเป็นเรื่องง่ายและอุ่นใจในไม่กี่นาที"
            </h3>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: PRICING & SERVICES
            ========================================================================= */}
        <section className="py-32 px-6 bg-[var(--color-bg)] relative border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] font-manrope mb-4">แพ็กเกจและประเภทบริการ</h2>
              <p className="text-[var(--color-text-muted)] font-normal">เลือกแพ็กเกจบริการที่ตอบโจทย์ความต้องการของคุณหรือสถานประกอบการ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Option 1: Personal Trip */}
              <div className="p-8 border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[#2340A7]/60 transition-all rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">บริการขับรถส่วนบุคคล</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับบุคคลทั่วไปที่ต้องการพนักงานขับรถแทนขับรถส่วนตัวกลับบ้าน</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">฿</span>
                    <span className="text-5xl font-extrabold text-[var(--color-text)]">300</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/เริ่มต้น</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> 1 คนขับประจำเที่ยวรถ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> รหัสติดตามสถานะ GPS เรียลไทม์
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> ประกันภัยคุ้มครองยานพาหนะ
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/tracking')}
                  className="w-full py-3.5 px-4 bg-[var(--color-surface)] hover:bg-[#2340A7]/15 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  ติดตามสถานะการเดินทาง
                </button>
              </div>

              {/* Option 2: Venue Partner (Featured) */}
              <div className="relative p-8 border-2 border-[#2340A7] bg-[var(--color-card)] shadow-[0_0_45px_rgba(35,64,167,0.25)] rounded-2xl flex flex-col justify-between scale-105 z-10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  แนะนำสำหรับสถานบันเทิง
                </div>
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">พาร์ทเนอร์สถานบริการ</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับสถานบันเทิง บาร์ คาราโอเกะ ที่ดูแลรถผู้ใช้บริการหน้าร้าน</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">฿</span>
                    <span className="text-5xl font-extrabold text-[var(--color-text)]">0</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/ไม่มีค่าแรกเข้า</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#2340A7]" /> ระบบเรียกคนขับผ่านแท็บเล็ต/QR
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#2340A7]" /> จัดส่งคนขับถึงสถานบันเทิงเป็นลำดับแรก
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#2340A7]" /> แดชบอร์ดตรวจสอบสถิติเรียลไทม์
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-semibold">
                      <Check className="w-4 h-4 text-[#2340A7]" /> ประชาสัมพันธ์สถานบันเทิงบนเครือข่าย
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/register/pub')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1D4ED8] !text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  สมัครพาร์ทเนอร์สถานบันเทิง
                </button>
              </div>

              {/* Option 3: Driver Partner */}
              <div className="p-8 border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[#2340A7]/60 transition-all rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-xl font-bold font-manrope mb-2 text-[var(--color-text)]">พนักงานขับรถแทน</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 h-10 font-normal">สำหรับพนักงานขับรถมืออาชีพที่ต้องการสร้างรายได้เสริมที่มั่นคง</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-[var(--color-text-muted)]">รายได้</span>
                    <span className="text-4xl font-extrabold text-[var(--color-text)]">ยืดหยุ่น</span>
                    <span className="text-[var(--color-text-muted)] text-sm font-semibold">/ถอนเงินได้ทุกวัน</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> เลือกรอบและเวลาทำงานอิสระ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> ปุ่มแจ้งเหตุฉุกเฉินคุ้มครองคนขับ
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--color-text)] font-medium">
                      <Check className="w-4 h-4 text-[#2340A7]" /> โอนเงินรายได้เข้าบัญชีทุกวัน
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push('/register/driver')}
                  className="w-full py-3.5 px-4 bg-[var(--color-surface)] hover:bg-[#2340A7]/15 text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  สมัครเป็นพนักงานขับรถ
                </button>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Multiple Matches Modal Popup */}
      {multipleMatches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setMultipleMatches(null)}>
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-[#0B132B] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
          }`} onClick={e => e.stopPropagation()}>
            <div className={`flex justify-between items-center pb-4 border-b mb-6 ${
              isDark ? 'border-slate-700/80' : 'border-slate-200'
            }`}>
              <div className={`flex items-center gap-2.5 text-lg font-black font-manrope ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}>
                <span className={`p-2 rounded-xl ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-[#1D358F] border border-blue-200/80'
                }`}>
                  <Layers className="w-5 h-5" />
                </span>
                พบข้อมูล 2 รายการซ้ำกัน ({multipleMatches[0]?.requestid})
              </div>
              <button 
                onClick={() => setMultipleMatches(null)}
                className={`font-black text-sm px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-[#0F172A]'
                }`}
              >
                ✕
              </button>
            </div>

            <p className={`text-sm mb-6 leading-relaxed font-bold ${
              isDark ? 'text-slate-200' : 'text-[#0F172A]'
            }`}>
              เนื่องจากรหัสหมายเลข <span className={`font-black ${isDark ? 'text-blue-400' : 'text-[#1D358F]'}`}>#{multipleMatches[0]?.requestid}</span> มีบันทึกอยู่ทั้งในระบบเรียกรถของผู้ใช้บริการ และระบบพาร์ทเนอร์สถานบันเทิง กรุณาเลือกรายการที่คุณต้องการติดตาม:
            </p>

            <div className="flex flex-col gap-3.5 mb-6">
              {multipleMatches.map((item, idx) => {
                const isUser = item.requestType === 'user'
                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const reqId = item.requestid
                      setMultipleMatches(null)
                      const targetUrl = isUser ? `/trip?id=${reqId}` : `/tracking?id=${reqId}`
                      window.open(targetUrl, '_blank')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        const reqId = item.requestid
                        setMultipleMatches(null)
                        const targetUrl = isUser ? `/trip?id=${reqId}` : `/tracking?id=${reqId}`
                        window.open(targetUrl, '_blank')
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] flex items-center justify-between gap-4 cursor-pointer shadow-xs ${
                      isDark
                        ? (isUser 
                            ? 'bg-slate-900/90 border-blue-500/40 hover:border-blue-400 hover:bg-blue-950/60'
                            : 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/60')
                        : (isUser
                            ? 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 hover:border-[#2340A7] hover:shadow-md'
                            : 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200 hover:border-[#2340A7] hover:shadow-md')
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl !text-white shadow-md bg-gradient-to-r from-[#2340A7] to-[#2563EB]">
                        {isUser ? <User className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <div 
                          className="text-base font-black tracking-tight"
                          style={{ color: isDark ? '#ffffff' : '#0F172A' }}
                        >
                          {isUser ? 'รายการของผู้ใช้บริการ (User Trip)' : 'รายการของสถานบันเทิง (Venue Order)'}
                        </div>
                        <div 
                          className="text-xs mt-1 font-bold"
                          style={{ color: isDark ? '#cbd5e1' : '#334155' }}
                        >
                          ผู้ใช้บริการ: <span style={{ color: isDark ? '#ffffff' : '#0F172A', fontWeight: 900 }}>{item.custname || '—'}</span> • สถานะ: <span style={{ color: isDark ? '#60a5fa' : '#1D358F', fontWeight: 900 }}>{item.requeststatus}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight 
                      className="w-5 h-5 shrink-0" 
                      style={{ color: isDark ? '#60a5fa' : '#1D358F' }} 
                    />
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setMultipleMatches(null)}
              className={`w-full py-3.5 font-black text-xs rounded-full transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 border-slate-300 text-[#0F172A] hover:bg-slate-200'
              }`}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {}
      <Footer />

    </div>
  )
}