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
  aiModels?: string[];
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

export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: LocalizedString;
  bio?: LocalizedString;
}

export interface ArticleComment {
  id: string;
  articleId?: string;
  articleSlug?: string;
  authorName: string;
  authorAvatar?: string;
  authorEmail?: string;
  authorId?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Article {
  id: string;
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  content: LocalizedString;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author?: Author;
  authorEmail?: string;
  authorId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  coverImage?: string;
  featured?: boolean;
  vanpediaTerms?: string[]; // slugs referenced in content via [[slug]]
  vanpediaSlugs?: string[]; // alias for vanpediaTerms
  relatedArticleSlugs?: string[]; // relational slugs to other articles
  views?: number;
  likes?: number;
  commentsCount?: number;
}

export interface VanpediaTerm {
  id: string;
  slug: string;
  title: LocalizedString;
  definition: LocalizedString;
  category: string;
  phonetic?: string;
  examples?: LocalizedStringArray;
  formula?: string;
  relatedTerms?: string[]; // slugs of related vanpedia terms
  relatedSlugs?: string[]; // alias
  articleIds?: string[]; // article IDs that reference this term
  content?: LocalizedString; // full markdown content for term page
  status?: 'pending' | 'approved' | 'rejected';
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface IssueAnswer {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorEmail?: string;
  authorId?: string;
  content: string;
  createdAt: string;
  votes: number;
  isAccepted?: boolean;
}

export interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  authorName: string;
  authorAvatar?: string;
  authorEmail?: string;
  authorId?: string;
  createdAt: string;
  votes: number;
  answersCount: number;
  status: 'open' | 'solved';
  solvedAnswerId?: string;
  answers?: IssueAnswer[];
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
