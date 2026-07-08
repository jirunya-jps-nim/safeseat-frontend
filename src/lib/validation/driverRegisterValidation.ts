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

  // Bank Account: ตัวเลข 12 หลัก
  if (!/^[0-9]{12}$/.test(bankAccountNo)) {
    setError('เลขบัญชีธนาคาร (กสิกรไทย) ต้องเป็นตัวเลข 12 หลัก')
    return false
  }

  // Phone No: ตัวเลข 10 หลัก
  if (!/^[0-9]{10}$/.test(phoneNo)) {
    setError('หมายเลขโทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก')
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

  // Car Brand: ภาษาอังกฤษเท่านั้น ความยาว 2-50 ตัวอักษร ไม่มีช่องว่าง
  if (!/^[a-zA-Z]{2,50}$/.test(carBrand)) {
    setError('ยี่ห้อรถยนต์ต้องเป็นตัวอักษรภาษาอังกฤษ 2-50 ตัวอักษร')
    return false
  }

  // Car Model: ภาษาอังกฤษและตัวเลขเท่านั้น ความยาว 2-50 ตัวอักษร ไม่มีช่องว่าง
  if (!/^[a-zA-Z0-9]{2,50}$/.test(carModel)) {
    setError('รุ่นรถยนต์ต้องเป็นภาษาอังกฤษหรือตัวเลข 2-50 ตัวอักษร')
    return false
  }

  // Car Color: ภาษาไทยเท่านั้น ความยาว 2-50 ตัวอักษร ไม่มีช่องว่าง
  if (!/^[ก-๙]{2,50}$/.test(carColor)) {
    setError('สีรถยนต์ต้องเป็นภาษาไทย 2-50 ตัวอักษร')
    return false
  }

  // Car Plate: ภาษาไทย ตัวเลข และขีด ความยาว 2-20 ตัวอักษร ไม่มีช่องว่าง
  if (!/^[ก-๙0-9-]{2,20}$/.test(carPlate)) {
    setError('ทะเบียนรถยนต์ต้องเป็นภาษาไทย ตัวเลข หรือเครื่องหมายขีด (-) ความยาว 2-20 ตัวอักษร')
    return false
  }

  return true
}

// STEP 3: ตรวจสอบรูปภาพเอกสารแนบ
export function validateDriverStep3(
  files: {
    regisImagePath: File | null
    carImagePath: File | null
    driverLicensePath: File | null
    criminalRecordPath: File | null
    medicalCertificatePath: File | null
  },
  setError: (msg: string) => void
): boolean {
  const {
    regisImagePath,
    carImagePath,
    driverLicensePath,
    criminalRecordPath,
    medicalCertificatePath,
  } = files

  if (!regisImagePath) {
    setError('กรุณาแนบรูปภาพใบหน้าตนเอง')
    return false
  }
  if (!carImagePath) {
    setError('กรุณาแนบรูปภาพรถยนต์')
    return false
  }
  if (!driverLicensePath) {
    setError('กรุณาแนบรูปภาพใบขับขี่')
    return false
  }
  if (!criminalRecordPath) {
    setError('กรุณาแนบรูปภาพประวัติอาชญากรรม')
    return false
  }
  if (!medicalCertificatePath) {
    setError('กรุณาแนบใบรับรองแพทย์ตรวจสุขภาพ')
    return false
  }

  return true
}

// STEP 4: ข้อมูลบัญชีและข้อตกลง
export function validateDriverStep4(
  form: DriverRegisterForm,
  termsAccepted: boolean,
  setError: (msg: string) => void
): boolean {
  const { username, password } = form

  if (!termsAccepted) {
    setError('กรุณายอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว')
    return false
  }

  if (!password) {
    setError('กรุณากรอกรหัสผ่าน')
    return false
  }

  // Password: a-zA-Z0-9 และอักขระพิเศษ [!#_.] เท่านั้น ความยาว 6-50 ตัว ไม่มีช่องว่าง
  if (!/^[a-zA-Z0-9!#_.]{6,50}$/.test(password)) {
    setError('รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข และอักขระพิเศษ [!#_.] เท่านั้น ความยาว 6 - 50 ตัวอักษร')
    return false
  }

  // Username (ถ้ามี): a-zA-Z0-9_ 2-50 ตัว
  if (username && !/^[a-zA-Z0-9_]{2,50}$/.test(username)) {
    setError('ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) ความยาว 2-50 ตัวอักษร')
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
