import yaml from 'js-yaml';

export interface Skill {
  name: string;
  items: string[];
  progress?: number;
  level?: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string[];
  technologies: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
}

export interface PortfolioData {
  name: string;
  bio: string;
  tagline: string;
  skills: Skill[];
  experiences: Experience[];
  soft_skills: Skill[];
  projects: Project[];
  contact: Contact;
}

export const loadPortfolioData = async (): Promise<PortfolioData> => {
  try {
    const response = await fetch('/data.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load YAML file: ${response.statusText}`);
    }
    const yamlText = await response.text();
    const data = yaml.load(yamlText) as PortfolioData;
    
    // Validate the data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid YAML data structure');
    }

    if (!Array.isArray(data.skills)) {
      data.skills = []; // Provide default empty array if skills is undefined
    }

    if (!Array.isArray(data.experiences)) {
      data.experiences = []; // Provide default empty array if experiences is undefined
    }

    if (!Array.isArray(data.soft_skills)) {
      data.soft_skills = []; // Provide default empty array if soft_skills is undefined
    }

    if (!Array.isArray(data.projects)) {
      data.projects = []; // Provide default empty array if projects is undefined
    }

    return data;
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    // Return default data structure to prevent undefined errors
    return {
      name: 'YOGESH JOSHI',
      bio: 'Portfolio data loading failed',
      tagline: 'Please check your data.yaml file',
      skills: [],
      experiences: [],
      soft_skills: [],
      projects: [],
      contact: {
        email: '',
        github: '',
        linkedin: '',
        twitter: ''
      }
    };
  }
}; 