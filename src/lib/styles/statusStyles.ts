// ═══════════════════════════════════════════════════════════════
// lib/styles/statusStyles.ts
// Styles สำหรับหน้า View Registration Status (Cohesive Light Theme)
// ═══════════════════════════════════════════════════════════════

import React from 'react'

export const statusStyles: Record<string, React.CSSProperties> = {
  // ── Layout ────────────────────────────────────────────────────
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e0e7ff 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },

  // วงกลมตกแต่งพื้นหลัง (glow effect)
  bgCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  // ── Main content wrapper ─────────────────────────────────────
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px 64px',
    position: 'relative',
    zIndex: 1,
  },

  // ── Page header ───────────────────────────────────────────────
  pageHeader: {
    textAlign: 'center',
    marginBottom: 40,
  },
  pageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#e0e7ff',
    border: '1px solid rgba(79,70,229,0.2)',
    borderRadius: 24,
    padding: '6px 16px',
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: 600,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#475569',
    margin: 0,
  },

  // ── Card container ────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: 680,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '36px 40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.03)',
    marginBottom: 20,
  },

  // ── Hello greeting ────────────────────────────────────────────
  greeting: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },

  // ── Stepper ───────────────────────────────────────────────────
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 40,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stepDotWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
    zIndex: 1,
    transition: 'all 0.3s ease',
  },
  stepLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    transition: 'background 0.3s ease',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'center',
    paddingTop: 4,
    lineHeight: 1.4,
    maxWidth: 90,
  },

  // ── Status banner (สี dynamic ตาม regisstatus) ────────────────
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 24px',
    borderRadius: 14,
    marginBottom: 28,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  statusIcon: {
    fontSize: 28,
    flexShrink: 0,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 13,
    lineHeight: 1.5,
    opacity: 0.85,
  },

  // ── Info grid ─────────────────────────────────────────────────
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginBottom: 28,
  },
  infoItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '14px 16px',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: 500,
    wordBreak: 'break-word',
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    height: 1,
    background: '#e2e8f0',
    margin: '0 0 24px',
  },

  // ── Action buttons ────────────────────────────────────────────
  btnRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: 'transparent',
    color: '#475569',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s',
  },
  refreshBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  // ── Loading skeleton ─────────────────────────────────────────
  skeletonLine: {
    borderRadius: 8,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  // ── Error box ────────────────────────────────────────────────
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '14px 18px',
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  // ── Loading spinner ───────────────────────────────────────────
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    marginRight: 6,
  },
}
