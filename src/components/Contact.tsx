import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ContactContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  color: #64ffda;
  margin-bottom: 2rem;
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: #8892b0;
  max-width: 600px;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const ContactLinks = styled(motion.div)`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ContactLink = styled(motion.a)`
  color: #64ffda;
  text-decoration: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
    transform: translateY(-3px);
  }
`;

interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
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
          ✉️ Email
        </ContactLink>
        <ContactLink
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🐙 GitHub
        </ContactLink>
        <ContactLink
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          👥 LinkedIn
        </ContactLink>
        <ContactLink
          href={contact.twitter}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🐦 Twitter
        </ContactLink>
      </ContactLinks>
    </ContactContainer>
  );
};

export default Contact; 