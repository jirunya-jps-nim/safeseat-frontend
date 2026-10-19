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
      color: 'text-[#2340A7]',
      bgIcon: 'bg-[#2340A7]/15 border-[#2340A7]/30',
      title: 'แจ้งเตือน (Notice)',
    },
    confirm: {
      icon: HelpCircle,
      color: 'text-[#2340A7]',
      bgIcon: 'bg-[#2340A7]/15 border-[#2340A7]/30',
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
        className="w-full max-w-2xl sm:max-w-3xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB]" />

        {/* Icon */}
        <div className={`p-4 rounded-full border ${c.bgIcon} ${c.color} shadow-lg`}>
          <IconComp className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-black font-manrope text-[#0F172A] dark:text-white">
            {title || c.title}
          </h3>

          <p className="text-sm sm:text-base text-[#1E293B] dark:text-slate-200 mt-2.5 leading-relaxed font-bold">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full mt-2">
          {isConfirmMode ? (
            <>
              <button
                onClick={onConfirm || onClose}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] !text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
                style={{ color: '#ffffff' }}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-card-hover)] transition-all cursor-pointer"
              >
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-[#2340A7] to-[#2563EB] hover:from-[#1D358F] hover:to-[#1E40AF] !text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              style={{ color: '#ffffff' }}
            >
              {confirmText}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
