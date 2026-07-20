// ============================================
// DYNAMIC SECTION COMPONENT - Handles ALL Sections
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdExpandMore,
  MdExpandLess,
  MdDragHandle,
  MdCheck,
  MdClose,
} from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { useResume } from '../store';
import { getDefaultExperience, getDefaultEducation, getDefaultSkill } from '../lib/utils';

interface DynamicSectionProps {
  sectionType: string;
  title: string;
  icon?: string;
  required?: boolean;
}

const DynamicSection: React.FC<DynamicSectionProps> = ({
  sectionType,
  title,
  icon = '📄',
  required = false,
}) => {
  const { currentResume, updateSection, addItem, updateItem, removeItem } = useResume();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);

  if (!currentResume) return null;

  const sectionData = currentResume.sections[sectionType as keyof typeof currentResume.sections];

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

 const handleAdd = () => {
  let newItem: any = { id: uuidv4() };

  switch (sectionType) {
    case 'experience':
      newItem = getDefaultExperience();
      break;
    case 'education':
      newItem = getDefaultEducation();
      break;
    case 'skills':
      newItem = getDefaultSkill();
      break;
    default:
      newItem = { id: uuidv4(), name: '' };
  }

  addItem(sectionType as any, newItem);
  setEditingItem(newItem.id);
  
  // FIX: Convert Set to Array first
  const newSet = new Set<string>();
  expandedItems.forEach(item => newSet.add(item));
  newSet.add(newItem.id);
  setExpandedItems(newSet);
};

  const handleRemove = (id: string) => {
    removeItem(sectionType as any, id);
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // For non-array sections (contact, summary)
  // For non-array sections (contact, summary)
if (!Array.isArray(sectionData)) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {required && (
          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
        )}
      </div>
      
      {sectionType === 'contact' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={(sectionData as any).fullName || ''}
            onChange={(e) => updateSection('contact', { fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={(sectionData as any).email || ''}
              onChange={(e) => updateSection('contact', { email: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={(sectionData as any).phone || ''}
              onChange={(e) => updateSection('contact', { phone: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Location"
            value={(sectionData as any).location || ''}
            onChange={(e) => updateSection('contact', { location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={(sectionData as any).linkedIn || ''}
              onChange={(e) => updateSection('contact', { linkedIn: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="url"
              placeholder="GitHub URL"
              value={(sectionData as any).github || ''}
              onChange={(e) => updateSection('contact', { github: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {sectionType === 'summary' && (
        <textarea
          placeholder="Write a compelling professional summary..."
          value={(sectionData as any).content || ''}
          onChange={(e) => updateSection('summary', { content: e.target.value })}
          rows={5}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      )}
    </div>
  );
}

  // For array sections (experience, education, etc.)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {required && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
          )}
          <span className="text-sm text-gray-400">({sectionData.length})</span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <MdAdd className="w-4 h-4" />
          Add {title}
        </button>
      </div>

      <AnimatePresence>
        {sectionData.map((item: any, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Item Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-center gap-3">
                <MdDragHandle className="w-5 h-5 text-gray-400 cursor-grab" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.position || item.degree || item.name || `${title} ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.company || item.institution || item.issuer || 'No details'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete item"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
                {expandedItems.has(item.id) ? (
                  <MdExpandLess className="w-5 h-5 text-gray-400" />
                ) : (
                  <MdExpandMore className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Item Content */}
            <AnimatePresence>
              {expandedItems.has(item.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-t border-gray-100 space-y-4">
                    {/* Experience Fields */}
                    {sectionType === 'experience' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                            <input
                              type="text"
                              value={item.position || ''}
                              onChange={(e) => updateItem('experience' as any, item.id, { position: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                            <input
                              type="text"
                              value={item.company || ''}
                              onChange={(e) => updateItem('experience' as any, item.id, { company: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Google"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="text"
                              value={item.startDate || ''}
                              onChange={(e) => updateItem('experience' as any, item.id, { startDate: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Jan 2020"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={item.endDate || ''}
                              onChange={(e) => updateItem('experience' as any, item.id, { endDate: e.target.value })}
                              disabled={item.current}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                              placeholder="Present"
                            />
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.current || false}
                                onChange={(e) => updateItem('experience' as any, item.id, { 
                                  current: e.target.checked,
                                  endDate: e.target.checked ? '' : item.endDate 
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-700">Current</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => updateItem('experience' as any, item.id, { description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Describe your role and responsibilities..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Achievements</label>
                          {(item.achievements || ['']).map((achievement: string, i: number) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => {
                                  const newAchievements = [...(item.achievements || [])];
                                  newAchievements[i] = e.target.value;
                                  updateItem('experience' as any, item.id, { achievements: newAchievements });
                                }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="• Add an achievement..."
                              />
                              <button
                                onClick={() => {
                                  const newAchievements = (item.achievements || []).filter((_: string, j: number) => j !== i);
                                  updateItem('experience' as any, item.id, { achievements: newAchievements });
                                }}
                                className="p-2 text-gray-400 hover:text-red-500"
                              >
                                <MdClose className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newAchievements = [...(item.achievements || []), ''];
                              updateItem('experience' as any, item.id, { achievements: newAchievements });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            + Add achievement
                          </button>
                        </div>
                      </>
                    )}

                    {/* Education Fields */}
                    {sectionType === 'education' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
                            <input
                              type="text"
                              value={item.degree || ''}
                              onChange={(e) => updateItem('education' as any, item.id, { degree: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Bachelor of Science"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Field of Study</label>
                            <input
                              type="text"
                              value={item.field || ''}
                              onChange={(e) => updateItem('education' as any, item.id, { field: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Computer Science"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={item.institution || ''}
                            onChange={(e) => updateItem('education' as any, item.id, { institution: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., MIT"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="text"
                              value={item.startDate || ''}
                              onChange={(e) => updateItem('education' as any, item.id, { startDate: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Sep 2018"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={item.endDate || ''}
                              onChange={(e) => updateItem('education' as any, item.id, { endDate: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="May 2022"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">GPA</label>
                            <input
                              type="text"
                              value={item.gpa || ''}
                              onChange={(e) => updateItem('education' as any, item.id, { gpa: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="3.8"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Skills Fields */}
                    {sectionType === 'skills' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Skill Name</label>
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => updateItem('skills' as any, item.id, { name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., React"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                          <select
                            value={item.level || 'Intermediate'}
                            onChange={(e) => updateItem('skills' as any, item.id, { level: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Generic Fields for other sections */}
                    {!['experience', 'education', 'skills'].includes(sectionType) && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => updateItem(sectionType as any, item.id, { name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter name..."
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {sectionData.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-500">
            No {title.toLowerCase()} added yet. Click the button above to add one.
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicSection;