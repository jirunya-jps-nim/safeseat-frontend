
import { LoginForm } from '@/types'

export function validateLogin(
  form: LoginForm,
  setError: (msg: string) => void,
  role: 'pub' | 'driver' | 'admin' = 'pub'
): boolean {
  if (!form.username || !form.username.trim() || !form.password) {
    setError('กรุณากรอกข้อมูลให้ครบถ้วน')
    return false
  }

  return true
}

