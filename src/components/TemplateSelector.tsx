// ============================================
// TEMPLATE SELECTOR COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheck, MdStar, MdLock, MdInfo } from 'react-icons/md';
import { TemplateConfig } from '../lib/types';
import { useTemplates } from '../store';
import TemplateEngine from '../lib/templates';
import Loading from './Loading';

interface TemplateSelectorProps {
  onSelect?: (templateId: string) => void;
  showPreview?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  showPreview = true,
}) => {
  const { selectedTemplate, availableTemplates, setSelectedTemplate, setAvailableTemplates } = useTemplates();
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const templateEngine = TemplateEngine.getInstance();

  useEffect(() => {
    // Load templates
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

  if (loading) {
    return <Loading type="skeleton" />;
  }

  return (
    <div className="space-y-6">
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

// Template Card
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
            <MdStar className="w-3 h-3" />
            Recommended
          </span>
        )}
        {template.isPremium && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
            <MdLock className="w-3 h-3" />
            Premium
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <MdCheck className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Preview Image */}
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        {/* NEW - CSS-generated preview */}
<div 
  className="w-full h-full flex flex-col p-3"
  style={{ 
    backgroundColor: template.colors.background,
    fontFamily: template.fonts.heading,
  }}
>
  {/* Name */}
  <div style={{ 
    fontSize: template.fonts.sizes.name, 
    color: template.colors.headingText,
    fontWeight: 'bold',
    textAlign: template.layout.headerStyle === 'centered' ? 'center' : 'left',
    marginBottom: '4px',
  }}>
    John Doe
  </div>
  
  {/* Contact line */}
  <div style={{ 
    fontSize: '6px', 
    color: '#666', 
    textAlign: template.layout.headerStyle === 'centered' ? 'center' : 'left',
    marginBottom: '8px',
    borderBottom: `1px solid ${template.colors.borderColor}`,
    paddingBottom: '4px',
  }}>
    john@email.com | (555) 123-4567 | New York, NY
  </div>
  
  {/* Summary */}
  <div style={{ fontSize: '5px', color: template.colors.text, marginBottom: '6px', lineHeight: 1.3 }}>
    Experienced professional with a proven track record of delivering results...
  </div>
  
  {/* Experience */}
  <div style={{ fontSize: template.fonts.sizes.headings, color: template.colors.primary, fontWeight: 'bold', marginBottom: '2px' }}>
    EXPERIENCE
  </div>
  <div style={{ fontSize: '5px', color: template.colors.text, marginBottom: '2px' }}>
    <strong>Software Engineer</strong> | Tech Corp
  </div>
  <div style={{ fontSize: '4px', color: '#999', marginBottom: '3px' }}>
    2020 - Present
  </div>
  
  {/* Education */}
  <div style={{ fontSize: template.fonts.sizes.headings, color: template.colors.primary, fontWeight: 'bold', marginBottom: '2px' }}>
    EDUCATION
  </div>
  <div style={{ fontSize: '5px', color: template.colors.text, marginBottom: '2px' }}>
    B.Sc. Computer Science | MIT
  </div>
  <div style={{ fontSize: '4px', color: '#999', marginBottom: '6px' }}>
    2016 - 2020
  </div>
  
  {/* Skills */}
  <div style={{ fontSize: template.fonts.sizes.headings, color: template.colors.primary, fontWeight: 'bold', marginBottom: '2px' }}>
    SKILLS
  </div>
  <div style={{ fontSize: '4px', color: template.colors.text }}>
    JavaScript • React • Node.js • Python • SQL • AWS • Docker • Git
  </div>
</div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          {template.name}
        </h4>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {template.description}
        </p>
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
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${isSelected
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isSelected ? 'Selected' : 'Use Template'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateSelector;
