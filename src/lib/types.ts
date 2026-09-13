export type ProjectStatus = 'completed' | 'in-progress' | 'planned' | 'archived'
export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'Tools' | 'Design' | 'Other'
export type LabelPosition =
  | 'top-left'
  | 'top-right'
  | 'mid-left'
  | 'mid-right'
  | 'bottom-left'
  | 'bottom-right'

export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  thumbnail_url: string | null
  hero_image_url: string | null
  technologies: string[]
  category: string
  github_url: string | null
  live_url: string | null
  status: ProjectStatus
  featured: boolean
  published: boolean
  display_order: number
  start_date: string | null
  completion_date: string | null
  key_features: string[]
  challenges: string | null
  solutions: string | null
  lessons_learned: string | null
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  caption: string | null
  display_order: number
  created_at: string
}

export interface Skill {
  id: string
  name: string
  icon: string | null
  category: SkillCategory
  level: number | null
  display_order: number
  active: boolean
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string | null
  logo_url: string | null
  company_url: string | null
  start_date: string | null
  end_date: string | null
  currently_working: boolean
  description: string | null
  display_order: number
  active: boolean
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string | null
  location: string | null
  logo_url: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  display_order: number
  active: boolean
}

export interface Service {
  id: string
  title: string
  description: string | null
  icon: string | null
  active: boolean
  display_order: number
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string | null
  active: boolean
  display_order: number
}

export interface HeroLabel {
  id: string
  text: string
  position: LabelPosition
  active: boolean
  display_order: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'viewer'
}

/* ---------- Settings groups: one jsonb row each in site_settings ---------- */

export interface GeneralSettings {
  site_name: string
  logo_url: string
  favicon_url: string
  footer_text: string
}

export interface HeroSettings {
  greeting: string
  name: string
  title: string
  intro: string
  availability_text: string
  availability_active: boolean
  cta_projects: string
  cta_contact: string
  cta_resume: string
  image_url: string
  video_url: string
  video_poster_url: string
  video_enabled: boolean
}

export interface AboutSettings {
  short_bio: string
  full_bio: string
  location: string
  role: string
  experience_years: string
  image_url: string
  resume_url: string
}

export interface ContactSettings {
  email: string
  phone: string
  whatsapp: string
  location: string
  form_note: string
}

export interface ResumeSettings {
  url: string
  filename: string
}

export interface SeoSettings {
  site_title: string
  meta_description: string
  keywords: string
  og_image_url: string
}

export interface ThemeSettings {
  outer_bg: string
  accent: string
  micro_accent: string
}

export interface SettingsMap {
  general: GeneralSettings
  hero: HeroSettings
  about: AboutSettings
  contact: ContactSettings
  resume: ResumeSettings
  seo: SeoSettings
  theme: ThemeSettings
}

export type SettingsKey = keyof SettingsMap

/** Fallbacks so the UI never renders undefined while settings load. */
export const SETTINGS_DEFAULTS: SettingsMap = {
  general: { site_name: 'Portfolio', logo_url: '', favicon_url: '', footer_text: '' },
  hero: {
    greeting: 'Hello, I am',
    name: '',
    title: '',
    intro: '',
    availability_text: '',
    availability_active: false,
    cta_projects: 'View projects',
    cta_contact: 'Contact me',
    cta_resume: 'Download resume',
    image_url: '',
    video_url: '',
    video_poster_url: '',
    video_enabled: false,
  },
  about: {
    short_bio: '',
    full_bio: '',
    location: '',
    role: '',
    experience_years: '',
    image_url: '',
    resume_url: '',
  },
  contact: { email: '', phone: '', whatsapp: '', location: '', form_note: '' },
  resume: { url: '', filename: '' },
  seo: { site_title: 'Portfolio', meta_description: '', keywords: '', og_image_url: '' },
  theme: { outer_bg: '#E9EDF2', accent: '#2563EB', micro_accent: '#FF6B4A' },
}
