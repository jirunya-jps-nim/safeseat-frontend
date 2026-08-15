'use client'

// ═══════════════════════════════════════════════════════════════
// app/pub/service-info/page.tsx — Service History (Royal Purple-Blue)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingNav from '@/components/ui/FloatingNav'
import { Search, RefreshCw, Plus, FileText, ArrowRight, QrCode, Copy, Check } from 'lucide-react'

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

export default function ServiceInfoPage() {
  const router = useRouter()
  const [pubUser, setPubUser] = useState<any>(null)
  const [records, setRecords] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

  const statusConfig: { [k: string]: { label: string; color: string; bg: string; step: number } } = {
    pending:          { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 0 },
    'รอคนขับ':        { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 0 },
    accepted:         { label: 'คนขับรับงาน', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', step: 1 },
    'กำลังไปรับ':     { label: 'คนขับรับงาน', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', step: 1 },
    'ถึงจุดรับแล้ว':   { label: 'ถึงจุดรับ', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', step: 2 },
    'ระหว่างเดินทาง': { label: 'กำลังเดินทาง', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', step: 3 },
    completed:        { label: 'ถึงจุดหมายปลายทาง', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', step: 4 },
    'เสร็จสิ้น':       { label: 'ถึงจุดหมายปลายทาง', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', step: 4 },
    cancelled:        { label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', step: -1 },
    'ยกเลิก':         { label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', step: -1 },
    'ปฏิเสธ':         { label: 'ปฏิเสธ/เรียกรถใหม่', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', step: -1 },
  }

  const getStatus = (status: string) => {
    if (!status) return { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 0 }
    const s = status.toLowerCase()
    return statusConfig[status] || statusConfig[s] || { label: status, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', step: 0 }
  }

  const paymentLabel = (m: number) => m === 1 ? '💵 เงินสด' : '📲 โอนเงิน'
  const carTypeLabel = (id: number) => {
    if (id === 1) return 'EV'
    if (id === 2) return 'Manual'
    return 'Auto'
  }

  const pendingStatuses = ['pending', 'รอคนขับ', 'กำลังไปรับ', 'ถึงจุดรับแล้ว', 'ระหว่างเดินทาง', 'accepted']
  const completedStatuses = ['completed', 'เสร็จสิ้น']
  const cancelledStatuses = ['cancelled', 'ยกเลิก', 'ปฏิเสธ', 'rejected']

  const isPending = (status: string) => {
    if (!status) return true
    const s = status.toLowerCase()
    return pendingStatuses.includes(s) || pendingStatuses.includes(status)
  }
  const isCompleted = (status: string) => {
    if (!status) return false
    const s = status.toLowerCase()
    return completedStatuses.includes(s) || completedStatuses.includes(status)
  }
  const isCancelled = (status: string) => {
    if (!status) return false
    const s = status.toLowerCase()
    return cancelledStatuses.includes(s) || cancelledStatuses.includes(status)
  }

  const getPriorityRank = (status: string) => {
    if (!status) return 1
    const s = status.toLowerCase()
    if (s === 'รอคนขับ' || s === 'pending') return 1 // 🥇 Rank 1: รอรับงานเท่านั้น อยู่บนสุด
    if (['กำลังไปรับ', 'ถึงจุดรับแล้ว', 'ระหว่างเดินทาง', 'accepted', 'คนขับรับงาน'].includes(s) || ['กำลังไปรับ', 'ถึงจุดรับแล้ว', 'ระหว่างเดินทาง', 'accepted', 'คนขับรับงาน'].includes(status)) {
      return 2 // 🥈 Rank 2: กำลังดำเนินการ (คนขับรับงานแล้ว)
    }
    return 3 // 🥉 Rank 3: เสร็จสิ้น / ยกเลิก
  }

  const filtered = records
    .filter(r => {
      const matchSearch = !searchQuery || r.custname?.toLowerCase().includes(searchQuery.toLowerCase()) || r.phoneno?.includes(searchQuery)
      let matchStatus = false
      if (statusFilter === 'all') matchStatus = true
      else if (statusFilter === 'pending') matchStatus = isPending(r.requeststatus)
      else if (statusFilter === 'completed') matchStatus = isCompleted(r.requeststatus)
      else if (statusFilter === 'cancelled') matchStatus = isCancelled(r.requeststatus)
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const aRank = getPriorityRank(a.requeststatus)
      const bRank = getPriorityRank(b.requeststatus)
      if (aRank !== bRank) {
        return aRank - bRank // 1 (รอรับงาน) -> 2 (กำลังดำเนินการ) -> 3 (เสร็จสิ้น/ยกเลิก)
      }
      const aId = Number(a.requestid || a.requestId || 0)
      const bId = Number(b.requestid || b.requestId || 0)
      return bId - aId // เรียงตาม ID ล่าสุดจากมากไปน้อย
    })

  const counts = {
    all: records.length,
    pending: records.filter(r => isPending(r.requeststatus)).length,
    completed: records.filter(r => isCompleted(r.requeststatus)).length,
    cancelled: records.filter(r => isCancelled(r.requeststatus)).length,
  }

  const tabDefs = [
    { key: 'all', label: 'ทั้งหมด', count: counts.all },
    { key: 'pending', label: 'รอรับงาน/กำลังดำเนินการ', count: counts.pending },
    { key: 'completed', label: 'เสร็จสิ้น', count: counts.completed },
    { key: 'cancelled', label: 'ยกเลิก', count: counts.cancelled },
  ]

  if (!pubUser) return null

  return (
    <div className="selection-purple min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="gradient-blur"></div>
      <Navbar />
      <FloatingNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-bold text-[#7C3AED] tracking-wider uppercase font-manrope">SERVICE HISTORY</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-[var(--color-text)] mt-1">ประวัติการเรียกใช้บริการ (Service History)</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => pubUser && fetchRecords(pubUser.username)}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-full text-xs font-bold text-[var(--color-text)] hover:border-[#7C3AED] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7C3AED]" /> รีเฟรช
            </button>
            <button 
              onClick={() => router.push('/pub/request-driver')}
              className="px-5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] rounded-full text-xs font-bold text-white shadow-md hover:from-[#6D28D9] hover:to-[#1E40AF] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> เรียกรถใหม่
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'คำขอทั้งหมด', value: counts.all, color: 'text-[#7C3AED]' },
            { label: 'รอรับงาน', value: counts.pending, color: 'text-amber-500' },
            { label: 'เสร็จสิ้น', value: counts.completed, color: 'text-emerald-500' },
            { label: 'ยกเลิก', value: counts.cancelled, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="p-5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-md flex flex-col">
              <span className={`text-3xl font-extrabold font-manrope ${stat.color}`}>{stat.value}</span>
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--color-card)] border border-[var(--color-border)] p-4 rounded-2xl shadow-md">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tabDefs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] text-white shadow-md'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#7C3AED]'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-[var(--color-card)] text-[var(--color-text)]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full w-full md:w-72">
            <Search className="w-4 h-4 text-[#7C3AED]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full font-semibold"
              placeholder="ค้นหาชื่อ หรือเบอร์โทรศัพท์..."
            />
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>}

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
            <p className="text-sm font-bold text-[var(--color-text-muted)]">กำลังโหลดข้อมูลประวัติการเรียกรถ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center gap-3 shadow-md">
            <FileText className="w-12 h-12 text-[#7C3AED]" />
            <h3 className="text-base font-bold text-[var(--color-text)]">
              {searchQuery ? 'ไม่พบรายการที่ตรงกับการค้นหา' : 'ยังไม่มีประวัติการเรียกรถ'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {searchQuery ? 'ลองค้นหาด้วยชื่อหรือเบอร์โทรศัพท์อื่น' : 'กดปุ่มเรียกรถใหม่เพื่อเรียกรถให้ลูกค้าของร้านได้เลย'}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">วันที่/เวลา</th>
                  <th className="p-4">ชื่อลูกค้า</th>
                  <th className="p-4">เบอร์โทรศัพท์</th>
                  <th className="p-4">ประเภทรถ</th>
                  <th className="p-4">การชำระเงิน</th>
                  <th className="p-4">สถานะ</th>
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
                            ? new Date(item.reqdatetime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
                            : '—'}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          {item.reqdatetime
                            ? new Date(item.reqdatetime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
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
                          <div className="flex items-center gap-1 mt-2 w-28" title={`สถานะการเดินทาง: ขั้นที่ ${st.step}/4 (${st.label})`}>
                            {[1, 2, 3, 4].map(sNum => (
                              <div 
                                key={sNum} 
                                className={`h-1.5 flex-1 rounded-full transition-colors ${sNum <= st.step ? 'bg-[#7C3AED]' : 'bg-[var(--color-border)]'}`}
                              />
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {recordId && (
                            <button
                              type="button"
                              onClick={() => {
                                const originUrl = typeof window !== 'undefined' ? window.location.origin : ''
                                const tUrl = `${originUrl}/tracking?id=${recordId}`
                                setSelectedQrRecord({ url: tUrl, id: recordId, custName: item.custname })
                              }}
                              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-full text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                              title="แสดง QR Code สำหรับติดตาม"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#7C3AED]" /> QR Code
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => router.push(`/pub/tracking?id=${recordId}`)}
                            className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1"
                          >
                            ดูรายละเอียด <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
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

      {/* ── QR CODE MODAL (ROOT LEVEL Z-99999 OVER EVERYTHING) ── */}
      {selectedQrRecord && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedQrRecord(null)}>
          <div className="bg-[var(--color-card)] border border-[#7C3AED]/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-5 text-center relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedQrRecord(null)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold text-lg p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-[#7C3AED]/15 rounded-full flex items-center justify-center text-[#7C3AED] text-2xl">
              📲
            </div>

            <div>
              <h3 className="text-lg font-bold font-manrope text-[var(--color-text)]">
                QR Code ติดตามการเดินทาง #{selectedQrRecord.id}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium whitespace-nowrap overflow-x-auto px-2">
                ให้ลูกค้าใช้กล้องโทรศัพท์สแกน QR Code นี้เพื่อเปิดหน้าติดตามการเดินทางของคนขับได้ทันทีเรียลไทม์ (ลูกค้า: {selectedQrRecord.custName})
              </p>
            </div>

            {/* QR Code Image */}
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
                className="px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-[#6D28D9] transition-colors cursor-pointer"
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
