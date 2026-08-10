export interface Project {
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly metrics?: string;
  readonly architecture?: readonly string[];
  readonly githubUrl?: string;
  readonly liveUrl?: string;
}

export interface ExperienceItem {
  readonly company: string;
  readonly location: string;
  readonly role: string;
  readonly duration: string;
  readonly domain: string;
  readonly responsibilities: readonly string[];
  readonly achievements: readonly string[];
}

export interface Certification {
  readonly name: string;
  readonly provider: string;
  readonly completedDate?: string;
  readonly status?: string;
}

export interface PersonalInfo {
  readonly name: string;
  readonly title: string;
  readonly location: string;
  readonly phone: string;
  readonly email: string;
}

export interface SocialLinks {
  readonly linkedin: string;
  readonly github: string;
  readonly twitter: string;
}

export interface AboutData {
  readonly headline: string;
  readonly intro: readonly string[];
  readonly expertise: readonly string[];
  readonly approach: readonly string[];
}

export interface Stats {
  readonly experienceYears: number;
  readonly projects: number;
  readonly certifications: number;
  readonly vmsManaged: string;
  readonly esxiHosts: string;
  readonly backupStorage: string;
  readonly uptime: string;
  readonly usersServed: string;
}
