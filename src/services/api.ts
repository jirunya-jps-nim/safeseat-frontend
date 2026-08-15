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
  validateStatus: (status) => status < 500, // Handle 4xx responses (404, 400) gracefully in components without uncaught Axios errors
})

// Attach Bearer Token automatically if stored in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('safeseat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api