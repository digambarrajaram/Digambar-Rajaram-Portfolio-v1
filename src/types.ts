export interface Project {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  metrics?: string;
  architecture?: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface ExperienceItem {
  company: string;
  location: string;
  role: string;
  duration: string;
  domain: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Certification {
  name: string;
  provider: string;
  completedDate?: string;
  status?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
}

export interface AboutData {
  headline: string;
  intro: string[];
  expertise: string[];
  approach: string[];
}

export interface Stats {
  experienceYears: number;
  projects: number;
  certifications: number;
  vmsManaged: string;
  esxiHosts: string;
  backupStorage: string;
  uptime: string;
  usersServed: string;
}
