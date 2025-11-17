// User profile data structure
export type UserProfile = {
  // Immutable fields (from IDP/SSO)
  merck_id: string;
  name: string;
  surname: string;
  email: string;
  image?: string;

  // Editable fields (user preferences stored in our database)
  role?: string | null;
  department?: string | null;
  region?: string | null;
  roleDescription?: string | null;
  aiResponseStyleId?: string | null;
  customResponseStyle?: string | null;
  customInstructions?: string | null;
};

// Type for updating profile (only editable fields)
export type UpdateProfileData = {
  role?: string | null;
  department?: string | null;
  region?: string | null;
  roleDescription?: string | null;
  aiResponseStyleId?: string | null;
  customResponseStyle?: string | null;
  customInstructions?: string | null;
};

// Response styles available in the system
export type ResponseStyle = {
  id: string;
  label: string;
  description: string;
  isDefault?: boolean;
};
