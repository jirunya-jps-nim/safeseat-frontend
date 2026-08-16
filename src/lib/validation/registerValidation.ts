
import { RegisterForm } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 

export function validateStep1(
  form: RegisterForm,
  setError: (msg: string) => void
): boolean {
  if (!form.pubName || !form.pubOpen || !form.pubClose || !form.pubEmail || !form.pubPhone) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  if (!form.pubAddress || form.pubAddressLat === undefined || form.pubAddressLng === undefined) {
    setError('กรุณาปักหมุดตำแหน่งร้านผ่านแผนที่')
    return false
  }

  if (!/^0[0-9]{8,9}$/.test(form.pubPhone)) {
    setError('หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก')
    return false
  }

  if (!/^[a-z0-9_.]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.pubEmail)) {
    setError('อีเมลต้องเป็นรูปแบบมาตรฐานสากลเท่านั้น')
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
    setError('กรุณาแนบใบอนุญาตประกอบการ')
    return false
  }

  if (!shopImgFile) {
    setError('กรุณาแนบรูปภาพหน้าร้าน')
    return false
  }

  if (!form.taxNumber || !form.bankAccountName || !form.bankAccountNo) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  if (!/^[0-9]{13}$/.test(form.taxNumber)) {
    setError('เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก')
    return false
  }

  if (!form.bankAccountNo.trim() || !/^[0-9]{10,12}$/.test(form.bankAccountNo)) {
    setError('เลขที่บัญชีต้องเป็นตัวเลข 10–12 หลักเท่านั้น')
    return false
  }

  if (!form.bankAccountName.trim() || !/^[ก-๙a-zA-Z\s]{1,150}$/.test(form.bankAccountName)) {
    setError('ชื่อบัญชีต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น และห้ามใช้อักขระพิเศษ')
    return false
  }

  return true
}

export function validateStep3(
  form: RegisterForm,
  termsAccepted: boolean,
  setError: (msg: string) => void
): boolean {
  if (!termsAccepted) {
    setError('กรุณายอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก')
    return false
  }
  if (!form.username || !form.password) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  if (!/^[a-zA-Z0-9]{8,50}$/.test(form.username)) {
    setError('ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น และมีความยาว 8-50 ตัวอักษร')
    return false
  }

  if (!/^(?=.*[!#_.])[a-zA-Z0-9!#_.]{8,50}$/.test(form.password)) {
    setError('รหัสผ่านต้องเป็นอักษรภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] มีความยาว 8-50 ตัวอักษร')
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
    setError('รูปหน้าร้าน: รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('รูปหน้าร้าน: ขนาดไฟล์ต้องไม่เกิน 10 MB')
    return false
  }

  return true
}
