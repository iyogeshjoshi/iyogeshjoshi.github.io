import { Project, ProjectFilters, ProjectSortOptions, Technology, ProjectCategory } from '../types/project';

/**
 * Project Manager utility class for handling project operations
 */
export class ProjectManager {
  private projects: Project[];
  private categories: ProjectCategory[];

  constructor(projects: Project[], categories: ProjectCategory[]) {
    this.projects = projects;
    this.categories = categories;
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return [...this.projects];
  }

  /**
   * Get projects with applied filters
   */
  getFilteredProjects(filters: ProjectFilters): Project[] {
    let filteredProjects = [...this.projects];

    // Filter by category
    if (filters.category) {
      filteredProjects = filteredProjects.filter(
        project => project.category.id === filters.category
      );
    }

    // Filter by technology
    if (filters.technology) {
      filteredProjects = filteredProjects.filter(
        project => project.technologies.some(tech => tech.name === filters.technology)
      );
    }

    // Filter by featured status
    if (filters.featured !== undefined) {
      filteredProjects = filteredProjects.filter(
        project => project.featured === filters.featured
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.longDescription.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.name.toLowerCase().includes(query)) ||
        project.category.name.toLowerCase().includes(query) ||
        project.challenges.some(challenge => challenge.toLowerCase().includes(query)) ||
        project.outcomes.some(outcome => outcome.toLowerCase().includes(query))
      );
    }

    return filteredProjects;
  }

  /**
   * Sort projects by specified criteria
   */
  sortProjects(projects: Project[], sortOptions: ProjectSortOptions): Project[] {
    return [...projects].sort((a, b) => {
      let aValue: string | Date | number;
      let bValue: string | Date | number;

      switch (sortOptions.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'completionDate':
          aValue = a.completionDate.getTime();
          bValue = b.completionDate.getTime();
          break;
        case 'category':
          aValue = a.category.name.toLowerCase();
          bValue = b.category.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Get project by ID
   */
  getProjectById(id: string): Project | undefined {
    return this.projects.find(project => project.id === id);
  }

  /**
   * Get featured projects
   */
  getFeaturedProjects(): Project[] {
    return this.projects.filter(project => project.featured);
  }

  /**
   * Get projects by category
   */
  getProjectsByCategory(categoryId: string): Project[] {
    return this.projects.filter(project => project.category.id === categoryId);
  }

  /**
   * Get projects by technology
   */
  getProjectsByTechnology(technologyName: string): Project[] {
    return this.projects.filter(project =>
      project.technologies.some(tech => tech.name === technologyName)
    );
  }

  /**
   * Get all unique technologies used across projects
   */
  getAllTechnologies(): Technology[] {
    const techMap = new Map<string, Technology>();
    
    this.projects.forEach(project => {
      project.technologies.forEach(tech => {
        techMap.set(tech.name, tech);
      });
    });

    return Array.from(techMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all categories
   */
  getAllCategories(): ProjectCategory[] {
    return [...this.categories];
  }

  /**
   * Get project statistics
   */
  getProjectStats() {
    const totalProjects = this.projects.length;
    const featuredProjects = this.getFeaturedProjects().length;
    const categoryCounts = this.categories.map(category => ({
      category: category.name,
      count: this.getProjectsByCategory(category.id).length
    }));

    const technologyCounts = this.getAllTechnologies().map(tech => ({
      technology: tech.name,
      count: this.getProjectsByTechnology(tech.name).length,
      category: tech.category
    }));

    const recentProjects = this.sortProjects(
      this.projects,
      { field: 'completionDate', direction: 'desc' }
    ).slice(0, 3);

    return {
      totalProjects,
      featuredProjects,
      categoryCounts,
      technologyCounts,
      recentProjects
    };
  }

  /**
   * Get related projects based on technology overlap
   */
  getRelatedProjects(projectId: string, limit: number = 3): Project[] {
    const project = this.getProjectById(projectId);
    if (!project) return [];

    const projectTechNames = project.technologies.map(tech => tech.name);
    
    const relatedProjects = this.projects
      .filter(p => p.id !== projectId)
      .map(p => ({
        project: p,
        score: p.technologies.filter(tech => projectTechNames.includes(tech.name)).length
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.project);

    return relatedProjects;
  }

  /**
   * Search projects with advanced options
   */
  searchProjects(
    query: string,
    options: {
      includeDescription?: boolean;
      includeTechnologies?: boolean;
      includeCategories?: boolean;
      includeChallenges?: boolean;
      includeOutcomes?: boolean;
    } = {}
  ): Project[] {
    const {
      includeDescription = true,
      includeTechnologies = true,
      includeCategories = true,
      includeChallenges = false,
      includeOutcomes = false
    } = options;

    const lowercaseQuery = query.toLowerCase();

    return this.projects.filter(project => {
      // Always search in title
      if (project.title.toLowerCase().includes(lowercaseQuery)) return true;

      // Optional searches
      if (includeDescription && project.description.toLowerCase().includes(lowercaseQuery)) return true;
      if (includeDescription && project.longDescription.toLowerCase().includes(lowercaseQuery)) return true;
      
      if (includeTechnologies && project.technologies.some(tech => 
        tech.name.toLowerCase().includes(lowercaseQuery)
      )) return true;
      
      if (includeCategories && project.category.name.toLowerCase().includes(lowercaseQuery)) return true;
      
      if (includeChallenges && project.challenges.some(challenge => 
        challenge.toLowerCase().includes(lowercaseQuery)
      )) return true;
      
      if (includeOutcomes && project.outcomes.some(outcome => 
        outcome.toLowerCase().includes(lowercaseQuery)
      )) return true;

      return false;
    });
  }

  /**
   * Get project completion timeline
   */
  getProjectTimeline(): { month: string; count: number; projects: Project[] }[] {
    const timeline = new Map<string, Project[]>();

    this.projects.forEach(project => {
      const monthKey = project.completionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!timeline.has(monthKey)) {
        timeline.set(monthKey, []);
      }
      timeline.get(monthKey)!.push(project);
    });

    return Array.from(timeline.entries())
      .map(([month, projects]) => ({
        month,
        count: projects.length,
        projects: projects.sort((a, b) => b.completionDate.getTime() - a.completionDate.getTime())
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }

  /**
   * Validate project data
   */
  validateProject(project: Partial<Project>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!project.title || project.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!project.description || project.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!project.category) {
      errors.push('Category is required');
    }

    if (!project.technologies || project.technologies.length === 0) {
      errors.push('At least one technology is required');
    }

    if (!project.completionDate) {
      errors.push('Completion date is required');
    }

    if (project.liveUrl && !this.isValidUrl(project.liveUrl)) {
      errors.push('Live URL must be a valid URL');
    }

    if (project.githubUrl && !this.isValidUrl(project.githubUrl)) {
      errors.push('GitHub URL must be a valid URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to validate URLs
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}