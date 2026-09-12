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
  likedBy?: string[];
  replyToId?: string;
  replyToName?: string;
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
  isAiAssisted?: boolean;
  aiModel?: string; // e.g. "Gemini 3.7 Flash", "ChatGPT (GPT-4o)", "Claude 3.7 Sonnet", "v0 by Vercel", "Scira AI", "GLM-4"
  aiPromptUsed?: string;
  status?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  coverImage?: string;
  featured?: boolean;
  vanpediaTerms?: string[]; // slugs referenced in content via [[slug]]
  vanpediaSlugs?: string[]; // alias for vanpediaTerms
  relatedArticleSlugs?: string[]; // relational slugs to other articles
  visibility?: 'public' | 'private';
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
  likedBy?: string[];
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
  isAiAssisted?: boolean;
  aiModel?: string; // e.g. "Gemini 3.7 Flash", "Claude 3.7 Sonnet"
  visibility?: 'public' | 'private';
  status?: 'pending' | 'approved' | 'rejected';
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentReport {
  id: string;
  contentType: 'article' | 'vanpedia' | 'question';
  contentSlug: string;
  contentTitle: string;
  reason: 'incorrect_info' | 'math_error' | 'typo' | 'copyright' | 'inappropriate' | 'other';
  reasonLabel?: string;
  details: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterId?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedBy?: string;
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
  votedBy?: string[];
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
  votedBy?: string[];
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
