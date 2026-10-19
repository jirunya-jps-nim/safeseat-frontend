
export interface LoginForm {
  username: string   
  password: string   
}

export interface RegisterForm {
  pubName: string           
  pubOpen: string           
  pubClose: string          
  pubEmail: string          
  pubPhone: string          

  pubAddress: string        
  pubAddressLat?: number    
  pubAddressLng?: number    

  taxNumber: string         
  bankAccountName: string   
  bankAccountNo: string     

  username: string          
  password: string          

  regisStatus?: string      
  regisDate?: string        
}

export interface StepConfig {
  label: string   
  icon: string    
}

export interface DriverRegisterForm {
  firstName: string
  lastName: string
  idCard: string
  email: string
  bankAccountNo: string
  gender: string        
  phoneNo: string

  carBrand: string
  carModel: string
  carColor: string
  carPlate: string
  driverSkills: string[] 

  username?: string      
  password: string
}

