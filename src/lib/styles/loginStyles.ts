import React from 'react'

// ─── Login Page Styles ─────────────────────────────────────────────────────
// Design: Clean two-column layout — hero image left, form right
// Colors align with global design tokens (Blue 700 primary, Amber accent)
// ──────────────────────────────────────────────────────────────────────────

export const loginStyles: Record<string, React.CSSProperties> = {

  // ── Page wrapper ──────────────────────────────────────────────
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },

  // ── Subtle bg decoration ──────────────────────────────────────
  bgCircle1: {
    position: 'absolute',
    top: '-120px',
    right: '-80px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-100px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,78,216,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  // ── Layout ───────────────────────────────────────────────────
  container: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    zIndex: 5,
    maxWidth: '1200px',
    width: '100%',
    margin: '48px auto',
    padding: '0 24px',
    gap: '40px',
    alignItems: 'stretch',
  },

  // ── Hero (Left) ──────────────────────────────────────────────
  heroPanel: {
    width: '44%',
    minHeight: '680px',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(170deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.55) 60%, rgba(15,23,42,0.85) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '40px 36px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: '20px',
    marginBottom: '14px',
    width: 'fit-content',
    letterSpacing: '0.02em',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.3,
    margin: '0 0 10px',
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: '14px',
    lineHeight: 1.7,
    margin: '0 0 24px',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '14px 0',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '11px',
    fontWeight: 500,
  },
  statDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ── Form (Right) ─────────────────────────────────────────────
  formPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    minHeight: '680px',
  },
  formInner: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 40px',
  },
  formHeader: {
    marginBottom: '24px',
  },
  formIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  formTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px',
  },
  formSubtitle: {
    fontSize: '13.5px',
    color: '#6b7280',
    margin: 0,
    fontWeight: 400,
  },

  // ── Role Toggle ───────────────────────────────────────────────
  roleToggleContainer: {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '20px',
    gap: '4px',
  },
  roleBtn: {
    flex: 1,
    padding: '9px 10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontWeight: 500,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  },
  roleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  // ── Fields ────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '15px',
    zIndex: 1,
    userSelect: 'none',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    lineHeight: 1.5,
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: '4px',
    color: '#9ca3af',
    lineHeight: 1,
    transition: 'color 0.15s',
  },

  // ── Feedback ─────────────────────────────────────────────────
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px',
    padding: '10px 12px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    lineHeight: 1.5,
  },

  // ── Submit ────────────────────────────────────────────────────
  submitBtn: {
    width: '100%',
    backgroundColor: '#1d4ed8',
    border: 'none',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.15s, transform 0.1s, box-shadow 0.15s',
    marginBottom: '16px',
    letterSpacing: '0.01em',
  },
  spinner: {
    width: '15px',
    height: '15px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
  },

  // ── Register Link ─────────────────────────────────────────────
  registerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 14px',
  },
  registerLink: {
    color: '#1d4ed8',
    cursor: 'pointer',
    fontWeight: 600,
  },

  // ── Trust Badge ───────────────────────────────────────────────
  trustBadge: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '8px 12px',
    letterSpacing: '0.01em',
  },
}
