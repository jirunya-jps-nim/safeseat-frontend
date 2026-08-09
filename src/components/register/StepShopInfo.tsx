'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepShopInfo.tsx
// Form ขั้นตอนที่ 1 ของหน้าสมัครสมาชิก — ข้อมูลสถานประกอบการ (รองรับสีตัวอักษร)
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Field from '@/components/ui/Field'
import AnalogClockPicker from '@/components/ui/AnalogClockPicker'
import { RegisterForm } from '@/types'

// Dynamic import ป้องกัน error "window is not defined" จาก Leaflet ตอนทำ SSR
const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false })

interface StepShopInfoProps {
  form: RegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPin?: (lat: number, lng: number) => void
  inputStyle: React.CSSProperties
  labelColor?: string // ส่งสีของ label และข้อความประกอบมาเพื่อความยืดหยุ่นของธีม
}

// Helper formatting 24h "18:00" -> "06:00 PM"
function formatDisplayTime(val: string): string {
  if (!val) return '06:00 PM'
  const parts = val.split(':')
  if (parts.length < 2) return val
  let h = parseInt(parts[0], 10)
  if (isNaN(h)) return val
  const m = parts[1] || '00'
  const period = h >= 12 ? 'PM' : 'AM'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return `${String(h12).padStart(2, '0')}:${m} ${period}`
}

export default function StepShopInfo({ form, onChange, onPin, inputStyle, labelColor }: StepShopInfoProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [activeClock, setActiveClock] = useState<'pubOpen' | 'pubClose' | null>(null)

  const handleClockChange = (timeStr: string) => {
    if (!activeClock) return
    const event = {
      target: {
        name: activeClock,
        value: timeStr,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── ชื่อสถานประกอบการ ── */}
      <Field label="ชื่อสถานประกอบการ *" icon="🏪" color={labelColor}>
        <input
          name="pubName"
          value={form.pubName}
          onChange={onChange}
          style={inputStyle}
          placeholder="ชื่อร้านของคุณ"
        />
      </Field>

      {/* ── เวลาเปิด-ปิด (ตัวเลือกเวลาแบบเข็มนาฬิกา Analog Clock) ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="เวลาเปิด *" icon="🕐" color={labelColor}>
            <div
              onClick={() => setActiveClock('pubOpen')}
              className="relative flex items-center cursor-pointer group"
            >
              <input
                name="pubOpen"
                readOnly
                value={formatDisplayTime(form.pubOpen || '18:00')}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  paddingRight: '40px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
                className="select-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveClock('pubOpen')
                }}
                className="absolute right-3 p-1 text-gray-400 group-hover:text-[#7C3AED] transition-colors"
                title="เลือกเวลาด้วยเข็มนาฬิกา"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </Field>
        </div>

        <div style={{ flex: 1 }}>
          <Field label="เวลาปิด *" icon="🕙" color={labelColor}>
            <div
              onClick={() => setActiveClock('pubClose')}
              className="relative flex items-center cursor-pointer group"
            >
              <input
                name="pubClose"
                readOnly
                value={formatDisplayTime(form.pubClose || '02:00')}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  paddingRight: '40px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
                className="select-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveClock('pubClose')
                }}
                className="absolute right-3 p-1 text-gray-400 group-hover:text-[#7C3AED] transition-colors"
                title="เลือกเวลาด้วยเข็มนาฬิกา"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </Field>
        </div>
      </div>

      {/* Analog Clock Picker Modal (ตัวเลือกเข็มนาฬิกา) */}
      <AnalogClockPicker
        isOpen={activeClock !== null}
        onClose={() => setActiveClock(null)}
        value={activeClock === 'pubOpen' ? (form.pubOpen || '18:00') : (form.pubClose || '02:00')}
        onChange={handleClockChange}
        title={activeClock === 'pubOpen' ? 'ตั้งค่าเวลาเปิดร้าน (เข็มนาฬิกา)' : 'ตั้งค่าเวลาปิดร้าน (เข็มนาฬิกา)'}
      />

      {/* ── อีเมล ── */}
      <Field label="อีเมล *" icon="📧" color={labelColor}>
        <input
          name="pubEmail"
          type="email"
          value={form.pubEmail}
          onChange={onChange}
          style={inputStyle}
          placeholder="example@email.com"
        />
      </Field>

      {/* ── เบอร์โทรศัพท์ ── */}
      <Field label="หมายเลขโทรศัพท์ * (ขึ้นต้นด้วย 0, 9–10 หลัก)" icon="📱" color={labelColor}>
        <input
          name="pubPhone"
          value={form.pubPhone}
          onChange={onChange}
          style={inputStyle}
          placeholder="0812345678"
          maxLength={10}
          inputMode="numeric"
        />
      </Field>

      {/* ── ตำแหน่งร้าน (ปักหมุดผ่านแผนที่) ── */}
      <Field label="ตำแหน่งร้าน *" icon="📍" color={labelColor}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={form.pubAddress}
            readOnly
            className="placeholder:text-[var(--color-text-muted)] opacity-90 font-medium"
            style={{
              ...inputStyle,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
              cursor: 'pointer',
            }}
            placeholder="กรุณาปักหมุดผ่านแผนที่"
            onClick={() => setIsMapOpen(true)}
          />

          <button
            type="button"
            style={styles.pinBtn}
            onClick={() => setIsMapOpen(true)}
          >
            ปักหมุด
          </button>
        </div>

        {form.pubAddressLat && form.pubAddressLng && (
          <div style={{ ...styles.coordText, color: labelColor || '#64748b' }}>
            Lat: {form.pubAddressLat}
            <br />
            Lng: {form.pubAddressLng}
          </div>
        )}
      </Field>

      {isMapOpen && (
        <MapPicker
          defaultLat={form.pubAddressLat as number}
          defaultLng={form.pubAddressLng as number}
          onConfirm={(lat, lng) => {
            if (onPin) onPin(lat, lng)
            setIsMapOpen(false)
          }}
          onCancel={() => setIsMapOpen(false)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  pinBtn: {
    padding: '0 16px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    whiteSpace: 'nowrap',
  },
  coordText: {
    marginTop: 8,
    fontSize: 12,
  },
}
