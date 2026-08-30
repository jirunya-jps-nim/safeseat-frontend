'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Field from '@/components/ui/Field'
import AnalogClockPicker from '@/components/ui/AnalogClockPicker'
import { RegisterForm } from '@/types'

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false })

interface StepShopInfoProps {
  form: RegisterForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPin?: (lat: number, lng: number, label?: string) => void
  inputStyle: React.CSSProperties
  labelColor?: string 
  errorMessage?: string
}

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

export default function StepShopInfo({ form, onChange, onPin, inputStyle, labelColor, errorMessage }: StepShopInfoProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [activeClock, setActiveClock] = useState<'pubOpen' | 'pubClose' | null>(null)

  const isPubNameError = errorMessage?.includes('สถานประกอบการ') || errorMessage?.includes('ชื่อสถานบันเทิง')
  const isTimeError = errorMessage?.includes('เวลาเปิด') || errorMessage?.includes('เวลาปิด') || errorMessage?.includes('เวลา')
  const isEmailError = errorMessage?.includes('อีเมล')
  const isPhoneError = errorMessage?.includes('โทรศัพท์')
  const isAddressError = errorMessage?.includes('แผนที่') || errorMessage?.includes('ปักหมุด') || errorMessage?.includes('ตำแหน่ง')

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

      {/* ชื่อสถานประกอบการ */}
      <Field label="ชื่อสถานประกอบการ *" icon="🏪" color={labelColor}>
        <input
          name="pubName"
          value={form.pubName}
          onChange={onChange}
          autoComplete="off"
          style={{
            ...inputStyle,
            borderColor: isPubNameError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isPubNameError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="ชื่อสถานบันเทิงของคุณ"
        />
        {isPubNameError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      {/* เวลาเปิด-ปิด ให้เลือกด้วย Analog Clock Picker */}
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
                className="absolute right-3 p-1 text-gray-400 group-hover:text-[#2340A7] transition-colors"
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
                className="absolute right-3 p-1 text-gray-400 group-hover:text-[#2340A7] transition-colors"
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

      {/* Clock Modal */}
      <AnalogClockPicker
        isOpen={activeClock !== null}
        onClose={() => setActiveClock(null)}
        value={activeClock === 'pubOpen' ? (form.pubOpen || '18:00') : (form.pubClose || '02:00')}
        onChange={handleClockChange}
        title={activeClock === 'pubOpen' ? 'ตั้งค่าเวลาเปิดสถานบันเทิง (เข็มนาฬิกา)' : 'ตั้งค่าเวลาปิดสถานบันเทิง (เข็มนาฬิกา)'}
      />

      {/* อีเมล */}
      <Field label="อีเมล *" icon="📧" color={labelColor}>
        <input
          name="pubEmail"
          type="email"
          value={form.pubEmail}
          onChange={onChange}
          autoComplete="off"
          style={{
            ...inputStyle,
            borderColor: isEmailError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isEmailError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="example@email.com"
        />
        {isEmailError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      {/* เบอร์โทรศัพท์ */}
      <Field label="หมายเลขโทรศัพท์ *" icon="📱" color={labelColor}>
        <input
          name="pubPhone"
          value={form.pubPhone}
          onChange={onChange}
          autoComplete="off"
          style={{
            ...inputStyle,
            borderColor: isPhoneError ? '#ef4444' : (inputStyle.borderColor || 'var(--color-border)'),
            backgroundColor: isPhoneError ? 'rgba(239, 68, 68, 0.05)' : (inputStyle.backgroundColor || 'var(--color-surface)'),
          }}
          placeholder="0812345678"
          maxLength={10}
          inputMode="numeric"
        />
        {isPhoneError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}
      </Field>

      {/* ปักหมุดแผนที่ */}
      <Field label="ตำแหน่งสถานบันเทิง *" icon="📍" color={labelColor}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={form.pubAddress}
            readOnly
            className="placeholder:text-[var(--color-text-muted)] opacity-90 font-medium"
            style={{
              ...inputStyle,
              backgroundColor: isAddressError ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-surface)',
              color: 'var(--color-text)',
              borderColor: isAddressError ? '#ef4444' : 'var(--color-border)',
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
        {isAddressError && (
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
            ⚠️ {errorMessage}
          </span>
        )}

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
          onConfirm={(lat, lng, label) => {
            if (onPin) onPin(lat, lng, label)
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 20px',
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#2340A7',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    height: '100%',
    minHeight: '48px',
    boxSizing: 'border-box',
  },
  coordText: {
    marginTop: 8,
    fontSize: 12,
  },
}
