import React from 'react'

// ─── Status Page Styles — Royal Purple-Blue Edition ────────────────────
// Colors: Deep Space (#050714), Royal Violet (#7C3AED), Royal Blue (#1D4ED8)
// ──────────────────────────────────────────────────────────────────────────

export const statusStyles: Record<string, React.CSSProperties> = {
  // ── Layout ────────────────────────────────────────────────────
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },

  bgCircle1: { display: 'none' },
  bgCircle2: { display: 'none' },
  bgCircle3: { display: 'none' },

  // ── Main content wrapper ─────────────────────────────────────
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '130px 24px 80px',
    position: 'relative',
    zIndex: 1,
    maxWidth: '1240px',
    margin: '0 auto',
    width: '100%',
  },

  // ── Page header ───────────────────────────────────────────────
  pageHeader: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  pageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: '9999px',
    padding: '6px 14px',
    fontSize: '11px',
    color: '#ffffff',
    fontWeight: 700,
    marginBottom: '16px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: '0 0 8px',
    letterSpacing: '-0.03em',
  },
  pageSubtitle: {
    fontSize: '14.5px',
    color: 'var(--color-text-muted)',
    margin: 0,
    lineHeight: 1.6,
  },

  // ── Card container ────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: '680px',
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '24px',
    padding: '36px 40px',
    boxShadow: '0 12px 36px rgba(124, 58, 237, 0.1)',
    marginBottom: '20px',
  },

  // ── Hello greeting ────────────────────────────────────────────
  greeting: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  greetingSub: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginBottom: '28px',
    lineHeight: 1.6,
  },

  // ── Stepper ───────────────────────────────────────────────────
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: '36px',
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
    width: '36px',
    height: '36px',
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
    fontWeight: 700,
    letterSpacing: '0.04em',
    textAlign: 'center',
    paddingTop: '4px',
    lineHeight: 1.4,
    maxWidth: '96px',
    color: 'var(--color-text-muted)',
  },

  // ── Status banner ─────────────────────────────────────────────
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
  },
  statusIcon: {
    fontSize: '28px',
    flexShrink: 0,
    lineHeight: 1,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '4px',
    color: 'var(--color-text)',
  },
  statusDesc: {
    fontSize: '13.5px',
    lineHeight: 1.55,
    color: 'var(--color-text-muted)',
  },

  // ── Info grid ─────────────────────────────────────────────────
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '28px',
  },
  infoItem: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  infoLabel: {
    fontSize: '10.5px',
    color: 'var(--color-text-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '14px',
    color: 'var(--color-text)',
    fontWeight: 700,
    wordBreak: 'break-word',
    lineHeight: 1.4,
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border)',
    margin: '0 0 24px',
  },

  // ── Action buttons ────────────────────────────────────────────
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    padding: '11px 22px',
    borderRadius: '9999px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  refreshBtn: {
    padding: '12px 24px',
    borderRadius: '9999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #1D4ED8 100%)',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
  },

  // ── Loading skeleton ─────────────────────────────────────────
  skeletonLine: {
    borderRadius: '6px',
    backgroundColor: 'var(--color-surface)',
  },

  // ── Error box ────────────────────────────────────────────────
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#f87171',
    fontSize: '13.5px',
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: 1.5,
    fontWeight: 500,
  },

  // ── Loading spinner ───────────────────────────────────────────
  spinner: {
    display: 'inline-block',
    width: '15px',
    height: '15px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    marginRight: '4px',
  },
}
