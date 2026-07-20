// ============================================
// AI ASSISTANT COMPONENT - Recommendations Panel
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAutoAwesome,
  MdLightbulb,
  MdCheck,
  MdClose,
  MdSend,
  MdPerson,
  MdRefresh,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { AIRecommendation, AIChatMessage } from '../lib/types';
import { useAI } from '../store';
import Loading from './Loading';

interface AIAssistantProps {
  onApplyRecommendation?: (recommendation: AIRecommendation) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onApplyRecommendation }) => {
  const {
    recommendations,
    loading,
    error,
    chatMessages,
    applyRecommendation,
    dismissRecommendation,
    addChatMessage,
    clearChat,
  } = useAI();

  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (showChat) {
      inputRef.current?.focus();
    }
  }, [showChat]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(newMessage);
    setChatInput('');

    // Simulate AI response (in production, this would call the AI service)
    setTimeout(() => {
      const aiResponse: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I can help you optimize your resume. What specific section would you like to improve?',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Optimize my professional summary',
          'Improve my work experience bullet points',
          'Add missing keywords',
          'Check ATS compatibility',
        ],
      };
      addChatMessage(aiResponse);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRecs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecs(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return '➕';
      case 'removal': return '➖';
      case 'improvement': return '📈';
      case 'rewrite': return '✏️';
      default: return '💡';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MdAutoAwesome className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">
                {recommendations.length} recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle chat"
            >
              <MdSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6">
          <Loading type="spinner" size="md" text="Analyzing your resume..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Recommendations List */}
      {!loading && !error && recommendations.length > 0 && !showChat && (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 ${rec.applied ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{getTypeIcon(rec.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 capitalize">
                      {rec.section}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    {rec.applied && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Applied
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">{rec.reason}</p>
                  
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {expandedRecs.has(rec.id) ? (
                      <>Show less <MdExpandLess className="w-3 h-3" /></>
                    ) : (
                      <>Show details <MdExpandMore className="w-3 h-3" /></>
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedRecs.has(rec.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {rec.current && (
                          <div className="p-2 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600 font-medium mb-1">Current:</p>
                            <p className="text-xs text-red-700">{rec.current}</p>
                          </div>
                        )}
                        {rec.suggested && (
                          <div className="p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-medium mb-1">Suggested:</p>
                            <p className="text-xs text-green-700">{rec.suggested}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!rec.applied && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        applyRecommendation(rec.id);
                        onApplyRecommendation?.(rec);
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="Apply recommendation"
                    >
                      <MdCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => dismissRecommendation(rec.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Dismiss recommendation"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recommendations.length === 0 && !showChat && (
        <div className="p-6 text-center">
          <MdLightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No recommendations yet. Upload a resume to get started.
          </p>
        </div>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 400 }}
            exit={{ height: 0 }}
            className="flex flex-col"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setChatInput(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="text-xs px-2 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your resume..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  aria-label="Send message"
                >
                  <MdSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;