// src/pages/SampleResumes.tsx
// ============================================
// WORLD-CLASS RESUME SAMPLES - COMPLETE SECTIONS
// ALL 13 SECTIONS FILLED WITH 3+ ENTRIES
// 10 FULLY COMPLETE RESUME SAMPLES
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MdDownload, MdStar, MdSearch, MdVisibility, 
  MdWork, MdSchool, MdVerified, MdPeople, 
  MdBusinessCenter, MdLightbulb, MdCheckCircle, 
  MdRocket, MdStars, MdEmojiEvents, MdDescription,
  MdPictureAsPdf, MdFileDownload
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';

// ============================================
// COMPLETE RESUME DATA - ALL 10 SAMPLES
// ALL 13 SECTIONS COMPLETELY FILLED
// ============================================

const sampleResumes = [
  // ============================================
  // 1. SENIOR SOFTWARE ENGINEER
  // ============================================
  {
    id: 'sr-1',
    title: 'Senior Software Engineer Resume',
    industry: 'Technology',
    role: 'Senior Software Engineer',
    experience: '10+ years',
    score: 97,
    featured: true,
    downloads: 32000,
    color: 'from-blue-600 to-cyan-600',
    sections: {
      contact: {
        fullName: 'Alex Thompson',
        email: 'alex.thompson@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA, USA',
        linkedIn: 'linkedin.com/in/alex-thompson',
        github: 'github.com/alexthompson',
        portfolio: 'alexthompson.dev',
      },
      summary: {
        content: 'Senior Software Engineer with 10+ years of experience designing and building scalable distributed systems. Expert in microservices architecture, cloud infrastructure, and team leadership. Passionate about mentoring engineers and delivering high-impact solutions that serve millions of users. Consistently delivered 40% cost reductions and 65% latency improvements across major platforms.',
      },
      experience: [
        {
          position: 'Senior Software Engineer',
          company: 'Google',
          startDate: 'Jan 2022',
          endDate: 'Present',
          current: true,
          location: 'Mountain View, CA',
          responsibilities: [
            'Led 15-engineer team building microservices platform serving 500M+ daily requests with 99.99% availability',
            'Architected event-driven system processing 1M+ events/sec with sub-50ms latency',
            'Designed and implemented distributed caching layer saving $18M/year in infrastructure costs',
            'Reduced CI/CD pipeline time from 45 minutes to 8 minutes, increasing developer productivity by 35%',
          ],
          achievements: [
            'Achieved 99.99% uptime with zero-downtime deployments across 50+ microservices',
            'Improved system latency by 65% through distributed caching and optimization',
            'Saved $18M/year in infrastructure costs through resource optimization and auto-scaling',
            'Mentored 12 junior engineers, with 6 promoted to senior roles within 18 months',
          ],
        },
        {
          position: 'Software Engineer',
          company: 'Microsoft',
          startDate: 'Jun 2018',
          endDate: 'Dec 2021',
          current: false,
          location: 'Redmond, WA',
          responsibilities: [
            'Built cloud-native applications on Azure serving 100M+ users globally',
            'Led migration of legacy systems to microservices architecture',
            'Implemented real-time monitoring and alerting systems for 50+ services',
            'Designed and developed RESTful APIs with OpenAPI specification',
          ],
          achievements: [
            'Reduced deployment time by 70% through CI/CD automation and infrastructure as code',
            'Mentored 12 engineers, with 6 promoted to senior roles within 18 months',
            'Received Microsoft Gold Star Award for exceptional team leadership',
            'Achieved 99.95% uptime for all services during the 2020 pandemic surge',
          ],
        },
        {
          position: 'Junior Software Engineer',
          company: 'Amazon',
          startDate: 'Aug 2014',
          endDate: 'May 2018',
          current: false,
          location: 'Seattle, WA',
          responsibilities: [
            'Developed and maintained e-commerce platform features serving 10M+ customers',
            'Implemented RESTful APIs for payment processing and order management',
            'Collaborated with cross-functional teams on 15+ product launches',
            'Participated in on-call rotation for critical production systems',
          ],
          achievements: [
            'Optimized database queries reducing response time by 50% for 200+ API endpoints',
            'Received Amazon Inventor Award for innovative payment system optimization',
            'Reduced payment processing errors by 35% through improved error handling',
            'Successfully launched 5 major features that increased customer satisfaction by 25%',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Science',
          field: 'Computer Science',
          institution: 'Stanford University',
          startDate: 'Sep 2012',
          endDate: 'Jun 2014',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'MIT',
          startDate: 'Sep 2008',
          endDate: 'Jun 2012',
          gpa: '3.85/4.0',
        },
        {
          degree: 'High School Diploma',
          field: 'STEM Focus',
          institution: 'Phillips Academy Andover',
          startDate: 'Sep 2004',
          endDate: 'Jun 2008',
          gpa: '4.0/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Java', level: 'Expert' },
          { name: 'Python', level: 'Advanced' },
          { name: 'Go', level: 'Advanced' },
          { name: 'AWS', level: 'Expert' },
          { name: 'Kubernetes', level: 'Advanced' },
          { name: 'Docker', level: 'Expert' },
          { name: 'Kafka', level: 'Advanced' },
          { name: 'Redis', level: 'Advanced' },
          { name: 'PostgreSQL', level: 'Advanced' },
          { name: 'Elasticsearch', level: 'Intermediate' },
        ],
        soft: [
          { name: 'Leadership', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Mentoring', level: 'Advanced' },
          { name: 'Problem Solving', level: 'Expert' },
          { name: 'Team Collaboration', level: 'Expert' },
        ],
        tools: [
          { name: 'Git', level: 'Expert' },
          { name: 'Jira', level: 'Advanced' },
          { name: 'Confluence', level: 'Advanced' },
          { name: 'Slack', level: 'Advanced' },
          { name: 'VS Code', level: 'Expert' },
          { name: 'IntelliJ', level: 'Expert' },
        ],
      },
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023' },
        { name: 'Kubernetes Administrator (CKA)', issuer: 'CNCF', date: '2022' },
        { name: 'Google Cloud Engineer', issuer: 'Google', date: '2021' },
        { name: 'Certified Scrum Master', issuer: 'Scrum Alliance', date: '2020' },
      ],
      projects: [
        {
          name: 'Distributed Caching Layer',
          description: 'Built distributed caching system reducing database load by 60% and improving response times by 65%',
          technologies: ['Redis', 'Kafka', 'AWS', 'Java'],
          achievements: ['Saved $18M/year', '65% latency improvement', 'Zero-downtime deployment'],
        },
        {
          name: 'Microservices Platform',
          description: 'Architected platform serving 500M+ daily requests with 99.99% availability across 50+ services',
          technologies: ['Go', 'Kubernetes', 'gRPC', 'AWS'],
          achievements: ['99.99% uptime', 'Zero-downtime deployments', '40% cost reduction'],
        },
        {
          name: 'Real-time Analytics Pipeline',
          description: 'Built real-time data processing pipeline for analytics and monitoring across 200+ services',
          technologies: ['Apache Kafka', 'Flink', 'Elasticsearch', 'Kibana'],
          achievements: ['Processed 1M+ events/sec', '70% latency reduction', 'Real-time alerting'],
        },
        {
          name: 'Payment Processing System',
          description: 'Designed and implemented scalable payment processing system handling 10M+ transactions daily',
          technologies: ['Java', 'AWS', 'PostgreSQL', 'Redis'],
          achievements: ['35% error reduction', 'Amazon Inventor Award', '99.99% uptime'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' },
        { name: 'French', proficiency: 'Intermediate' },
        { name: 'German', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Jane Smith',
          position: 'VP of Engineering',
          organization: 'Google',
          email: 'jane.smith@google.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'Worked together for 3 years. Highly recommend.',
        },
        {
          name: 'John Davis',
          position: 'Senior Director',
          organization: 'Microsoft',
          email: 'john.davis@microsoft.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'Managed team together for 2 years. Excellent technical leader.',
        },
        {
          name: 'Dr. Sarah Chen',
          position: 'Professor of Computer Science',
          organization: 'Stanford University',
          email: 'sarah.chen@stanford.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'PhD advisor. Outstanding researcher and problem solver.',
        },
      ],
      volunteer: [
        {
          organization: 'Code.org',
          role: 'Technical Mentor',
          startDate: 'Jan 2021',
          endDate: 'Present',
          description: 'Teaching coding to underserved youth in the San Francisco area. Developed curriculum for 100+ students.',
        },
        {
          organization: 'Open Source Community',
          role: 'Maintainer',
          startDate: 'Jun 2020',
          endDate: 'Present',
          description: 'Maintaining 3 popular open-source projects with 10K+ GitHub stars combined.',
        },
        {
          organization: 'STEM for Girls',
          role: 'Workshop Facilitator',
          startDate: 'Sep 2019',
          endDate: 'Dec 2021',
          description: 'Facilitated 20+ workshops on computer science for 500+ girls across 10 schools.',
        },
      ],
      publications: [
        {
          title: 'Distributed Systems Design Patterns for Modern Applications',
          publisher: 'IEEE Software',
          date: '2023',
          description: 'Published paper on modern distributed systems patterns and best practices for microservices architecture.',
        },
        {
          title: 'Optimizing Microservices Performance in Cloud Environments',
          publisher: 'ACM Queue',
          date: '2022',
          description: 'Research on microservices optimization techniques with practical case studies from major cloud providers.',
        },
        {
          title: 'Scalable Event-Driven Architecture at Google Scale',
          publisher: 'ACM SIGMOD',
          date: '2021',
          description: 'Case study on building event-driven systems handling 1M+ events per second.',
        },
      ],
      awards: [
        { title: 'Google Engineering Excellence Award', issuer: 'Google', year: '2023', description: 'For outstanding technical contributions and team leadership' },
        { title: 'Microsoft Gold Star Award', issuer: 'Microsoft', year: '2020', description: 'For exceptional team leadership and delivery of critical features' },
        { title: 'Amazon Inventor Award', issuer: 'Amazon', year: '2017', description: 'For innovative payment system optimization that saved $5M annually' },
        { title: 'Stanford Graduate Fellowship', issuer: 'Stanford University', year: '2012', description: 'Full tuition fellowship for academic excellence in computer science' },
      ],
    },
  },
  // ============================================
  // 2. DATA SCIENTIST & AI RESEARCHER
  // ============================================
  {
    id: 'sr-2',
    title: 'Data Scientist & AI Researcher Resume',
    industry: 'Technology',
    role: 'Lead Data Scientist',
    experience: '8+ years',
    score: 98,
    featured: true,
    downloads: 28000,
    color: 'from-purple-600 to-pink-500',
    sections: {
      contact: {
        fullName: 'Dr. Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1 (555) 555-1234',
        location: 'New York, NY, USA',
        linkedIn: 'linkedin.com/in/sarah-chen-phd',
        github: 'github.com/sarahchen',
        portfolio: 'sarahchen.ai',
      },
      summary: {
        content: 'Lead Data Scientist with 8+ years of experience in machine learning, deep learning, and AI research. PhD in Machine Learning from Carnegie Mellon with 25+ publications and 5,800+ citations. Expert in building production ML systems serving 50M+ users. Passionate about applying AI to solve real-world problems in healthcare, finance, and technology.',
      },
      experience: [
        {
          position: 'Lead Data Scientist',
          company: 'Google DeepMind',
          startDate: 'Jan 2021',
          endDate: 'Present',
          current: true,
          location: 'London, UK',
          responsibilities: [
            'Led 25-person research team developing protein folding models achieving 2.3x SOTA accuracy',
            'Built ML-powered drug discovery platform accelerating research by 70%',
            'Developed transformer-based models for 100+ languages, improving translation quality by 45%',
            'Established research collaborations with 15+ academic institutions globally',
          ],
          achievements: [
            'Achieved 2.3x SOTA accuracy improvement on protein structure prediction',
            'Secured $18M in research grants from Wellcome Trust and Gates Foundation',
            'Published 12 papers at top conferences (NeurIPS, ICML, ICLR) with 1,200+ citations',
            'Deployed production ML systems serving 50M+ users with 99.9% uptime',
          ],
        },
        {
          position: 'Senior Data Scientist',
          company: 'OpenAI',
          startDate: 'Jun 2018',
          endDate: 'Dec 2020',
          current: false,
          location: 'San Francisco, CA',
          responsibilities: [
            'Developed state-of-the-art NLP models for language understanding and generation',
            'Built large language model training pipelines on 256 TPU cores',
            'Led team of 8 researchers in developing GPT-3 inspired models',
            'Implemented novel attention mechanisms for improved model efficiency',
          ],
          achievements: [
            'Improved translation quality by 45% across 100+ languages',
            'Deployed models serving 50M+ users with sub-100ms latency',
            'Reduced model training time by 60% through distributed computing',
            'Published 3 papers at top conferences with 500+ citations',
          ],
        },
        {
          position: 'Data Scientist',
          company: 'IBM Watson',
          startDate: 'Aug 2014',
          endDate: 'May 2018',
          current: false,
          location: 'Boston, MA',
          responsibilities: [
            'Developed healthcare AI applications for clinical decision support',
            'Built predictive models for disease diagnosis and treatment planning',
            'Collaborated with 10+ healthcare institutions on research projects',
            'Implemented data pipelines for processing 1M+ patient records',
          ],
          achievements: [
            'Reduced diagnostic errors by 35% through AI-powered decision support',
            'Received 3 IBM Innovation Awards for healthcare AI applications',
            'Improved model accuracy by 25% through novel feature engineering',
            'Processed 1M+ patient records with 99.9% data quality',
          ],
        },
      ],
      education: [
        {
          degree: 'Doctor of Philosophy',
          field: 'Machine Learning',
          institution: 'Carnegie Mellon University',
          startDate: 'Sep 2012',
          endDate: 'Jun 2018',
          gpa: '4.0/4.0',
        },
        {
          degree: 'Master of Science',
          field: 'Data Science',
          institution: 'University of California, Berkeley',
          startDate: 'Sep 2010',
          endDate: 'Jun 2012',
          gpa: '3.95/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Mathematics',
          institution: 'MIT',
          startDate: 'Sep 2006',
          endDate: 'Jun 2010',
          gpa: '3.88/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Python', level: 'Expert' },
          { name: 'TensorFlow', level: 'Expert' },
          { name: 'PyTorch', level: 'Expert' },
          { name: 'JAX', level: 'Advanced' },
          { name: 'SQL', level: 'Advanced' },
          { name: 'R', level: 'Advanced' },
          { name: 'Scala', level: 'Intermediate' },
          { name: 'Spark', level: 'Advanced' },
          { name: 'AWS', level: 'Advanced' },
          { name: 'Kubeflow', level: 'Advanced' },
        ],
        soft: [
          { name: 'Research Leadership', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Team Building', level: 'Advanced' },
          { name: 'Critical Thinking', level: 'Expert' },
          { name: 'Problem Solving', level: 'Expert' },
        ],
        tools: [
          { name: 'MLflow', level: 'Expert' },
          { name: 'Kubeflow', level: 'Advanced' },
          { name: 'Docker', level: 'Advanced' },
          { name: 'Jupyter', level: 'Expert' },
          { name: 'Git', level: 'Expert' },
          { name: 'VS Code', level: 'Advanced' },
        ],
      },
      certifications: [
        { name: 'TensorFlow Expert', issuer: 'Google', date: '2023' },
        { name: 'AWS Machine Learning Specialty', issuer: 'Amazon', date: '2022' },
        { name: 'Google ML Engineer', issuer: 'Google', date: '2021' },
        { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2020' },
        { name: 'Data Science Professional', issuer: 'IBM', date: '2019' },
      ],
      projects: [
        {
          name: 'AlphaFold Protein Prediction',
          description: 'Graph Neural Network for protein folding prediction achieving 2.3x SOTA accuracy',
          technologies: ['Python', 'JAX', 'GNN', 'TPU'],
          achievements: ['2.3x accuracy improvement', '1,200+ citations', 'Nature publication'],
        },
        {
          name: 'Drug Discovery Platform',
          description: 'ML-powered drug discovery platform for infectious diseases, identifying 12 promising drug candidates',
          technologies: ['PyTorch', 'GNN', 'RDKit', 'AWS'],
          achievements: ['$2.8M funding', '3 patents filed', '12 drug candidates identified'],
        },
        {
          name: 'Multilingual Translation System',
          description: 'Transformer models for 100+ languages with state-of-the-art performance',
          technologies: ['TensorFlow', 'Transformers', 'TPU', 'AWS'],
          achievements: ['45% quality improvement', '50M+ users', 'Deployed in production'],
        },
        {
          name: 'Healthcare Clinical Decision Support',
          description: 'AI-powered clinical decision support system for 10+ healthcare institutions',
          technologies: ['Python', 'TensorFlow', 'AWS', 'FHIR'],
          achievements: ['35% diagnostic error reduction', '3 IBM Innovation Awards', '1M+ patients served'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Mandarin', proficiency: 'Native' },
        { name: 'French', proficiency: 'Fluent' },
        { name: 'German', proficiency: 'Intermediate' },
        { name: 'Japanese', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Geoffrey Hinton',
          position: 'Professor of Computer Science',
          organization: 'University of Toronto',
          email: 'hinton@cs.toronto.edu',
          phone: '+1 (555) 999-8888',
          relationship: 'Academic Advisor',
          notes: 'PhD advisor. Pioneer of deep learning research.',
        },
        {
          name: 'Dr. Yann LeCun',
          position: 'Chief AI Scientist',
          organization: 'Meta',
          email: 'ylecun@meta.com',
          phone: '+1 (555) 777-6666',
          relationship: 'Research Collaborator',
          notes: 'Collaborated on ML research for 3 years.',
        },
        {
          name: 'Dr. Andrew Ng',
          position: 'Founder',
          organization: 'DeepLearning.AI',
          email: 'andrew.ng@deeplearning.ai',
          phone: '+1 (555) 555-5555',
          relationship: 'Mentor',
          notes: 'Mentored during AI research career.',
        },
      ],
      volunteer: [
        {
          organization: 'AI for Good Foundation',
          role: 'Technical Advisor',
          startDate: 'Jan 2020',
          endDate: 'Present',
          description: 'Advising on AI applications for social impact in developing countries.',
        },
        {
          organization: 'Women in Data Science',
          role: 'Mentor',
          startDate: 'Jun 2019',
          endDate: 'Present',
          description: 'Mentoring women in data science careers across 15+ countries.',
        },
        {
          organization: 'AI for Healthcare',
          role: 'Volunteer Researcher',
          startDate: 'Sep 2018',
          endDate: 'Dec 2020',
          description: 'Developing AI solutions for healthcare in low-resource settings.',
        },
      ],
      publications: [
        {
          title: 'Graph Neural Networks for Protein Folding Prediction',
          publisher: 'Nature Machine Intelligence',
          date: '2023',
          description: 'Groundbreaking research on GNN applications in computational biology.',
        },
        {
          title: 'Scalable Transformer Models for Multilingual Translation',
          publisher: 'NeurIPS',
          date: '2022',
          description: 'Novel architecture for efficient multilingual translation at scale.',
        },
        {
          title: 'Healthcare AI: Clinical Decision Support Systems',
          publisher: 'JAMA',
          date: '2021',
          description: 'Comprehensive study on AI applications in clinical decision making.',
        },
        {
          title: 'Deep Learning for Drug Discovery',
          publisher: 'Cell',
          date: '2020',
          description: 'AI-powered drug discovery platform for infectious diseases.',
        },
      ],
      awards: [
        { title: 'Best Paper Award - NeurIPS 2021', issuer: 'NeurIPS', year: '2021', description: 'For groundbreaking ML research on protein folding' },
        { title: 'Google Research Scholar Award', issuer: 'Google', year: '2020', description: 'For research excellence in AI and machine learning' },
        { title: 'Wellcome Trust Research Fellowship', issuer: 'Wellcome Trust', year: '2019', description: 'For AI applications in drug discovery' },
        { title: 'Bill & Melinda Gates Foundation Grant', issuer: 'Gates Foundation', year: '2018', description: 'For AI in global health and development' },
      ],
    },
  },
  // ============================================
  // 3. CHIEF TECHNOLOGY OFFICER (CTO)
  // ============================================
  {
    id: 'sr-3',
    title: 'Chief Technology Officer (CTO) Resume',
    industry: 'Executive',
    role: 'Chief Technology Officer',
    experience: '18+ years',
    score: 99,
    featured: true,
    downloads: 22400,
    color: 'from-blue-600 to-indigo-700',
    sections: {
      contact: {
        fullName: 'James Chen',
        email: 'james.chen@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA, USA',
        linkedIn: 'linkedin.com/in/james-chen-cto',
        github: 'github.com/jameschen',
        portfolio: 'jameschen.tech',
      },
      summary: {
        content: 'Chief Technology Officer with 18+ years of experience leading technology strategy for global organizations. Expert in cloud architecture, AI/ML, and digital transformation. Built and scaled engineering organizations from 20 to 500+ engineers. Passionate about innovation and building world-class technology teams that deliver measurable business impact.',
      },
      experience: [
        {
          position: 'Chief Technology Officer',
          company: 'Global Tech Unicorn',
          startDate: 'Jan 2019',
          endDate: 'Present',
          current: true,
          location: 'San Francisco, CA',
          responsibilities: [
            'Led 500+ engineer organization across 8 global hubs',
            'Architected multi-cloud platform serving 200M+ users with 99.999% uptime',
            'Built proprietary AI platform generating $450M annual revenue',
            'Established zero-trust security architecture achieving SOC 2 Type II and ISO 27001 compliance',
            'Drove technology strategy aligned with $2B annual revenue targets',
          ],
          achievements: [
            'Achieved 99.999% uptime with 30% infrastructure cost reduction',
            'Delivered 150+ products over 4 years with 95% customer satisfaction',
            'Filed 100+ patents with 15 industry awards for innovation',
            'Grew engineering team from 200 to 500 while maintaining 90% retention',
            'Secured $50M investment for technology innovation initiatives',
          ],
        },
        {
          position: 'Senior Vice President of Engineering',
          company: 'Fortune 500 Technology',
          startDate: 'Jan 2014',
          endDate: 'Dec 2018',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Led 200+ engineering team across 5 countries',
            'Drove cloud migration strategy to AWS and GCP',
            'Established global innovation labs in 3 countries',
            'Managed $100M annual engineering budget',
          ],
          achievements: [
            'Reduced operational costs by $50M annually through cloud optimization',
            'Achieved SOC 2 Type II and ISO 27001 compliance for all systems',
            'Opened 3 international R&D centers in Europe, Asia, and Africa',
            'Launched 50+ products generating $500M in new revenue',
          ],
        },
        {
          position: 'Director of Engineering',
          company: 'Amazon Web Services',
          startDate: 'Jun 2009',
          endDate: 'Dec 2013',
          current: false,
          location: 'Seattle, WA',
          responsibilities: [
            'Led AWS cloud infrastructure development for 15+ services',
            'Built and launched 5 major AWS services from concept to GA',
            'Managed 150+ engineers across 4 locations',
            'Drove cloud architecture strategy and innovation',
          ],
          achievements: [
            'Grew service revenue from $0 to $2B ARR within 3 years',
            'Scaled team from 15 to 150 engineers with 92% retention',
            'Launched EC2, S3, and Lambda services that became industry standards',
            'Received AWS Inventor Award for cloud computing innovations',
          ],
        },
      ],
      education: [
        {
          degree: 'Doctor of Philosophy',
          field: 'Computer Science',
          institution: 'Carnegie Mellon University',
          startDate: 'Sep 2004',
          endDate: 'Jun 2009',
          gpa: '4.0/4.0',
        },
        {
          degree: 'Master of Science',
          field: 'Software Engineering',
          institution: 'California Institute of Technology',
          startDate: 'Sep 2002',
          endDate: 'Jun 2004',
          gpa: '3.95/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'University of California, Berkeley',
          startDate: 'Sep 1998',
          endDate: 'Jun 2002',
          gpa: '3.9/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Cloud Architecture', level: 'Expert' },
          { name: 'AI/ML', level: 'Expert' },
          { name: 'Cybersecurity', level: 'Advanced' },
          { name: 'Distributed Systems', level: 'Expert' },
          { name: 'DevSecOps', level: 'Advanced' },
          { name: 'System Design', level: 'Expert' },
          { name: 'Data Engineering', level: 'Advanced' },
          { name: 'Blockchain', level: 'Intermediate' },
          { name: 'IoT', level: 'Intermediate' },
          { name: 'Quantum Computing', level: 'Basic' },
        ],
        soft: [
          { name: 'Executive Leadership', level: 'Expert' },
          { name: 'Board Management', level: 'Expert' },
          { name: 'Strategic Planning', level: 'Expert' },
          { name: 'Stakeholder Management', level: 'Expert' },
          { name: 'Change Management', level: 'Advanced' },
        ],
        tools: [
          { name: 'AWS', level: 'Expert' },
          { name: 'Kubernetes', level: 'Expert' },
          { name: 'Terraform', level: 'Advanced' },
          { name: 'Docker', level: 'Expert' },
          { name: 'Jenkins', level: 'Advanced' },
          { name: 'Git', level: 'Expert' },
        ],
      },
      certifications: [
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2023' },
        { name: 'Google Cloud Architect', issuer: 'Google', date: '2022' },
        { name: 'CISSP', issuer: 'ISC²', date: '2021' },
        { name: 'CISM', issuer: 'ISACA', date: '2020' },
        { name: 'Certified Board Director', issuer: 'NACD', date: '2019' },
      ],
      projects: [
        {
          name: 'Multi-Cloud Platform',
          description: 'Global cloud platform serving 200M+ users with 99.999% uptime across AWS, GCP, and Azure',
          technologies: ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Terraform'],
          achievements: ['99.999% uptime', '30% cost reduction', '200M+ users'],
        },
        {
          name: 'AI Platform',
          description: 'Enterprise AI platform generating $450M annual revenue with 500+ AI models in production',
          technologies: ['ML', 'Python', 'TensorFlow', 'Kubeflow', 'AWS'],
          achievements: ['450M ARR', '500+ models', '50M+ users'],
        },
        {
          name: 'Zero-Trust Security Architecture',
          description: 'Enterprise zero-trust security framework adopted across all systems and services',
          technologies: ['Security', 'IAM', 'Zero-Trust', 'AWS', 'GCP'],
          achievements: ['SOC 2 Type II', 'ISO 27001', 'FedRAMP compliance'],
        },
        {
          name: 'Digital Transformation Initiative',
          description: 'Led enterprise-wide digital transformation achieving $50M annual cost savings',
          technologies: ['Cloud', 'AI', 'RPA', 'Automation'],
          achievements: ['$50M savings', '45% efficiency improvement', '500+ systems migrated'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Mandarin', proficiency: 'Native' },
        { name: 'Japanese', proficiency: 'Fluent' },
        { name: 'Spanish', proficiency: 'Intermediate' },
        { name: 'French', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Michael Brown',
          position: 'CEO',
          organization: 'Global Tech Unicorn',
          email: 'michael.brown@tech.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CEO for 5 years. Outstanding strategic leader.',
        },
        {
          name: 'Sarah Williams',
          position: 'Board Director',
          organization: 'Fortune 500 Technology',
          email: 'sarah.williams@board.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Board Member',
          notes: 'Board Director for 4 years. Exceptional technology vision.',
        },
        {
          name: 'Dr. David Kim',
          position: 'Professor of Computer Science',
          organization: 'Stanford University',
          email: 'david.kim@stanford.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'PhD advisor. One of the most brilliant minds in technology.',
        },
      ],
      volunteer: [
        {
          organization: 'Technology for Good',
          role: 'Board Member',
          startDate: 'Jan 2020',
          endDate: 'Present',
          description: 'Advising on technology strategy for non-profits and social enterprises in Africa.',
        },
        {
          organization: 'STEM for Youth',
          role: 'Mentor',
          startDate: 'Jun 2018',
          endDate: 'Present',
          description: 'Mentoring youth in computer science, reaching 1,000+ students annually.',
        },
        {
          organization: 'Global Entrepreneurship Network',
          role: 'Technology Advisor',
          startDate: 'Sep 2017',
          endDate: 'Dec 2020',
          description: 'Advising tech startups in emerging markets across 15 countries.',
        },
      ],
      publications: [
        {
          title: 'Cloud-Native Architecture Patterns for Enterprises',
          publisher: 'O\'Reilly Media',
          date: '2023',
          description: 'Comprehensive guide to cloud architecture patterns and best practices.',
        },
        {
          title: 'Scaling Engineering Organizations: From 20 to 500 Engineers',
          publisher: 'Harvard Business Review',
          date: '2022',
          description: 'Research on building and scaling engineering organizations effectively.',
        },
        {
          title: 'Digital Transformation Strategy: A Framework for Success',
          publisher: 'MIT Sloan Management Review',
          date: '2021',
          description: 'Strategy for successful digital transformation initiatives.',
        },
        {
          title: 'AI-Driven Innovation: A CTO\'s Guide',
          publisher: 'IEEE Computer',
          date: '2020',
          description: 'Guide for technology leaders on implementing AI-driven innovation.',
        },
      ],
      awards: [
        { title: 'CTO of the Year 2023', issuer: 'Tech Excellence Awards', year: '2023', description: 'For outstanding technology leadership and innovation' },
        { title: 'Innovation Leadership Award', issuer: 'Fortune 500', year: '2022', description: 'For AI platform innovation and business impact' },
        { title: 'Executive Leadership Award', issuer: 'Global Tech Awards', year: '2021', description: 'For executive excellence in technology leadership' },
        { title: 'Engineering Excellence Award', issuer: 'IEEE', year: '2020', description: 'For contributions to software engineering and architecture' },
      ],
    },
  },
  // ============================================
  // 4. CHIEF FINANCIAL OFFICER (CFO)
  // ============================================
  {
    id: 'sr-4',
    title: 'Chief Financial Officer (CFO) Resume',
    industry: 'Finance',
    role: 'Chief Financial Officer',
    experience: '22+ years',
    score: 99,
    featured: true,
    downloads: 15600,
    color: 'from-emerald-600 to-teal-600',
    sections: {
      contact: {
        fullName: 'Michael Rothstein',
        email: 'michael.rothstein@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY, USA',
        linkedIn: 'linkedin.com/in/michael-rothstein-cfo',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Chief Financial Officer with 22+ years of experience in financial strategy, M&A, and investor relations. Expert in capital markets, risk management, and financial transformation. Led successful IPOs and executed $8.5B in M&A transactions. Passionate about driving sustainable growth and maximizing shareholder value through data-driven financial strategy.',
      },
      experience: [
        {
          position: 'Chief Financial Officer',
          company: 'Fortune 100 Financial Services',
          startDate: 'Jan 2018',
          endDate: 'Present',
          current: true,
          location: 'New York, NY',
          responsibilities: [
            'Managed $28B annual budget across 45 countries with 18% ROI',
            'Led financial strategy aligned with $15B revenue targets',
            'Implemented AI-powered financial analytics platform improving forecast accuracy by 35%',
            'Drove M&A strategy with 18 acquisitions totaling $8.5B',
          ],
          achievements: [
            'Optimized capital allocation achieving 18% ROI on $28B budget',
            'Executed 18 strategic acquisitions integrating 7,000+ employees',
            'Achieved 2x synergies on acquisitions through effective integration',
            'Improved forecast accuracy by 35% through AI-powered analytics',
          ],
        },
        {
          position: 'Senior Vice President of Finance',
          company: 'Goldman Sachs',
          startDate: 'Jun 2010',
          endDate: 'Dec 2017',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Led investment banking division with $50B+ in deal volume',
            'Managed 200+ finance professionals across 10 offices',
            'Drove capital raising strategies for 100+ clients',
            'Oversaw risk management and regulatory compliance',
          ],
          achievements: [
            'Led $4.5B IPO and 3 follow-on offerings for major clients',
            'Built world-class investor relations program with 95% institutional ownership',
            'Reduced risk exposure by 40% through advanced analytics',
            'Ranked #1 investment banking division for 3 consecutive years',
          ],
        },
        {
          position: 'Director of Corporate Finance',
          company: 'JPMorgan Chase',
          startDate: 'Aug 2002',
          endDate: 'May 2010',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Led corporate finance advisory for Fortune 500 clients',
            'Managed M&A due diligence teams on 50+ transactions',
            'Drove financial modeling and valuation analysis',
            'Built relationships with 100+ institutional investors',
          ],
          achievements: [
            'Advised on 75+ M&A transactions totaling $120B+',
            'Executed 25+ leveraged buyouts for private equity clients',
            'Developed financial modeling frameworks used across firm',
            'Promoted 3 times in 8 years for exceptional performance',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Business Administration',
          field: 'Finance',
          institution: 'Wharton School, University of Pennsylvania',
          startDate: 'Sep 2000',
          endDate: 'Jun 2002',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Accounting',
          institution: 'London School of Economics',
          startDate: 'Sep 1996',
          endDate: 'Jun 2000',
          gpa: '3.85/4.0',
        },
        {
          degree: 'High School Diploma',
          field: 'Business Focus',
          institution: 'Phillips Exeter Academy',
          startDate: 'Sep 1992',
          endDate: 'Jun 1996',
          gpa: '4.0/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Financial Modeling', level: 'Expert' },
          { name: 'Corporate Finance', level: 'Expert' },
          { name: 'M&A', level: 'Expert' },
          { name: 'Capital Markets', level: 'Expert' },
          { name: 'Risk Management', level: 'Expert' },
          { name: 'Audit & Compliance', level: 'Expert' },
          { name: 'Treasury Management', level: 'Advanced' },
          { name: 'FP&A', level: 'Expert' },
          { name: 'Tax Optimization', level: 'Advanced' },
          { name: 'ESG Finance', level: 'Advanced' },
        ],
        soft: [
          { name: 'Strategic Planning', level: 'Expert' },
          { name: 'Investor Relations', level: 'Expert' },
          { name: 'Team Leadership', level: 'Expert' },
          { name: 'Stakeholder Management', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
        ],
        tools: [
          { name: 'Excel', level: 'Expert' },
          { name: 'Bloomberg Terminal', level: 'Expert' },
          { name: 'SAP', level: 'Advanced' },
          { name: 'Oracle', level: 'Advanced' },
          { name: 'Power BI', level: 'Advanced' },
          { name: 'Tableau', level: 'Intermediate' },
        ],
      },
      certifications: [
        { name: 'Certified Public Accountant (CPA)', issuer: 'AICPA', date: '2003' },
        { name: 'Chartered Financial Analyst (CFA)', issuer: 'CFA Institute', date: '2005' },
        { name: 'Certified Treasury Professional', issuer: 'AFP', date: '2008' },
        { name: 'Financial Risk Manager', issuer: 'GARP', date: '2010' },
        { name: 'Certified Board Director', issuer: 'NACD', date: '2019' },
      ],
      projects: [
        {
          name: 'Financial Transformation Initiative',
          description: 'Modernized finance function with AI-powered automation, reducing month-end close from 15 to 3 days',
          technologies: ['AI', 'Automation', 'Cloud', 'Analytics'],
          achievements: ['Month-end close reduced from 15 to 3 days', '45% operational efficiency improvement', 'Reduced errors by 60%'],
        },
        {
          name: 'Tax Optimization Strategy',
          description: 'Architected tax-optimized structure saving $420M annually and achieving 98% global tax compliance',
          technologies: ['Tax Planning', 'Global Compliance', 'Optimization'],
          achievements: ['$420M annual savings', '98% compliance rate', 'Zero tax penalties'],
        },
        {
          name: 'Predictive Financial Modeling Platform',
          description: 'Implemented AI-powered financial modeling platform improving forecast accuracy by 35%',
          technologies: ['AI', 'ML', 'Analytics', 'Cloud'],
          achievements: ['35% accuracy improvement', '50% faster forecasting', 'Adopted across 45 countries'],
        },
        {
          name: 'M&A Integration Framework',
          description: 'Developed comprehensive M&A integration framework for 18 acquisitions totaling $8.5B',
          technologies: ['Due Diligence', 'Integration', 'Change Management'],
          achievements: ['8.5B total deal value', '2x synergies achieved', '7,000+ employees integrated'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' },
        { name: 'French', proficiency: 'Intermediate' },
        { name: 'German', proficiency: 'Intermediate' },
        { name: 'Mandarin', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Elizabeth Warren',
          position: 'Board Chair',
          organization: 'Fortune 100 Financial Services',
          email: 'elizabeth.warren@board.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'Board Chair for 3 years. Exceptional CFO.',
        },
        {
          name: 'James Dimon',
          position: 'CEO',
          organization: 'JPMorgan Chase',
          email: 'james.dimon@jpmorgan.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'CEO for 8 years. Outstanding financial leader.',
        },
        {
          name: 'Dr. Robert Kaplan',
          position: 'Professor of Finance',
          organization: 'Wharton School',
          email: 'robert.kaplan@wharton.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'MBA advisor. One of the best finance minds.',
        },
      ],
      volunteer: [
        {
          organization: 'Financial Literacy Foundation',
          role: 'Board Member',
          startDate: 'Jan 2018',
          endDate: 'Present',
          description: 'Promoting financial literacy in underserved communities, reaching 10,000+ students annually.',
        },
        {
          organization: 'New York Cares',
          role: 'Financial Advisor',
          startDate: 'Jun 2016',
          endDate: 'Present',
          description: 'Providing financial education to 500+ families in New York City annually.',
        },
        {
          organization: 'Global Banking Alliance',
          role: 'Advisory Board Member',
          startDate: 'Sep 2015',
          endDate: 'Dec 2020',
          description: 'Advising on financial inclusion initiatives in developing countries.',
        },
      ],
      publications: [
        {
          title: 'AI-Powered Financial Strategy: A CFO\'s Guide',
          publisher: 'Harvard Business Review',
          date: '2023',
          description: 'Guide for CFOs on implementing AI in financial strategy.',
        },
        {
          title: 'M&A Integration: Best Practices and Pitfalls',
          publisher: 'Financial Times',
          date: '2022',
          description: 'Comprehensive guide to successful M&A integration strategies.',
        },
        {
          title: 'The Future of Finance: Technology and Transformation',
          publisher: 'Wall Street Journal',
          date: '2021',
          description: 'Research on technology-driven financial transformation.',
        },
        {
          title: 'Sustainable Finance: ESG Strategy for CFOs',
          publisher: 'Forbes',
          date: '2020',
          description: 'Guide to integrating ESG considerations into financial strategy.',
        },
      ],
      awards: [
        { title: 'CFO of the Year 2023', issuer: 'Financial Times', year: '2023', description: 'For outstanding financial leadership and transformation' },
        { title: 'Finance Innovation Award', issuer: 'Wall Street Journal', year: '2022', description: 'For AI-powered financial analytics platform' },
        { title: 'Excellence in M&A Award', issuer: 'Harvard Business Review', year: '2021', description: 'For exceptional M&A strategy and execution' },
        { title: 'Lifetime Achievement Award', issuer: 'CFO Magazine', year: '2020', description: 'For contributions to the finance profession' },
      ],
    },
  },
  // ============================================
  // 5. MARKETING DIRECTOR
  // ============================================
  {
    id: 'sr-5',
    title: 'Global Marketing Director Resume',
    industry: 'Marketing',
    role: 'Global Marketing Director',
    experience: '14+ years',
    score: 96,
    featured: false,
    downloads: 14200,
    color: 'from-orange-500 to-red-500',
    sections: {
      contact: {
        fullName: 'Marcus Williams',
        email: 'marcus.williams@email.com',
        phone: '+1 (555) 123-4567',
        location: 'Chicago, IL, USA',
        linkedIn: 'linkedin.com/in/marcus-williams-marketing',
        github: '',
        portfolio: 'marcuswilliams.marketing',
      },
      summary: {
        content: 'Global Marketing Director with 14+ years of experience driving revenue growth through integrated marketing strategies. Expert in brand strategy, digital transformation, and growth hacking. Delivered 280% revenue growth and led global rebranding for Fortune 500 companies. Passionate about building high-performance marketing teams and creating exceptional customer experiences.',
      },
      experience: [
        {
          position: 'Global Marketing Director',
          company: 'Leading Consumer Brand',
          startDate: 'Jan 2018',
          endDate: 'Present',
          current: true,
          location: 'Chicago, IL',
          responsibilities: [
            'Led global marketing strategy across 50+ markets with $150M budget',
            'Drove brand strategy and positioning for 20+ product lines',
            'Managed 80+ marketing professionals across 12 countries',
            'Oversaw digital transformation of marketing functions',
          ],
          achievements: [
            'Drove revenue growth from $340M to $1.3B (280% increase) over 5 years',
            'Achieved 92% brand awareness and 45% brand equity increase',
            'Grew online revenue from 12% to 45% of total sales',
            'Improved marketing ROI from 2.1x to 6.8x through AI-driven attribution',
          ],
        },
        {
          position: 'Senior Marketing Manager',
          company: 'Procter & Gamble',
          startDate: 'Jun 2012',
          endDate: 'Dec 2017',
          current: false,
          location: 'Cincinnati, OH',
          responsibilities: [
            'Led marketing strategy for $2B product portfolio',
            'Managed 30+ marketing professionals across 3 regions',
            'Drove product innovation and go-to-market strategies',
            'Oversaw agency relationships and creative development',
          ],
          achievements: [
            'Launched 25+ products generating $200M+ in new revenue',
            'Achieved 5 market category leadership positions',
            'Increased market share by 15% through differentiated positioning',
            'Built marketing capabilities in 10+ new markets',
          ],
        },
        {
          position: 'Brand Manager',
          company: 'Nestlé',
          startDate: 'Aug 2008',
          endDate: 'May 2012',
          current: false,
          location: 'Vevey, Switzerland',
          responsibilities: [
            'Managed $50M brand portfolio across 20+ markets',
            'Developed brand positioning and marketing strategies',
            'Led cross-functional teams on product development',
            'Managed marketing budget and performance metrics',
          ],
          achievements: [
            'Grew brand revenue by 35% through targeted campaigns',
            'Achieved #1 market position in 5 key markets',
            'Launched successful digital marketing initiatives',
            'Recognized as top brand manager in global portfolio',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Business Administration',
          field: 'Marketing',
          institution: 'Kellogg School of Management',
          startDate: 'Sep 2006',
          endDate: 'Jun 2008',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Communications',
          institution: 'Northwestern University',
          startDate: 'Sep 2002',
          endDate: 'Jun 2006',
          gpa: '3.85/4.0',
        },
        {
          degree: 'High School Diploma',
          field: 'Business Focus',
          institution: 'Northside College Prep',
          startDate: 'Sep 1998',
          endDate: 'Jun 2002',
          gpa: '4.0/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Brand Strategy', level: 'Expert' },
          { name: 'Digital Marketing', level: 'Expert' },
          { name: 'Growth Hacking', level: 'Expert' },
          { name: 'SEO/SEM', level: 'Advanced' },
          { name: 'Content Marketing', level: 'Expert' },
          { name: 'Analytics', level: 'Advanced' },
          { name: 'Product Marketing', level: 'Expert' },
          { name: 'Consumer Insights', level: 'Expert' },
          { name: 'CRM', level: 'Advanced' },
          { name: 'Marketing Automation', level: 'Advanced' },
        ],
        soft: [
          { name: 'Leadership', level: 'Expert' },
          { name: 'Strategic Thinking', level: 'Expert' },
          { name: 'Team Building', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Change Management', level: 'Advanced' },
        ],
        tools: [
          { name: 'Google Analytics', level: 'Expert' },
          { name: 'HubSpot', level: 'Expert' },
          { name: 'Salesforce', level: 'Advanced' },
          { name: 'Tableau', level: 'Advanced' },
          { name: 'Adobe Creative Cloud', level: 'Intermediate' },
          { name: 'Asana', level: 'Advanced' },
        ],
      },
      certifications: [
        { name: 'Google Analytics Certified', issuer: 'Google', date: '2023' },
        { name: 'Facebook Blueprint Certified', issuer: 'Meta', date: '2022' },
        { name: 'HubSpot Inbound Marketing', issuer: 'HubSpot', date: '2021' },
        { name: 'Certified Marketing Strategist', issuer: 'AMA', date: '2020' },
        { name: 'Digital Marketing Professional', issuer: 'DMI', date: '2019' },
      ],
      projects: [
        {
          name: 'Global Rebrand Initiative',
          description: 'Led global rebrand across 50+ markets, achieving 92% brand awareness and 45% increase in brand equity',
          technologies: ['Brand Strategy', 'Market Research', 'Creative Development'],
          achievements: ['92% brand awareness', '45% brand equity increase', '50+ markets launched'],
        },
        {
          name: 'Digital Transformation',
          description: 'Led digital transformation increasing online revenue from 12% to 45% of total sales',
          technologies: ['E-commerce', 'Digital Marketing', 'Analytics'],
          achievements: ['Online revenue from 12% to 45%', '$100M+ new revenue', '20+ new capabilities'],
        },
        {
          name: 'AI-Powered Marketing Attribution',
          description: 'Optimized marketing spend through AI-driven attribution, improving ROI from 2.1x to 6.8x',
          technologies: ['AI', 'ML', 'Analytics', 'Attribution Modeling'],
          achievements: ['ROI from 2.1x to 6.8x', '3x efficiency improvement', 'Adopted across all markets'],
        },
        {
          name: 'Product Launch Excellence',
          description: 'Launched 25+ products generating $200M+ in new revenue with 5 market category leaders',
          technologies: ['Product Marketing', 'Go-to-Market', 'Consumer Insights'],
          achievements: ['$200M+ revenue', '5 category leaders', '25+ products launched'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' },
        { name: 'French', proficiency: 'Intermediate' },
        { name: 'Portuguese', proficiency: 'Intermediate' },
        { name: 'Arabic', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Patricia Johnson',
          position: 'Chief Marketing Officer',
          organization: 'Leading Consumer Brand',
          email: 'patricia.johnson@brand.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CMO for 5 years. Outstanding marketing leader.',
        },
        {
          name: 'David Miller',
          position: 'CEO',
          organization: 'Procter & Gamble',
          email: 'david.miller@pg.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'CEO for 5 years. Exceptional marketer.',
        },
        {
          name: 'Dr. Philip Kotler',
          position: 'Professor of Marketing',
          organization: 'Kellogg School of Management',
          email: 'philip.kotler@kellogg.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'MBA advisor. One of the best marketing minds.',
        },
      ],
      volunteer: [
        {
          organization: 'Marketing for Nonprofits',
          role: 'Board Advisor',
          startDate: 'Jan 2019',
          endDate: 'Present',
          description: 'Providing marketing strategy advice to 20+ non-profit organizations annually.',
        },
        {
          organization: 'Youth Marketing Institute',
          role: 'Mentor',
          startDate: 'Jun 2017',
          endDate: 'Present',
          description: 'Mentoring young marketing professionals, reaching 100+ students annually.',
        },
        {
          organization: 'Global Marketing Alliance',
          role: 'Advisory Board Member',
          startDate: 'Sep 2016',
          endDate: 'Dec 2020',
          description: 'Advising on marketing excellence initiatives in emerging markets.',
        },
      ],
      publications: [
        {
          title: 'The Future of Marketing: AI-Powered Customer Engagement',
          publisher: 'Harvard Business Review',
          date: '2023',
          description: 'Research on AI applications in modern marketing.',
        },
        {
          title: 'Brand Building in the Digital Age',
          publisher: 'AdAge',
          date: '2022',
          description: 'Strategies for building strong brands in digital-first environments.',
        },
        {
          title: 'Growth Hacking: A Marketing Director\'s Guide',
          publisher: 'Forbes',
          date: '2021',
          description: 'Guide to growth hacking strategies for marketing leaders.',
        },
        {
          title: 'Marketing ROI: Measuring and Maximizing Impact',
          publisher: 'Marketing Week',
          date: '2020',
          description: 'Framework for measuring and maximizing marketing ROI.',
        },
      ],
      awards: [
        { title: 'Marketing Leader of the Year 2023', issuer: 'AdWeek', year: '2023', description: 'For outstanding marketing leadership and results' },
        { title: 'Brand Innovation Award', issuer: 'Forbes', year: '2022', description: 'For global rebrand initiative' },
        { title: 'Digital Excellence Award', issuer: 'Google', year: '2021', description: 'For digital transformation success' },
        { title: 'Lifetime Achievement in Marketing', issuer: 'AMA', year: '2020', description: 'For contributions to the marketing profession' },
      ],
    },
  },
  // ============================================
  // 6. INVESTMENT BANKING DIRECTOR
  // ============================================
  {
    id: 'sr-6',
    title: 'Investment Banking Director Resume',
    industry: 'Finance',
    role: 'Investment Banking Director',
    experience: '15+ years',
    score: 97,
    featured: false,
    downloads: 12400,
    color: 'from-slate-600 to-slate-800',
    sections: {
      contact: {
        fullName: 'Jennifer Park',
        email: 'jennifer.park@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY, USA',
        linkedIn: 'linkedin.com/in/jennifer-park-ib',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Investment Banking Director with 15+ years of experience advising on 75+ M&A transactions totaling $120B+. Expert in financial modeling, deal execution, and client management. Built and led high-performing teams at Goldman Sachs. Ranked #1 investment banker for 3 consecutive years. Passionate about helping clients achieve their strategic objectives through exceptional M&A advisory.',
      },
      experience: [
        {
          position: 'Investment Banking Director',
          company: 'Goldman Sachs',
          startDate: 'Jan 2015',
          endDate: 'Present',
          current: true,
          location: 'New York, NY',
          responsibilities: [
            'Advised on 75+ M&A transactions totaling $120B+ across technology, healthcare, and energy sectors',
            'Led 25+ leveraged buyouts for private equity clients',
            'Managed 20+ junior bankers and analysts with 90% promotion rate',
            'Built and maintained relationships with 100+ institutional investors',
          ],
          achievements: [
            'Ranked #1 investment banker in coverage group for 3 consecutive years',
            'Led $8.5B cross-border acquisition of European fintech, achieving 3.2x return',
            'Executed 18 strategic acquisitions totaling $8.5B in deal value',
            'Built client relationships resulting in $45B+ in deal flow',
          ],
        },
        {
          position: 'Vice President of Investment Banking',
          company: 'Morgan Stanley',
          startDate: 'Jun 2008',
          endDate: 'Dec 2014',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Led M&A advisory teams on 50+ transactions',
            'Developed complex financial models for Fortune 500 clients',
            'Managed client relationships across 10+ industries',
            'Supervised 15+ junior bankers and analysts',
          ],
          achievements: [
            'Executed $2.5B in M&A transactions as lead banker',
            'Built LBO and DCF models for 50+ major transactions',
            'Increased client satisfaction by 40% through improved service',
            'Promoted twice in 6 years for exceptional performance',
          ],
        },
        {
          position: 'Investment Banking Analyst',
          company: 'Goldman Sachs',
          startDate: 'Jul 2004',
          endDate: 'May 2008',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Built financial models and valuation analyses',
            'Prepared pitch books and presentations for C-suite executives',
            'Conducted due diligence on 30+ transactions',
            'Supported senior bankers on deal execution',
          ],
          achievements: [
            'Ranked top analyst out of 45 for deal execution',
            'Developed financial models with 95% accuracy',
            'Contributed to 15+ successful M&A transactions',
            'Received early promotion to Vice President track',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Business Administration',
          field: 'Finance',
          institution: 'Harvard Business School',
          startDate: 'Sep 2002',
          endDate: 'Jun 2004',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Economics',
          institution: 'Wharton School, University of Pennsylvania',
          startDate: 'Sep 1998',
          endDate: 'Jun 2002',
          gpa: '3.85/4.0',
        },
        {
          degree: 'High School Diploma',
          field: 'Business Focus',
          institution: 'Phillips Exeter Academy',
          startDate: 'Sep 1994',
          endDate: 'Jun 1998',
          gpa: '4.0/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Financial Modeling', level: 'Expert' },
          { name: 'DCF Analysis', level: 'Expert' },
          { name: 'LBO Modeling', level: 'Expert' },
          { name: 'M&A', level: 'Expert' },
          { name: 'Valuation', level: 'Expert' },
          { name: 'Capital Markets', level: 'Expert' },
          { name: 'Due Diligence', level: 'Expert' },
          { name: 'Negotiation', level: 'Expert' },
          { name: 'Excel', level: 'Expert' },
          { name: 'PowerPoint', level: 'Expert' },
        ],
        soft: [
          { name: 'Client Management', level: 'Expert' },
          { name: 'Leadership', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Problem Solving', level: 'Expert' },
          { name: 'Team Building', level: 'Advanced' },
        ],
        tools: [
          { name: 'Excel', level: 'Expert' },
          { name: 'PowerPoint', level: 'Expert' },
          { name: 'Bloomberg Terminal', level: 'Expert' },
          { name: 'Capital IQ', level: 'Expert' },
          { name: 'FactSet', level: 'Advanced' },
          { name: 'Tableau', level: 'Intermediate' },
        ],
      },
      certifications: [
        { name: 'Chartered Financial Analyst (CFA)', issuer: 'CFA Institute', date: '2006' },
        { name: 'Series 7', issuer: 'FINRA', date: '2004' },
        { name: 'Series 63', issuer: 'FINRA', date: '2004' },
        { name: 'Series 79', issuer: 'FINRA', date: '2006' },
        { name: 'Certified Investment Banker', issuer: 'AIB', date: '2008' },
      ],
      projects: [
        {
          name: 'Cross-Border Acquisition',
          description: 'Led $8.5B acquisition of European fintech, achieving 3.2x return for clients',
          technologies: ['M&A', 'Cross-Border', 'Due Diligence', 'Integration'],
          achievements: ['$8.5B deal value', '3.2x return', 'Client satisfaction of 98%'],
        },
        {
          name: 'LBO Portfolio Optimization',
          description: 'Executed 25+ leveraged buyouts for private equity clients',
          technologies: ['LBO', 'Private Equity', 'Financial Modeling'],
          achievements: ['25+ LBOs completed', '2.5x average return', '$15B total value'],
        },
        {
          name: 'IPO Execution',
          description: 'Led $4.5B IPO and 3 follow-on offerings for major technology clients',
          technologies: ['IPO', 'Capital Markets', 'Investor Relations'],
          achievements: ['$4.5B IPO', '40% first-day pop', '95% institutional ownership'],
        },
        {
          name: 'Capital Raising Strategy',
          description: 'Developed and executed capital raising strategies securing $45B+ in financing',
          technologies: ['Capital Markets', 'Debt Financing', 'Equity Financing'],
          achievements: ['$45B+ secured', '100+ clients served', '3x repeat business'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Korean', proficiency: 'Native' },
        { name: 'Japanese', proficiency: 'Fluent' },
        { name: 'Mandarin', proficiency: 'Intermediate' },
        { name: 'Spanish', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Lloyd Blankfein',
          position: 'Former CEO',
          organization: 'Goldman Sachs',
          email: 'lloyd.blankfein@gs.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CEO for 5 years. Outstanding investment banker.',
        },
        {
          name: 'David Solomon',
          position: 'CEO',
          organization: 'Goldman Sachs',
          email: 'david.solomon@gs.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'CEO for 3 years. Exceptional deal maker.',
        },
        {
          name: 'Dr. Michael Porter',
          position: 'Professor of Business',
          organization: 'Harvard Business School',
          email: 'michael.porter@hbs.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'MBA advisor. One of the best finance minds.',
        },
      ],
      volunteer: [
        {
          organization: 'Financial Education Foundation',
          role: 'Board Member',
          startDate: 'Jan 2018',
          endDate: 'Present',
          description: 'Promoting financial education in underserved communities, reaching 5,000+ students annually.',
        },
        {
          organization: 'Women in Finance',
          role: 'Mentor',
          startDate: 'Jun 2016',
          endDate: 'Present',
          description: 'Mentoring women in finance careers, reaching 100+ mentees annually.',
        },
        {
          organization: 'Global Banking Alliance',
          role: 'Advisory Board Member',
          startDate: 'Sep 2015',
          endDate: 'Dec 2020',
          description: 'Advising on financial inclusion initiatives in developing countries.',
        },
      ],
      publications: [
        {
          title: 'M&A Strategy: Creating Value Through Strategic Acquisitions',
          publisher: 'Harvard Business Review',
          date: '2023',
          description: 'Research on creating value through M&A strategy.',
        },
        {
          title: 'Cross-Border M&A: Challenges and Opportunities',
          publisher: 'Financial Times',
          date: '2022',
          description: 'Guide to cross-border M&A transactions and best practices.',
        },
        {
          title: 'The Future of Investment Banking: Technology and Innovation',
          publisher: 'Wall Street Journal',
          date: '2021',
          description: 'Research on technology-driven transformation in investment banking.',
        },
        {
          title: 'Private Equity: Value Creation Strategies',
          publisher: 'Forbes',
          date: '2020',
          description: 'Guide to value creation strategies in private equity.',
        },
      ],
      awards: [
        { title: 'Investment Banker of the Year 2023', issuer: 'Financial Times', year: '2023', description: 'For outstanding investment banking leadership' },
        { title: 'M&A Deal of the Year', issuer: 'Wall Street Journal', year: '2022', description: 'For $8.5B cross-border acquisition' },
        { title: 'Excellence in Client Service', issuer: 'Harvard Business Review', year: '2021', description: 'For exceptional client satisfaction' },
        { title: 'Lifetime Achievement in Investment Banking', issuer: 'CFO Magazine', year: '2020', description: 'For contributions to investment banking' },
      ],
    },
  },
  // ============================================
  // 7. CHIEF PEOPLE OFFICER (CPO)
  // ============================================
  {
    id: 'sr-7',
    title: 'Chief People Officer (CPO) Resume',
    industry: 'General',
    role: 'Chief People Officer',
    experience: '20+ years',
    score: 97,
    featured: false,
    downloads: 9800,
    color: 'from-rose-500 to-pink-500',
    sections: {
      contact: {
        fullName: 'Dr. Maya Patel',
        email: 'maya.patel@email.com',
        phone: '+1 (555) 123-4567',
        location: 'Boston, MA, USA',
        linkedIn: 'linkedin.com/in/maya-patel-hr',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Chief People Officer with 20+ years of experience in talent strategy, culture transformation, and organizational development. Expert in diversity & inclusion, employee experience, and HR analytics. Transformed HR functions with AI-powered talent intelligence and drove culture change across global organizations. Passionate about creating workplaces where people can thrive and do their best work.',
      },
      experience: [
        {
          position: 'Chief People Officer',
          company: 'Global Technology Leader',
          startDate: 'Jan 2019',
          endDate: 'Present',
          current: true,
          location: 'Boston, MA',
          responsibilities: [
            'Led HR strategy for 15,000+ employees across 25 countries',
            'Drove culture transformation and organizational development',
            'Implemented AI-powered talent intelligence platform',
            'Managed $150M annual HR budget and 100+ HR professionals',
          ],
          achievements: [
            'Improved employee engagement from 62% to 92% through culture transformation',
            'Achieved 50% female and 45% minority leadership representation within 3 years',
            'Reduced voluntary turnover from 25% to 11% through enhanced employee experience',
            'Reduced hiring time by 50% through AI-powered recruitment',
          ],
        },
        {
          position: 'Senior Vice President of HR',
          company: 'Fortune 500 Healthcare',
          startDate: 'Jun 2012',
          endDate: 'Dec 2018',
          current: false,
          location: 'Chicago, IL',
          responsibilities: [
            'Led HR strategy for 25,000+ employees across 15 countries',
            'Drove talent development and succession planning',
            'Implemented compensation and benefits strategy',
            'Managed 150+ HR professionals and $200M HR budget',
          ],
          achievements: [
            'Reduced turnover by 35% through enhanced engagement programs',
            'Developed leadership pipeline with 85% internal fill rate',
            'Improved diversity metrics by 30% through targeted initiatives',
            'Achieved 95% employee satisfaction with benefits programs',
          ],
        },
        {
          position: 'HR Director',
          company: 'Accenture',
          startDate: 'Aug 2004',
          endDate: 'May 2012',
          current: false,
          location: 'New York, NY',
          responsibilities: [
            'Led HR operations for 10,000+ consultants across 20 countries',
            'Drove talent acquisition and workforce planning',
            'Implemented performance management systems',
            'Managed 50+ HR professionals and $50M HR budget',
          ],
          achievements: [
            'Reduced recruiting costs by 30% through process optimization',
            'Improved time-to-hire by 45% through recruitment transformation',
            'Achieved 90% employee engagement scores across all regions',
            'Successfully integrated 5 acquired companies with 100% retention',
          ],
        },
      ],
      education: [
        {
          degree: 'Doctor of Philosophy',
          field: 'Organizational Psychology',
          institution: 'Stanford University',
          startDate: 'Sep 2000',
          endDate: 'Jun 2004',
          gpa: '4.0/4.0',
        },
        {
          degree: 'Master of Arts',
          field: 'Human Resources',
          institution: 'Cornell University',
          startDate: 'Sep 1998',
          endDate: 'Jun 2000',
          gpa: '3.95/4.0',
        },
        {
          degree: 'Bachelor of Arts',
          field: 'Psychology',
          institution: 'University of California, Berkeley',
          startDate: 'Sep 1994',
          endDate: 'Jun 1998',
          gpa: '3.88/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Talent Strategy', level: 'Expert' },
          { name: 'Culture Transformation', level: 'Expert' },
          { name: 'Diversity & Inclusion', level: 'Expert' },
          { name: 'Organizational Development', level: 'Expert' },
          { name: 'Employee Experience', level: 'Expert' },
          { name: 'HR Analytics', level: 'Advanced' },
          { name: 'Change Management', level: 'Expert' },
          { name: 'Leadership Development', level: 'Expert' },
          { name: 'Compensation & Benefits', level: 'Advanced' },
          { name: 'Employee Relations', level: 'Expert' },
        ],
        soft: [
          { name: 'Executive Leadership', level: 'Expert' },
          { name: 'Strategic Planning', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Influence', level: 'Expert' },
          { name: 'Collaboration', level: 'Expert' },
        ],
        tools: [
          { name: 'Workday', level: 'Expert' },
          { name: 'SAP SuccessFactors', level: 'Advanced' },
          { name: 'PeopleSoft', level: 'Advanced' },
          { name: 'Tableau', level: 'Advanced' },
          { name: 'Power BI', level: 'Intermediate' },
          { name: 'Microsoft Suite', level: 'Expert' },
        ],
      },
      certifications: [
        { name: 'SHRM-SCP', issuer: 'SHRM', date: '2010' },
        { name: 'SPHR', issuer: 'HRCI', date: '2008' },
        { name: 'Hogan Assessment', issuer: 'Hogan', date: '2012' },
        { name: 'DiSC Certified', issuer: 'Wiley', date: '2014' },
        { name: 'Emotional Intelligence Certified', issuer: 'EQ-i', date: '2016' },
      ],
      projects: [
        {
          name: 'AI-Powered Talent Intelligence',
          description: 'Built AI-powered talent intelligence platform reducing hiring time by 50%',
          technologies: ['AI', 'ML', 'Analytics', 'Talent Management'],
          achievements: ['50% hiring time reduction', '35% quality of hire improvement', 'Adopted across 25 countries'],
        },
        {
          name: 'Culture Transformation Initiative',
          description: 'Led comprehensive culture transformation improving employee engagement from 62% to 92%',
          technologies: ['Change Management', 'Culture Change', 'Employee Engagement'],
          achievements: ['62% to 92% engagement', '85% team effectiveness', 'Zero voluntary turnover in top talent'],
        },
        {
          name: 'Diversity & Inclusion Strategy',
          description: 'Launched global D&I strategy achieving 50% female and 45% minority leadership representation',
          technologies: ['D&I', 'Recruitment', 'Development', 'Retention'],
          achievements: ['50% female leadership', '45% minority leadership', 'D&I award winner'],
        },
        {
          name: 'Employee Experience Transformation',
          description: 'Built comprehensive employee experience platform reducing voluntary turnover from 25% to 11%',
          technologies: ['Employee Experience', 'Well-being', 'Career Development'],
          achievements: ['25% to 11% turnover', '95% employee satisfaction', '$10M annual retention savings'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Hindi', proficiency: 'Native' },
        { name: 'French', proficiency: 'Fluent' },
        { name: 'Spanish', proficiency: 'Intermediate' },
        { name: 'Mandarin', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. William Johnson',
          position: 'CEO',
          organization: 'Global Technology Leader',
          email: 'william.johnson@tech.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CEO for 4 years. Exceptional HR leader.',
        },
        {
          name: 'Dr. Mary Smith',
          position: 'Professor of Organizational Psychology',
          organization: 'Stanford University',
          email: 'mary.smith@stanford.edu',
          phone: '+1 (555) 333-4444',
          relationship: 'Academic Advisor',
          notes: 'PhD advisor. One of the best HR minds.',
        },
        {
          name: 'Dr. John Carter',
          position: 'Former Chief HR Officer',
          organization: 'Fortune 500 Healthcare',
          email: 'john.carter@healthcare.com',
          phone: '+1 (555) 555-6666',
          relationship: 'Mentor',
          notes: 'Mentored throughout HR career. Outstanding leader.',
        },
      ],
      volunteer: [
        {
          organization: 'HR for Good Foundation',
          role: 'Board Member',
          startDate: 'Jan 2018',
          endDate: 'Present',
          description: 'Advising non-profits on HR strategy and talent management.',
        },
        {
          organization: 'Women in Leadership',
          role: 'Mentor',
          startDate: 'Jun 2016',
          endDate: 'Present',
          description: 'Mentoring women in leadership careers across 10+ countries.',
        },
        {
          organization: 'Global HR Alliance',
          role: 'Advisory Board Member',
          startDate: 'Sep 2015',
          endDate: 'Dec 2020',
          description: 'Advising on HR excellence initiatives globally.',
        },
      ],
      publications: [
        {
          title: 'AI-Powered HR: Transforming Talent Management',
          publisher: 'Harvard Business Review',
          date: '2023',
          description: 'Research on AI applications in human resources.',
        },
        {
          title: 'Culture Transformation: A Leader\'s Guide',
          publisher: 'MIT Sloan Management Review',
          date: '2022',
          description: 'Guide to successful culture transformation initiatives.',
        },
        {
          title: 'The Future of Work: Employee Experience and Well-being',
          publisher: 'Forbes',
          date: '2021',
          description: 'Research on employee experience and well-being strategies.',
        },
        {
          title: 'Diversity & Inclusion: A Comprehensive Strategy',
          publisher: 'Diversity Journal',
          date: '2020',
          description: 'Framework for D&I success in global organizations.',
        },
      ],
      awards: [
        { title: 'HR Leader of the Year 2023', issuer: 'SHRM', year: '2023', description: 'For outstanding HR leadership and innovation' },
        { title: 'D&I Excellence Award', issuer: 'Forbes', year: '2022', description: 'For D&I strategy achievement' },
        { title: 'Employee Experience Award', issuer: 'Gallup', year: '2021', description: 'For exceptional employee engagement transformation' },
        { title: 'Lifetime Achievement in HR', issuer: 'HRCI', year: '2020', description: 'For contributions to the HR profession' },
      ],
    },
  },
  // ============================================
  // 8. CHIEF MEDICAL OFFICER (CMO)
  // ============================================
  {
    id: 'sr-8',
    title: 'Chief Medical Officer (CMO) Resume',
    industry: 'Healthcare',
    role: 'Chief Medical Officer',
    experience: '25+ years',
    score: 99,
    featured: false,
    downloads: 8700,
    color: 'from-green-600 to-emerald-600',
    sections: {
      contact: {
        fullName: 'Dr. Anthony Williams, MD, MPH',
        email: 'anthony.williams@email.com',
        phone: '+1 (555) 123-4567',
        location: 'Baltimore, MD, USA',
        linkedIn: 'linkedin.com/in/dr-anthony-williams',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Chief Medical Officer with 25+ years of experience in clinical leadership, healthcare innovation, and patient safety. Expert in healthcare transformation, quality improvement, and medical education. Led clinical strategy for 25-hospital system with 50,000+ employees. Passionate about leveraging technology to improve patient outcomes and healthcare delivery.',
      },
      experience: [
        {
          position: 'Chief Medical Officer',
          company: 'Leading Healthcare System',
          startDate: 'Jan 2018',
          endDate: 'Present',
          current: true,
          location: 'Baltimore, MD',
          responsibilities: [
            'Led clinical strategy for 25-hospital system with 50,000+ employees and $12B annual revenue',
            'Drove quality and patient safety initiatives across all facilities',
            'Established medical innovation hub leading to 15 new patents',
            'Managed 1,500+ physicians and 5,000+ clinical staff',
          ],
          achievements: [
            'Reduced medical errors by 48% through AI-powered clinical decision support',
            'Improved patient outcomes and reduced readmissions by 35%',
            'Launched telemedicine program achieving 15x growth with 95% patient satisfaction',
            'Achieved 99th percentile patient safety ratings nationally',
          ],
        },
        {
          position: 'Senior Vice President of Medical Affairs',
          company: 'Mayo Clinic',
          startDate: 'Jun 2010',
          endDate: 'Dec 2017',
          current: false,
          location: 'Rochester, MN',
          responsibilities: [
            'Led medical affairs for 15-hospital system',
            'Drove research and innovation initiatives',
            'Managed 1,000+ physicians and clinical staff',
            'Oversaw quality and patient safety programs',
          ],
          achievements: [
            'Achieved Top 10 Hospital ranking for 5 consecutive years',
            'Launched clinical research program with 100+ active trials',
            'Reduced patient wait times by 40% through process improvement',
            'Achieved 98% patient satisfaction scores across all facilities',
          ],
        },
        {
          position: 'Chief of Medicine',
          company: 'Johns Hopkins Hospital',
          startDate: 'Jul 2002',
          endDate: 'May 2010',
          current: false,
          location: 'Baltimore, MD',
          responsibilities: [
            'Led Department of Medicine with 500+ faculty members',
            'Drove clinical excellence and quality improvement',
            'Managed $200M annual clinical budget',
            'Oversaw medical education and training programs',
          ],
          achievements: [
            'Increased research funding by 150% to $50M annually',
            'Launched 15 new clinical programs and services',
            'Achieved #1 rankings in 8 specialties by US News',
            'Developed and implemented 50+ clinical pathways',
          ],
        },
      ],
      education: [
        {
          degree: 'Doctor of Medicine',
          field: 'Medicine',
          institution: 'Johns Hopkins University School of Medicine',
          startDate: 'Sep 1994',
          endDate: 'Jun 1998',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Master of Public Health',
          field: 'Public Health',
          institution: 'Harvard University',
          startDate: 'Sep 1998',
          endDate: 'Jun 2000',
          gpa: '3.95/4.0',
        },
        {
          degree: 'Bachelor of Arts',
          field: 'Biology',
          institution: 'Princeton University',
          startDate: 'Sep 1990',
          endDate: 'Jun 1994',
          gpa: '3.85/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Clinical Leadership', level: 'Expert' },
          { name: 'Healthcare Innovation', level: 'Expert' },
          { name: 'Patient Safety', level: 'Expert' },
          { name: 'Quality Improvement', level: 'Expert' },
          { name: 'Regulatory Compliance', level: 'Expert' },
          { name: 'Medical Education', level: 'Expert' },
          { name: 'Population Health', level: 'Advanced' },
          { name: 'Telehealth', level: 'Advanced' },
          { name: 'Healthcare IT', level: 'Advanced' },
          { name: 'Strategic Planning', level: 'Expert' },
        ],
        soft: [
          { name: 'Executive Leadership', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Team Building', level: 'Expert' },
          { name: 'Decision Making', level: 'Expert' },
          { name: 'Change Management', level: 'Advanced' },
        ],
        tools: [
          { name: 'Epic', level: 'Expert' },
          { name: 'Cerner', level: 'Advanced' },
          { name: 'Tableau', level: 'Advanced' },
          { name: 'Power BI', level: 'Intermediate' },
          { name: 'Microsoft Suite', level: 'Expert' },
          { name: 'Clinical Decision Support', level: 'Expert' },
        ],
      },
      certifications: [
        { name: 'Board Certified Internal Medicine', issuer: 'ABIM', date: '2001' },
        { name: 'Certified Physician Executive', issuer: 'CPS', date: '2005' },
        { name: 'Six Sigma Black Belt', issuer: 'ASQ', date: '2008' },
        { name: 'Certified Medical Director', issuer: 'ACPE', date: '2010' },
        { name: 'Fellow of the American College of Physicians', issuer: 'ACP', date: '2005' },
      ],
      projects: [
        {
          name: 'AI-Powered Clinical Decision Support',
          description: 'Implemented AI-powered clinical decision support system reducing medical errors by 48%',
          technologies: ['AI', 'Clinical Decision Support', 'Healthcare IT'],
          achievements: ['48% error reduction', '35% readmission reduction', 'Adopted across 25 hospitals'],
        },
        {
          name: 'Population Health Initiative',
          description: 'Spearheaded population health initiative improving outcomes for 1.5M+ patients with chronic conditions',
          technologies: ['Population Health', 'Data Analytics', 'Care Management'],
          achievements: ['1.5M+ patients served', '30% outcome improvement', '25% cost reduction'],
        },
        {
          name: 'Telemedicine Transformation',
          description: 'Directed telemedicine expansion achieving 15x growth with 95% patient satisfaction',
          technologies: ['Telehealth', 'Virtual Care', 'Patient Engagement'],
          achievements: ['15x growth', '95% satisfaction', '50,000+ virtual visits/month'],
        },
        {
          name: 'Medical Innovation Hub',
          description: 'Established medical innovation hub leading to 15 new patents and 8 FDA-approved medical devices',
          technologies: ['Innovation', 'Research', 'Product Development', 'Regulatory'],
          achievements: ['15 patents', '8 FDA approvals', '$50M research funding'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' },
        { name: 'French', proficiency: 'Intermediate' },
        { name: 'Portuguese', proficiency: 'Intermediate' },
        { name: 'Hindi', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Peter Johnson',
          position: 'CEO',
          organization: 'Leading Healthcare System',
          email: 'peter.johnson@healthcare.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CEO for 5 years. Exceptional medical leader.',
        },
        {
          name: 'Dr. Richard Lee',
          position: 'Chief Medical Officer',
          organization: 'Mayo Clinic',
          email: 'richard.lee@mayo.edu',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'CMO for 7 years. Outstanding physician leader.',
        },
        {
          name: 'Dr. Elizabeth Blackwell',
          position: 'Professor of Medicine',
          organization: 'Johns Hopkins University',
          email: 'elizabeth.blackwell@jhmi.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'Medical school advisor. One of the best clinicians.',
        },
      ],
      volunteer: [
        {
          organization: 'Medical Missions International',
          role: 'Board Member',
          startDate: 'Jan 2017',
          endDate: 'Present',
          description: 'Providing medical care in underserved communities across 15 countries.',
        },
        {
          organization: 'Global Health Alliance',
          role: 'Advisory Board Member',
          startDate: 'Jun 2015',
          endDate: 'Present',
          description: 'Advising on global health initiatives and policy.',
        },
        {
          organization: 'Community Health Foundation',
          role: 'Board Advisor',
          startDate: 'Sep 2014',
          endDate: 'Dec 2020',
          description: 'Promoting community health and wellness programs.',
        },
      ],
      publications: [
        {
          title: 'AI in Healthcare: Clinical Decision Support Systems',
          publisher: 'New England Journal of Medicine',
          date: '2023',
          description: 'Research on AI applications in clinical decision making.',
        },
        {
          title: 'Population Health Strategies for Chronic Disease Management',
          publisher: 'JAMA',
          date: '2022',
          description: 'Comprehensive study on population health management.',
        },
        {
          title: 'The Future of Telemedicine: Lessons from the Pandemic',
          publisher: 'Lancet',
          date: '2021',
          description: 'Research on telemedicine transformation and lessons learned.',
        },
        {
          title: 'Medical Innovation: From Research to Practice',
          publisher: 'Science Translational Medicine',
          date: '2020',
          description: 'Framework for translating medical research into clinical practice.',
        },
      ],
      awards: [
        { title: 'Healthcare Leader of the Year 2023', issuer: 'Modern Healthcare', year: '2023', description: 'For outstanding healthcare leadership and innovation' },
        { title: 'Patient Safety Excellence Award', issuer: 'Joint Commission', year: '2022', description: 'For achieving 99th percentile patient safety ratings' },
        { title: 'Innovation in Healthcare Award', issuer: 'Forbes', year: '2021', description: 'For AI-powered clinical decision support' },
        { title: 'Lifetime Achievement in Medicine', issuer: 'AMA', year: '2020', description: 'For contributions to the medical profession' },
      ],
    },
  },
  // ============================================
  // 9. CHIEF SUSTAINABILITY OFFICER (CSO)
  // ============================================
  {
    id: 'sr-9',
    title: 'Chief Sustainability Officer (CSO) Resume',
    industry: 'Executive',
    role: 'Chief Sustainability Officer',
    experience: '16+ years',
    score: 98,
    featured: false,
    downloads: 7600,
    color: 'from-emerald-500 to-teal-500',
    sections: {
      contact: {
        fullName: 'Dr. David Okonkwo, PhD',
        email: 'david.okonkwo@email.com',
        phone: '+1 (555) 123-4567',
        location: 'London, UK',
        linkedIn: 'linkedin.com/in/david-okonkwo-sustainability',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Chief Sustainability Officer with 16+ years of experience leading corporate sustainability transformation. Expert in ESG strategy, carbon reduction, and circular economy. Led net-zero transformation for Global Fortune 500 achieving 15 years ahead of industry average. Passionate about creating sustainable business models that benefit people, planet, and profit.',
      },
      experience: [
        {
          position: 'Chief Sustainability Officer',
          company: 'Global Fortune 500',
          startDate: 'Jan 2018',
          endDate: 'Present',
          current: true,
          location: 'London, UK',
          responsibilities: [
            'Led corporate sustainability transformation across 50+ countries',
            'Drove ESG strategy and reporting frameworks',
            'Managed $500M sustainability investment portfolio',
            'Built partnerships with 100+ NGOs and government agencies',
          ],
          achievements: [
            'Achieved net-zero emissions by 2035, 15 years ahead of industry average',
            'Reduced waste by 75% through circular economy strategy, saving $280M annually',
            'Secured $2.5B green bond issuance for sustainability initiatives',
            'Integrated sustainability metrics across all business units',
          ],
        },
        {
          position: 'Director of Sustainability',
          company: 'Unilever',
          startDate: 'Jun 2010',
          endDate: 'Dec 2017',
          current: false,
          location: 'London, UK',
          responsibilities: [
            'Led sustainability strategy for 50+ brands across 100+ countries',
            'Drove carbon reduction and renewable energy initiatives',
            'Managed $200M sustainability portfolio',
            'Built sustainable supply chain programs',
          ],
          achievements: [
            'Reduced carbon footprint by 35% across supply chain',
            'Achieved 100% renewable energy across global operations',
            'Launched sustainable sourcing program with 500+ suppliers',
            'Increased sustainable product portfolio to 45% of revenue',
          ],
        },
        {
          position: 'Environmental Sustainability Manager',
          company: 'World Wildlife Fund (WWF)',
          startDate: 'Aug 2006',
          endDate: 'May 2010',
          current: false,
          location: 'Washington, DC',
          responsibilities: [
            'Developed sustainability programs across 20+ countries',
            'Led conservation and climate action initiatives',
            'Managed partnerships with 50+ corporations',
            'Drove policy advocacy and stakeholder engagement',
          ],
          achievements: [
            'Launched 15 conservation projects in 20+ countries',
            'Secured $50M in corporate partnerships for conservation',
            'Influenced policy changes in 5 countries',
            'Reached 10M+ people through awareness campaigns',
          ],
        },
      ],
      education: [
        {
          degree: 'Doctor of Philosophy',
          field: 'Environmental Science',
          institution: 'University of Cambridge',
          startDate: 'Sep 2002',
          endDate: 'Jun 2006',
          gpa: '4.0/4.0',
        },
        {
          degree: 'Master of Science',
          field: 'Sustainability',
          institution: 'Yale University',
          startDate: 'Sep 2000',
          endDate: 'Jun 2002',
          gpa: '3.95/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Engineering',
          institution: 'MIT',
          startDate: 'Sep 1996',
          endDate: 'Jun 2000',
          gpa: '3.88/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'ESG Strategy', level: 'Expert' },
          { name: 'Sustainability', level: 'Expert' },
          { name: 'Carbon Reduction', level: 'Expert' },
          { name: 'Circular Economy', level: 'Expert' },
          { name: 'Climate Action', level: 'Expert' },
          { name: 'Renewable Energy', level: 'Advanced' },
          { name: 'Environmental Policy', level: 'Expert' },
          { name: 'Stakeholder Engagement', level: 'Expert' },
          { name: 'ESG Reporting', level: 'Advanced' },
          { name: 'Sustainable Finance', level: 'Advanced' },
        ],
        soft: [
          { name: 'Executive Leadership', level: 'Expert' },
          { name: 'Strategic Planning', level: 'Expert' },
          { name: 'Influence', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Collaboration', level: 'Expert' },
        ],
        tools: [
          { name: 'SAP', level: 'Advanced' },
          { name: 'Salesforce', level: 'Intermediate' },
          { name: 'Tableau', level: 'Advanced' },
          { name: 'Power BI', level: 'Intermediate' },
          { name: 'Microsoft Suite', level: 'Expert' },
          { name: 'ESG Reporting Platforms', level: 'Advanced' },
        ],
      },
      certifications: [
        { name: 'GRI Certified Sustainability Professional', issuer: 'GRI', date: '2015' },
        { name: 'ESG Investing', issuer: 'CFA Institute', date: '2018' },
        { name: 'LEED AP', issuer: 'USGBC', date: '2010' },
        { name: 'Climate Reality Leader', issuer: 'Climate Reality Project', date: '2012' },
        { name: 'Certified Sustainable Business Professional', issuer: 'ASBC', date: '2016' },
      ],
      projects: [
        {
          name: 'Net-Zero Transformation',
          description: 'Led corporate sustainability transformation achieving net-zero emissions by 2035, 15 years ahead of industry average',
          technologies: ['Sustainability', 'Carbon Reduction', 'ESG'],
          achievements: ['Net-zero by 2035', '15 years ahead of industry', '$280M annual savings'],
        },
        {
          name: 'Circular Economy Strategy',
          description: 'Developed circular economy strategy reducing waste by 75% and saving $280M annually',
          technologies: ['Circular Economy', 'Waste Management', 'Resource Efficiency'],
          achievements: ['75% waste reduction', '$280M annual savings', '90% recycling rate'],
        },
        {
          name: 'Green Bond Initiative',
          description: 'Secured $2.5B green bond issuance for sustainability initiatives and ESG projects',
          technologies: ['Green Finance', 'ESG', 'Sustainable Investing'],
          achievements: ['$2.5B raised', '15 sustainability projects funded', 'AAA rating'],
        },
        {
          name: 'UN Climate Action Framework',
          description: 'Partnered with UN to develop climate action framework adopted by 50+ global corporations',
          technologies: ['Climate Policy', 'Global Governance', 'Sustainability Standards'],
          achievements: ['50+ corporations adopted', 'Framework recognized by UN', 'Global impact'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Igbo', proficiency: 'Native' },
        { name: 'French', proficiency: 'Fluent' },
        { name: 'Spanish', proficiency: 'Intermediate' },
        { name: 'Mandarin', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. Ellen MacArthur',
          position: 'Founder',
          organization: 'Ellen MacArthur Foundation',
          email: 'ellen.macarthur@foundation.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Collaborator',
          notes: 'Collaborated on circular economy initiatives.',
        },
        {
          name: 'Dr. Paul Polman',
          position: 'Former CEO',
          organization: 'Unilever',
          email: 'paul.polman@unilever.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Direct Manager',
          notes: 'CEO for 7 years. Outstanding sustainability leader.',
        },
        {
          name: 'Dr. Jane Goodall',
          position: 'Founder',
          organization: 'Jane Goodall Institute',
          email: 'jane.goodall@institute.com',
          phone: '+1 (555) 555-6666',
          relationship: 'Mentor',
          notes: 'Mentored throughout sustainability career.',
        },
      ],
      volunteer: [
        {
          organization: 'Sustainable Development Foundation',
          role: 'Board Member',
          startDate: 'Jan 2017',
          endDate: 'Present',
          description: 'Advising on sustainable development initiatives globally.',
        },
        {
          organization: 'Climate Action Network',
          role: 'Advisory Board Member',
          startDate: 'Jun 2015',
          endDate: 'Present',
          description: 'Advising on climate action and policy advocacy.',
        },
        {
          organization: 'Environmental Education Alliance',
          role: 'Board Advisor',
          startDate: 'Sep 2014',
          endDate: 'Dec 2020',
          description: 'Promoting environmental education in schools.',
        },
      ],
      publications: [
        {
          title: 'Corporate Sustainability Transformation: A CEO\'s Guide',
          publisher: 'Harvard Business Review',
          date: '2023',
          description: 'Guide to corporate sustainability transformation for business leaders.',
        },
        {
          title: 'Circular Economy: Business Opportunities and Benefits',
          publisher: 'MIT Sloan Management Review',
          date: '2022',
          description: 'Research on business opportunities in the circular economy.',
        },
        {
          title: 'Net-Zero Business Strategy: Achieving Carbon Neutrality',
          publisher: 'Forbes',
          date: '2021',
          description: 'Strategy for achieving net-zero emissions in business operations.',
        },
        {
          title: 'ESG Integration: Creating Value Through Sustainability',
          publisher: 'Wall Street Journal',
          date: '2020',
          description: 'Framework for integrating ESG into business strategy.',
        },
      ],
      awards: [
        { title: 'Sustainability Leader of the Year 2023', issuer: 'Forbes', year: '2023', description: 'For outstanding sustainability leadership' },
        { title: 'Environmental Excellence Award', issuer: 'UN Global Compact', year: '2022', description: 'For net-zero transformation achievement' },
        { title: 'Circular Economy Innovation Award', issuer: 'Ellen MacArthur Foundation', year: '2021', description: 'For circular economy strategy' },
        { title: 'Lifetime Achievement in Sustainability', issuer: 'Climate Reality Project', year: '2020', description: 'For contributions to sustainability' },
      ],
    },
  },
  // ============================================
  // 10. CHIEF INFORMATION SECURITY OFFICER (CISO)
  // ============================================
  {
    id: 'sr-10',
    title: 'Chief Information Security Officer (CISO) Resume',
    industry: 'Technology',
    role: 'Chief Information Security Officer',
    experience: '20+ years',
    score: 99,
    featured: false,
    downloads: 8200,
    color: 'from-slate-700 to-slate-900',
    sections: {
      contact: {
        fullName: 'Robert Martinez',
        email: 'robert.martinez@email.com',
        phone: '+1 (555) 123-4567',
        location: 'Washington, DC, USA',
        linkedIn: 'linkedin.com/in/robert-martinez-ciso',
        github: '',
        portfolio: '',
      },
      summary: {
        content: 'Chief Information Security Officer with 20+ years of experience in cybersecurity, risk management, and information assurance. Expert in security strategy, incident response, and regulatory compliance. Led enterprise security programs for global organizations achieving ISO 27001, SOC 2 Type II, and FedRAMP compliance. Passionate about protecting critical infrastructure and building resilient security organizations.',
      },
      experience: [
        {
          position: 'Chief Information Security Officer',
          company: 'Global Technology Leader',
          startDate: 'Jan 2019',
          endDate: 'Present',
          current: true,
          location: 'Washington, DC',
          responsibilities: [
            'Led global security strategy for 50,000+ employees across 40+ countries',
            'Managed $200M annual security budget and 200+ security professionals',
            'Drove zero-trust security architecture implementation',
            'Oversaw incident response and crisis management',
          ],
          achievements: [
            'Achieved SOC 2 Type II and ISO 27001 compliance for all systems',
            'Reduced security incidents by 65% through proactive threat hunting',
            'Achieved FedRAMP High compliance for government clients',
            'Improved security incident response time from 48 hours to 4 hours',
          ],
        },
        {
          position: 'Senior Director of Cybersecurity',
          company: 'Bank of America',
          startDate: 'Jun 2010',
          endDate: 'Dec 2018',
          current: false,
          location: 'Charlotte, NC',
          responsibilities: [
            'Led cybersecurity strategy for $2T financial services organization',
            'Managed 300+ security professionals across 5 global centers',
            'Drove security operations and incident response',
            'Oversaw regulatory compliance and risk management',
          ],
          achievements: [
            'Reduced data breaches by 80% through enhanced security controls',
            'Achieved 100% compliance with 50+ regulatory requirements',
            'Led successful security transformation reducing risk exposure by 50%',
            'Received Financial Services Security Award for excellence',
          ],
        },
        {
          position: 'Head of Security Operations',
          company: 'Lockheed Martin',
          startDate: 'Aug 2004',
          endDate: 'May 2010',
          current: false,
          location: 'Bethesda, MD',
          responsibilities: [
            'Led security operations for defense and aerospace systems',
            'Managed 150+ security professionals across 5 global hubs',
            'Drove threat intelligence and incident response',
            'Oversaw classified program security',
          ],
          achievements: [
            'Designed security architecture for $100B aerospace programs',
            'Achieved 100% compliance with DoD security requirements',
            'Reduced security breaches by 70% through advanced monitoring',
            'Received DoD Excellence in Security Award',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Science',
          field: 'Cybersecurity',
          institution: 'Carnegie Mellon University',
          startDate: 'Sep 2000',
          endDate: 'Jun 2002',
          gpa: '3.9/4.0',
        },
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'University of Virginia',
          startDate: 'Sep 1996',
          endDate: 'Jun 2000',
          gpa: '3.85/4.0',
        },
        {
          degree: 'High School Diploma',
          field: 'STEM Focus',
          institution: 'Thomas Jefferson High School',
          startDate: 'Sep 1992',
          endDate: 'Jun 1996',
          gpa: '4.0/4.0',
        },
      ],
      skills: {
        technical: [
          { name: 'Cybersecurity Strategy', level: 'Expert' },
          { name: 'Risk Management', level: 'Expert' },
          { name: 'Information Assurance', level: 'Expert' },
          { name: 'Zero-Trust Architecture', level: 'Expert' },
          { name: 'Incident Response', level: 'Expert' },
          { name: 'Cloud Security', level: 'Advanced' },
          { name: 'AI Security', level: 'Advanced' },
          { name: 'Blockchain Security', level: 'Advanced' },
          { name: 'IoT Security', level: 'Advanced' },
          { name: 'Quantum Security', level: 'Intermediate' },
        ],
        soft: [
          { name: 'Executive Leadership', level: 'Expert' },
          { name: 'Strategic Planning', level: 'Expert' },
          { name: 'Communication', level: 'Expert' },
          { name: 'Crisis Management', level: 'Expert' },
          { name: 'Team Building', level: 'Expert' },
        ],
        tools: [
          { name: 'FireEye', level: 'Expert' },
          { name: 'Palo Alto', level: 'Expert' },
          { name: 'Fortinet', level: 'Advanced' },
          { name: 'AWS', level: 'Advanced' },
          { name: 'Azure', level: 'Advanced' },
          { name: 'Splunk', level: 'Advanced' },
        ],
      },
      certifications: [
        { name: 'CISSP', issuer: 'ISC²', date: '2005' },
        { name: 'CISA', issuer: 'ISACA', date: '2006' },
        { name: 'CISM', issuer: 'ISACA', date: '2008' },
        { name: 'GIAC Certified Incident Handler', issuer: 'SANS', date: '2010' },
        { name: 'AWS Certified Security', issuer: 'Amazon', date: '2020' },
      ],
      projects: [
        {
          name: 'Zero-Trust Security Architecture',
          description: 'Designed and implemented enterprise zero-trust security architecture for 50,000+ employees',
          technologies: ['Zero-Trust', 'IAM', 'Security', 'AWS', 'Azure'],
          achievements: ['SOC 2 Type II', 'ISO 27001', 'FedRAMP High compliance'],
        },
        {
          name: 'Security Operations Center (SOC)',
          description: 'Built and scaled global security operations center with 200+ security professionals',
          technologies: ['SIEM', 'Threat Intelligence', 'Incident Response'],
          achievements: ['65% incident reduction', '24/7 monitoring', '4-hour response time'],
        },
        {
          name: 'AI-Powered Threat Detection',
          description: 'Implemented AI-powered threat detection platform reducing false positives by 80%',
          technologies: ['AI', 'ML', 'Threat Detection', 'Analytics'],
          achievements: ['80% false positive reduction', '300% detection speed increase', 'Real-time protection'],
        },
        {
          name: 'Supply Chain Security Program',
          description: 'Built comprehensive supply chain security program for 5,000+ suppliers',
          technologies: ['Supply Chain Security', 'Risk Management', 'Compliance'],
          achievements: ['100% supplier compliance', '50% risk reduction', 'Industry-leading program'],
        },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Native' },
        { name: 'French', proficiency: 'Fluent' },
        { name: 'German', proficiency: 'Intermediate' },
        { name: 'Russian', proficiency: 'Basic' },
      ],
      referees: [
        {
          name: 'Dr. James Morrison',
          position: 'CEO',
          organization: 'Global Technology Leader',
          email: 'james.morrison@tech.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Direct Manager',
          notes: 'CEO for 5 years. Exceptional CISO.',
        },
        {
          name: 'Dr. Kevin Mandia',
          position: 'CEO',
          organization: 'Mandiant',
          email: 'kevin.mandia@mandiant.com',
          phone: '+1 (555) 333-4444',
          relationship: 'Collaborator',
          notes: 'Collaborated on cybersecurity initiatives.',
        },
        {
          name: 'Dr. John Smith',
          position: 'Professor of Cybersecurity',
          organization: 'Carnegie Mellon University',
          email: 'john.smith@cmu.edu',
          phone: '+1 (555) 555-6666',
          relationship: 'Academic Advisor',
          notes: 'Graduate school advisor. Outstanding security mind.',
        },
      ],
      volunteer: [
        {
          organization: 'Cybersecurity Education Foundation',
          role: 'Board Member',
          startDate: 'Jan 2017',
          endDate: 'Present',
          description: 'Promoting cybersecurity education in underserved communities.',
        },
        {
          organization: 'Global Cyber Alliance',
          role: 'Advisory Board Member',
          startDate: 'Jun 2015',
          endDate: 'Present',
          description: 'Advising on global cybersecurity initiatives.',
        },
        {
          organization: 'Women in Cybersecurity',
          role: 'Mentor',
          startDate: 'Sep 2014',
          endDate: 'Present',
          description: 'Mentoring women in cybersecurity careers.',
        },
      ],
      publications: [
        {
          title: 'Zero-Trust Security: A Comprehensive Framework',
          publisher: 'IEEE Security & Privacy',
          date: '2023',
          description: 'Framework for implementing zero-trust security architecture.',
        },
        {
          title: 'AI-Powered Threat Detection: Opportunities and Challenges',
          publisher: 'ACM Computing Surveys',
          date: '2022',
          description: 'Research on AI applications in threat detection.',
        },
        {
          title: 'CISO Strategy: Building Resilient Security Organizations',
          publisher: 'Harvard Business Review',
          date: '2021',
          description: 'Strategy for building resilient security organizations.',
        },
        {
          title: 'The Future of Cybersecurity: Technology and Innovation',
          publisher: 'Forbes',
          date: '2020',
          description: 'Research on technology-driven cybersecurity innovation.',
        },
      ],
      awards: [
        { title: 'CISO of the Year 2023', issuer: 'Forbes', year: '2023', description: 'For outstanding cybersecurity leadership' },
        { title: 'Security Excellence Award', issuer: 'IEEE', year: '2022', description: 'For zero-trust architecture implementation' },
        { title: 'Innovation in Cybersecurity Award', issuer: 'ACM', year: '2021', description: 'For AI-powered threat detection platform' },
        { title: 'Lifetime Achievement in Cybersecurity', issuer: 'ISC²', year: '2020', description: 'For contributions to the cybersecurity profession' },
      ],
    },
  },
];

// ============================================
// PDF GENERATOR - FULL IMPLEMENTATION
// ============================================

const generatePDF = async (resume: any) => {
  const s = resume.sections;
  const pdf = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  const pageWidth = 210;
  const margin = 15;
  let y = margin;

  // Add line with proper spacing
  const addLine = (text: string, size: number = 10, style: string = 'normal', color: string = '#000000') => {
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.setFont('helvetica', style);
    pdf.text(text, margin, y);
    y += size * 0.5;
  };

  const addHeading = (text: string) => {
    y += 2;
    pdf.setFontSize(16);
    pdf.setTextColor('#1a365d');
    pdf.setFont('helvetica', 'bold');
    pdf.text(text, margin, y);
    y += 6;
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // Check if we need a new page
  const checkPage = (needed: number) => {
    if (y > 280) {
      pdf.addPage();
      y = margin;
    }
  };

  // ===== CONTACT =====
  pdf.setFontSize(24);
  pdf.setTextColor('#0f172a');
  pdf.setFont('helvetica', 'bold');
  pdf.text(s.contact.fullName, margin, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.setTextColor('#4a5568');
  pdf.setFont('helvetica', 'normal');
  const contactLine = `${s.contact.email} • ${s.contact.phone} • ${s.contact.location}`;
  pdf.text(contactLine, margin, y);
  y += 6;
  if (s.contact.linkedIn || s.contact.github) {
    const socialLine = `${s.contact.linkedIn || ''}${s.contact.linkedIn && s.contact.github ? ' • ' : ''}${s.contact.github || ''}`;
    pdf.text(socialLine, margin, y);
    y += 8;
  }

  // ===== SUMMARY =====
  addHeading('PROFESSIONAL SUMMARY');
  pdf.setFontSize(10);
  pdf.setTextColor('#333333');
  pdf.setFont('helvetica', 'normal');
  const summaryLines = pdf.splitTextToSize(s.summary.content, pageWidth - margin * 2);
  pdf.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 2;

  // ===== EXPERIENCE =====
  addHeading('PROFESSIONAL EXPERIENCE');
  s.experience.forEach((exp: any) => {
    checkPage(25);
    pdf.setFontSize(11);
    pdf.setTextColor('#111827');
    pdf.setFont('helvetica', 'bold');
    const titleLine = `${exp.position} | ${exp.company}`;
    pdf.text(titleLine, margin, y);
    const dateLine = `${exp.startDate} - ${exp.endDate}`;
    const dateX = pageWidth - margin - pdf.getTextWidth(dateLine);
    pdf.text(dateLine, dateX, y);
    y += 4;
    pdf.setFontSize(9);
    pdf.setTextColor('#6b7280');
    pdf.setFont('helvetica', 'italic');
    pdf.text(exp.location, margin, y);
    y += 4;
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    exp.achievements.forEach((ach: string) => {
      pdf.text(`• ${ach}`, margin + 2, y);
      y += 4;
    });
    y += 2;
  });
  y += 2;

  // ===== EDUCATION =====
  addHeading('EDUCATION');
  s.education.forEach((edu: any) => {
    checkPage(15);
    pdf.setFontSize(10);
    pdf.setTextColor('#111827');
    pdf.setFont('helvetica', 'bold');
    const eduLine = `${edu.degree} - ${edu.field}`;
    pdf.text(eduLine, margin, y);
    const dateLine = `${edu.startDate} - ${edu.endDate}`;
    const dateX = pageWidth - margin - pdf.getTextWidth(dateLine);
    pdf.text(dateLine, dateX, y);
    y += 4;
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    pdf.text(edu.institution, margin, y);
    y += 4;
    if (edu.gpa) {
      pdf.text(`GPA: ${edu.gpa}`, margin, y);
      y += 3;
    }
    y += 2;
  });
  y += 2;

  // ===== SKILLS =====
  addHeading('TECHNICAL SKILLS');
  pdf.setFontSize(9);
  pdf.setTextColor('#374151');
  pdf.setFont('helvetica', 'normal');
  const technicalNames = s.skills.technical.map((t: any) => t.name).join(', ');
  const skillText = pdf.splitTextToSize(`Technical: ${technicalNames}`, pageWidth - margin * 2);
  pdf.text(skillText, margin, y);
  y += skillText.length * 4 + 2;
  const softNames = s.skills.soft.map((t: any) => t.name).join(', ');
  const softText = pdf.splitTextToSize(`Soft Skills: ${softNames}`, pageWidth - margin * 2);
  pdf.text(softText, margin, y);
  y += softText.length * 4 + 2;
  const toolNames = s.skills.tools.map((t: any) => t.name).join(', ');
  const toolText = pdf.splitTextToSize(`Tools: ${toolNames}`, pageWidth - margin * 2);
  pdf.text(toolText, margin, y);
  y += toolText.length * 4 + 4;

  // ===== CERTIFICATIONS =====
  if (s.certifications && s.certifications.length > 0) {
    addHeading('CERTIFICATIONS');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.certifications.forEach((cert: any) => {
      checkPage(5);
      pdf.text(`• ${cert.name} - ${cert.issuer} (${cert.date})`, margin + 2, y);
      y += 4;
    });
    y += 2;
  }

  // ===== PROJECTS =====
  if (s.projects && s.projects.length > 0) {
    addHeading('KEY PROJECTS');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.projects.forEach((proj: any) => {
      checkPage(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${proj.name}`, margin, y);
      y += 3;
      pdf.setFont('helvetica', 'normal');
      const projDesc = pdf.splitTextToSize(proj.description, pageWidth - margin * 2 - 4);
      pdf.text(projDesc, margin + 2, y);
      y += projDesc.length * 4 + 2;
      if (proj.achievements && proj.achievements.length > 0) {
        proj.achievements.forEach((ach: string) => {
          pdf.text(`• ${ach}`, margin + 4, y);
          y += 3;
        });
      }
      y += 2;
    });
  }

  // ===== LANGUAGES =====
  if (s.languages && s.languages.length > 0) {
    addHeading('LANGUAGES');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    const langText = s.languages.map((l: any) => `${l.name} (${l.proficiency})`).join(' • ');
    pdf.text(langText, margin, y);
    y += 6;
  }

  // ===== REFEREES =====
  if (s.referees && s.referees.length > 0) {
    addHeading('REFEREES');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.referees.forEach((ref: any) => {
      checkPage(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${ref.name} - ${ref.position}`, margin, y);
      y += 3;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${ref.organization} | ${ref.email}`, margin + 2, y);
      y += 3;
      pdf.text(`${ref.relationship}`, margin + 2, y);
      y += 3;
    });
    y += 2;
  }

  // ===== VOLUNTEER =====
  if (s.volunteer && s.volunteer.length > 0) {
    addHeading('VOLUNTEER EXPERIENCE');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.volunteer.forEach((vol: any) => {
      checkPage(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${vol.role} at ${vol.organization}`, margin, y);
      y += 3;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${vol.startDate} - ${vol.endDate}`, margin + 2, y);
      y += 3;
      const volDesc = pdf.splitTextToSize(vol.description, pageWidth - margin * 2 - 4);
      pdf.text(volDesc, margin + 2, y);
      y += volDesc.length * 4 + 2;
    });
  }

  // ===== PUBLICATIONS =====
  if (s.publications && s.publications.length > 0) {
    addHeading('PUBLICATIONS');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.publications.forEach((pub: any) => {
      checkPage(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${pub.title}`, margin, y);
      y += 3;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${pub.publisher} (${pub.date})`, margin + 2, y);
      y += 3;
      if (pub.description) {
        const pubDesc = pdf.splitTextToSize(pub.description, pageWidth - margin * 2 - 4);
        pdf.text(pubDesc, margin + 2, y);
        y += pubDesc.length * 4 + 2;
      }
    });
  }

  // ===== AWARDS =====
  if (s.awards && s.awards.length > 0) {
    addHeading('AWARDS & HONORS');
    pdf.setFontSize(9);
    pdf.setTextColor('#374151');
    pdf.setFont('helvetica', 'normal');
    s.awards.forEach((award: any) => {
      checkPage(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${award.title} (${award.year})`, margin, y);
      y += 3;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${award.issuer}`, margin + 2, y);
      y += 3;
      if (award.description) {
        const awardDesc = pdf.splitTextToSize(award.description, pageWidth - margin * 2 - 4);
        pdf.text(awardDesc, margin + 2, y);
        y += awardDesc.length * 4 + 2;
      }
    });
  }

  return pdf;
};

// ============================================
// DOCX GENERATOR - FULL IMPLEMENTATION
// ============================================

const generateDOCX = async (resume: any) => {
  const s = resume.sections;
  const children: Paragraph[] = [];

  // Helper to add paragraphs
  const addParagraph = (text: string, bold: boolean = false, size: number = 20, alignment: any = AlignmentType.LEFT) => {
    children.push(new Paragraph({
      children: [new TextRun({ text, bold, size })],
      alignment,
    }));
  };

  const addHeadingParagraph = (text: string) => {
    children.push(new Paragraph({
      children: [new TextRun({ text, bold: true, size: 28 })],
      alignment: AlignmentType.LEFT,
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: '──────────────────────────────────────────────────', color: '1a365d', size: 18 })],
      alignment: AlignmentType.LEFT,
    }));
  };

  // ===== CONTACT =====
  addParagraph(s.contact.fullName, true, 36, AlignmentType.CENTER);
  addParagraph(`${s.contact.email} • ${s.contact.phone}`, false, 22, AlignmentType.CENTER);
  addParagraph(s.contact.location, false, 22, AlignmentType.CENTER);
  if (s.contact.linkedIn || s.contact.github) {
    addParagraph(`${s.contact.linkedIn || ''}${s.contact.linkedIn && s.contact.github ? ' • ' : ''}${s.contact.github || ''}`, false, 20, AlignmentType.CENTER);
  }
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));

  // ===== SUMMARY =====
  addHeadingParagraph('PROFESSIONAL SUMMARY');
  const summaryPara = new Paragraph({
    children: [new TextRun({ text: s.summary.content, size: 20 })],
    alignment: AlignmentType.LEFT,
  });
  children.push(summaryPara);
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));

  // ===== EXPERIENCE =====
  addHeadingParagraph('PROFESSIONAL EXPERIENCE');
  s.experience.forEach((exp: any) => {
    const expTitle = new Paragraph({
      children: [
        new TextRun({ text: `${exp.position} | ${exp.company}`, bold: true, size: 22 }),
        new TextRun({ text: `  ${exp.startDate} - ${exp.endDate}`, size: 20 }),
      ],
      alignment: AlignmentType.LEFT,
    });
    children.push(expTitle);
    children.push(new Paragraph({
      children: [new TextRun({ text: exp.location, size: 18, italics: true })],
      alignment: AlignmentType.LEFT,
    }));
    exp.achievements.forEach((ach: string) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${ach}`, size: 20 })],
        alignment: AlignmentType.LEFT,
        bullet: { level: 0 },
      }));
    });
    children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
  });

  // ===== EDUCATION =====
  addHeadingParagraph('EDUCATION');
  s.education.forEach((edu: any) => {
    const eduTitle = new Paragraph({
      children: [
        new TextRun({ text: `${edu.degree} - ${edu.field}`, bold: true, size: 22 }),
        new TextRun({ text: `  ${edu.startDate} - ${edu.endDate}`, size: 20 }),
      ],
      alignment: AlignmentType.LEFT,
    });
    children.push(eduTitle);
    children.push(new Paragraph({
      children: [new TextRun({ text: edu.institution, size: 20 })],
      alignment: AlignmentType.LEFT,
    }));
    if (edu.gpa) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 18 })],
        alignment: AlignmentType.LEFT,
      }));
    }
    children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
  });

  // ===== SKILLS =====
  addHeadingParagraph('TECHNICAL SKILLS');
  const technicalNames = s.skills.technical.map((t: any) => t.name).join(', ');
  children.push(new Paragraph({
    children: [new TextRun({ text: `Technical: ${technicalNames}`, size: 20 })],
    alignment: AlignmentType.LEFT,
  }));
  const softNames = s.skills.soft.map((t: any) => t.name).join(', ');
  children.push(new Paragraph({
    children: [new TextRun({ text: `Soft Skills: ${softNames}`, size: 20 })],
    alignment: AlignmentType.LEFT,
  }));
  const toolNames = s.skills.tools.map((t: any) => t.name).join(', ');
  children.push(new Paragraph({
    children: [new TextRun({ text: `Tools: ${toolNames}`, size: 20 })],
    alignment: AlignmentType.LEFT,
  }));
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));

  // ===== CERTIFICATIONS =====
  if (s.certifications && s.certifications.length > 0) {
    addHeadingParagraph('CERTIFICATIONS');
    s.certifications.forEach((cert: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${cert.name} - ${cert.issuer} (${cert.date})`, size: 20 })],
        alignment: AlignmentType.LEFT,
        bullet: { level: 0 },
      }));
    });
    children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
  }

  // ===== PROJECTS =====
  if (s.projects && s.projects.length > 0) {
    addHeadingParagraph('KEY PROJECTS');
    s.projects.forEach((proj: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.name, bold: true, size: 22 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.description, size: 20 })],
        alignment: AlignmentType.LEFT,
      }));
      if (proj.achievements && proj.achievements.length > 0) {
        proj.achievements.forEach((ach: string) => {
          children.push(new Paragraph({
            children: [new TextRun({ text: `• ${ach}`, size: 18 })],
            alignment: AlignmentType.LEFT,
            bullet: { level: 0 },
          }));
        });
      }
      children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
    });
  }

  // ===== LANGUAGES =====
  if (s.languages && s.languages.length > 0) {
    addHeadingParagraph('LANGUAGES');
    const langText = s.languages.map((l: any) => `${l.name} (${l.proficiency})`).join(' • ');
    children.push(new Paragraph({
      children: [new TextRun({ text: langText, size: 20 })],
      alignment: AlignmentType.LEFT,
    }));
    children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
  }

  // ===== REFEREES =====
  if (s.referees && s.referees.length > 0) {
    addHeadingParagraph('REFEREES');
    s.referees.forEach((ref: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${ref.name} - ${ref.position}`, bold: true, size: 22 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${ref.organization} | ${ref.email}`, size: 20 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${ref.relationship}`, size: 18 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
    });
  }

  // ===== VOLUNTEER =====
  if (s.volunteer && s.volunteer.length > 0) {
    addHeadingParagraph('VOLUNTEER EXPERIENCE');
    s.volunteer.forEach((vol: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${vol.role} at ${vol.organization}`, bold: true, size: 22 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${vol.startDate} - ${vol.endDate}`, size: 18 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: vol.description, size: 20 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
    });
  }

  // ===== PUBLICATIONS =====
  if (s.publications && s.publications.length > 0) {
    addHeadingParagraph('PUBLICATIONS');
    s.publications.forEach((pub: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: pub.title, bold: true, size: 22 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${pub.publisher} (${pub.date})`, size: 20 })],
        alignment: AlignmentType.LEFT,
      }));
      if (pub.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: pub.description, size: 18 })],
          alignment: AlignmentType.LEFT,
        }));
      }
      children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
    });
  }

  // ===== AWARDS =====
  if (s.awards && s.awards.length > 0) {
    addHeadingParagraph('AWARDS & HONORS');
    s.awards.forEach((award: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${award.title} (${award.year})`, bold: true, size: 22 })],
        alignment: AlignmentType.LEFT,
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: award.issuer, size: 20 })],
        alignment: AlignmentType.LEFT,
      }));
      if (award.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: award.description, size: 18 })],
          alignment: AlignmentType.LEFT,
        }));
      }
      children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
    });
  }

  // Build the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.8),
            right: convertInchesToTwip(0.8),
          },
        },
      },
      children,
    }],
  });

  return doc;
};
// ============================================
// MAIN COMPONENT
// ============================================

const SampleResumes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedResume, setSelectedResume] = useState<typeof sampleResumes[0] | null>(null);
  const [downloading, setDownloading] = useState(false);

  const industries = ['All', ...new Set(sampleResumes.map(r => r.industry))];

  const filteredResumes = sampleResumes.filter(resume => {
    const matchesSearch = resume.title.toLowerCase().includes(search.toLowerCase()) ||
      resume.industry.toLowerCase().includes(search.toLowerCase()) ||
      resume.sections.contact.fullName.toLowerCase().includes(search.toLowerCase()) ||
      resume.sections.contact.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || resume.industry === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = async (resume: typeof sampleResumes[0], format: 'pdf' | 'docx') => {
    setDownloading(true);
    try {
      if (format === 'pdf') {
        const pdf = await generatePDF(resume);
        pdf.save(`${resume.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        toast.success(`✅ Downloaded: ${resume.title} (PDF)`);
      } else {
        const doc = await generateDOCX(resume);
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.title.replace(/\s+/g, '-').toLowerCase()}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`✅ Downloaded: ${resume.title} (DOCX)`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <MdStars className="w-10 h-10 text-yellow-300" />
            World-Class Resume Samples
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-blue-100 max-w-3xl mx-auto">
            10 executive-level, ATS-optimized resume templates crafted by industry experts.
            Used by Fortune 500 hires and global leaders.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-blue-200">
            <span className="flex items-center gap-1">📊 Average ATS Score: <strong className="text-white">97/100</strong></span>
            <span className="flex items-center gap-1">⭐ <strong className="text-white">150,000+</strong> Downloads</span>
            <span className="flex items-center gap-1">🏆 Used by <strong className="text-white">Fortune 500</strong> Hires</span>
            <span className="flex items-center gap-1">🌍 <strong className="text-white">50+</strong> Industries Covered</span>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-soft p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, industry, or name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setFilter(ind)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  filter === ind ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl border-2 overflow-hidden hover:shadow-soft transition-all group ${
                resume.featured ? 'border-blue-200 shadow-md' : 'border-gray-200'
              }`}
            >
              {/* Preview */}
              <div className={`aspect-[3/4] bg-gradient-to-br ${resume.color} p-5 relative overflow-hidden cursor-pointer`} onClick={() => setSelectedResume(resume)}>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {resume.featured && (
                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <MdStar className="w-3 h-3" /> Featured
                    </span>
                  )}
                  <span className="bg-green-400 text-green-900 text-[9px] font-bold px-2 py-1 rounded-full">
                    {resume.score}%
                  </span>
                </div>

                {/* Mini Resume - White card overlay */}
                <div className="absolute inset-0 m-5 bg-white/95 backdrop-blur-sm rounded-lg p-4 text-left flex flex-col shadow-lg">
                  <div className="text-center border-b border-gray-200 pb-2 mb-3">
                    <p className="text-xs font-bold text-gray-900 uppercase">{resume.sections.contact.fullName}</p>
                    <p className="text-[8px] text-gray-500">{resume.sections.contact.fullName}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {resume.sections.experience.slice(0, 3).map((exp: any, j: number) => (
                      <p key={j} className="text-[6px] text-gray-600 leading-tight">• {exp.position} at {exp.company}</p>
                    ))}
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-200">
                    <p className="text-[5px] text-gray-400 leading-tight">{resume.sections.skills.technical.slice(0, 5).map((s: any) => s.name).join(', ')}...</p>
                    <p className="text-[5px] text-gray-400 mt-0.5">{resume.experience} • {resume.industry}</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <MdVisibility className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Preview Resume</p>
                    <p className="text-xs text-gray-300">{resume.downloads.toLocaleString()} downloads</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{resume.industry}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                    <MdStar className="w-4 h-4" /> {resume.score}/100
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{resume.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <MdWork className="w-3 h-3" /> {resume.experience}
                  <MdSchool className="w-3 h-3" /> {resume.role}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {resume.sections.experience.slice(0, 3).map((exp: any, j: number) => (
                    <span key={j} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exp.company}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedResume(resume)}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <MdVisibility className="w-4 h-4" /> Preview
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDownload(resume, 'pdf')}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      title="Download PDF"
                    >
                      <MdPictureAsPdf className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(resume, 'docx')}
                      className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      title="Download DOCX"
                    >
                      <MdDescription className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedResume(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedResume.sections.contact.fullName}</h2>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{selectedResume.score}%</span>
                  </div>
                  <p className="text-gray-500 text-sm">{selectedResume.role}</p>
                  <p className="text-xs text-gray-400">{selectedResume.industry} • {selectedResume.experience}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedResume.industry}</span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedResume.experience}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Professional Summary</h3>
                  <p className="text-sm text-gray-700">{selectedResume.sections.summary.content}</p>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Professional Experience</h3>
                  <div className="space-y-4">
                    {selectedResume.sections.experience.map((exp: any, i: number) => (
                      <div key={i} className="border-l-2 border-blue-300 pl-3">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">{exp.position} | {exp.company}</h4>
                          <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-xs text-gray-500">{exp.location}</p>
                        <ul className="mt-1 space-y-0.5">
                          {exp.achievements.slice(0, 3).map((ach: string, j: number) => (
                            <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-blue-500">•</span> {ach}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Education</h3>
                  <div className="space-y-2">
                    {selectedResume.sections.education.map((edu: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{edu.degree} - {edu.field}</p>
                          <p className="text-xs text-gray-500">{edu.institution}</p>
                        </div>
                        <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Skills</h3>
                  <div className="space-y-1">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Technical:</span>
                      <span className="text-xs text-gray-500 ml-1">{selectedResume.sections.skills.technical.map((s: any) => s.name).join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Soft Skills:</span>
                      <span className="text-xs text-gray-500 ml-1">{selectedResume.sections.skills.soft.map((s: any) => s.name).join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Tools:</span>
                      <span className="text-xs text-gray-500 ml-1">{selectedResume.sections.skills.tools.map((s: any) => s.name).join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                {selectedResume.sections.certifications && selectedResume.sections.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedResume.sections.certifications.map((cert: any, i: number) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{cert.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedResume.sections.languages && selectedResume.sections.languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.sections.languages.map((lang: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{lang.name} ({lang.proficiency})</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Referees */}
                {selectedResume.sections.referees && selectedResume.sections.referees.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Referees</h3>
                    <div className="space-y-2">
                      {selectedResume.sections.referees.map((ref: any, i: number) => (
                        <div key={i} className="border-l-2 border-gray-200 pl-3">
                          <p className="text-sm font-medium text-gray-900">{ref.name}</p>
                          <p className="text-xs text-gray-500">{ref.position} | {ref.organization}</p>
                          <p className="text-xs text-gray-400">{ref.relationship}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedResume(null)}
                  className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleDownload(selectedResume, 'pdf');
                      setSelectedResume(null);
                    }}
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    disabled={downloading}
                  >
                    <MdPictureAsPdf className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={() => {
                      handleDownload(selectedResume, 'docx');
                      setSelectedResume(null);
                    }}
                    className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    disabled={downloading}
                  >
                    <MdDescription className="w-4 h-4" /> DOCX
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SampleResumes;
