// User profile data structure
export interface UserProfile {
  // Immutable fields (from IDP/SSO)
  merck_id: string
  name: string
  surname: string
  email: string
  image?: string

  // Editable fields (user preferences stored in our database)
  role?: string
  department?: string
  region?: string
  roleDescription?: string
  aiResponseStyleId?: string
  customResponseStyle?: string
  customInstructions?: string
}

// Type for updating profile (only editable fields)
export interface UpdateProfileData {
  role?: string
  department?: string
  region?: string
  roleDescription?: string
  aiResponseStyleId?: string
  customResponseStyle?: string
  customInstructions?: string
}

// Response styles available in the system
export interface ResponseStyle {
  id: string
  label: string
  description: string
}
