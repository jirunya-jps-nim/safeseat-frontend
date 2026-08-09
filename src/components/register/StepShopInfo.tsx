'use client'
// ═══════════════════════════════════════════════════════════════
// components/register/StepShopInfo.tsx
// Form ขั้นตอนที่ 1 ของหน้าสมัครสมาชิก — ข้อมูลสถานประกอบการ (รองรับสีตัวอักษร)
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Field from '@/components/ui/Field'
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

export default function StepShopInfo({ form, onChange, onPin, inputStyle, labelColor }: StepShopInfoProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)

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

      {/* ── เวลาเปิด-ปิด (วางชิดกัน 2 ช่อง) ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="เวลาเปิด *" icon="🕐" color={labelColor}>
            <input
              name="pubOpen"
              type="time"
              value={form.pubOpen}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="เวลาปิด *" icon="🕙" color={labelColor}>
            <input
              name="pubClose"
              type="time"
              value={form.pubClose}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

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
            style={{
              ...inputStyle,
              backgroundColor: labelColor ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
              cursor: 'not-allowed',
            }}
            placeholder="กรุณาปักหมุดผ่านแผนที่"
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
