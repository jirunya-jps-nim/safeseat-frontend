'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'

const encodeId = (id: number | string | undefined) => {
  if (!id) return '';
  const offset = 100000000;
  const num = Number(id);
  if (isNaN(num)) return String(id);
  return (offset + num).toString(36).toUpperCase();
};

const decodeId = (input: string) => {
  const clean = input.replace('#', '').trim();
  if (!clean) return null;
  if (/^\d+$/.test(clean) && clean.length < 6) {
    return parseInt(clean, 10);
  }
  const offset = 100000000;
  const num = parseInt(clean.toLowerCase(), 36);
  if (isNaN(num)) return null;
  const decoded = num - offset;
  return decoded > 0 ? decoded : null;
};

function WaitingDriverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackingParam = searchParams.get('id')
  const requestId = trackingParam ? decodeId(trackingParam) : null

  const [timeLeft, setTimeLeft] = useState(60)
  const [status, setStatus] = useState('กำลังรอให้คนขับรับงาน...')
  const [error, setError] = useState('')
  const [isTimeout, setIsTimeout] = useState(false)
  const [copied, setCopied] = useState(false)

  const trackingUrl = typeof window !== 'undefined' && trackingParam
    ? `${window.location.origin}/tracking?id=${trackingParam}`
    : ''

  useEffect(() => {
    if (!requestId) {
      router.push('/pub/request-driver')
      return
    }

    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimeout(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Polling Backend every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/pub/service-request/${requestId}`)
        if (res.data.success) {
          const data = res.data.data
          // ถ้ามีคนขับรับงานแล้ว
          if (data.buddy_team_id || data.requeststatus !== 'รอคนขับ') {
            clearInterval(pollInterval)
            clearInterval(timer)
            setStatus('มีคนขับรับงานแล้ว! กำลังพาไปยังหน้าติดตามการบริการ...')
            setTimeout(() => {
              router.push(`/pub/tracking?id=${trackingParam || requestId || ''}`)
            }, 1500)
          }
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(pollInterval)
    }
  }, [requestId, router])

  if (isTimeout) {
    return (
      <div style={s.pageCenter}>
        <div style={s.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏱️</div>
          <h2 style={{ color: '#dc2626', fontSize: 24, margin: '0 0 12px' }}>ไม่มีคนขับรับงาน</h2>
          <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
            ขณะนี้ไม่มีคนขับอยู่ในพื้นที่หรือว่างรับงานภายในเวลาที่กำหนด<br/>
            กรุณาลองเรียกรถใหม่อีกครั้งในภายหลัง
          </p>
          <button 
            style={s.btnPrimary} 
            onClick={() => router.push('/pub/request-driver')}
          >
            กลับไปหน้าเรียกรถ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.pageCenter}>
      <div style={s.card}>
        <div style={s.radarContainer}>
          <div style={s.radarCircle} />
          <div style={s.radarCircle2} />
          <div style={s.radarIcon}>🚗</div>
        </div>
        <h2 style={{ color: '#0f172a', fontSize: 24, margin: '24px 0 8px' }}>กำลังค้นหาคนขับรถ</h2>
        <p style={{ color: '#4f46e5', fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>
          {status}
        </p>
        
        <div style={s.timerBox}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>เหลือเวลาค้นหา</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: timeLeft <= 10 ? '#dc2626' : '#1e293b', lineHeight: 1 }}>
            {timeLeft} <span style={{ fontSize: 20 }}>วินาที</span>
          </div>
        </div>

        {/* QR Code and Sharing Actions for customers */}
        {trackingUrl && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: 20,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            margin: '0 0 24px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>ลูกค้าสแกน QR Code เพื่อติดตามการเดินทาง</div>
            <div style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(trackingUrl)}`}
                alt="Trip Tracking QR Code"
                style={{ width: 130, height: 130, display: 'block' }}
              />
            </div>
            
            <div style={{ width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  width: '100%',
                  backgroundColor: copied ? '#059669' : '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Prompt', sans-serif"
                }}
              >
                {copied ? '✅ คัดลอกสำเร็จ!' : '📋 คัดลอกลิงก์ให้ลูกค้า'}
              </button>
            </div>
          </div>
        )}
        
        <button 
          style={s.btnCancel} 
          onClick={() => router.push('/pub/request-driver?step=4')}
        >
          ยกเลิกการค้นหา
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Prompt', sans-serif; }
        
        @keyframes radar {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  pageCenter: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: '48px 32px',
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid #e2e8f0',
  },
  radarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    animation: 'radar 2s infinite ease-out',
  },
  radarCircle2: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    animation: 'radar 2s infinite ease-out 1s',
  },
  radarIcon: {
    fontSize: 40,
    position: 'relative',
    zIndex: 10,
  },
  timerBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: '24px',
    margin: '24px 0',
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: 12,
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  }
}

export default function WaitingDriverPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Prompt', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ marginTop: 16, color: '#64748b' }}>กำลังโหลด...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <WaitingDriverContent />
    </Suspense>
  )
}
