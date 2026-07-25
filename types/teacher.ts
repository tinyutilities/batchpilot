export interface TeacherProfile {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
}

export interface InstituteProfile {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  website: string;
}

export interface TeacherPreferences {
  emailNotifications: boolean;
  autoReports: boolean;
  // Most teachers using BatchPilot tutor independently from home. Institute
  // Information only appears in Settings once this is switched on.
  teachesUnderInstitute: boolean;
}

export interface TeacherSettings {
  profile: TeacherProfile;
  institute: InstituteProfile;
  preferences: TeacherPreferences;
}
