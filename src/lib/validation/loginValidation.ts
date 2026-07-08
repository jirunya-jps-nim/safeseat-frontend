// ═══════════════════════════════════════════════════════════════
// lib/validation/loginValidation.ts
// ฟังก์ชัน validate ข้อมูลฟอร์ม Login ก่อนส่งไป Backend
// แยกออกมาจาก page เพื่อให้ทดสอบและนำกลับมาใช้ใหม่ได้ง่าย
// ═══════════════════════════════════════════════════════════════

import { LoginForm } from '@/types'

/**
 * ตรวจสอบความถูกต้องของฟอร์ม Login
 * @param form      - ข้อมูลที่ผู้ใช้กรอก
 * @param setError  - ฟังก์ชัน setState สำหรับแสดงข้อความ error
 * @returns true ถ้าผ่านทุก rule, false ถ้ามี error (จะ setError ให้อัตโนมัติ)
 */
export function validateLogin(
  form: LoginForm,
  setError: (msg: string) => void,
  role: 'pub' | 'driver' | 'admin' = 'pub'
): boolean {
  // Rule 1: ห้ามกรอกข้อมูลไม่ครบ
  if (!form.username || !form.password) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  if (role === 'admin') {
    const adminUsernameRegex = /^[a-zA-Z0-9]{6,30}$/
    if (!adminUsernameRegex.test(form.username)) {
      setError('ชื่อผู้ใช้ผู้ดูแลระบบต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข ความยาว 6–30 ตัวอักษร')
      return false
    }

    const adminPasswordRegex = /^[a-zA-Z0-9!#_.]{6,30}$/
    if (!adminPasswordRegex.test(form.password)) {
      setError('รหัสผ่านผู้ดูแลระบบต้องเป็นภาษาอังกฤษ ตัวเลข และ ! # _ . ความยาว 6–30 ตัวอักษร')
      return false
    }
  } else if (role === 'driver') {
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(form.username)) {
      setError('ชื่อผู้ใช้งานสำหรับผู้ให้บริการขับรถ ต้องเป็นเบอร์โทรศัพท์ 10 หลักเท่านั้น')
      return false
    }
  } else {
    // Rule 2: username ต้องเป็นตัวอักษรหรือตัวเลข 8-50 ตัวเท่านั้น
    // ^ = เริ่มต้น, [a-zA-Z0-9] = ตัวอักษรหรือตัวเลข, {8,50} = 8 ถึง 50 ตัว, $ = สิ้นสุด
    const usernameRegex = /^[a-zA-Z0-9]{8,50}$/
    if (!usernameRegex.test(form.username)) {
      setError('ชื่อผู้ใช้ต้องเป็นตัวอักษรหรือตัวเลข 8–50 ตัว')
      return false
    }
  }

  // ผ่านทุก rule
  return true
}

