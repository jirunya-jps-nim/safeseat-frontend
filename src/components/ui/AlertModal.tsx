'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, HelpCircle } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm?: () => void
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  onClose,
  onConfirm
}: AlertModalProps) {
  if (!isOpen) return null

  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgIcon: 'bg-emerald-500/15 border-emerald-500/30',
      title: 'สำเร็จ (Success)',
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgIcon: 'bg-red-500/15 border-red-500/30',
      title: 'เกิดข้อผิดพลาด (Error)',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgIcon: 'bg-amber-500/15 border-amber-500/30',
      title: 'คำเตือน (Warning)',
    },
    info: {
      icon: Info,
      color: 'text-[#7C3AED]',
      bgIcon: 'bg-[#7C3AED]/15 border-[#7C3AED]/30',
      title: 'แจ้งเตือน (Notice)',
    },
    confirm: {
      icon: HelpCircle,
      color: 'text-[#7C3AED]',
      bgIcon: 'bg-[#7C3AED]/15 border-[#7C3AED]/30',
      title: 'ยืนยันรายการ (Confirmation)',
    }
  }

  const c = config[type]
  const IconComp = c.icon
  const isConfirmMode = type === 'confirm'

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-up" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        className="w-auto max-w-2xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8]" />

        {}
        <div className={`p-4 rounded-full border ${c.bgIcon} ${c.color} shadow-lg`}>
          <IconComp className="w-8 h-8" />
        </div>

        {}
        <h3 className="text-lg sm:text-xl font-bold font-manrope text-[var(--color-text)] whitespace-nowrap">
          {title || c.title}
        </h3>

        {}
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed font-light whitespace-nowrap">
          {message}
        </p>

        {}
        <div className="flex items-center gap-3 w-full mt-2">
          {isConfirmMode ? (
            <>
              <button
                onClick={onConfirm || onClose}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-card-hover)] transition-all cursor-pointer"
              >
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#1D4ED8] hover:from-[#6D28D9] hover:to-[#1E40AF] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
            >
              {confirmText}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
