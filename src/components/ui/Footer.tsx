'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] pt-10 pb-6 relative overflow-hidden text-[var(--color-text)] font-inter transition-colors duration-300">
      
      {}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-6 relative z-10">
        
        {}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] rounded-sm rotate-45 shadow-[0_0_15px_rgba(124,58,237,0.7)]"></div>
            <span className="text-xl font-bold font-manrope tracking-tight text-[var(--color-text)]">Safe<span className="text-[#7C3AED]">Seat</span></span>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-sm leading-relaxed text-xs font-normal">
            แพลตฟอร์มบริการคนขับรถแทนมืออาชีพ เพื่อยกระดับความปลอดภัย ยุติอุบัติเหตุเมาแล้วขับ และสร้างความอุ่นใจในการเดินทางทุกค่ำคืน
          </p>
        </div>
        
        {}
        <div>
          <h4 className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4 font-manrope">เมนูหลัก</h4>
          <ul className="space-y-2.5 text-[var(--color-text-muted)] text-xs font-medium">
            <li><Link href="/" className="hover:text-[var(--color-text)] transition-colors">หน้าแรก</Link></li>
            <li><Link href="/about" className="hover:text-[var(--color-text)] transition-colors">เกี่ยวกับเรา</Link></li>
            <li><Link href="/register/pub" className="hover:text-[var(--color-text)] transition-colors">สำหรับพาร์ทเนอร์ร้านค้า</Link></li>
            <li><Link href="/register/driver" className="hover:text-[var(--color-text)] transition-colors">สำหรับผู้ขับขี่แทน</Link></li>
            <li><Link href="/help" className="hover:text-[var(--color-text)] transition-colors">ศูนย์ช่วยเหลือ &amp; SOS</Link></li>
          </ul>
        </div>
        
        {}
        <div>
          <h4 className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest mb-4 font-manrope">ติดต่อ &amp; ช่วยเหลือ</h4>
          <div className="space-y-3 text-[var(--color-text-muted)] text-xs font-medium">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)]">
              <Phone className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>สายด่วน 24 ชั่วโมง: 02-123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)]">
              <Mail className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>contact@safeseat.app</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>ประกันภัยคุ้มครองยานพาหนะ</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="hidden dark:flex justify-center items-center py-2 opacity-15 pointer-events-none">
        <h1 className="text-[7vw] md:text-[6vw] leading-none font-extrabold font-manrope tracking-tighter text-stroke select-none">
          SAFESEAT
        </h1>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6 border-t border-[var(--color-border)] pt-4 flex flex-col md:flex-row items-center justify-between text-[var(--color-text-muted)] text-[10px] tracking-widest gap-2">
        <p>&copy; 2026 SafeSeat Platform Inc. สงวนลิขสิทธิ์ทั้งหมด</p>
        <div className="flex gap-6 font-semibold">
          <a href="#" className="hover:text-[var(--color-text)] transition-colors">นโยบายความเป็นส่วนตัว</a>
          <a href="#" className="hover:text-[var(--color-text)] transition-colors">ข้อกำหนดการให้บริการ</a>
          <a href="#" className="hover:text-[var(--color-text)] transition-colors">ประกันภัยสวัสดิภาพ</a>
        </div>
      </div>
    </footer>
  )
}
