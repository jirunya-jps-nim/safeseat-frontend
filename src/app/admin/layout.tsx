// app/admin/layout.tsx
// Layout wrapper สำหรับทุกหน้าใน /admin/*
// ทำให้มั่นใจว่าทุกหน้า admin ใช้ font Prompt เดียวกัน
// และมี dark background ที่แตกต่างจากหน้าทั่วไปของผู้ใช้งาน

export const metadata = {
  title: 'SafeSeat Admin — ระบบจัดการผู้ดูแล',
  description: 'SafeSeat Admin Control Panel — จัดการคนขับ ร้านค้า และรายงาน',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Inject Prompt font + Admin-wide global overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap');

        /* Standardize layout sizing */
        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Admin body background: light mode clean layout */
        body {
          background-color: #f1f5f9 !important;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        /* Scrollbar ให้ดูเข้ากับ light theme */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }

        /* Skeleton pulse animation */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Smooth transitions for nav hover */
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </>
  )
}
