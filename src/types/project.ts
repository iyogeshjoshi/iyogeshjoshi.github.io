// Project-related type definitions

export interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tool' | 'cloud' | 'mobile';
  icon?: string;
  color?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
}

export interface ProjectImage {
  url: string;
  alt: string;
  type: 'screenshot' | 'mockup' | 'diagram';
  caption?: string;
}

export interface ProjectMetrics {
  performanceImprovement?: string;
  userEngagement?: string;
  codeReduction?: string;
  customMetrics?: Record<string, string>;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: Technology[];
  category: ProjectCategory;
  images: ProjectImage[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  completionDate: Date;
  challenges: string[];
  outcomes: string[];
  metrics?: ProjectMetrics;
}

export interface ProjectGalleryProps {
  projects: Project[];
  categories: ProjectCategory[];
  viewMode: 'grid' | 'list' | 'masonry';
  onProjectSelect: (project: Project) => void;
}

export interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// Filter and search types
export interface ProjectFilters {
  category?: string;
  technology?: string;
  featured?: boolean;
  searchQuery?: string;
}

export interface ProjectSortOptions {
  field: 'title' | 'completionDate' | 'category';
  direction: 'asc' | 'desc';
}