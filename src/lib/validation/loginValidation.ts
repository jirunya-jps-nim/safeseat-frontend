
import { LoginForm } from '@/types'

export function validateLogin(
  form: LoginForm,
  setError: (msg: string) => void,
  role: 'pub' | 'driver' | 'admin' = 'pub'
): boolean {
  const username = form.username ? form.username.trim() : ''
  const password = form.password ? form.password.trim() : ''

  if (!username || !password) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  if (role === 'driver') {
    if (!/^0[689][0-9]{8}$/.test(username)) {
      setError('หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09 เท่านั้น')
      return false
    }
  } else if (role === 'pub') {
    if (!/^[a-zA-Z0-9]{8,50}$/.test(username)) {
      setError('ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 8-50 ตัวอักษร')
      return false
    }
  }

  if (!/^(?=.*[!#_.])[a-zA-Z0-9!#_.]{8,50}$/.test(password)) {
    setError('รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข และรวมอักขระพิเศษ [!#_.] เท่านั้น ความยาว 8 - 50 ตัวอักษร')
    return false
  }

  return true
}

