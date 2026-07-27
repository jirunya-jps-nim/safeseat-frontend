// ═══════════════════════════════════════════════════════════════
// lib/styles/statusStyles.ts
// Styles สำหรับหน้า View Registration Status
// ═══════════════════════════════════════════════════════════════

import React from 'react'

export const statusStyles: Record<string, React.CSSProperties> = {
  // ── Layout ────────────────────────────────────────────────────
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },

  bgCircle1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,78,216,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle3: { display: 'none' },

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
    marginBottom: '36px',
  },
  pageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    padding: '5px 14px',
    fontSize: '12.5px',
    color: '#1d4ed8',
    fontWeight: 600,
    marginBottom: '14px',
    letterSpacing: '0.01em',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },

  // ── Card container ────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: '640px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '32px 36px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  },

  // ── Hello greeting ────────────────────────────────────────────
  greeting: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '2px',
  },
  greetingSub: {
    fontSize: '13.5px',
    color: '#6b7280',
    marginBottom: '28px',
    lineHeight: 1.6,
  },

  // ── Stepper ───────────────────────────────────────────────────
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: '32px',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  stepDotWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  stepDot: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
    zIndex: 1,
    transition: 'all 0.25s ease',
  },
  stepLine: {
    flex: 1,
    height: '2px',
    borderRadius: '2px',
    transition: 'background 0.25s ease',
  },
  stepLabel: {
    fontSize: '11.5px',
    fontWeight: 500,
    textAlign: 'center',
    paddingTop: '4px',
    lineHeight: 1.4,
    maxWidth: '88px',
    color: '#6b7280',
  },

  // ── Status banner ─────────────────────────────────────────────
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    borderRadius: '10px',
    marginBottom: '24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  statusIcon: {
    fontSize: '24px',
    flexShrink: 0,
    lineHeight: 1,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: '15px',
    fontWeight: 700,
    marginBottom: '2px',
    lineHeight: 1.3,
  },
  statusDesc: {
    fontSize: '13px',
    lineHeight: 1.55,
    opacity: 0.85,
  },

  // ── Info grid ─────────────────────────────────────────────────
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  infoItem: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  infoLabel: {
    fontSize: '10.5px',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '13.5px',
    color: '#111827',
    fontWeight: 500,
    wordBreak: 'break-word',
    lineHeight: 1.4,
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '0 0 20px',
  },

  // ── Action buttons ────────────────────────────────────────────
  btnRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    padding: '9px 20px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    background: 'transparent',
    color: '#6b7280',
    fontSize: '13.5px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  refreshBtn: {
    padding: '9px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#1d4ed8',
    color: '#fff',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s',
  },

  // ── Loading skeleton ─────────────────────────────────────────
  skeletonLine: {
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  // ── Error box ────────────────────────────────────────────────
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '14px 18px',
    color: '#dc2626',
    fontSize: '13.5px',
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: 1.5,
  },

  // ── Loading spinner ───────────────────────────────────────────
  spinner: {
    display: 'inline-block',
    width: '15px',
    height: '15px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    marginRight: '4px',
  },
}
