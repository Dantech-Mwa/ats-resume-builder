// src/components/TemplateSelector.tsx
// ============================================
// TEMPLATE SELECTOR COMPONENT - Premium Previews
// ALL SAMPLE DATA EMBEDDED DIRECTLY IN THIS FILE
// ============================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdStar, MdLock } from 'react-icons/md';
import { TemplateConfig } from '../lib/types';
import { useTemplates } from '../store';
import TemplateEngine from '../lib/templates';
import Loading from './Loading';

interface TemplateSelectorProps {
  onSelect?: (templateId: string) => void;
}

// ============================================
// COMPLETE SAMPLE RESUME DATA - EMBEDDED HERE
// ============================================

const SAMPLE_RESUME = {
  contact: {
    fullName: 'Dr. Alexander K. Mwangi',
    email: 'alex.mwangi@email.com',
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    linkedIn: 'linkedin.com/in/alexmwangi',
    portfolio: 'alexmwangi.dev',
    github: 'github.com/alexmwangi',
    twitter: '@alexmwangi',
    website: 'alexmwangi.com',
  },
  summary: {
    content: `Award-winning Data Science Leader with 10+ years of experience driving AI innovation across fintech, telco, and healthcare sectors. Spearheaded 25+ production ML systems serving 50M+ users, generating $18M+ in annual revenue impact. PhD in Machine Learning from Carnegie Mellon University Africa with 15+ peer-reviewed publications. Recognized as "Top 40 Under 40 Data Scientists in Africa" (2023). Passionate about building high-performance teams and translating complex algorithms into business value. Expert in end-to-end ML lifecycle, from research to production, with deep expertise in deep learning, NLP, computer vision, and MLOps.`,
  },
  experience: [
    {
      id: 'exp1',
      company: 'Safaricom PLC',
      position: 'Director of Data Science & AI',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      location: 'Nairobi, Kenya',
      description: 'Leading a team of 45 data scientists, ML engineers, and data analysts in developing AI-powered solutions for East Africa\'s largest telecommunications company.',
      achievements: [
        'Architected and deployed 15+ production ML models serving 35M+ customers, generating $12.4M in annual revenue.',
        'Led FraudShield AI: real-time fraud detection, 10,000+ TPS, 99.7% accuracy, $4.2M annual savings.',
        'Built MLOps platform (MLflow + Kubernetes) reducing deployment time from 3 weeks to 12 hours.',
        'Mentored 12 junior data scientists, with 8 promoted to senior roles within 18 months.',
        'Drove 40% improvement in customer retention through AI-powered hyper-personalization.',
      ],
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'MLflow', 'Kubernetes', 'AWS SageMaker', 'Apache Spark'],
    },
    {
      id: 'exp2',
      company: 'Google DeepMind',
      position: 'Senior Research Scientist',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      current: false,
      location: 'London, UK (Remote)',
      description: 'Led cutting-edge research in reinforcement learning and graph neural networks for healthcare and sustainability.',
      achievements: [
        'Developed novel GNN architecture for protein folding, achieving 15% improvement over state-of-the-art.',
        'Published 8 papers at NeurIPS, ICML, ICLR with 1,200+ citations.',
        'Led 5 researchers in AlphaFold-inspired drug discovery models.',
        'Secured $2.8M in research grants from Wellcome Trust and Gates Foundation.',
      ],
      technologies: ['Python', 'JAX', 'TensorFlow', 'PyTorch', 'GNN', 'Reinforcement Learning', 'TPU', 'GCP'],
    },
    {
      id: 'exp3',
      company: 'KCB Bank Group',
      position: 'Lead Data Scientist',
      startDate: 'Jan 2017',
      endDate: 'Feb 2019',
      current: false,
      location: 'Nairobi, Kenya',
      description: 'Built and led the first dedicated data science team at East Africa\'s largest banking group.',
      achievements: [
        'Credit scoring model: 28% NPL reduction, 15% approval increase.',
        'Customer 360 analytics platform serving 200+ business users daily.',
        'Fraud detection system: 65% reduction in fraudulent transactions.',
        'Automated reporting pipeline saving 120 person-hours per month.',
        'Trained 50+ business stakeholders on data-driven decision making.',
      ],
      technologies: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'AWS'],
    },
    {
      id: 'exp4',
      company: 'PwC Kenya',
      position: 'Data Analytics Consultant',
      startDate: 'Jun 2015',
      endDate: 'Dec 2016',
      current: false,
      location: 'Nairobi, Kenya',
      description: 'Delivered data-driven consulting solutions for financial services, retail, and telecommunications clients.',
      achievements: [
        'Led 8 consultants: inventory optimization model, 30% stockout reduction.',
        'Revenue forecasting system: 95% accuracy for leading beverage company.',
        'Customer segmentation framework for major bank enabling targeted marketing.',
        'Automated data pipelines reducing project delivery time by 40%.',
      ],
      technologies: ['Python', 'R', 'SQL', 'Excel VBA', 'Tableau'],
    },
    {
      id: 'exp5',
      company: 'Microsoft Research',
      position: 'Research Intern',
      startDate: 'Jun 2014',
      endDate: 'Aug 2014',
      current: false,
      location: 'Redmond, WA, USA',
      description: 'Contributed to research on efficient deep learning models for mobile devices.',
      achievements: [
        'Developed quantization technique: 80% model size reduction, <1% accuracy loss.',
        'Co-authored paper presented at CVPR 2015.',
        'Implemented TensorFlow Lite models for on-device inference.',
      ],
      technologies: ['Python', 'TensorFlow', 'C++', 'CUDA'],
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Carnegie Mellon University Africa',
      degree: 'Doctor of Philosophy (PhD)',
      field: 'Machine Learning & Artificial Intelligence',
      startDate: 'Aug 2016',
      endDate: 'May 2020',
      gpa: '4.0/4.0',
      location: 'Kigali, Rwanda',
      degreeType: 'PhD',
      honors: ['Summa Cum Laude', 'Best PhD Thesis Award', 'Presidential Fellowship'],
    },
    {
      id: 'edu2',
      institution: 'University of Nairobi',
      degree: 'Master of Science (MSc)',
      field: 'Computer Science',
      startDate: 'Sep 2013',
      endDate: 'May 2015',
      gpa: '3.92/4.0',
      location: 'Nairobi, Kenya',
      degreeType: 'Master',
      honors: ['Distinction', 'Dean\'s List', 'Best Research Paper Award'],
    },
    {
      id: 'edu3',
      institution: 'Stanford University',
      degree: 'Bachelor of Science (BSc)',
      field: 'Computer Science, Minor in Mathematics',
      startDate: 'Sep 2009',
      endDate: 'Jun 2013',
      gpa: '3.85/4.0',
      location: 'Stanford, CA, USA',
      degreeType: 'Bachelor',
      honors: ['Magna Cum Laude', 'Stanford Outstanding Achievement Award'],
    },
    {
      id: 'edu4',
      institution: 'Harvard University',
      degree: 'Postgraduate Certificate',
      field: 'Data Science & Business Analytics',
      startDate: 'Jan 2021',
      endDate: 'Dec 2021',
      location: 'Boston, MA, USA (Online)',
      degreeType: 'Certificate',
      honors: ['Harvard Extension School Merit Scholarship'],
    },
    {
      id: 'edu5',
      institution: 'Oxford University',
      degree: 'Executive Education',
      field: 'AI for Business Leaders',
      startDate: 'Jun 2022',
      endDate: 'Aug 2022',
      location: 'Oxford, UK (Online)',
      degreeType: 'Certificate',
      honors: ['Oxford Saïd Business School Fellow'],
    },
  ],
  skills: {
    technical: [
      'Python', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Java', 'JavaScript',
      'Graph Neural Networks', 'Reinforcement Learning', 'Computer Vision', 'NLP',
      'Time Series Forecasting', 'Bayesian Methods', 'Causal Inference',
    ],
    soft: [
      'Leadership', 'Strategic Thinking', 'Cross-functional Collaboration',
      'Communication', 'Mentoring', 'Project Management', 'Critical Thinking',
      'Change Management', 'Stakeholder Management', 'Agile Methodologies',
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Swahili', proficiency: 'Native' },
      { name: 'French', proficiency: 'Advanced' },
      { name: 'Spanish', proficiency: 'Intermediate' },
      { name: 'German', proficiency: 'Basic' },
    ],
    tools: ['Git', 'Jira', 'Confluence', 'Slack', 'Notion', 'Figma', 'Postman', 'VS Code', 'PyCharm', 'Jupyter'],
    frameworks: ['Django', 'Flask', 'Spring Boot', 'React', 'Node.js'],
    databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Snowflake', 'BigQuery', 'Redis'],
    cloudPlatforms: ['AWS', 'Google Cloud Platform', 'Azure'],
  },
  certifications: [
    { name: 'AWS Certified ML – Specialty', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'TensorFlow Developer Certificate', issuer: 'Google', date: '2023' },
    { name: 'Google Professional Data Engineer', issuer: 'Google Cloud', date: '2022' },
    { name: 'Certified Scrum Master (CSM)', issuer: 'Scrum Alliance', date: '2022' },
    { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2021' },
    { name: 'Executive Leadership Program', issuer: 'Harvard Business School', date: '2023' },
  ],
  projects: [
    {
      name: 'FraudShield AI Platform',
      description: 'Real-time fraud detection for mobile money, 10K+ TPS, 99.7% accuracy',
      technologies: ['Python', 'XGBoost', 'Kafka', 'Redis', 'Docker', 'AWS'],
      achievements: ['99.7% accuracy', '10K+ TPS', '$4.2M annual savings'],
    },
    {
      name: 'AlphaFold Protein Prediction',
      description: 'GNN architecture for protein folding, 15% SOTA improvement',
      technologies: ['Python', 'JAX', 'GNN', 'TPU', 'TensorFlow'],
      achievements: ['15% accuracy improvement', '1,200+ citations'],
    },
    {
      name: 'CustomerLens 360',
      description: 'Customer intelligence platform for 200+ business users',
      technologies: ['Python', 'Power BI', 'SQL', 'AWS', 'Airflow'],
      achievements: ['200+ users', '25% cross-sell increase', '18% churn reduction'],
    },
    {
      name: 'SmartCredit AI',
      description: 'AI-powered credit scoring, 28% NPL reduction',
      technologies: ['Python', 'XGBoost', 'SQL', 'AWS', 'Streamlit'],
      achievements: ['28% NPL reduction', '15% approval increase'],
    },
  ],
  languages: [
    { name: 'English', proficiency: 'Native' },
    { name: 'Swahili', proficiency: 'Native' },
    { name: 'French', proficiency: 'Advanced' },
    { name: 'Spanish', proficiency: 'Intermediate' },
    { name: 'German', proficiency: 'Basic' },
  ],
  awards: [
    { title: 'Top 40 Under 40 Data Scientists in Africa', issuer: 'Data Science Africa', year: '2023' },
    { title: 'Best Paper Award - NeurIPS 2020', issuer: 'NeurIPS', year: '2020' },
    { title: 'President\'s Innovation Award', issuer: 'Government of Kenya', year: '2022' },
    { title: 'Google Research Scholar Award', issuer: 'Google Inc.', year: '2020' },
    { title: 'Wellcome Trust Research Fellowship', issuer: 'Wellcome Trust', year: '2019' },
    { title: 'Bill & Melinda Gates Foundation Grant', issuer: 'Gates Foundation', year: '2019' },
  ],
  publications: [
    { title: 'GNN for Protein Structure Prediction', venue: 'NeurIPS 2020', citations: 450 },
    { title: 'RL for Dynamic Pricing in Mobile Networks', venue: 'ICML 2021', citations: 210 },
    { title: 'Explainable AI for Credit Scoring', venue: 'ICLR 2022', citations: 89 },
    { title: 'Federated Learning for Fraud Detection', venue: 'KDD 2023', citations: 34 },
  ],
  referees: [
    { name: 'Dr. Jane Smith', position: 'Professor of ML', company: 'Carnegie Mellon', relationship: 'Academic' },
    { name: 'Dr. Peter Ochieng', position: 'Director of DS', company: 'Safaricom PLC', relationship: 'Manager' },
    { name: 'Prof. Christopher Manning', position: 'Professor of CS', company: 'Stanford', relationship: 'Academic' },
    { name: 'Grace Muthuri', position: 'Chief Data Officer', company: 'KCB Bank', relationship: 'Professional' },
  ],
};

// ============================================
// TEMPLATE SELECTOR COMPONENT
// ============================================

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const { selectedTemplate, availableTemplates, setSelectedTemplate, setAvailableTemplates } = useTemplates();
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const templateEngine = TemplateEngine.getInstance();

  useEffect(() => {
    const templates = templateEngine.getAllTemplates();
    setAvailableTemplates(templates);
    setLoading(false);
  }, [setAvailableTemplates]);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelect?.(templateId);
  };

  const recommendedTemplates = templateEngine.getRecommendedTemplates();
  const featuredTemplates = templateEngine.getFeaturedTemplates();

  if (loading) return <Loading type="skeleton" />;

  return (
    <div className="space-y-8">
      {featuredTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MdStar className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top Picks for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                isHovered={hoveredTemplate === template.id}
                onSelect={() => handleSelect(template.id)}
                onHover={() => setHoveredTemplate(template.id)}
                onLeave={() => setHoveredTemplate(null)}
                isRecommended={recommendedTemplates.some((t) => t.id === template.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isHovered={hoveredTemplate === template.id}
              onSelect={() => handleSelect(template.id)}
              onHover={() => setHoveredTemplate(template.id)}
              onLeave={() => setHoveredTemplate(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// TEMPLATE CARD WITH PREMIUM PREVIEW
// Uses the embedded SAMPLE_RESUME data
// ============================================

interface TemplateCardProps {
  template: TemplateConfig;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  isRecommended?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  isRecommended = false,
}) => {
  // Use the embedded sample data
  const s = SAMPLE_RESUME;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer
        transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-soft ring-2 ring-blue-500/20' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-medium'
        }
      `}
      onClick={onSelect}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {isRecommended && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
            <MdStar className="w-3 h-3" /> Recommended
          </span>
        )}
        {template.isPremium && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
            <MdLock className="w-3 h-3" /> Premium
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <MdCheck className="w-4 h-4 text-white" />
        </div>
      )}

      {/* ============================================ */}
      {/* PREMIUM TEMPLATE PREVIEW - FULL DATA */}
      {/* ============================================ */}
      <div className="aspect-[3/4] overflow-hidden border-b">
        <div 
          className="w-full h-full flex flex-col overflow-hidden p-[6px]"
          style={{ 
            backgroundColor: template.colors.background || '#ffffff',
            fontFamily: template.fonts?.heading || 'Inter, sans-serif',
          }}
        >
          {/* ===== HEADER ===== */}
          <div style={{
            backgroundColor: template.layout?.headerStyle === 'split' ? template.colors.primary : 'transparent',
            padding: template.layout?.headerStyle === 'split' ? '8px 10px 6px' : '6px 10px 2px',
            textAlign: template.layout?.headerStyle === 'centered' ? 'center' : 'left',
          }}>
            <div style={{
              fontSize: template.layout?.headerStyle === 'split' ? '9px' : '8.5px',
              fontWeight: '800',
              color: template.layout?.headerStyle === 'split' ? '#FFFFFF' : template.colors.headingText || '#1a365d',
              marginBottom: '1px',
              letterSpacing: template.layout?.headerStyle === 'split' ? '0.5px' : '0',
            }}>
              {s.contact.fullName.toUpperCase()}
            </div>
            <div style={{
              fontSize: '4px',
              color: template.layout?.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.3,
            }}>
              {s.contact.email} • {s.contact.phone} • {s.contact.location}
            </div>
            <div style={{
              fontSize: '4px',
              color: template.layout?.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.3,
            }}>
              {s.contact.linkedIn} • {s.contact.github}
            </div>
          </div>

          {/* ===== SUMMARY ===== */}
          <div style={{ padding: '3px 10px 2px' }}>
            <div style={{ fontSize: '4.5px', color: template.colors.text || '#1a202c', lineHeight: 1.3 }}>
              {s.summary.content.substring(0, 280)}...
            </div>
          </div>

          {/* ===== CORE COMPETENCIES (Creative/Modern) ===== */}
          {(template.id === 'creative' || template.id === 'modern') && (
            <div style={{ padding: '2px 10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {s.skills.technical.slice(0, 18).map((skill, i) => (
                  <span key={i} style={{
                    fontSize: '3.5px', padding: '1px 4px', borderRadius: '2px',
                    backgroundColor: template.id === 'creative' ? template.colors.primary + '15' : '#F3F4F6',
                    color: template.id === 'creative' ? template.colors.primary : '#374151',
                    fontWeight: '500',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* ===== EXPERIENCE ===== */}
          <div style={{ padding: '3px 10px 1px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Professional Experience
            </div>

            {/* Experience 1 - Director */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.experience[0].position}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>{s.experience[0].startDate} – {s.experience[0].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>{s.experience[0].company}, {s.experience[0].location}</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                {s.experience[0].achievements.slice(0, 3).map((ach, i) => (
                  <div key={i}>• {ach.substring(0, 50)}...</div>
                ))}
              </div>
            </div>

            {/* Experience 2 - Senior Research Scientist */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.experience[1].position}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>{s.experience[1].startDate} – {s.experience[1].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>{s.experience[1].company}, {s.experience[1].location}</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                {s.experience[1].achievements.slice(0, 3).map((ach, i) => (
                  <div key={i}>• {ach.substring(0, 50)}...</div>
                ))}
              </div>
            </div>

            {/* Experience 3 - Lead Data Scientist */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.experience[2].position}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>{s.experience[2].startDate} – {s.experience[2].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>{s.experience[2].company}, {s.experience[2].location}</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                {s.experience[2].achievements.slice(0, 3).map((ach, i) => (
                  <div key={i}>• {ach.substring(0, 50)}...</div>
                ))}
              </div>
            </div>

            {/* Experience 4 - Consultant (Minimal/Executive/Corporate) */}
            {(template.id === 'minimal' || template.id === 'executive' || template.id === 'corporate') && (
              <div style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.experience[3].position}</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>{s.experience[3].startDate} – {s.experience[3].endDate}</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>{s.experience[3].company}, {s.experience[3].location}</div>
                <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                  {s.experience[3].achievements.slice(0, 2).map((ach, i) => (
                    <div key={i}>• {ach.substring(0, 50)}...</div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience 5 - Intern (All templates) */}
            <div style={{ marginBottom: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.experience[4].position}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>{s.experience[4].startDate} – {s.experience[4].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>{s.experience[4].company}, {s.experience[4].location}</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                {s.experience[4].achievements.slice(0, 2).map((ach, i) => (
                  <div key={i}>• {ach.substring(0, 50)}...</div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== EDUCATION ===== */}
          <div style={{ padding: '2px 10px 1px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Education
            </div>

            {/* Education 1 - PhD */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.education[0].degree}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[0].startDate} – {s.education[0].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>{s.education[0].institution}</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>GPA: {s.education[0].gpa} • {s.education[0].honors?.[0]}</div>
            </div>

            {/* Education 2 - MSc */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.education[1].degree}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[1].startDate} – {s.education[1].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>{s.education[1].institution}</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>GPA: {s.education[1].gpa} • {s.education[1].honors?.[0]}</div>
            </div>

            {/* Education 3 - BSc */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.education[2].degree}</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[2].startDate} – {s.education[2].endDate}</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>{s.education[2].institution}</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>GPA: {s.education[2].gpa} • {s.education[2].honors?.[0]}</div>
            </div>

            {/* Education 4 - Harvard (Minimal/Executive) */}
            {(template.id === 'minimal' || template.id === 'executive') && (
              <div style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.education[3].degree}</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[3].startDate} – {s.education[3].endDate}</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>{s.education[3].institution}</div>
                <div style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[3].honors?.[0]}</div>
              </div>
            )}

            {/* Education 5 - Oxford (Corporate/Executive) */}
            {(template.id === 'corporate' || template.id === 'executive') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>{s.education[4].degree}</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[4].startDate} – {s.education[4].endDate}</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>{s.education[4].institution}</div>
                <div style={{ fontSize: '3.5px', color: '#6B7280' }}>{s.education[4].honors?.[0]}</div>
              </div>
            )}
          </div>

          {/* ===== TECHNICAL SKILLS ===== */}
          <div style={{ padding: '2px 10px 1px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Technical Skills
            </div>
            <div style={{ fontSize: '3.5px', color: '#374151', lineHeight: 1.4 }}>
              <div><strong>Languages:</strong> {s.skills.technical.slice(0, 5).join(', ')}</div>
              <div><strong>ML/AI:</strong> {s.skills.technical.slice(5, 10).join(', ')}</div>
              <div><strong>Cloud/DevOps:</strong> {s.skills.cloudPlatforms.join(', ')} • {s.skills.tools.slice(0, 3).join(', ')}</div>
              <div><strong>Data:</strong> {s.skills.databases.slice(0, 4).join(', ')}</div>
            </div>
          </div>

          {/* ===== CERTIFICATIONS (Corporate/Executive) ===== */}
          {(template.id === 'corporate' || template.id === 'executive') && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Certifications
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                {s.certifications.slice(0, 4).map((cert, i) => (
                  <div key={i}>• {cert.name} ({cert.issuer}, {cert.date})</div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PROJECTS (Creative/Modern) ===== */}
          {(template.id === 'creative' || template.id === 'modern') && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Key Projects
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                {s.projects.slice(0, 3).map((proj, i) => (
                  <div key={i}>• <strong>{proj.name}</strong> — {proj.description.substring(0, 40)}...</div>
                ))}
              </div>
            </div>
          )}

          {/* ===== AWARDS (Minimal) ===== */}
          {template.id === 'minimal' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Awards
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                {s.awards.slice(0, 4).map((award, i) => (
                  <div key={i}>• {award.title} ({award.issuer}, {award.year})</div>
                ))}
              </div>
            </div>
          )}

          {/* ===== LANGUAGES (Minimal) ===== */}
          {template.id === 'minimal' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Languages
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                {s.languages.map((lang, i) => (
                  <span key={i}>{lang.name} ({lang.proficiency}){i < s.languages.length - 1 ? ' • ' : ''}</span>
                ))}
              </div>
            </div>
          )}

          {/* ===== PUBLICATIONS (Executive) ===== */}
          {template.id === 'executive' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Publications
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                {s.publications.slice(0, 3).map((pub, i) => (
                  <div key={i}>• {pub.title} — {pub.venue} ({pub.citations} citations)</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CARD INFO */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{template.name}</h4>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">ATS Score:</span>
            <span className={`text-xs font-medium ${
              template.atsCompatibility >= 95 ? 'text-green-600' :
              template.atsCompatibility >= 90 ? 'text-yellow-600' : 'text-orange-600'
            }`}>
              {template.atsCompatibility}%
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Use Template'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateSelector;
