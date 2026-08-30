'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Search, RefreshCw, Plus, FileText, ArrowRight, QrCode } from 'lucide-react'

interface RequestRecord {
  requestId?: number
  requestid?: number
  custname: string
  phoneno: string
  carmodel?: string
  carplate?: string
  requiredcartype: number
  requeststatus: string
  reqdatetime: string
  dropofflatitude: number
  dropofflongitude: number
  paymentmethod: number
  isladymode: boolean
  note?: string
}

function parseThaiDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const s = String(dateStr).trim()
  const cleanStr = s.replace(/Z$/i, '')
  const isoWithTz = cleanStr.includes('T')
    ? `${cleanStr.split('+')[0]}+07:00`
    : `${cleanStr.replace(' ', 'T').split('+')[0]}+07:00`
  const d = new Date(isoWithTz)
  return isNaN(d.getTime()) ? new Date(dateStr) : d
}

export default function ServiceInfoPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)
  const [records, setRecords] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [selectedQrRecord, setSelectedQrRecord] = useState<{ url: string; id: number; custName: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)
    if (user.regisstatus !== 'approved' && user.regisstatus !== 'อนุมัติแล้ว') {
      router.push('/status')
      return
    }
    setPubUser(user)
    fetchRecords(user.username, true)

    const interval = setInterval(() => {
      fetchRecords(user.username, false)
    }, 5000)
    return () => clearInterval(interval)
  }, [router])

  const fetchRecords = async (username: string, showSpinner = true) => {
    if (showSpinner) setLoading(true)
    setError('')
    try {
      const res = await api.get(`/pub/service-info/${username}`)
      if (res.data.success) setRecords(res.data.data || [])
      else setError(res.data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } catch (err: any) {
      if (showSpinner) setError(err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally { 
      if (showSpinner) setLoading(false) 
    }
  }

  const getStep = (s?: string) => {
    if (!s) return 0
    const str = s.toLowerCase().trim()
    if (['accepted', 'คนขับรับงาน', 'กำลังไปรับ', 'รับงานแล้ว'].includes(str) || str.includes('กำลังไปรับ') || str.includes('accepted') || str.includes('คนขับรับงาน')) return 1
    if (['ถึงจุดรับแล้ว', 'ถึงจุดรับ', 'ถึงจุดนัดหมาย', 'arrived'].includes(str) || str.includes('ถึงจุดรับ') || str.includes('ถึงจุดนัดหมาย')) return 2
    if (['ระหว่างเดินทาง', 'กำลังเดินทาง', 'in_transit', 'driving'].includes(str) || str.includes('ระหว่างเดินทาง') || str.includes('กำลังเดินทาง')) return 3
    if (['เสร็จสิ้น', 'completed', 'ถึงจุดหมายปลายทาง', 'finished', 'done', 'success'].includes(str) || str.includes('เสร็จสิ้น') || str.includes('completed') || str.includes('ถึงจุดหมาย')) return 4
    if (['cancelled', 'ยกเลิก', 'ปฏิเสธ', 'rejected', 'cancel'].includes(str) || str.includes('ยกเลิก') || str.includes('ปฏิเสธ') || str.includes('cancel')) return -1
    return 0
  }

  const getStatus = (status?: string) => {
    const step = getStep(status)
    if (step === 1) return { label: 'คนขับรับงาน', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', step: 1 }
    if (step === 2) return { label: 'ถึงจุดรับ', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 2 }
    if (step === 3) return { label: 'กำลังเดินทาง', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', step: 3 }
    if (step === 4) return { label: 'ถึงจุดหมายปลายทาง', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', step: 4 }
    if (step === -1) return { label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', step: -1 }
    return { label: 'รอรับงาน', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', step: 0 }
  }

  const paymentLabel = (m: number) => m === 1 ? '💵 เงินสด' : '📲 โอนเงิน'
  const carTypeLabel = (id: number) => {
    if (id === 1) return 'EV'
    if (id === 2) return 'Manual'
    return 'Auto'
  }

  const isPending = (status?: string) => {
    const step = getStep(status)
    return step >= 0 && step < 4
  }

  const isCompleted = (status?: string) => {
    const step = getStep(status)
    return step === 4
  }

  const isCancelled = (status?: string) => {
    const step = getStep(status)
    return step === -1
  }

  const getPriorityRank = (status?: string) => {
    const step = getStep(status)
    if (step === 0) return 1 
    if (step === 1 || step === 2 || step === 3) return 2 
    return 3 
  }

  const validRecords = records.filter(r => !isCancelled(r.requeststatus))

  const counts = {
    pending: validRecords.filter(r => isPending(r.requeststatus)).length,
    completed: validRecords.filter(r => isCompleted(r.requeststatus)).length,
  }

  const tabDefs = [
    { key: 'pending', label: 'กำลังดำเนินการ', count: counts.pending },
    { key: 'completed', label: 'เสร็จสิ้น', count: counts.completed },
  ]

  const filtered = validRecords
    .filter(r => {
      const matchSearch = !searchQuery || r.custname?.toLowerCase().includes(searchQuery.toLowerCase()) || r.phoneno?.includes(searchQuery)
      let matchStatus = false
      if (statusFilter === 'pending') matchStatus = isPending(r.requeststatus)
      else if (statusFilter === 'completed') matchStatus = isCompleted(r.requeststatus)
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const aRank = getPriorityRank(a.requeststatus)
      const bRank = getPriorityRank(b.requeststatus)
      if (aRank !== bRank) {
        return aRank - bRank 
      }
      const aId = Number(a.requestid || a.requestId || 0)
      const bId = Number(b.requestid || b.requestId || 0)
      return bId - aId 
    })

  if (!pubUser) return null

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2340A7]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#2340A7] tracking-wider uppercase font-manrope">SERVICE HISTORY</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">ประวัติการเรียกใช้บริการ (Service History)</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/pub/dashboard')}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-full text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[#2340A7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              ← ย้อนกลับ
            </button>
            <button 
              onClick={() => router.push('/pub/request-driver')}
              className="px-5 py-2 bg-gradient-to-r from-[#2340A7] to-[#2563EB] rounded-full text-xs font-bold text-white shadow-md hover:from-[#1D358F] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> เรียกรถใหม่
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => setStatusFilter('pending')}
            className={`p-5 bg-[var(--color-card)] border rounded-2xl shadow-md flex items-center justify-between cursor-pointer transition-all ${
              statusFilter === 'pending'
                ? 'border-[#2340A7] ring-2 ring-[#2340A7]/20 shadow-lg'
                : 'border-[var(--color-border)] hover:border-[#2340A7]/50'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold font-manrope text-[#2340A7]">{counts.pending}</span>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">กำลังดำเนินการ</span>
            </div>
            <div className="p-3 bg-[#2340A7]/10 text-[#2340A7] rounded-xl text-2xl font-bold">
              ⏳
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('completed')}
            className={`p-5 bg-[var(--color-card)] border rounded-2xl shadow-md flex items-center justify-between cursor-pointer transition-all ${
              statusFilter === 'completed'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                : 'border-[var(--color-border)] hover:border-emerald-500/50'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold font-manrope text-emerald-500">{counts.completed}</span>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">เสร็จสิ้น</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-2xl font-bold">
              ✅
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-2xl shadow-md">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tabDefs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as 'pending' | 'completed')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-gradient-to-r from-[#2340A7] to-[#2563EB] text-white shadow-md'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#2340A7]'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === tab.key ? 'bg-white/20 text-white font-mono' : 'bg-[var(--color-card)] text-[var(--color-text)] font-mono'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full w-full md:w-72">
            <Search className="w-4 h-4 text-[#2340A7]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full font-semibold"
              placeholder="ค้นหาชื่อ หรือเบอร์โทรศัพท์..."
            />
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

        {loading ? (
          <div className="p-16 text-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#2340A7] animate-spin" />
            <p className="text-sm font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูลประวัติการเรียกรถ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3 shadow-md">
            <FileText className="w-12 h-12 text-[#2340A7]" />
            <h3 className="text-base font-bold text-[var(--color-text)]">
              {searchQuery ? 'ไม่พบรายการที่ตรงกับการค้นหา' : 'ยังไม่มีประวัติการเรียกรถ'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {searchQuery ? 'ลองค้นหาด้วยชื่อหรือเบอร์โทรศัพท์อื่น' : 'กดปุ่มเรียกรถใหม่เพื่อเรียกรถให้ลูกค้าของสถานบันเทิงได้เลย'}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">วันที่/เวลา</th>
                  <th className="p-4">ชื่อลูกค้า</th>
                  <th className="p-4">เบอร์โทรศัพท์</th>
                  <th className="p-4">ประเภทรถ</th>
                  <th className="p-4">การชำระเงิน</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">QR Code</th>
                  <th className="p-4 text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
                {filtered.map((item, idx) => {
                  const st = getStatus(item.requeststatus)
                  const recordId = item.requestid || item.requestId
                  return (
                    <tr key={idx} className="hover:bg-[var(--color-card-hover)] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[var(--color-text)]">
                          {item.reqdatetime
                            ? parseThaiDate(item.reqdatetime).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: '2-digit' })
                            : '—'}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-semibold mt-0.5">
                          {item.reqdatetime
                            ? parseThaiDate(item.reqdatetime).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.'
                            : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[var(--color-text)]">{item.custname}</div>
                        {item.isladymode && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold rounded-full">
                            👩 Lady Mode
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold text-[var(--color-text-muted)]">{item.phoneno}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold rounded-md text-[11px]">
                          {carTypeLabel(item.requiredcartype)}
                        </span>
                        {(item.carmodel || item.carplate) && (
                          <div className="text-[11px] text-[var(--color-text-muted)] mt-1 font-semibold">
                            {item.carmodel ? item.carmodel : ''}{item.carmodel && item.carplate ? ' • ' : ''}{item.carplate ? item.carplate : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{paymentLabel(item.paymentmethod)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.bg} ${st.color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {st.label}
                        </span>
                        {st.step > 0 && (
                          <div className="mt-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                            {st.step === 1 && '🚘 คนขับรับงานแล้ว'}
                            {st.step === 2 && '📍 ถึงจุดรับแล้ว'}
                            {st.step === 3 && '🚗 กำลังเดินทาง'}
                            {st.step === 4 && '✅ ถึงจุดหมายปลายทาง'}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {recordId ? (
                          <button
                            type="button"
                            onClick={() => {
                              const originUrl = typeof window !== 'undefined' ? window.location.origin : ''
                              const tUrl = `${originUrl}/tracking?id=${recordId}`
                              setSelectedQrRecord({ url: tUrl, id: recordId, custName: item.custname })
                            }}
                            className="px-3.5 py-1.5 bg-[var(--color-surface)] border border-[#2340A7]/30 text-[#2340A7] hover:bg-[#2340A7]/10 rounded-full text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            title="แสดง QR Code สำหรับติดตาม"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#2340A7]" /> QR Code
                          </button>
                        ) : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/pub/tracking?id=${recordId}`)}
                          className="px-4 py-1.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          ดูรายละเอียด <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />

      {selectedQrRecord && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedQrRecord(null)}>
          <div className="bg-[var(--color-card)] border border-[#2340A7]/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-5 text-center relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedQrRecord(null)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold text-lg p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-[#2340A7]/15 rounded-full flex items-center justify-center text-[#2340A7] text-2xl">
              📲
            </div>

            <div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                QR Code ติดตามการเดินทาง {selectedQrRecord.id}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium whitespace-nowrap overflow-x-auto px-2">
                ให้ลูกค้าใช้กล้องโทรศัพท์สแกน QR Code นี้เพื่อเปิดหน้าติดตามการเดินทางของคนขับได้ทันทีเรียลไทม์ (ลูกค้า: {selectedQrRecord.custName})
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-200 my-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedQrRecord.url)}`}
                alt="QR Code สำหรับติดตามการเดินทาง"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
              <span className="truncate text-[var(--color-text-muted)] text-[11px]">
                {selectedQrRecord.url}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedQrRecord.url)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                className="px-3 py-1.5 bg-[#2340A7] text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-[#1D358F] transition-colors cursor-pointer"
              >
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>

            <button
              onClick={() => setSelectedQrRecord(null)}
              className="w-full py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-full text-xs font-bold hover:bg-[var(--color-card)] transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
