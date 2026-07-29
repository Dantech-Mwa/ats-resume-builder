// src/components/TemplateSelector.tsx
// ============================================
// TEMPLATE SELECTOR COMPONENT - Premium Previews
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
      {/* Featured Templates */}
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

      {/* All Templates */}
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
      {/* PREMIUM TEMPLATE PREVIEW WITH FULL RESUME DATA */}
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
              DR. ALEXANDER K. MWANGI
            </div>
            <div style={{
              fontSize: '4px',
              color: template.layout?.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.3,
            }}>
              alex.mwangi@email.com • +254 712 345 678 • Nairobi, Kenya
            </div>
            <div style={{
              fontSize: '4px',
              color: template.layout?.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.3,
            }}>
              linkedin.com/in/alexmwangi • github.com/alexmwangi
            </div>
          </div>

          {/* ===== SUMMARY ===== */}
          <div style={{ padding: '3px 10px 2px' }}>
            <div style={{ fontSize: '4.5px', color: template.colors.text || '#1a202c', lineHeight: 1.3 }}>
              <strong>Director of Data Science & AI</strong> with <strong>10+ years</strong> leading AI innovation across fintech, telco, and healthcare. PhD in ML from Carnegie Mellon with <strong>25+ production systems</strong> serving <strong>50M+ users</strong>, generating <strong>$18M+</strong> annual revenue impact. Published <strong>15+ papers</strong> at NeurIPS, ICML, ICLR with <strong>2,000+ citations</strong>.
            </div>
          </div>

          {/* ===== CORE COMPETENCIES ===== */}
          {(template.id === 'creative' || template.id === 'modern') && (
            <div style={{ padding: '2px 10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {['Machine Learning','Deep Learning','NLP','Computer Vision','Reinforcement Learning','Graph Neural Networks','TensorFlow','PyTorch','Python','SQL','AWS','Docker','Kubernetes','MLflow','Time Series','Bayesian Methods','Causal Inference','Leadership'].map((skill, i) => (
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
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Director of Data Science & AI</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>2022 – Present</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>Safaricom PLC, Nairobi</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                <div>• Leading 45-person AI team, 15+ production models serving 35M+ customers</div>
                <div>• Architected FraudShield AI: 10K+ TPS, 99.7% accuracy, $4.2M annual savings</div>
                <div>• Built MLOps platform reducing deployment time from 3 weeks to 12 hours</div>
                <div>• Drove 40% retention improvement through AI-powered personalization</div>
              </div>
            </div>

            {/* Experience 2 - Senior Research Scientist */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Senior Research Scientist</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>2019 – 2021</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>Google DeepMind, London</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                <div>• Novel GNN for protein folding: 15% SOTA improvement, 1,200+ citations</div>
                <div>• Led 5 researchers, published 8 papers at NeurIPS, ICML, ICLR</div>
                <div>• Secured $2.8M grants from Wellcome Trust & Gates Foundation</div>
              </div>
            </div>

            {/* Experience 3 - Lead Data Scientist */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Lead Data Scientist</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>2017 – 2019</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>KCB Bank Group, Nairobi</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                <div>• Credit scoring model: 28% NPL reduction, 15% approval increase</div>
                <div>• Customer 360 analytics platform serving 200+ business users</div>
                <div>• Fraud detection system: 65% reduction in fraudulent transactions</div>
              </div>
            </div>

            {/* Experience 4 - Data Analytics Consultant */}
            <div style={{ marginBottom: '1px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Data Analytics Consultant</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>2015 – 2016</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>PwC Kenya, Nairobi</div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                <div>• Led 8 consultants: inventory optimization, 30% stockout reduction</div>
                <div>• Revenue forecasting: 95% accuracy for leading beverage company</div>
                <div>• Customer segmentation framework for major bank</div>
              </div>
            </div>

            {/* Experience 5 - Research Intern */}
            {(template.id === 'minimal' || template.id === 'executive' || template.id === 'corporate') && (
              <div style={{ marginBottom: '1px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Research Intern</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280', fontWeight: '500' }}>2014</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '600' }}>Microsoft Research, Redmond</div>
                <div style={{ fontSize: '3.5px', color: '#4B5563', paddingLeft: '4px', lineHeight: 1.3 }}>
                  <div>• Novel quantization technique: 80% model size reduction, <1% accuracy loss</div>
                  <div>• Co-authored paper at CVPR 2015</div>
                </div>
              </div>
            )}
          </div>

          {/* ===== EDUCATION ===== */}
          <div style={{ padding: '2px 10px 1px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Education
            </div>

            {/* Education 1 - PhD */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>PhD Machine Learning & AI</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>2016 – 2020</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>Carnegie Mellon University Africa</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Summa Cum Laude • GPA: 4.0/4.0</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Best PhD Thesis Award • Presidential Fellowship</div>
            </div>

            {/* Education 2 - MSc */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>MSc Computer Science</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>2013 – 2015</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>University of Nairobi, Kenya</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Distinction • GPA: 3.92/4.0</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Dean's List • Best Research Paper Award</div>
            </div>

            {/* Education 3 - BSc */}
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>BSc Computer Science</span>
                <span style={{ fontSize: '3.5px', color: '#6B7280' }}>2009 – 2013</span>
              </div>
              <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>Stanford University, USA</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Magna Cum Laude • GPA: 3.85/4.0</div>
              <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Stanford Outstanding Achievement Award</div>
            </div>

            {/* Education 4 - Harvard Certificate */}
            {(template.id === 'minimal' || template.id === 'executive') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>Data Science & Analytics</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280' }}>2021</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>Harvard University</div>
                <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Harvard Extension School Merit Scholarship</div>
              </div>
            )}

            {/* Education 5 - Oxford */}
            {(template.id === 'corporate' || template.id === 'executive') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: '#111827' }}>AI for Business Leaders</span>
                  <span style={{ fontSize: '3.5px', color: '#6B7280' }}>2022</span>
                </div>
                <div style={{ fontSize: '4px', color: '#374151', fontWeight: '500' }}>Oxford University</div>
                <div style={{ fontSize: '3.5px', color: '#6B7280' }}>Oxford Saïd Business School Fellow</div>
              </div>
            )}
          </div>

          {/* ===== TECHNICAL SKILLS ===== */}
          <div style={{ padding: '2px 10px 1px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Technical Skills
            </div>
            <div style={{ fontSize: '3.5px', color: '#374151', lineHeight: 1.4 }}>
              <div><strong>Languages:</strong> Python, SQL, R, Scala, Java, JavaScript</div>
              <div><strong>ML/AI:</strong> TensorFlow, PyTorch, JAX, Scikit-learn, XGBoost, GNNs</div>
              <div><strong>Cloud/DevOps:</strong> AWS, GCP, Docker, K8s, MLflow, Airflow, Terraform</div>
              <div><strong>Data:</strong> Spark, Snowflake, BigQuery, PostgreSQL, Redis, Kafka</div>
              <div><strong>Viz:</strong> Tableau, Power BI, Streamlit, Grafana, Plotly</div>
            </div>
          </div>

          {/* ===== CERTIFICATIONS (Corporate/Executive) ===== */}
          {(template.id === 'corporate' || template.id === 'executive') && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Certifications
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                <div>• AWS Certified ML – Specialty (2023)</div>
                <div>• TensorFlow Developer Certificate (2023)</div>
                <div>• Google Professional Data Engineer (2022)</div>
                <div>• Certified Scrum Master (CSM) (2022)</div>
                <div>• Deep Learning Specialization (2021)</div>
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
                <div><strong>FraudShield AI</strong> — Real-time fraud detection, 10K+ TPS, 99.7% accuracy</div>
                <div><strong>AlphaFold GNN</strong> — Protein folding prediction, 15% SOTA improvement</div>
                <div><strong>CustomerLens 360</strong> — Analytics platform for 200+ business users</div>
                <div><strong>SmartCredit AI</strong> — Credit scoring, 28% NPL reduction</div>
              </div>
            </div>
          )}

          {/* ===== AWARDS (Minimal) ===== */}
          {template.id === 'minimal' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Awards & Recognition
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                <div>• Top 40 Under 40 Data Scientists in Africa (2023)</div>
                <div>• Best Paper Award – NeurIPS 2020</div>
                <div>• President's Innovation Award – Kenya (2022)</div>
                <div>• Google Research Scholar Award (2020)</div>
                <div>• Wellcome Trust Research Fellowship (2019)</div>
              </div>
            </div>
          )}

          {/* ===== LANGUAGES ===== */}
          {template.id === 'minimal' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Languages
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                <div><strong>English</strong> (Native) • <strong>Swahili</strong> (Native)</div>
                <div><strong>French</strong> (Advanced • DELF B2)</div>
                <div><strong>Spanish</strong> (Intermediate • DELE B1)</div>
                <div><strong>German</strong> (Basic • Goethe A2)</div>
              </div>
            </div>
          )}

          {/* ===== PUBLICATIONS (Executive) ===== */}
          {template.id === 'executive' && (
            <div style={{ padding: '2px 10px 1px' }}>
              <div style={{ fontSize: '5px', fontWeight: '700', color: template.colors.primary || '#1a365d', borderBottom: `1px solid ${template.colors.borderColor || '#e2e8f0'}`, paddingBottom: '1.5px', marginBottom: '2px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Selected Publications
              </div>
              <div style={{ fontSize: '3.5px', color: '#4B5563', lineHeight: 1.3 }}>
                <div>• <strong>NeurIPS 2020</strong> — GNN for Protein Structure Prediction (450 citations)</div>
                <div>• <strong>ICML 2021</strong> — RL for Dynamic Pricing (210 citations)</div>
                <div>• <strong>ICLR 2022</strong> — Explainable AI for Credit Scoring (89 citations)</div>
                <div>• <strong>KDD 2023</strong> — Federated Learning for Fraud Detection (34 citations)</div>
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
