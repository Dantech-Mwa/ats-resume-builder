// ============================================
// DYNAMIC SECTION COMPONENT - Bullet-Ready Descriptions
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAdd, MdDelete, MdExpandMore, MdExpandLess,
  MdDragHandle, MdClose,
} from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { useResume } from '../store';
import RefereesSection from './sections/RefereesSection';
import { getDefaultExperience, getDefaultEducation, getDefaultSkill } from '../lib/utils';

// ============================================
// LOCAL INPUT - No focus loss
// ============================================
const LocalInput: React.FC<{
  value: string; onChange: (value: string) => void;
  placeholder?: string; type?: string; className?: string; disabled?: boolean;
}> = ({ value, onChange, placeholder, type = 'text', className, disabled }) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setLocal(value); }, [value]);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 200);
  };
  return <input type={type} value={local} onChange={handle} placeholder={placeholder} className={className} disabled={disabled} />;
};

// ============================================
// BULLET-READY TEXTAREA - Enter creates new bullet
// ============================================
const BulletTextarea: React.FC<{
  value: string; onChange: (value: string) => void;
  placeholder?: string; rows?: number; className?: string;
}> = ({ value, onChange, placeholder, rows = 4, className }) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value; setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const val = ta.value;
      
      // Find start of current line
      const beforeCursor = val.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentLine = val.substring(lastNewline + 1, start);
      
      // If current line is empty with a bullet, remove the bullet and break out
      if (currentLine.trim() === '•' || currentLine.trim() === '') {
        // Remove the empty bullet line
        const newVal = val.substring(0, lastNewline + 1) + '\n' + val.substring(start);
        setLocal(newVal);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(newVal), 200);
        setTimeout(() => {
          if (textRef.current) {
            const newPos = lastNewline + 2;
            textRef.current.selectionStart = textRef.current.selectionEnd = newPos;
          }
        }, 0);
        return;
      }
      
      // Insert new bullet point
      const newVal = val.substring(0, start) + '\n• ' + val.substring(start);
      setLocal(newVal);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(newVal), 200);
      
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.selectionStart = textRef.current.selectionEnd = start + 3;
        }
      }, 0);
    }
    
    // Backspace on empty bullet line removes it
    if (e.key === 'Backspace') {
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const val = ta.value;
      const beforeCursor = val.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentLine = val.substring(lastNewline + 1, start);
      
      if (currentLine.trim() === '•' && start === lastNewline + 3) {
        e.preventDefault();
        const newVal = val.substring(0, lastNewline) + val.substring(start);
        setLocal(newVal);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(newVal), 200);
        setTimeout(() => {
          if (textRef.current) {
            textRef.current.selectionStart = textRef.current.selectionEnd = lastNewline;
          }
        }, 0);
      }
    }
  };

  return (
    <textarea
      ref={textRef}
      value={local}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || 'Describe responsibilities and achievements...\nPress Enter for new bullet point'}
      rows={rows}
      className={className}
    />
  );
};

// ============================================
// SIMPLE TEXTAREA - No bullet behavior
// ============================================
const LocalTextarea: React.FC<{
  value: string; onChange: (value: string) => void;
  placeholder?: string; rows?: number; className?: string;
}> = ({ value, onChange, placeholder, rows = 3, className }) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setLocal(value); }, [value]);
  const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value; setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 200);
  };
  return <textarea value={local} onChange={handle} placeholder={placeholder} rows={rows} className={className} />;
};

// ============================================
// MAIN COMPONENT
// ============================================
interface DynamicSectionProps {
  sectionType: string; title: string; icon?: string; required?: boolean;
}

const DynamicSection: React.FC<DynamicSectionProps> = ({
  sectionType, title, icon = '📄', required = false,
}) => {
  const { currentResume, updateSection, addItem, updateItem, removeItem } = useResume();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  if (!currentResume) return null;

  if (sectionType === 'referees') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
        </div>
        <RefereesSection />
      </div>
    );
  }

  const sectionData = currentResume.sections[sectionType as keyof typeof currentResume.sections];

  const toggleExpand = (id: string) => setExpandedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleAdd = () => {
    let newItem: any = { id: uuidv4() };
    if (sectionType === 'experience') newItem = getDefaultExperience();
    else if (sectionType === 'education') newItem = getDefaultEducation();
    else if (sectionType === 'skills') newItem = getDefaultSkill();
    else newItem = { id: uuidv4(), name: '' };
    addItem(sectionType as any, newItem);
    setExpandedItems(prev => new Set([...prev, newItem.id]));
  };

  const handleRemove = (id: string) => {
    removeItem(sectionType as any, id);
    setExpandedItems(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  // ============================================
  // NON-ARRAY (contact, summary)
  // ============================================
  if (!Array.isArray(sectionData)) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
        </div>
        {sectionType === 'contact' && (
          <div className="space-y-4">
            <LocalInput placeholder="Full Name" value={(sectionData as any).fullName || ''} onChange={v => updateSection('contact', { fullName: v })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <div className="grid grid-cols-2 gap-4">
              <LocalInput type="email" placeholder="Email" value={(sectionData as any).email || ''} onChange={v => updateSection('contact', { email: v })} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <LocalInput type="tel" placeholder="Phone" value={(sectionData as any).phone || ''} onChange={v => updateSection('contact', { phone: v })} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <LocalInput placeholder="Location" value={(sectionData as any).location || ''} onChange={v => updateSection('contact', { location: v })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <div className="grid grid-cols-2 gap-4">
              <LocalInput type="url" placeholder="LinkedIn URL" value={(sectionData as any).linkedIn || ''} onChange={v => updateSection('contact', { linkedIn: v })} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <LocalInput type="url" placeholder="GitHub URL" value={(sectionData as any).github || ''} onChange={v => updateSection('contact', { github: v })} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        )}
        {sectionType === 'summary' && (
          <BulletTextarea placeholder="Write a compelling professional summary..." value={(sectionData as any).content || ''} onChange={v => updateSection('summary', { content: v })} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        )}
      </div>
    );
  }

  // ============================================
  // ARRAY SECTIONS
  // ============================================
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
          <span className="text-sm text-gray-400">({sectionData.length})</span>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <MdAdd className="w-4 h-4" /> Add {title}
        </button>
      </div>
      <AnimatePresence>
        {sectionData.map((item: any, index: number) => (
          <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(item.id)}>
              <div className="flex items-center gap-3">
                <MdDragHandle className="w-5 h-5 text-gray-400 cursor-grab" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.position || item.degree || item.name || `${title} ${index + 1}`}</p>
                  <p className="text-xs text-gray-500">{item.company || item.institution || item.issuer || 'No details'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><MdDelete className="w-4 h-4" /></button>
                {expandedItems.has(item.id) ? <MdExpandLess className="w-5 h-5 text-gray-400" /> : <MdExpandMore className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
            <AnimatePresence>
              {expandedItems.has(item.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-4 border-t border-gray-100 space-y-4">

                    {/* EXPERIENCE */}
                    {sectionType === 'experience' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Position</label><LocalInput value={item.position || ''} onChange={v => updateItem('experience' as any, item.id, { position: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Software Engineer" /></div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Company</label><LocalInput value={item.company || ''} onChange={v => updateItem('experience' as any, item.id, { company: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Google" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label><LocalInput value={item.startDate || ''} onChange={v => updateItem('experience' as any, item.id, { startDate: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Jan 2020" /></div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">End Date</label><LocalInput value={item.endDate || ''} onChange={v => updateItem('experience' as any, item.id, { endDate: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400" placeholder="Present" disabled={item.current} /></div>
                          <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={item.current || false} onChange={e => updateItem('experience' as any, item.id, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-xs text-gray-700">Current</span></label></div>
                        </div>
                        {/* 🔥 BULLET-READY DESCRIPTION */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Roles & Responsibilities
                          </label>
                          <BulletTextarea
                            value={item.description || ''}
                            onChange={v => updateItem('experience' as any, item.id, { description: v })}
                            rows={5}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="• Designed and executed comprehensive MERL frameworks&#10;• Developed and deployed interactive MMIS dashboards&#10;• Spearheaded data quality assurance initiatives&#10;&#10;Press Enter for a new bullet point"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Key Achievements</label>
                          {(item.achievements || ['']).map((achievement: string, i: number) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <LocalInput value={achievement} onChange={v => { const a = [...(item.achievements || [])]; a[i] = v; updateItem('experience' as any, item.id, { achievements: a }); }} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="• Add an achievement..." />
                              <button onClick={() => { const a = (item.achievements || []).filter((_: string, j: number) => j !== i); updateItem('experience' as any, item.id, { achievements: a }); }} className="p-2 text-gray-400 hover:text-red-500"><MdClose className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => { const a = [...(item.achievements || []), '']; updateItem('experience' as any, item.id, { achievements: a }); }} className="text-xs text-blue-600 hover:text-blue-700">+ Add achievement</button>
                        </div>
                      </>
                    )}

                    {/* EDUCATION */}
                    {sectionType === 'education' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Degree</label><LocalInput value={item.degree || ''} onChange={v => updateItem('education' as any, item.id, { degree: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Bachelor of Science" /></div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Field of Study</label><LocalInput value={item.field || ''} onChange={v => updateItem('education' as any, item.id, { field: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Computer Science" /></div>
                        </div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Institution</label><LocalInput value={item.institution || ''} onChange={v => updateItem('education' as any, item.id, { institution: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., MIT" /></div>
                        <div className="grid grid-cols-3 gap-4">
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label><LocalInput value={item.startDate || ''} onChange={v => updateItem('education' as any, item.id, { startDate: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Sep 2018" /></div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">End Date</label><LocalInput value={item.endDate || ''} onChange={v => updateItem('education' as any, item.id, { endDate: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="May 2022" /></div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">GPA</label><LocalInput value={item.gpa || ''} onChange={v => updateItem('education' as any, item.id, { gpa: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="3.8" /></div>
                        </div>
                      </>
                    )}

                    {/* SKILLS */}
                    {sectionType === 'skills' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Skill Name</label><LocalInput value={item.name || ''} onChange={v => updateItem('skills' as any, item.id, { name: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., React" /></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Level</label><select value={item.level || 'Intermediate'} onChange={e => updateItem('skills' as any, item.id, { level: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></div>
                      </div>
                    )}

                    {/* GENERIC */}
                    {!['experience', 'education', 'skills', 'referees'].includes(sectionType) && (
                      <div><label className="block text-xs font-medium text-gray-700 mb-1">Name</label><LocalInput value={item.name || ''} onChange={v => updateItem(sectionType as any, item.id, { name: v })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter name..." /></div>
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
          <p className="text-sm text-gray-500">No {title.toLowerCase()} added yet. Click the button above to add one.</p>
        </div>
      )}
    </div>
  );
};

export default DynamicSection;
