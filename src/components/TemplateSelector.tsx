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
      {/* PREMIUM TEMPLATE PREVIEW */}
      {/* ============================================ */}
      <div className="aspect-[3/4] overflow-hidden border-b">
        <div 
          className="w-full h-full flex flex-col overflow-hidden"
          style={{ 
            backgroundColor: template.colors.background,
            fontFamily: template.fonts.heading,
          }}
        >
          {/* HEADER */}
          <div style={{
            backgroundColor: template.layout.headerStyle === 'split' ? template.colors.primary : 'transparent',
            padding: template.layout.headerStyle === 'split' ? '10px 10px' : '6px 10px 2px',
            textAlign: template.layout.headerStyle === 'centered' ? 'center' : 'left',
          }}>
            <div style={{
              fontSize: template.layout.headerStyle === 'split' ? '9px' : '8.5px',
              fontWeight: '800',
              color: template.layout.headerStyle === 'split' ? '#FFFFFF' : template.colors.headingText,
              marginBottom: '2px',
              letterSpacing: template.layout.headerStyle === 'split' ? '0.5px' : '0',
            }}>
              ALEXANDER K. MAINA
            </div>
            <div style={{
              fontSize: '4.5px',
              color: template.layout.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.4,
            }}>
              alex.maina@email.com • +254 712 345 678 • Nairobi, Kenya
            </div>
            <div style={{
              fontSize: '4.5px',
              color: template.layout.headerStyle === 'split' ? '#D1D5FF' : '#4B5563',
              lineHeight: 1.4,
            }}>
              linkedin.com/in/alexmaina • github.com/alexmaina
            </div>
          </div>

          {/* SUMMARY */}
          <div style={{ padding: '5px 10px 3px' }}>
            <div style={{ fontSize: '5px', color: template.colors.text, lineHeight: 1.4 }}>
              <strong>Senior Data Scientist & ML Engineer</strong> with <strong>7+ years</strong> delivering production AI solutions. Built ML pipelines processing <strong>50M+ records</strong> daily, reducing costs by <strong>35%</strong>. Generated <strong>$2.4M</strong> annual revenue impact.
            </div>
          </div>

          {/* CORE COMPETENCIES (Creative/Modern) */}
          {(template.id === 'creative' || template.id === 'modern') && (
            <div style={{ padding: '2px 10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {['Machine Learning','Deep Learning','Python','TensorFlow','AWS','Docker','SQL','MLOps'].map((skill, i) => (
                  <span key={i} style={{
                    fontSize: '4px', padding: '1px 4px', borderRadius: '3px',
                    backgroundColor: template.id === 'creative' ? template.colors.primary + '15' : '#F3F4F6',
                    color: template.id === 'creative' ? template.colors.primary : '#374151',
                    fontWeight: '500',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          <div style={{ padding: '4px 10px 2px' }}>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Professional Experience
            </div>

            <div style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#111827' }}>Lead Data Scientist</span>
                <span style={{ fontSize: '4px', color: '#6B7280', fontWeight: '500' }}>2022 – Present</span>
              </div>
              <div style={{ fontSize: '4.5px', color: '#374151', fontWeight: '600' }}>Safaricom PLC, Nairobi</div>
              <div style={{ fontSize: '4px', color: '#4B5563', paddingLeft: '5px', lineHeight: 1.4 }}>
                <div>• Architected ML platform processing <strong>50M+ transactions/day</strong></div>
                <div>• Led <strong>8 engineers</strong>, deployed 15+ models, <strong>$2.4M</strong> impact</div>
                <div>• Reduced inference latency by <strong>65%</strong></div>
              </div>
            </div>

            <div style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#111827' }}>Senior Data Analyst</span>
                <span style={{ fontSize: '4px', color: '#6B7280', fontWeight: '500' }}>2019 – 2021</span>
              </div>
              <div style={{ fontSize: '4.5px', color: '#374151', fontWeight: '600' }}>KCB Bank Group, Nairobi</div>
              <div style={{ fontSize: '4px', color: '#4B5563', paddingLeft: '5px', lineHeight: 1.4 }}>
                <div>• Customer segmentation model, <strong>28%</strong> revenue increase</div>
                <div>• Automated reporting, saved <strong>120 hrs/month</strong></div>
              </div>
            </div>

            {(template.id === 'minimal' || template.id === 'executive' || template.id === 'corporate') && (
              <div style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#111827' }}>Data Analyst</span>
                  <span style={{ fontSize: '4px', color: '#6B7280', fontWeight: '500' }}>2017 – 2019</span>
                </div>
                <div style={{ fontSize: '4.5px', color: '#374151', fontWeight: '600' }}>PwC Kenya, Nairobi</div>
                <div style={{ fontSize: '4px', color: '#4B5563', paddingLeft: '5px', lineHeight: 1.4 }}>
                  <div>• Built forecasting models with <strong>94% accuracy</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* EDUCATION */}
          <div style={{ padding: '3px 10px 2px' }}>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Education
            </div>
            <div style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#111827' }}>M.Sc. Machine Learning & AI</span>
                <span style={{ fontSize: '4px', color: '#6B7280' }}>2019 – 2021</span>
              </div>
              <div style={{ fontSize: '4.5px', color: '#374151', fontWeight: '500' }}>Carnegie Mellon University Africa</div>
              <div style={{ fontSize: '4px', color: '#6B7280' }}>Distinction • GPA: 3.92/4.0</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#111827' }}>B.Sc. Computer Science</span>
                <span style={{ fontSize: '4px', color: '#6B7280' }}>2013 – 2017</span>
              </div>
              <div style={{ fontSize: '4.5px', color: '#374151', fontWeight: '500' }}>University of Nairobi, Kenya</div>
              <div style={{ fontSize: '4px', color: '#6B7280' }}>First Class Honors • GPA: 3.78/4.0</div>
            </div>
          </div>

          {/* SKILLS */}
          <div style={{ padding: '3px 10px 2px' }}>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Technical Skills
            </div>
            <div style={{ fontSize: '4.5px', color: '#374151', lineHeight: 1.5 }}>
              <strong>Languages:</strong> Python, SQL, R, Scala, Java<br/>
              <strong>ML/AI:</strong> TensorFlow, PyTorch, Scikit-learn, XGBoost<br/>
              <strong>Cloud:</strong> AWS (SageMaker, Lambda), Docker, K8s, MLflow<br/>
              <strong>Data:</strong> Spark, Airflow, Snowflake, PostgreSQL<br/>
              <strong>Viz:</strong> Tableau, Power BI, Streamlit, Grafana
            </div>
          </div>

          {/* CERTIFICATIONS (Corporate/Executive) */}
          {(template.id === 'corporate' || template.id === 'executive') && (
            <div style={{ padding: '3px 10px 2px' }}>
              <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Certifications
              </div>
              <div style={{ fontSize: '4px', color: '#4B5563', lineHeight: 1.5 }}>
                <div>• AWS Certified ML – Specialty</div>
                <div>• Google Professional Data Engineer</div>
                <div>• TensorFlow Developer Certificate</div>
              </div>
            </div>
          )}

          {/* PROJECTS (Creative/Modern) */}
          {(template.id === 'creative' || template.id === 'modern') && (
            <div style={{ padding: '3px 10px 3px' }}>
              <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Key Projects
              </div>
              <div style={{ fontSize: '4px', color: '#4B5563', lineHeight: 1.4 }}>
                <div style={{ marginBottom: '1px' }}>
                  <strong style={{ color: '#111827' }}>FraudShield AI</strong> — Real-time detection, 10K+ TPS, 99.7% accuracy
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>CustomerLens 360</strong> — Analytics platform for 200+ business users
                </div>
              </div>
            </div>
          )}

          {/* LANGUAGES (Minimal) */}
          {template.id === 'minimal' && (
            <div style={{ padding: '3px 10px 3px' }}>
              <div style={{ fontSize: '5.5px', fontWeight: '700', color: template.colors.primary, borderBottom: `1px solid ${template.colors.borderColor}`, paddingBottom: '2px', marginBottom: '2px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Languages
              </div>
              <div style={{ fontSize: '4px', color: '#4B5563' }}>
                English (Native) • Swahili (Native) • French (Professional)
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
