
import React from 'react'

interface FieldProps {
  label: string             
  icon: string              
  children: React.ReactNode 
  color?: string            
}

export default function Field({ label, icon, children, color }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ ...styles.label, color: color || '#475569' }}>
        {icon} {label}
      </label>
      {children}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 500,
    marginBottom: 6,
  },
}
