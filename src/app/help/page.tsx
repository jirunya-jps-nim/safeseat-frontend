'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Search, ChevronDown, MessageSquare, Phone, Mail } from 'lucide-react'

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

  const faqs: FAQItem[] = [
    {
      category: 'pub',
      question: 'ขั้นตอนการสมัครพาร์ทเนอร์สถานบันเทิง มีอะไรบ้าง?',
      answer: 'คุณสามารถสมัครโดยเตรียมเอกสารรูปใบอนุญาตประกอบการ และรูปภาพหน้าสถานบันเทิง จากนั้นเข้าไปที่หน้า "สมัครเป็นพาร์ทเนอร์สถานบันเทิง" กรอกข้อมูล และปักหมุดแผนที่ให้ชัดเจน หลังจากกดยืนยันแล้ว ทางผู้ดูแลระบบจะใช้เวลาตรวจสอบและอนุมัติภายใน 1-3 วันทำการ'
    },
    {
      category: 'driver',
      question: 'เอกสารที่จำเป็นสำหรับการสมัครเป็นพนักงานขับรถแทน (คนขับ) คืออะไร?',
      answer: 'เอกสารที่ต้องใช้แนบในการสมัคร ได้แก่: 1. รูปถ่ายโปรไฟล์คนขับ, 2. รูปถ่ายรถยนต์คู่ใจ, 3. รูปถ่ายใบอนุญาตขับรถยนต์ (ใบขับขี่), 4. รูปถ่ายประวัติอาชญากรรม (ถ้ามี), และ 5. ใบรับรองแพทย์ไม่เกิน 1 เดือน เพื่อยืนยันความพร้อมของสุขภาพ'
    },
    {
      category: 'general',
      question: 'ระบบ SafeSeat มีขั้นตอนช่วยลดการเมาแล้วขับอย่างไร?',
      answer: 'SafeSeat จะมีส่วนเชื่อมต่อโดยให้สถานบันเทิงพาร์ทเนอร์อำนวยความสะดวกในการเรียกรถส่งผู้ใช้งาน หรือผู้ใช้ทั่วไปสามารถเรียกพนักงานขับรถแทนที่อยู่บริเวณใกล้เคียงเพื่อขับรถยนต์ส่วนตัวของผู้ใช้กลับบ้านอย่างปลอดภัย ไร้กังวลเรื่องด่านตรวจและอุบัติเหตุ'
    },
    {
      category: 'driver',
      question: 'หลังจากลงทะเบียนคนขับแล้ว จะตรวจสอบสถานะการสมัครได้อย่างไร?',
      answer: 'คุณสามารถตรวจสอบสถานะได้โดยคลิกเมนูเข้าสู่ระบบ (Login) ด้วยชื่อผู้ใช้งานและรหัสผ่านที่สมัครไว้ หากระบบยังไม่อนุมัติจะนำทางไปยังหน้า "เช็คสถานะการสมัคร" เพื่อแสดงขั้นตอนความคืบหน้าอย่างละเอียดแบบเรียลไทม์'
    },
    {
      category: 'pub',
      question: 'สถานประกอบการต้องการเพิ่มตำแหน่งที่ตั้งสถานบันเทิงใหม่ ต้องทำอย่างไร?',
      answer: 'คุณสามารถเข้าสู่ระบบผ่านบัญชีผู้ใช้พาร์ทเนอร์สถานบันเทิง จากนั้นเลือกเมนูข้อมูลสถานบันเทิง เพื่อปรับเปลี่ยนตำแหน่งหมุดบนแผนที่ผ่านระบบ Leaflet Map Picker ได้แบบเรียลไทม์ทันที'
    },
    {
      category: 'general',
      question: 'สามารถติดต่อฝ่ายสนับสนุนผู้ใช้บริการหรือทีมงานเทคนิคได้ทางใดบ้าง?',
      answer: 'หากพบปัญหาการใช้งาน สามารถติดต่อได้ทาง LINE ID: @safeseat_support หรือโทรศัพท์สายด่วน 02-123-4567 ในช่วงเวลาให้บริการ 18:00 น. - 04:00 น. ของทุกวัน'
    }
  ]

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
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-44 pb-24 flex flex-col gap-16">
        
        {/* Header Search Section */}
        <section className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#2340A7] animate-pulse"></span>
            <span className="text-xs font-bold text-[#2340A7] uppercase tracking-widest font-manrope">
              ศูนย์ช่วยเหลือ &amp; ความปลอดภัย
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-manrope tracking-tight leading-tight mb-6 text-[var(--color-text)] max-w-5xl mx-auto whitespace-nowrap">
            คำถามที่พบบ่อย &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2340A7] to-[#2563EB]">
              ฝ่ายสนับสนุนผู้ใช้บริการ
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-muted)] font-light mb-8 whitespace-nowrap overflow-x-auto px-2">
            ค้นหาข้อมูลการใช้งาน คำถามที่พบบ่อย และคู่มือขั้นตอนการให้บริการสำหรับผู้ใช้บริการ สถานบันเทิงพาร์ทเนอร์ และผู้ขับขี่แทน
          </p>

          {/* Search Box */}
          <div className="w-full max-w-xl flex items-center gap-3 px-6 py-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full shadow-lg">
            <Search className="w-5 h-5 text-[#2340A7]" />
            <input 
              type="text" 
              placeholder="พิมพ์คำถาม หรือหัวข้อที่ต้องการค้นหา..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setOpenFaqIndex(null)
              }}
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] font-medium"
            />
          </div>
        </section>

        {/* Category Filters */}
        <div className="flex justify-center flex-wrap gap-3">
          <button 
            onClick={() => { setActiveCategory('all'); setOpenFaqIndex(null); }}
            style={activeCategory === 'all' ? { color: '#ffffff' } : {}}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all' 
                ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white shadow-md' 
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#2340A7]'
            }`}
          >
            หมวดหมู่ทั้งหมด
          </button>
          <button 
            onClick={() => { setActiveCategory('general'); setOpenFaqIndex(null); }}
            style={activeCategory === 'general' ? { color: '#ffffff' } : {}}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeCategory === 'general' 
                ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white shadow-md' 
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#2340A7]'
            }`}
          >
            ผู้ใช้บริการทั่วไป
          </button>
          <button 
            onClick={() => { setActiveCategory('pub'); setOpenFaqIndex(null); }}
            style={activeCategory === 'pub' ? { color: '#ffffff' } : {}}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeCategory === 'pub' 
                ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white shadow-md' 
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#2340A7]'
            }`}
          >
            พาร์ทเนอร์สถานบันเทิง
          </button>
          <button 
            onClick={() => { setActiveCategory('driver'); setOpenFaqIndex(null); }}
            style={activeCategory === 'driver' ? { color: '#ffffff' } : {}}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeCategory === 'driver' 
                ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] !text-white shadow-md' 
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#2340A7]'
            }`}
          >
            ผู้ขับขี่แทน
          </button>
        </div>

        {/* FAQs Accordion */}
        <section className="flex flex-col gap-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={index} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all shadow-md">
                  <div 
                    onClick={() => toggleFaq(index)}
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-[var(--color-card-hover)] transition-colors"
                  >
                    <span className="font-bold text-base text-[var(--color-text)] font-manrope">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#2340A7] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
              📭 ไม่พบหัวข้อคำถามที่ตรงกับข้อมูลค้นหาของคุณ
            </div>
          )}
        </section>

        {/* Contact Channels */}
        <section className="flex flex-col gap-8 pt-8 border-t border-[var(--color-border)]">
          <div className="text-center">
            <span className="text-xs font-bold tracking-widest text-[#2340A7] uppercase">ช่องทางติดต่อโดยตรง</span>
            <h2 className="text-3xl font-bold font-manrope text-[var(--color-text)] mt-2">ต้องการความช่วยเหลือเพิ่มเติม?</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">เจ้าหน้าที่ฝ่ายสนับสนุนผู้ใช้บริการพร้อมดูแลและตอบข้อสงสัยของคุณตลอด 24 ชั่วโมง</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center text-center gap-3 shadow-md hover:border-[#2340A7]/50 transition-all">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">LINE Official</h3>
              <p className="text-xs text-[var(--color-text-muted)]">แชทสอบถามฝ่ายสนับสนุนผู้ใช้บริการ</p>
              <span className="text-xs font-bold text-[#2340A7]">@safeseat_support</span>
            </div>

            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center text-center gap-3 shadow-md hover:border-[#2340A7]/50 transition-all">
              <div className="p-3 bg-[#2340A7]/10 border border-[#2340A7]/30 rounded-xl text-[#2340A7]">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">สายด่วนฉุกเฉิน</h3>
              <p className="text-xs text-[var(--color-text-muted)]">สายด่วนดูแลการเดินทางเรียลไทม์</p>
              <span className="text-xs font-bold text-[#2340A7]">02-123-4567</span>
            </div>

            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center text-center gap-3 shadow-md hover:border-[#2340A7]/50 transition-all">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">อีเมลฝ่ายสนับสนุน</h3>
              <p className="text-xs text-[var(--color-text-muted)]">แจ้งปัญหาระบบและส่งเอกสาร</p>
              <span className="text-xs font-bold text-[#2340A7]">support@safeseat.app</span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
