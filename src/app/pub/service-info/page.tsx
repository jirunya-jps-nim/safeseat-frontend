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
import { Search, RefreshCw, Plus, FileText, ArrowRight } from 'lucide-react'

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

  useEffect(() => {
    const userStr = localStorage.getItem('pub_user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)
    setPubUser(user)
    fetchRecords(user.username)
  }, [router])

  const fetchRecords = async (username: string) => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/pub/service-info/${username}`)
      if (res.data.success) setRecords(res.data.data || [])
      else setError(res.data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally { setLoading(false) }
  }

  const statusConfig: { [k: string]: { label: string; color: string; bg: string } } = {
    pending:   { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    accepted:  { label: 'กำลังเดินทาง', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
    completed: { label: 'เสร็จสิ้น', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    cancelled: { label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    'รอคนขับ': { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    'กำลังไปรับ': { label: 'กำลังไปรับ', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
    'ถึงจุดรับแล้ว': { label: 'ถึงจุดรับแล้ว', color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/30' },
    'ระหว่างเดินทาง': { label: 'ระหว่างเดินทาง', color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    'เสร็จสิ้น': { label: 'เสร็จสิ้น', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    'ยกเลิก': { label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
  }

  const getStatus = (status: string) => {
    if (!status) return { label: 'รอรับงาน', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' }
    const s = status.toLowerCase()
    return statusConfig[status] || statusConfig[s] || { label: status, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' }
  }

  const paymentLabel = (m: number) => m === 1 ? '💵 เงินสด' : '📲 โอนเงิน'
  const carTypeLabel = (id: number) => {
    if (id === 1) return 'EV'
    if (id === 2) return 'Manual'
    return 'Auto'
  }

  const pendingStatuses = ['pending', 'รอคนขับ', 'กำลังไปรับ', 'ถึงจุดรับแล้ว', 'ระหว่างเดินทาง', 'accepted']
  const completedStatuses = ['completed', 'เสร็จสิ้น']
  const cancelledStatuses = ['cancelled', 'ยกเลิก']

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

  const filtered = records.filter(r => {
    const matchSearch = !searchQuery || r.custname?.toLowerCase().includes(searchQuery.toLowerCase()) || r.phoneno?.includes(searchQuery)
    let matchStatus = false
    if (statusFilter === 'all') matchStatus = true
    else if (statusFilter === 'pending') matchStatus = isPending(r.requeststatus)
    else if (statusFilter === 'completed') matchStatus = isCompleted(r.requeststatus)
    else if (statusFilter === 'cancelled') matchStatus = isCancelled(r.requeststatus)
    return matchSearch && matchStatus
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
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/pub/tracking?id=${recordId}`)}
                          className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1"
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
    </div>
  )
}
