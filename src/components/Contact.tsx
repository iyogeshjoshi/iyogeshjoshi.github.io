import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ContactContainer = styled(motion.section)`
  padding: 4rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled(motion.h2)`
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const Description = styled(motion.p)`
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const ContactLinks = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const ContactLink = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background-color: var(--card-bg);
  color: var(--accent-color);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: var(--accent-color);
    color: var(--bg-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-color);
  }
`;

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z"/>
  </svg>
);

interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  x: string;
}

interface ContactProps {
  contact: ContactInfo;
}

const Contact: React.FC<ContactProps> = ({ contact }) => {
  return (
    <ContactContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Get in Touch
      </Title>
      <Description
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        I'm currently open to new opportunities and collaborations. Whether you have a question or just want to say hi, I'll try my best to get back to you!
      </Description>
      <ContactLinks
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ContactLink
          href={`mailto:${contact.email}?subject=deviloper.dev: Hello!`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <EmailIcon /> Email
        </ContactLink>
        <ContactLink
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GithubIcon /> GitHub
        </ContactLink>
        <ContactLink
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LinkedInIcon /> LinkedIn
        </ContactLink>
        <ContactLink
          href={contact.x}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <XIcon /> X
        </ContactLink>
      </ContactLinks>
    </ContactContainer>
  );
};

export default Contact; 