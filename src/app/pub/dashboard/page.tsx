'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Car, FileText, BarChart3, Shield, Radio, CheckCircle2, ArrowRight } from 'lucide-react'

// หน้าแดชบอร์ดหลักสำหรับสถานบันเทิงพาร์ทเนอร์ (Pub / Venue Dashboard)
export default function PubDashboardPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    const parsed = JSON.parse(userStr)
    if (parsed.regisstatus !== 'approved' && parsed.regisstatus !== 'อนุมัติแล้ว') {
      router.push('/status')
      return
    }
    setPubUser(parsed)
    localStorage.removeItem('safeseat_request_form')
  }, [router])

  if (!pubUser) return null
  const pubName = pubUser.pubname || pubUser.username || 'PUB'

  const cards = [
    {
      id: 'request',
      code: 'SERVICE // 01',
      title: 'เรียกรถให้ผู้ใช้บริการ',
      subtitle: 'REQUEST DESIGNATED DRIVER',
      desc: 'เรียกพนักงานขับรถแทนมืออาชีพให้ผู้ใช้บริการของคุณ รับส่งถึงที่หมายอย่างปลอดภัยตลอดเส้นทาง',
      btnLabel: 'เรียกคนขับแทนตอนนี้',
      icon: Car,
      colorClass: 'text-[#2340A7]',
      borderHover: 'hover:border-[#2340A7]',
      btnBg: 'bg-gradient-to-r from-[#2340A7] to-[#2563EB]',
      path: '/pub/request-driver',
    },
    {
      id: 'list',
      code: 'SERVICE // 02',
      title: 'ประวัติการเรียกรถ',
      subtitle: 'SERVICE HISTORY & STATUS',
      desc: 'ตรวจสอบรายการ ติดตามสถานะการเดินทางแบบเรียลไทม์ และเช็คประวัติย้อนหลังของผู้ใช้บริการ',
      btnLabel: 'ดูประวัติการเรียกรถ',
      icon: FileText,
      colorClass: 'text-[#2563EB]',
      borderHover: 'hover:border-[#2563EB]',
      btnBg: 'bg-gradient-to-r from-[#2340A7] to-[#2563EB]',
      path: '/pub/service-info',
    },
    {
      id: 'summary',
      code: 'SERVICE // 03',
      title: 'ผลสรุปบริการ',
      subtitle: 'ANALYTICS & REVENUE SUMMARY',
      desc: 'ดูยอดรวมการใช้บริการ ส่วนแบ่งรายได้พาร์ทเนอร์ และสถิติสรุปประจำเดือนของสถานบันเทิง',
      btnLabel: 'ดูผลสรุปรายได้',
      icon: BarChart3,
      colorClass: 'text-[#059669]',
      borderHover: 'hover:border-[#059669]',
      btnBg: 'bg-gradient-to-r from-[#2340A7] to-[#2563EB]',
      path: '/pub/summary',
    },
  ]

  const badges = [
    { icon: CheckCircle2, label: 'สถานะบัญชี', value: 'อนุมัติแล้ว (APPROVED)', color: 'text-[#059669]' },
    { icon: Shield, label: 'ระดับความปลอดภัย', value: 'สูงสุด (MAXIMUM HIGH)', color: 'text-[#2340A7]' },
    { icon: Radio, label: 'ระบบจ่ายงาน', value: 'เปิดใช้งาน 24/7 ACTIVE', color: 'text-[#2563EB]' },
  ]

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-12">
        
        {}
        <section className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-[#2340A7] animate-pulse"></span>
            <span className="text-xs font-bold text-[#2340A7] uppercase tracking-widest font-manrope">
              VENUE PARTNER DASHBOARD
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-manrope tracking-tight leading-tight mb-3 text-[var(--color-text)]">
            ยินดีต้อนรับกลับ,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2340A7] to-[#2563EB]">
              {pubName}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed font-light max-w-none whitespace-nowrap">
            จัดการบริการเรียกรถแทนให้ผู้ใช้บริการ ติดตามสถานะเดินทาง และดูสรุปผลสถิติรายได้ของสถานบริการ
          </p>
        </section>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const IconComp = card.icon
            return (
              <div
                key={card.id}
                onClick={() => router.push(card.path)}
                className={`group p-8 bg-[var(--color-card)] border border-[var(--color-border)] ${card.borderHover} rounded-2xl shadow-xl flex flex-col justify-between gap-6 cursor-pointer transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#2340A7]">
                      {card.code}
                    </span>
                    <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl group-hover:scale-110 transition-transform">
                      <IconComp className={`w-6 h-6 ${card.colorClass}`} />
                    </div>
                  </div>

                  <span className={`text-xs font-bold tracking-wider ${card.colorClass}`}>
                    {card.subtitle}
                  </span>

                  <h3 className="text-2xl font-bold font-manrope text-[var(--color-text)]">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
                    {card.desc}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); router.push(card.path); }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {card.btnLabel} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((b, i) => {
            const IconComp = b.icon
            return (
              <div key={i} className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex items-center gap-4 shadow-md">
                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shrink-0">
                  <IconComp className={`w-6 h-6 ${b.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
                    {b.label}
                  </span>
                  <span className={`text-sm font-bold font-manrope mt-0.5 ${b.color}`}>
                    {b.value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </main>

      <Footer />
    </div>
  )
}
