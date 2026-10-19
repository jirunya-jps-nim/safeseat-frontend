
import { RegisterForm } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 

export function validateStep1(
  form: RegisterForm,
  setError: (msg: string) => void
): boolean {
  if (!form.pubName || !form.pubName.trim()) {
    setError('กรุณากรอกชื่อสถานประกอบการ')
    return false
  }

  if (!form.pubOpen || !form.pubClose) {
    setError('กรุณาระบุเวลาเปิด-ปิดสถานประกอบการ')
    return false
  }

  if (!form.pubEmail || !form.pubEmail.trim()) {
    setError('กรุณากรอกอีเมล')
    return false
  }

  if (!/^[a-z0-9_.]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.pubEmail.toLowerCase().trim())) {
    setError('อีเมลต้องเป็นรูปแบบมาตรฐานสากลเท่านั้น (เช่น example@domain.com)')
    return false
  }

  if (!form.pubPhone || !form.pubPhone.trim()) {
    setError('กรุณากรอกหมายเลขโทรศัพท์')
    return false
  }

  if (!/^0[689][0-9]{8}$/.test(form.pubPhone.trim())) {
    setError('หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น')
    return false
  }

  if (!form.pubAddress || !form.pubAddress.trim() || form.pubAddressLat === undefined || form.pubAddressLng === undefined) {
    setError('กรุณาปักหมุดตำแหน่งสถานบันเทิงผ่านแผนที่')
    return false
  }

  return true
}

export function validateStep2(
  form: RegisterForm,
  licenseFile: File | null,
  shopImgFile: File | null,
  setError: (msg: string) => void
): boolean {
  if (!licenseFile) {
    setError('กรุณาแนบหลักฐานใบอนุญาตประกอบการ')
    return false
  }

  if (!shopImgFile) {
    setError('กรุณาแนบรูปภาพหน้าสถานบันเทิง')
    return false
  }

  if (!form.taxNumber || !form.taxNumber.trim()) {
    setError('กรุณากรอกเลขประจำตัวผู้เสียภาษี')
    return false
  }

  if (!/^[0-9]{13}$/.test(form.taxNumber.trim())) {
    setError('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก')
    return false
  }

  if (!form.bankAccountNo || !form.bankAccountNo.trim()) {
    setError('กรุณากรอกเลขบัญชีธนาคารกสิกรไทย')
    return false
  }

  if (!/^[0-9]{10,12}$/.test(form.bankAccountNo.trim())) {
    setError('เลขบัญชีธนาคารกสิกรไทยต้องเป็นตัวเลข 10–12 หลักเท่านั้น')
    return false
  }

  return true
}

export function validateStep3(
  form: RegisterForm,
  termsAccepted: boolean,
  setError: (msg: string) => void
): boolean {
  if (!form.username || !form.username.trim()) {
    setError('กรุณากรอกชื่อผู้ใช้งาน')
    return false
  }

  if (!/^[a-zA-Z0-9]{8,50}$/.test(form.username.trim())) {
    setError('ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น และมีความยาว 8-50 ตัวอักษร')
    return false
  }

  if (!form.password) {
    setError('กรุณากรอกรหัสผ่าน')
    return false
  }

  if (!/^(?=.*[!#_.])[a-zA-Z0-9!#_.]{8,50}$/.test(form.password)) {
    setError('รหัสผ่านต้องเป็นอักษรภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] มีความยาว 8-50 ตัวอักษร')
    return false
  }

  if (!termsAccepted) {
    setError('กรุณายอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก')
    return false
  }

  return true
}

export function validateLicenseFile(
  file: File,
  setError: (msg: string) => void
): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
    setError('ใบอนุญาต: รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('ใบอนุญาต: ขนาดไฟล์ต้องไม่เกิน 10 MB')
    return false
  }

  return true
}

export function validateShopImageFile(
  file: File,
  setError: (msg: string) => void
): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    setError('รูปหน้าสถานบันเทิง: รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('รูปหน้าสถานบันเทิง: ขนาดไฟล์ต้องไม่เกิน 10 MB')
    return false
  }

  return true
}
