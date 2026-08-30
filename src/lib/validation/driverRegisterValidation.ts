import { DriverRegisterForm } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 

export function validateDriverStep1(
  form: DriverRegisterForm,
  profileFile: File | null,
  setError: (msg: string) => void
): boolean {
  const { firstName, lastName, idCard, email, bankAccountNo, gender, phoneNo, password, driverSkills } = form

  if (!firstName || !firstName.trim()) {
    setError('กรุณากรอกชื่อ')
    return false
  }
  if (!/^[ก-๙a-zA-Z]{2,50}$/.test(firstName.trim())) {
    setError('ชื่อ ต้องเป็นอักษรภาษาไทยหรือภาษาอังกฤษ 2-50 ตัวอักษร และไม่มีช่องว่าง')
    return false
  }

  if (!lastName || !lastName.trim()) {
    setError('กรุณากรอกนามสกุล')
    return false
  }
  if (!/^[ก-๙a-zA-Z]{2,50}$/.test(lastName.trim())) {
    setError('นามสกุล ต้องเป็นอักษรภาษาไทยหรือภาษาอังกฤษ 2-50 ตัวอักษร และไม่มีช่องว่าง')
    return false
  }

  if (!idCard || !idCard.trim()) {
    setError('กรุณากรอกหมายเลขบัตรประชาชน')
    return false
  }
  if (!/^[0-9]{13}$/.test(idCard.trim())) {
    setError('หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก')
    return false
  }

  if (!bankAccountNo || !bankAccountNo.trim()) {
    setError('กรุณากรอกเลขบัญชีกสิกรไทย')
    return false
  }
  if (!/^[0-9]{10,12}$/.test(bankAccountNo.trim())) {
    setError('เลขบัญชีกสิกรไทยต้องเป็นตัวเลข 10 - 12 หลักเท่านั้น')
    return false
  }

  if (!email || !email.trim()) {
    setError('กรุณากรอกอีเมล')
    return false
  }
  if (!/^[a-z0-9_.]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.toLowerCase().trim())) {
    setError('อีเมลต้องเป็นรูปแบบมาตรฐานสากลเท่านั้น (เช่น example@domain.com)')
    return false
  }

  if (!phoneNo || !phoneNo.trim()) {
    setError('กรุณากรอกเบอร์โทรศัพท์มือถือ')
    return false
  }
  if (!/^0[689][0-9]{8}$/.test(phoneNo.trim())) {
    setError('หมายเลขโทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น')
    return false
  }

  if (!password) {
    setError('กรุณากรอกรหัสผ่าน')
    return false
  }
  if (!/^(?=.*[!#_.])[a-zA-Z0-9!#_.]{8,50}$/.test(password)) {
    setError('รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] เท่านั้น ความยาว 8 - 50 ตัวอักษร และไม่มีช่องว่าง')
    return false
  }

  if (!profileFile) {
    setError('กรุณาแนบรูปภาพใบหน้าตนเอง')
    return false
  }

  if (!gender) {
    setError('กรุณาเลือกเพศ')
    return false
  }

  if (!driverSkills || driverSkills.length === 0) {
    setError('กรุณาเลือกความสามารถในการขับรถยนต์อย่างน้อย 1 ประเภท')
    return false
  }

  return true
}

export function validateDriverStep2(
  form: DriverRegisterForm,
  carFile: File | null,
  termsAccepted: boolean,
  setError: (msg: string) => void
): boolean {
  const { carBrand, carModel, carColor, carPlate } = form

  if (!carBrand || !carBrand.trim()) {
    setError('กรุณากรอกยี่ห้อรถยนต์')
    return false
  }
  if (!/^[ก-๙a-zA-Z0-9\s.-]{1,50}$/.test(carBrand.trim())) {
    setError('ยี่ห้อรถยนต์ต้องเป็นตัวอักษรภาษาไทย ภาษาอังกฤษ ตัวเลข เครื่องหมายขีด (-) จุด หรือช่องว่าง 1-50 ตัวอักษร')
    return false
  }

  if (!carModel || !carModel.trim()) {
    setError('กรุณากรอกรุ่นรถยนต์')
    return false
  }
  if (!/^[ก-๙a-zA-Z0-9\s.-]{1,50}$/.test(carModel.trim())) {
    setError('รุ่นรถยนต์ต้องเป็นภาษาไทย ภาษาอังกฤษ ตัวเลข เครื่องหมายขีด (-) จุด หรือช่องว่าง 1-50 ตัวอักษร')
    return false
  }

  if (!carColor || !carColor.trim()) {
    setError('กรุณากรอกสีรถยนต์')
    return false
  }
  if (!/^[ก-๙a-zA-Z0-9\s.-]{1,50}$/.test(carColor.trim())) {
    setError('สีรถยนต์ต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษ 1-50 ตัวอักษร')
    return false
  }

  if (!carPlate || !carPlate.trim()) {
    setError('กรุณากรอกทะเบียนรถยนต์')
    return false
  }
  if (!/^[ก-๙a-zA-Z0-9\s.-]{1,20}$/.test(carPlate.trim())) {
    setError('ทะเบียนรถยนต์ต้องเป็นภาษาไทย ภาษาอังกฤษ ตัวเลข ช่องว่าง หรือเครื่องหมายขีด (-) ความยาว 1-20 ตัวอักษร')
    return false
  }

  if (!carFile) {
    setError('กรุณาแนบรูปภาพรถยนต์ของคุณ')
    return false
  }

  if (!termsAccepted) {
    setError('กรุณายอมรับนโยบายข้อมูลส่วนตัวก่อนดำเนินการต่อ')
    return false
  }

  return true
}

export function validateDriverStep3(
  files: {
    driverLicensePath: File | null
    criminalRecordPath: File | null
    medicalCertificatePath: File | null
  },
  setError: (msg: string) => void
): boolean {
  if (!files.driverLicensePath) {
    setError('กรุณาแนบรูปภาพใบขับขี่')
    return false
  }
  if (!files.criminalRecordPath) {
    setError('กรุณาแนบประวัติอาชญากรรม')
    return false
  }
  if (!files.medicalCertificatePath) {
    setError('กรุณาแนบใบรับรองแพทย์ตรวจสุขภาพ')
    return false
  }
  return true
}

export function validateDriverStep4(
  files: {
    trainingCert1: File | null
    trainingCert2: File | null
  },
  setError: (msg: string) => void
): boolean {
  if (!files.trainingCert1) {
    setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 1 (หลักสูตรการขับขี่ปลอดภัยฯ)')
    return false
  }
  if (!files.trainingCert2) {
    setError('กรุณาแนบเกียรติบัตรการอบรม คอร์สที่ 2 (หลักสูตรการปฐมพยาบาลเบื้องต้นฯ)')
    return false
  }
  return true
}

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
