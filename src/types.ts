export type Language = 'en' | 'id';
export type Theme = 'light' | 'dark';

export interface LocalizedString {
  en: string;
  id: string;
}

export interface LocalizedStringArray {
  en: string[];
  id: string[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: LocalizedString;
  description: LocalizedString;
  longDescription: LocalizedString;
  category: 'edtech' | 'enterprise' | 'academic' | 'management';
  year: string;
  technologies: string[];
  highlights: LocalizedStringArray;
  image: string;
  gallery?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  isHobby?: boolean;
  isNewest?: boolean;
  isMostUsed?: boolean;
  statusBadge?: LocalizedString;
  stats?: { label: LocalizedString; value: string }[];
}

export interface Experience {
  id: string;
  company: string;
  companyType?: LocalizedString;
  role: LocalizedString;
  period: string;
  location: LocalizedString;
  description: LocalizedString;
  achievements: LocalizedStringArray;
  technologies: string[];
}

export interface SkillItem {
  name: string;
  highlight?: boolean;
  note?: string;
}

export interface SkillGroup {
  category: LocalizedString;
  description: LocalizedString;
  skills: SkillItem[];
}

export interface BlogPost {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  content: LocalizedString;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export interface PhilosophyItem {
  number: string;
  title: LocalizedString;
  quote: LocalizedString;
  description: LocalizedString;
}

export interface ProfileInfo {
  name: string;
  title: LocalizedString;
  bio: LocalizedString;
  aboutEditorial: LocalizedStringArray;
  location: string;
  experienceYears: string;
  status: LocalizedString;
  email: string;
  github: string;
  instagram: string;
  quickStats: {
    label: LocalizedString;
    value: string;
  }[];
}
