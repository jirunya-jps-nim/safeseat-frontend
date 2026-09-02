'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface AnalogClockPickerProps {
  isOpen: boolean
  onClose: () => void
  value: string 
  onChange: (timeStr: string) => void
  title?: string
}

export default function AnalogClockPicker({
  isOpen,
  onClose,
  value,
  onChange,
  title = 'เลือกเวลา (เข็มนาฬิกา)',
}: AnalogClockPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const parseInitial = (val: string) => {
    if (!val || !val.includes(':')) return { hour12: 6, minute: 0, period: 'PM' as const }
    const [hStr, mStr] = val.split(':')
    let h = parseInt(hStr, 10)
    if (isNaN(h)) h = 18
    const m = parseInt(mStr, 10) || 0
    const period = h >= 12 ? ('PM' as const) : ('AM' as const)
    let hour12 = h % 12
    if (hour12 === 0) hour12 = 12
    return { hour12, minute: m, period }
  }

  const [hour12, setHour12] = useState<number>(6)
  const [minute, setMinute] = useState<number>(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM')
  const [mode, setMode] = useState<'hour' | 'minute'>('hour')

  useEffect(() => {
    if (isOpen) {
      const parsed = parseInitial(value)
      setHour12(parsed.hour12)
      setMinute(parsed.minute)
      setPeriod(parsed.period)
      setMode('hour')
    }
  }, [isOpen, value])

  if (!isOpen || !mounted) return null

  const get24Hour = (h12: number, p: 'AM' | 'PM') => {
    let h24 = h12 % 12
    if (p === 'PM') h24 += 12
    return h24
  }

  const handleConfirm = () => {
    const h24 = get24Hour(hour12, period)
    const hStr = String(h24).padStart(2, '0')
    const mStr = String(minute).padStart(2, '0')
    onChange(`${hStr}:${mStr}`)
    onClose()
  }

  const presets = [
    { label: '17:00 (5 PM)', h24: 17, m: 0 },
    { label: '18:00 (6 PM)', h24: 18, m: 0 },
    { label: '19:00 (7 PM)', h24: 19, m: 0 },
    { label: '02:00 (2 AM)', h24: 2, m: 0 },
    { label: '03:00 (3 AM)', h24: 3, m: 0 },
    { label: '04:00 (4 AM)', h24: 4, m: 0 },
  ]

  const applyPreset = (h24: number, m: number) => {
    const p = h24 >= 12 ? 'PM' : 'AM'
    let h12 = h24 % 12
    if (h12 === 0) h12 = 12
    setHour12(h12)
    setMinute(m)
    setPeriod(p)
  }

  const hourAngle = (hour12 % 12) * 30 + minute * 0.5
  const minuteAngle = minute * 6

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-inter overflow-y-auto">
      <div className="bg-[#111827] border border-[#374151] rounded-3xl p-6 w-full max-w-sm shadow-2xl text-white flex flex-col items-center gap-5 relative overflow-hidden my-auto">
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-[#2340A7]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕐</span>
            <span className="text-sm font-bold text-gray-200">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ส่วนแสดงเวลา Digital ด้านบนที่กำลังปรับ */}
        <div className="flex items-center justify-center gap-2 bg-[#1F2937] p-3 rounded-2xl w-full border border-gray-700/60 shadow-inner">
          <button
            onClick={() => setMode('hour')}
            className={`text-3xl font-extrabold px-3 py-1 rounded-xl transition-all ${
              mode === 'hour'
                ? 'bg-[#2340A7] text-white shadow-lg shadow-[#2340A7]/40 scale-105'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {String(hour12).padStart(2, '0')}
          </button>

          <span className="text-2xl font-bold text-gray-400 animate-pulse">:</span>

          <button
            onClick={() => setMode('minute')}
            className={`text-3xl font-extrabold px-3 py-1 rounded-xl transition-all ${
              mode === 'minute'
                ? 'bg-[#2340A7] text-white shadow-lg shadow-[#2340A7]/40 scale-105'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {String(minute).padStart(2, '0')}
          </button>

          {/* สลับ AM / PM */}
          <div className="flex flex-col gap-1 ml-3">
            <button
              onClick={() => setPeriod('AM')}
              className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                period === 'AM'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setPeriod('PM')}
              className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                period === 'PM'
                  ? 'bg-[#2340A7] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* แท็บสลับเลือก ชั่วโมง หรือ นาที */}
        <div className="flex bg-[#1F2937] rounded-full p-1 border border-gray-700 text-xs font-bold w-full">
          <button
            onClick={() => setMode('hour')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center ${
              mode === 'hour' ? 'bg-[#2340A7] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            เข็มชั่วโมง (Hour)
          </button>
          <button
            onClick={() => setMode('minute')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center ${
              mode === 'minute' ? 'bg-[#2340A7] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            เข็มนาที (Minute)
          </button>
        </div>

        {/* หน้าปัดนาฬิกาจำลอง (Analog Clock Face) */}
        <div className="relative w-60 h-60 rounded-full bg-gradient-to-b from-[#1F2937] to-[#111827] border-4 border-[#374151] shadow-2xl flex items-center justify-center select-none">
          {/* จุดหมุนแกนกลาง (Center Pivot) */}
          <div className="absolute w-4 h-4 rounded-full bg-[#2340A7] z-30 border-2 border-white shadow-md"></div>

          {/* เข็มชั่วโมง (Hour Hand) */}
          <div
            className="absolute origin-bottom bg-gradient-to-t from-[#2340A7] to-[#60A5FA] rounded-full z-20 transition-transform duration-300 shadow-lg"
            style={{
              width: '6px',
              height: '55px',
              bottom: '120px',
              left: 'calc(50% - 3px)',
              transform: `rotate(${hourAngle}deg)`,
              transformOrigin: '50% 100%',
            }}
          ></div>

          {/* เข็มนาที (Minute Hand) */}
          <div
            className="absolute origin-bottom bg-blue-400 rounded-full z-10 transition-transform duration-300 shadow-lg"
            style={{
              width: '3.5px',
              height: '80px',
              bottom: '120px',
              left: 'calc(50% - 1.75px)',
              transform: `rotate(${minuteAngle}deg)`,
              transformOrigin: '50% 100%',
            }}
          ></div>

          {/* ตัวเลขบนหน้าปัด */}
          {mode === 'hour' ? (
            hoursList.map((h, i) => {
              const angleDeg = i * 30 
              const angleRad = ((angleDeg - 90) * Math.PI) / 180
              const radius = 88 
              const x = 120 + radius * Math.cos(angleRad) - 16
              const y = 120 + radius * Math.sin(angleRad) - 16
              const isSelected = hour12 === h

              return (
                <button
                  key={h}
                  onClick={() => {
                    setHour12(h)
                    setMode('minute') 
                  }}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all z-40 ${
                    isSelected
                      ? 'bg-[#2340A7] text-white scale-125 shadow-lg shadow-[#2340A7]/60 ring-2 ring-white'
                      : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                  }`}
                >
                  {h}
                </button>
              )
            })
          ) : (
            minutesList.map((m, i) => {
              const angleDeg = i * 30 
              const angleRad = ((angleDeg - 90) * Math.PI) / 180
              const radius = 88
              const x = 120 + radius * Math.cos(angleRad) - 16
              const y = 120 + radius * Math.sin(angleRad) - 16
              const isSelected = minute === m

              return (
                <button
                  key={m}
                  onClick={() => setMinute(m)}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all z-40 ${
                    isSelected
                      ? 'bg-blue-500 text-white scale-125 shadow-lg shadow-blue-500/60 ring-2 ring-white'
                      : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                  }`}
                >
                  {String(m).padStart(2, '0')}
                </button>
              )
            })
          )}
        </div>

        {/* แถบปุ่มทางลัดยอดนิยม */}
        <div className="w-full">
          <div className="text-[11px] font-bold text-gray-400 mb-1.5">⚡ เลือกเวลาด่วนยอดนิยม:</div>
          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.h24, p.m)}
                className="py-1 px-2 bg-gray-800 hover:bg-gray-700 text-[11px] font-medium text-gray-200 rounded-lg border border-gray-700 transition-colors text-center"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ปุ่มกดยืนยัน / ยกเลิก */}
        <div className="flex items-center gap-2.5 w-full pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl border border-gray-700 transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1D4ED8] !text-white text-xs font-bold rounded-xl transition-all shadow-md"
            style={{ color: '#ffffff' }}
          >
            ตกลง ({String(get24Hour(hour12, period)).padStart(2, '0')}:{String(minute).padStart(2, '0')})
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}
