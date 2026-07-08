// ═══════════════════════════════════════════════════════════════
// services/api.ts
// ไฟล์กำหนดค่า Axios HTTP Client สำหรับเชื่อมต่อกับ Backend API
// ═══════════════════════════════════════════════════════════════

import axios from 'axios'

// สร้าง axios instance พร้อม config ตั้งต้น
// ทุกการเรียก api.get / api.post จะใช้ baseURL นี้โดยอัตโนมัติ
// ทำให้ไม่ต้องพิมพ์ http://localhost:5000/api ซ้ำทุกครั้ง
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
})

export default api