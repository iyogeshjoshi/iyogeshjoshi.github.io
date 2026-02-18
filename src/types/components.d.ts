declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module './components/About' {
  interface AboutProps {
    bio: string;
    tagline: string;
    name: string;
  }
  const About: React.FC<AboutProps>;
  export default About;
}

declare module './components/Skills' {
  interface Skill {
    name: string;
    items: string[];
  }
  interface SkillsProps {
    skills: Skill[];
  }
  const Skills: React.FC<SkillsProps>;
  export default Skills;
}

declare module './components/Contact' {
  interface Contact {
    email: string;
    github: string;
    linkedin: string;
    twitter: string;
  }
  interface ContactProps {
    contact: Contact;
  }
  const Contact: React.FC<ContactProps>;
  export default Contact;
}

declare module './components/Header' {
  interface HeaderProps {
    name: string;
  }
  const Header: React.FC<HeaderProps>;
  export default Header;
}

declare module './components/SoftSkills' {
  interface SoftSkill {
    name: string;
    items: string[];
  }
  interface SoftSkillsProps {
    softSkills: SoftSkill[];
  }
  const SoftSkills: React.FC<SoftSkillsProps>;
  export default SoftSkills;
}

declare module './components/Experiences' {
  interface Experience {
    company: string;
    position: string;
    duration: string;
    description: string[];
    technologies: string[];
  }
  interface ExperiencesProps {
    experiences: Experience[];
  }
  const Experiences: React.FC<ExperiencesProps>;
  export default Experiences;
}

declare module './components/DownloadButton' {
  interface DownloadButtonProps {
    onDownload: () => void;
  }
  const DownloadButton: React.FC<DownloadButtonProps>;
  export default DownloadButton;
} 