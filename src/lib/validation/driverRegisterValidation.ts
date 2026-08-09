// ═══════════════════════════════════════════════════════════════
// lib/validation/driverRegisterValidation.ts
// ฟังก์ชัน validate ข้อมูลฟอร์มสมัครสมาชิกคนขับรถตามขั้นตอน
// ═══════════════════════════════════════════════════════════════

import { DriverRegisterForm } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// STEP 1: ข้อมูลส่วนตัว
export function validateDriverStep1(
  form: DriverRegisterForm,
  setError: (msg: string) => void
): boolean {
  const { firstName, lastName, idCard, email, bankAccountNo, gender, phoneNo } = form

  if (!firstName || !lastName || !idCard || !email || !bankAccountNo || !gender || !phoneNo) {
    setError('กรุณากรอกข้อมูลส่วนตัวทั่วไปให้ครบถ้วน')
    return false
  }

  // First Name: ก-๙, a-z, A-Z เท่านั้น ความยาว 2-50 ตัวอักษร
  if (!/^[ก-๙a-zA-Z]{2,50}$/.test(firstName)) {
    setError('ชื่อ ต้องเป็นอักษรภาษาไทยหรือภาษาอังกฤษ 2-50 ตัวอักษร และไม่มีช่องว่าง')
    return false
  }

  // Last Name: ก-๙, a-z, A-Z เท่านั้น ความยาว 2-50 ตัวอักษร
  if (!/^[ก-๙a-zA-Z]{2,50}$/.test(lastName)) {
    setError('นามสกุล ต้องเป็นอักษรภาษาไทยหรือภาษาอังกฤษ 2-50 ตัวอักษร และไม่มีช่องว่าง')
    return false
  }

  // ID Card: ตัวเลข 13 หลัก
  if (!/^[0-9]{13}$/.test(idCard)) {
    setError('หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก')
    return false
  }

  // Email: รูปแบบอีเมลมาตรฐาน
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('รูปแบบอีเมลไม่ถูกต้อง')
    return false
  }

  // Bank Account: ตัวเลข 10-12 หลัก (รองรับธนาคารทั่วไปในไทย)
  if (!/^[0-9]{10,12}$/.test(bankAccountNo)) {
    setError('เลขบัญชีธนาคารต้องเป็นตัวเลข 10 - 12 หลัก')
    return false
  }

  // Phone No: ตัวเลข 10 หลัก ขึ้นต้นด้วย 0
  if (!/^0[0-9]{9}$/.test(phoneNo)) {
    setError('หมายเลขโทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0')
    return false
  }

  return true
}

// STEP 2: ข้อมูลรถยนต์และความสามารถ
export function validateDriverStep2(
  form: DriverRegisterForm,
  setError: (msg: string) => void
): boolean {
  const { carBrand, carModel, carColor, carPlate, driverSkills } = form

  if (!carBrand || !carModel || !carColor || !carPlate) {
    setError('กรุณากรอกข้อมูลยานพาหนะให้ครบถ้วน')
    return false
  }

  if (!driverSkills || driverSkills.length === 0) {
    setError('กรุณาเลือกความสามารถในการขับรถยนต์อย่างน้อย 1 ประเภท')
    return false
  }

  // Car Brand: ภาษาอังกฤษ ช่องว่าง และเครื่องหมายขีด (-) ความยาว 2-50 ตัวอักษร
  if (!/^[a-zA-Z\s-]{2,50}$/.test(carBrand)) {
    setError('ยี่ห้อรถยนต์ต้องเป็นตัวอักษรภาษาอังกฤษ เครื่องหมายขีด (-) หรือช่องว่าง 2-50 ตัวอักษร')
    return false
  }

  // Car Model: ภาษาอังกฤษ ตัวเลข ช่องว่าง และเครื่องหมายขีด (-) ความยาว 1-50 ตัวอักษร
  if (!/^[a-zA-Z0-9\s-]{1,50}$/.test(carModel)) {
    setError('รุ่นรถยนต์ต้องเป็นภาษาอังกฤษ ตัวเลข เครื่องหมายขีด (-) หรือช่องว่าง 1-50 ตัวอักษร')
    return false
  }

  // Car Color: ภาษาไทย ช่องว่าง และเครื่องหมายขีด (-) ความยาว 2-50 ตัวอักษร
  if (!/^[ก-๙\s-]{2,50}$/.test(carColor)) {
    setError('สีรถยนต์ต้องเป็นภาษาไทย 2-50 ตัวอักษร')
    return false
  }

  // Car Plate: ภาษาไทย ตัวเลข ช่องว่าง และขีด ความยาว 2-20 ตัวอักษร
  if (!/^[ก-๙0-9\s-]{2,20}$/.test(carPlate)) {
    setError('ทะเบียนรถยนต์ต้องเป็นภาษาไทย ตัวเลข ช่องว่าง หรือเครื่องหมายขีด (-) ความยาว 2-20 ตัวอักษร')
    return false
  }

  return true
}



// ฟังก์ชันสำหรับ validate แต่ละไฟล์
export function validateDriverFile(
  file: File,
  label: string,
  setError: (msg: string) => void
): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    setError(`${label}: รองรับเฉพาะไฟล์ JPG หรือ PNG เท่านั้น`)
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    setError(`${label}: ขนาดไฟล์ต้องไม่เกิน 10 MB`)
    return false
  }

  return true
}
