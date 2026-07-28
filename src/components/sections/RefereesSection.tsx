// Create: src/components/sections/RefereesSection.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAdd, MdDelete, MdEdit, MdExpandMore, MdExpandLess,
  MdPerson, MdEmail, MdPhone, MdBusiness, MdCheck,
  MdLocationOn, MdWork, MdVerified,
} from 'react-icons/md';
import { useResume } from '../../store';
import { Referee } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const defaultReferee = (): Referee => ({
  id: uuidv4(),
  fullName: '',
  title: '',
  organization: '',
  email: '',
  phone: '',
  relationship: '',
  location: '',
  linkedIn: '',
  notes: '',
  isVerified: false,
});

const RefereesSection: React.FC = () => {
  const { currentResume, addItem, updateItem, removeItem } = useResume();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const referees = currentResume?.sections.referees || [];

  const handleAdd = () => {
    const newReferee = defaultReferee();
    addItem('referees', newReferee);
    setExpandedId(newReferee.id);
    setEditingId(newReferee.id);
    toast.success('Referee added!');
  };

  const handleRemove = (id: string) => {
    removeItem('referees', id);
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
    toast.success('Referee removed');
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    updateItem('referees', id, { [field]: value });
  };

  const toggleVerify = (id: string, current: boolean) => {
    updateItem('referees', id, { isVerified: !current });
    toast.success(!current ? 'Referee verified!' : 'Verification removed');
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    return phone;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdPerson className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Referees</h3>
          <span className="text-sm text-gray-400">({referees.length})</span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <MdAdd className="w-4 h-4" />
          Add Referee
        </button>
      </div>

      {/* Referees List */}
      <AnimatePresence>
        {referees.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
          >
            <MdPerson className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No referees added yet</p>
            <p className="text-xs text-gray-400 mb-4">Add professional references to strengthen your application</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Add Your First Referee
            </button>
          </motion.div>
        ) : (
          referees.map((referee: Referee, index: number) => (
            <motion.div
              key={referee.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Referee Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === referee.id ? null : referee.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    referee.isVerified ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {referee.fullName ? referee.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {referee.fullName || 'New Referee'}
                      </p>
                      {referee.isVerified && (
                        <MdVerified className="w-4 h-4 text-green-500" title="Verified" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {[referee.title, referee.organization].filter(Boolean).join(' at ') || 'No details'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(referee.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove referee"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                  {expandedId === referee.id ? (
                    <MdExpandLess className="w-5 h-5 text-gray-400" />
                  ) : (
                    <MdExpandMore className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Referee Details */}
              <AnimatePresence>
                {expandedId === referee.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border-t border-gray-100 space-y-4 bg-gray-50/50">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                        <div className="relative">
                          <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={referee.fullName}
                            onChange={(e) => handleUpdate(referee.id, 'fullName', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Dr. Jane Smith"
                          />
                        </div>
                      </div>

                      {/* Title & Organization */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title/Position</label>
                          <div className="relative">
                            <MdWork className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={referee.title}
                              onChange={(e) => handleUpdate(referee.id, 'title', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Senior Manager"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
                          <div className="relative">
                            <MdBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={referee.organization}
                              onChange={(e) => handleUpdate(referee.id, 'organization', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Acme Corporation"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Relationship */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                        <select
                          value={referee.relationship}
                          onChange={(e) => handleUpdate(referee.id, 'relationship', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select relationship...</option>
                          <option value="Direct Manager">Direct Manager</option>
                          <option value="Senior Manager">Senior Manager</option>
                          <option value="Colleague">Colleague</option>
                          <option value="Client">Client</option>
                          <option value="Mentor">Mentor</option>
                          <option value="Professor">Professor/Supervisor</option>
                          <option value="Business Partner">Business Partner</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <div className="relative">
                            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              value={referee.email}
                              onChange={(e) => handleUpdate(referee.id, 'email', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="referee@example.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                          <div className="relative">
                            <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              value={referee.phone}
                              onChange={(e) => handleUpdate(referee.id, 'phone', formatPhone(e.target.value))}
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location & LinkedIn */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Location (Optional)</label>
                          <div className="relative">
                            <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={referee.location || ''}
                              onChange={(e) => handleUpdate(referee.id, 'location', e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nairobi, Kenya"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn (Optional)</label>
                          <input
                            type="url"
                            value={referee.linkedIn || ''}
                            onChange={(e) => handleUpdate(referee.id, 'linkedIn', e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="linkedin.com/in/..."
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                          value={referee.notes || ''}
                          onChange={(e) => handleUpdate(referee.id, 'notes', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Any additional notes about this reference..."
                        />
                      </div>

                      {/* Verify Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => toggleVerify(referee.id, referee.isVerified)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            referee.isVerified
                              ? 'text-green-700 bg-green-50 hover:bg-green-100'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <MdCheck className="w-4 h-4" />
                          {referee.isVerified ? 'Verified' : 'Mark as Verified'}
                        </button>
                        <span className="text-xs text-gray-400">
                          {referee.isVerified ? '✅ This referee has been confirmed' : '⚠️ Verification pending'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default RefereesSection;
