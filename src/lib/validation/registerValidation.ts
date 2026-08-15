// ═══════════════════════════════════════════════════════════════
// lib/validation/registerValidation.ts
// ฟังก์ชัน validate ข้อมูลฟอร์มสมัครสมาชิกแบ่งตาม 3 ขั้นตอน
// และ validate ไฟล์แนบ (ใบอนุญาต, รูปหน้าร้าน)
// ═══════════════════════════════════════════════════════════════

import { RegisterForm } from '@/types'

// ขนาดไฟล์สูงสุดที่รับได้ = 10 MB
// ใช้สูตร: 10 × 1024 (KB) × 1024 (Bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// ────────────────────────────────────────────────────────────────
// STEP 1: validate ข้อมูลสถานประกอบการ
// ────────────────────────────────────────────────────────────────

/**
 * ตรวจสอบข้อมูลขั้นตอนที่ 1 — ข้อมูลร้าน
 * @param form     - ข้อมูลฟอร์มทั้งหมด
 * @param setError - ฟังก์ชัน setState สำหรับแสดง error
 */
export function validateStep1(
  form: RegisterForm,
  setError: (msg: string) => void
): boolean {
  // Rule 1: ทุก field ต้องไม่ว่าง
  if (!form.pubName || !form.pubOpen || !form.pubClose || !form.pubEmail || !form.pubPhone) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  // Rule 2: ต้องปักหมุดตำแหน่งร้านก่อน (address + lat + lng ต้องมีค่า)
  if (!form.pubAddress || form.pubAddressLat === undefined || form.pubAddressLng === undefined) {
    setError('กรุณาปักหมุดตำแหน่งร้านผ่านแผนที่')
    return false
  }

  // Rule 3: เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก
  // ^0       = ขึ้นต้นด้วย 0
  // [0-9]    = ตัวเลข
  // {8,9}    = ตามด้วยอีก 8 หรือ 9 ตัว (รวมกับ 0 = 9 หรือ 10 ตัว)
  if (!/^0[0-9]{8,9}$/.test(form.pubPhone)) {
    setError('หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก')
    return false
  }

  // Rule 4: รูปแบบอีเมลต้องถูกต้อง (ตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และห้ามมีอักษรพิเศษอื่นนอกจาก _ .)
  if (!/^[a-z0-9_.]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.pubEmail)) {
    setError('อีเมลต้องเป็นรูปแบบมาตรฐานสากลเท่านั้น')
    return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────
// STEP 2: validate เอกสารและบัญชีธนาคาร
// ────────────────────────────────────────────────────────────────

/**
 * ตรวจสอบข้อมูลขั้นตอนที่ 2 — เอกสาร & บัญชี
 * @param form        - ข้อมูลฟอร์มทั้งหมด
 * @param licenseFile - ไฟล์ใบอนุญาตประกอบการ
 * @param shopImgFile - ไฟล์รูปภาพหน้าร้าน
 * @param setError    - ฟังก์ชัน setState สำหรับแสดง error
 */
export function validateStep2(
  form: RegisterForm,
  licenseFile: File | null,
  shopImgFile: File | null,
  setError: (msg: string) => void
): boolean {
  // Rule 1: ต้องแนบใบอนุญาตประกอบการ
  if (!licenseFile) {
    setError('กรุณาแนบใบอนุญาตประกอบการ')
    return false
  }

  // Rule 2: ต้องแนบรูปภาพหน้าร้าน
  if (!shopImgFile) {
    setError('กรุณาแนบรูปภาพหน้าร้าน')
    return false
  }

  // Rule 3: ทุก field ต้องไม่ว่าง
  if (!form.taxNumber || !form.bankAccountName || !form.bankAccountNo) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  // Rule 4: เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลักพอดี
  if (!/^[0-9]{13}$/.test(form.taxNumber)) {
    setError('เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก')
    return false
  }

  // Rule 5: เลขที่บัญชีต้องเป็นตัวเลข 10-12 หลัก
  if (!form.bankAccountNo.trim() || !/^[0-9]{10,12}$/.test(form.bankAccountNo)) {
    setError('เลขที่บัญชีต้องเป็นตัวเลข 10–12 หลักเท่านั้น')
    return false
  }

  // Rule 6: ชื่อบัญชีต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น ห้ามมีอักขระพิเศษ
  // [ก-๙]  = ตัวอักษรไทย
  // a-zA-Z = ตัวอักษรอังกฤษ
  // \s     = ช่องว่าง
  if (!form.bankAccountName.trim() || !/^[ก-๙a-zA-Z\s]{1,150}$/.test(form.bankAccountName)) {
    setError('ชื่อบัญชีต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น และห้ามใช้อักขระพิเศษ')
    return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────
// STEP 3: validate บัญชีผู้ใช้งาน
// ────────────────────────────────────────────────────────────────

/**
 * ตรวจสอบข้อมูลขั้นตอนที่ 3 — บัญชีผู้ใช้
 * @param form     - ข้อมูลฟอร์มทั้งหมด
 * @param setError - ฟังก์ชัน setState สำหรับแสดง error
 */
export function validateStep3(
  form: RegisterForm,
  termsAccepted: boolean,
  setError: (msg: string) => void
): boolean {
  // Rule 0: ต้องยอมรับเงื่อนไข
  if (!termsAccepted) {
    setError('กรุณายอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก')
    return false
  }
  // Rule 1: username และ password ต้องไม่ว่าง
  if (!form.username || !form.password) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  // Rule 2: username ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น ความยาว 8-50 ตัว ไม่มีเว้นวรรค
  if (!/^[a-zA-Z0-9]{8,50}$/.test(form.username)) {
    setError('ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น และมีความยาว 8-50 ตัวอักษร')
    return false
  }

  // Rule 3: password ต้องเป็นอักษรภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] ความยาว 8-50 ตัว ไม่มีเว้นวรรค
  if (!/^(?=.*[!#_.])[a-zA-Z0-9!#_.]{8,50}$/.test(form.password)) {
    setError('รหัสผ่านต้องเป็นอักษรภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] มีความยาว 8-50 ตัวอักษร')
    return false
  }

  return true
}

// ────────────────────────────────────────────────────────────────
// File Validators — ตรวจสอบนามสกุลและขนาดของไฟล์แนบ
// ────────────────────────────────────────────────────────────────

/**
 * ตรวจสอบไฟล์ใบอนุญาตประกอบการ
 * รองรับ: PDF, JPG, JPEG, PNG — ขนาดไม่เกิน 10 MB
 */
export function validateLicenseFile(
  file: File,
  setError: (msg: string) => void
): boolean {
  // ดึงนามสกุลไฟล์ออกมา เช่น "document.pdf" → "pdf"
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  // ตรวจสอบนามสกุลไฟล์
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
    setError('ใบอนุญาต: รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น')
    return false
  }

  // ตรวจสอบขนาดไฟล์ (file.size มีหน่วยเป็น Bytes)
  if (file.size > MAX_FILE_SIZE) {
    setError('ใบอนุญาต: ขนาดไฟล์ต้องไม่เกิน 10 MB')
    return false
  }

  return true
}

/**
 * ตรวจสอบไฟล์รูปภาพหน้าร้าน
 * รองรับ: JPG, JPEG, PNG เท่านั้น — ขนาดไม่เกิน 10 MB
 */
export function validateShopImageFile(
  file: File,
  setError: (msg: string) => void
): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  // รูปภาพไม่รองรับ PDF (ต่างจาก license)
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    setError('รูปหน้าร้าน: รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('รูปหน้าร้าน: ขนาดไฟล์ต้องไม่เกิน 10 MB')
    return false
  }

  return true
}
