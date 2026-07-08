// ═══════════════════════════════════════════════════════════════
// types/index.ts
// ไฟล์กลางสำหรับ TypeScript Interface ทั้งหมดของโปรเจกต์
// แยกออกมาเพื่อให้ import ใช้ร่วมกันได้ทุกไฟล์ ไม่ต้องนิยามซ้ำ
// ═══════════════════════════════════════════════════════════════

// ─── Auth Types ───────────────────────────────────────────────────
// โครงสร้างข้อมูลฟอร์ม Login
export interface LoginForm {
  username: string   // ชื่อผู้ใช้งาน (ตัวอักษร/ตัวเลข 8-50 ตัว)
  password: string   // รหัสผ่าน
}

// ─── Register Types ───────────────────────────────────────────────
// โครงสร้างข้อมูลฟอร์มสมัครสมาชิก (ใช้ส่ง multipart/form-data)
export interface RegisterForm {
  // ── ข้อมูลสถานประกอบการ (Step 1) ──────────────────────────────
  pubName: string           // ชื่อสถานประกอบการ
  pubOpen: string           // เวลาเปิด (format HH:mm)
  pubClose: string          // เวลาปิด (format HH:mm)
  pubEmail: string          // อีเมลติดต่อ
  pubPhone: string          // เบอร์โทรศัพท์ (ขึ้นต้น 0, 9-10 หลัก)

  pubAddress: string        // ที่อยู่ (ได้จากการปักหมุดแผนที่)
  pubAddressLat?: number    // Latitude (optional ก่อนปักหมุด)
  pubAddressLng?: number    // Longitude (optional ก่อนปักหมุด)

  // ── เอกสารและบัญชีธนาคาร (Step 2) ────────────────────────────
  taxNumber: string         // เลขผู้เสียภาษี 13 หลัก
  bankAccountName: string   // ชื่อบัญชีธนาคาร (ไทย/อังกฤษ)
  bankAccountNo: string     // เลขที่บัญชีธนาคาร

  // ── บัญชีผู้ใช้งาน (Step 3) ───────────────────────────────────
  username: string          // ชื่อผู้ใช้ระบบ (ตัวอักษร/ตัวเลข 2-50 ตัว)
  password: string          // รหัสผ่าน

  // ── ข้อมูลที่ Backend ส่งกลับมา (ไม่ต้องกรอก) ─────────────────
  regisStatus?: string      // สถานะการสมัคร (pending/approved/rejected)
  regisDate?: string        // วันที่สมัคร
}

// ─── Register Step Config ─────────────────────────────────────────
// โครงสร้างของแต่ละขั้นตอนในหน้าสมัครสมาชิก
export interface StepConfig {
  label: string   // ชื่อขั้นตอน เช่น "ข้อมูลร้าน"
  icon: string    // emoji icon เช่น "🏪"
}

// ─── Driver Register Types ─────────────────────────────────────────
export interface DriverRegisterForm {
  // Step 1: Personal Info
  firstName: string
  lastName: string
  idCard: string
  email: string
  bankAccountNo: string
  gender: string        // "1" (Male), "2" (Female), "3" (Other) - send string that parses to int
  phoneNo: string

  // Step 2: Car Info & Driving Ability
  carBrand: string
  carModel: string
  carColor: string
  carPlate: string
  driverSkills: string[] // e.g., ["Auto", "Manual"]

  // Step 4: Account Details
  username?: string      // optional, falls back to phoneNo
  password: string
}

