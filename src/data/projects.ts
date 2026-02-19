import { Project, ProjectCategory, Technology } from '../types/project';

// Technology definitions
export const technologies: Technology[] = [
  // Frontend
  { name: 'React', category: 'frontend', color: '#61DAFB' },
  { name: 'TypeScript', category: 'frontend', color: '#3178C6' },
  { name: 'Next.js', category: 'frontend', color: '#000000' },
  { name: 'Vue.js', category: 'frontend', color: '#4FC08D' },
  { name: 'Angular', category: 'frontend', color: '#DD0031' },
  { name: 'Svelte', category: 'frontend', color: '#FF3E00' },
  { name: 'HTML5', category: 'frontend', color: '#E34F26' },
  { name: 'CSS3', category: 'frontend', color: '#1572B6' },
  { name: 'Sass', category: 'frontend', color: '#CC6699' },
  { name: 'Tailwind CSS', category: 'frontend', color: '#06B6D4' },
  { name: 'Styled Components', category: 'frontend', color: '#DB7093' },

  // Backend
  { name: 'Node.js', category: 'backend', color: '#339933' },
  { name: 'Express.js', category: 'backend', color: '#000000' },
  { name: 'Python', category: 'backend', color: '#3776AB' },
  { name: 'Django', category: 'backend', color: '#092E20' },
  { name: 'FastAPI', category: 'backend', color: '#009688' },
  { name: 'Java', category: 'backend', color: '#ED8B00' },
  { name: 'Spring Boot', category: 'backend', color: '#6DB33F' },
  { name: 'PHP', category: 'backend', color: '#777BB4' },
  { name: 'Laravel', category: 'backend', color: '#FF2D20' },
  { name: 'Ruby on Rails', category: 'backend', color: '#CC0000' },

  // Database
  { name: 'PostgreSQL', category: 'database', color: '#336791' },
  { name: 'MySQL', category: 'database', color: '#4479A1' },
  { name: 'MongoDB', category: 'database', color: '#47A248' },
  { name: 'Redis', category: 'database', color: '#DC382D' },
  { name: 'SQLite', category: 'database', color: '#003B57' },

  // Cloud & Tools
  { name: 'AWS', category: 'cloud', color: '#FF9900' },
  { name: 'Google Cloud', category: 'cloud', color: '#4285F4' },
  { name: 'Azure', category: 'cloud', color: '#0078D4' },
  { name: 'Docker', category: 'tool', color: '#2496ED' },
  { name: 'Kubernetes', category: 'tool', color: '#326CE5' },
  { name: 'Git', category: 'tool', color: '#F05032' },
  { name: 'GitHub Actions', category: 'tool', color: '#2088FF' },
  { name: 'Jest', category: 'tool', color: '#C21325' },
  { name: 'Cypress', category: 'tool', color: '#17202C' },

  // Mobile
  { name: 'React Native', category: 'mobile', color: '#61DAFB' },
  { name: 'Flutter', category: 'mobile', color: '#02569B' },
  { name: 'Swift', category: 'mobile', color: '#FA7343' },
  { name: 'Kotlin', category: 'mobile', color: '#7F52FF' },
];

// Project categories
export const projectCategories: ProjectCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'User interface and client-side applications',
    color: '#61DAFB',
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Server-side applications and APIs',
    color: '#339933',
  },
  {
    id: 'fullstack',
    name: 'Full-Stack',
    description: 'Complete web applications with frontend and backend',
    color: '#FF6B6B',
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'Mobile applications for iOS and Android',
    color: '#4ECDC4',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Infrastructure, deployment, and automation',
    color: '#45B7D1',
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    description: 'Data processing, analytics, and visualization',
    color: '#96CEB4',
  },
];

// Project data - populated from GitHub
export const projects: Project[] = [];

// Utility functions for project management
export const getProjectsByCategory = (categoryId: string): Project[] => {
  return projects.filter((project) => project.category.id === categoryId);
};

export const getFeaturedProjects = (): Project[] => {
  return projects.filter((project) => project.featured);
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((project) => project.id === id);
};

export const searchProjects = (query: string): Project[] => {
  const lowercaseQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.title.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.technologies.some((tech) =>
        tech.name.toLowerCase().includes(lowercaseQuery)
      ) ||
      project.category.name.toLowerCase().includes(lowercaseQuery)
  );
};

export const getProjectsByTechnology = (technologyName: string): Project[] => {
  return projects.filter((project) =>
    project.technologies.some((tech) => tech.name === technologyName)
  );
};

export const sortProjects = (
  projects: Project[],
  field: 'title' | 'completionDate' | 'category',
  direction: 'asc' | 'desc' = 'asc'
): Project[] => {
  return [...projects].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (field) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'completionDate':
        aValue = a.completionDate;
        bValue = b.completionDate;
        break;
      case 'category':
        aValue = a.category.name;
        bValue = b.category.name;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};
