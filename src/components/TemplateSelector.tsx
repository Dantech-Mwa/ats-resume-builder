// src/components/TemplateSelector.tsx
// ============================================
// TEMPLATE SELECTOR COMPONENT - Premium Previews
// FIXED: Button conflict removed
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheck, MdStar, MdLock, MdClose, MdZoomIn } from 'react-icons/md';
import { TemplateConfig } from '../lib/types';
import { useTemplates } from '../store';
import TemplateEngine from '../lib/templates';
import Loading from './Loading';

interface TemplateSelectorProps {
  onSelect?: (templateId: string) => void;
}

// ============================================
// TEMPLATE SELECTOR COMPONENT
// ============================================

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const { selectedTemplate, availableTemplates, setSelectedTemplate, setAvailableTemplates } = useTemplates();
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState<TemplateConfig | null>(null);
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
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      
      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {fullscreenPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setFullscreenPreview(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">{fullscreenPreview.name} - Full Preview</h3>
                <button onClick={() => setFullscreenPreview(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-gray-100 flex justify-center items-start">
                <div className="shadow-xl bg-white w-full max-w-[620px] aspect-[8.5/11] overflow-hidden rounded-sm">
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ 
                      __html: templateEngine.generatePreviewHTML(fullscreenPreview.id, 1.8) 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {featuredTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <MdStar className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Top Picks for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                onFullscreen={() => setFullscreenPreview(template)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">All Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isHovered={hoveredTemplate === template.id}
              onSelect={() => handleSelect(template.id)}
              onHover={() => setHoveredTemplate(template.id)}
              onLeave={() => setHoveredTemplate(null)}
              onFullscreen={() => setFullscreenPreview(template)}
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
  onFullscreen: () => void;
  isRecommended?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  onFullscreen,
  isRecommended = false,
}) => {
  const templateEngine = TemplateEngine.getInstance();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md
        transition-all duration-300 flex flex-col
        ${isSelected 
          ? 'border-2 border-blue-600 shadow-2xl ring-2 ring-blue-600/20' 
          : 'border border-gray-200 hover:shadow-xl hover:border-blue-300'
        }
      `}
      onClick={onSelect}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
        {isRecommended && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <MdStar className="w-3 h-3" /> Recommended
          </span>
        )}
        {template.isPremium && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <MdLock className="w-3 h-3" /> Premium
          </span>
        )}
      </div>

      {/* Selection Checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/80">
          <MdCheck className="w-5 h-5 text-white" />
        </div>
      )}

      {/* The Mockup Container */}
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-50 p-4">
        <div className="w-full h-full shadow-sm bg-white rounded-sm overflow-hidden">
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ 
              __html: templateEngine.generatePreviewHTML(template.id, 1) 
            }}
          />
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900 leading-tight">{template.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1 gap-2 flex-wrap">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">ATS Score</span>
            <span className={`text-lg font-bold ${
              template.atsCompatibility >= 95 ? 'text-green-600' :
              template.atsCompatibility >= 90 ? 'text-yellow-600' : 'text-orange-600'
            }`}>
              {template.atsCompatibility}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* FIXED: Preview Button is here, safe from conflict */}
            <button
              onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1 shadow-sm"
            >
              <MdZoomIn className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${
                isSelected 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
              }`}
            >
              {isSelected ? 'Selected' : 'Use Template'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateSelector;
