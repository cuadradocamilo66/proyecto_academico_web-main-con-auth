// ===============================
// AUTH & USER TYPES
// ===============================

export interface TeacherProfileDB {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  institution: string | null
  subject_specialty: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TeacherProfile {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  institution: string
  subjectSpecialty: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
}

export interface UpdateTeacherProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  institution?: string
  subjectSpecialty?: string
  avatarUrl?: string
}

// ===============================
// HELPER FUNCTIONS
// ===============================

export function dbTeacherProfileToFrontend(
  dbProfile: TeacherProfileDB
): TeacherProfile {
  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    fullName: `${dbProfile.first_name} ${dbProfile.last_name}`,
    email: dbProfile.email,
    phone: dbProfile.phone || "",
    institution: dbProfile.institution || "",
    subjectSpecialty: dbProfile.subject_specialty || "",
    avatarUrl: dbProfile.avatar_url || "",
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  }
}
