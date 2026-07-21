// ============================================
// AI ASSISTANT COMPONENT - Institutional Expert Level
// Real-time AI processing with actual OpenAI calls
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAutoAwesome,
  MdLightbulb,
  MdCheck,
  MdClose,
  MdSend,
  MdRefresh,
  MdExpandMore,
  MdExpandLess,
  MdContentCopy,
  MdAnalytics,
  MdSpellcheck,
  MdAutoFixHigh,
} from 'react-icons/md';
import { AIRecommendation, AIChatMessage } from '../lib/types';
import { useAI, useResume } from '../store';
import AIService from '../lib/ai';
import Loading from './Loading';
import toast from 'react-hot-toast';

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
    setAILoading,
  } = useAI();

  const { currentResume, updateSection, updateItem } = useResume();

  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (showChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showChat]);

  // Get resume context for AI
  const getResumeContext = useCallback((): string => {
    if (!currentResume) return '';
    
    const sections = currentResume.sections;
    let context = '';
    
    if (sections.contact.fullName) {
      context += `Name: ${sections.contact.fullName}\n`;
      context += `Email: ${sections.contact.email}\n`;
      context += `Phone: ${sections.contact.phone}\n`;
    }
    
    if (sections.summary?.content) {
      context += `\nProfessional Summary:\n${sections.summary.content}\n`;
    }
    
    if (sections.experience?.length) {
      context += `\nWork Experience (${sections.experience.length} positions):\n`;
      sections.experience.forEach((exp, i) => {
        context += `\nPosition ${i + 1}: ${exp.position} at ${exp.company}\n`;
        context += `Dates: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
        context += `Description: ${exp.description}\n`;
        if (exp.achievements?.length) {
          context += `Achievements:\n${exp.achievements.map(a => `- ${a}`).join('\n')}\n`;
        }
      });
    }
    
    if (sections.education?.length) {
      context += `\nEducation (${sections.education.length} entries):\n`;
      sections.education.forEach(edu => {
        context += `- ${edu.degree} from ${edu.institution}\n`;
      });
    }
    
    if (sections.skills) {
      const allSkills = [
        ...(sections.skills.technical || []).map(s => s.name),
        ...(sections.skills.soft || []).map(s => s.name),
        ...(sections.skills.tools || []).map(s => s.name),
      ];
      if (allSkills.length) {
        context += `\nSkills: ${allSkills.join(', ')}\n`;
      }
    }
    
    return context;
  }, [currentResume]);

  // Real AI chat handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setChatInput('');
    setIsProcessing(true);
    setActiveAction('chat');

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    addChatMessage({
      id: typingId,
      role: 'assistant',
      content: 'Analyzing your resume...',
      timestamp: new Date().toISOString(),
    });

    try {
      const aiService = AIService.getInstance();
      const resumeContext = getResumeContext();
      
      // Build conversation history
      const recentMessages = chatMessages.slice(-10).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));
      
      const response = await aiService.chat(
        [...recentMessages, userMessage],
        resumeContext
      );

      // Remove typing indicator
      dismissRecommendation(typingId);

      // Add real AI response
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });

      toast.success('AI response ready');
    } catch (error: any) {
      // Remove typing indicator
      dismissRecommendation(typingId);
      
      console.error('AI Chat Error:', error);
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your API key configuration.',
        timestamp: new Date().toISOString(),
      });
      
      toast.error('AI request failed');
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    setChatInput(action);
    setIsProcessing(true);
    setActiveAction(action);

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    addChatMessage({
      id: typingId,
      role: 'assistant',
      content: 'Processing your request...',
      timestamp: new Date().toISOString(),
    });

    try {
      const aiService = AIService.getInstance();
      const resumeContext = getResumeContext();
      
      let prompt = action;
      
      // Enhance prompts based on action type
      if (action.includes('summary')) {
        prompt = `Analyze my professional summary and suggest improvements. Make it ATS-friendly with strong keywords. Here's my current summary: ${currentResume?.sections.summary?.content || 'No summary yet'}. Provide a rewritten version.`;
      } else if (action.includes('bullet points')) {
        prompt = `Analyze all my work experience bullet points and suggest stronger, more impactful versions with quantifiable metrics and action verbs. My experience: ${getResumeContext()}`;
      } else if (action.includes('keywords')) {
        prompt = `Analyze my resume for missing ATS keywords and industry-specific terms. List the top missing keywords I should add. My resume: ${getResumeContext()}`;
      } else if (action.includes('ATS compatibility') || action.includes('score')) {
        prompt = `Analyze my resume for ATS compatibility. Identify formatting issues, missing sections, keyword gaps, and provide a score breakdown. My resume: ${getResumeContext()}`;
      }

      const response = await aiService.chat(
        [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
        resumeContext
      );

      // Remove typing indicator
      dismissRecommendation(typingId);

      // Process specific actions
      if (action.includes('summary') && response) {
        // Extract the suggested summary from response
        const summaryMatch = response.match(/(?:suggested|rewritten|improved)\s*(?:summary|version)?:?\s*["']?([^"']{100,})["']?/i);
        if (summaryMatch && currentResume) {
          updateSection('summary', { 
            content: summaryMatch[1].trim(),
            aiOptimized: true,
            lastModified: new Date().toISOString(),
          });
          toast.success('Summary updated with AI suggestions!');
        }
      }

      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });

      toast.success('Analysis complete');
    } catch (error: any) {
      dismissRecommendation(typingId);
      console.error('Quick action error:', error);
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString(),
      });
      toast.error('Request failed');
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle recommendation expansion
  const toggleExpand = (id: string) => {
    setExpandedRecs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Apply recommendation to resume
  const handleApplyRecommendation = (rec: AIRecommendation) => {
    if (!currentResume) return;
    
    applyRecommendation(rec.id);
    
    // Auto-apply to the actual resume section
    if (rec.section === 'summary' && rec.suggested) {
      updateSection('summary', {
        content: rec.suggested,
        aiOptimized: true,
        lastModified: new Date().toISOString(),
      });
    } else if (rec.section === 'experience' && rec.field === 'achievements') {
      // Find the experience entry and update
      const expIndex = currentResume.sections.experience.findIndex(
        e => e.achievements?.includes(rec.current)
      );
      if (expIndex >= 0 && rec.suggested) {
        const exp = currentResume.sections.experience[expIndex];
        const newAchievements = (exp.achievements || []).map(a =>
          a === rec.current ? rec.suggested : a
        );
        updateItem('experience', exp.id, { achievements: newAchievements });
      }
    }
    
    onApplyRecommendation?.(rec);
    toast.success('Recommendation applied!');
  };

  // Copy text to clipboard
  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
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

  // Quick action buttons
  const quickActions = [
    { label: 'Optimize Summary', icon: <MdAutoFixHigh />, action: 'Optimize my professional summary for ATS with strong keywords and metrics' },
    { label: 'Improve Bullets', icon: <MdAnalytics />, action: 'Rewrite my work experience bullet points to be more impactful with quantifiable results' },
    { label: 'Add Keywords', icon: <MdSpellcheck />, action: 'Analyze my resume and list missing ATS keywords for my industry' },
    { label: 'ATS Score', icon: <MdAutoAwesome />, action: 'Analyze my resume for ATS compatibility and give me a detailed score breakdown' },
  ];

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
                {recommendations.length} recommendations • {isProcessing ? 'Processing...' : 'Ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {chatMessages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <MdRefresh className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle chat"
              title="AI Chat"
            >
              <MdSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!showChat && (
        <div className="p-3 border-b border-gray-100 grid grid-cols-2 gap-2">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => {
                setShowChat(true);
                setTimeout(() => handleQuickAction(qa.action), 200);
              }}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && !showChat && (
        <div className="p-6">
          <Loading type="spinner" size="md" text="Analyzing your resume..." />
        </div>
      )}

      {/* Error State */}
      {error && !showChat && (
        <div className="p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm text-blue-600 hover:text-blue-700">
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
                    <span className="text-xs font-medium text-gray-500 capitalize">{rec.section}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    {rec.applied && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Applied</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">{rec.reason}</p>
                  
                  <button onClick={() => toggleExpand(rec.id)} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {expandedRecs.has(rec.id) ? (<>Show less <MdExpandLess className="w-3 h-3" /></>) : (<>Show details <MdExpandMore className="w-3 h-3" /></>)}
                  </button>

                  <AnimatePresence>
                    {expandedRecs.has(rec.id) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-2 overflow-hidden">
                        {rec.current && (
                          <div className="p-2 bg-red-50 rounded-lg relative group">
                            <p className="text-xs text-red-600 font-medium mb-1">Current:</p>
                            <p className="text-xs text-red-700 pr-6">{rec.current}</p>
                            <button onClick={() => handleCopyText(rec.current)} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MdContentCopy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {rec.suggested && (
                          <div className="p-2 bg-green-50 rounded-lg relative group">
                            <p className="text-xs text-green-600 font-medium mb-1">Suggested:</p>
                            <p className="text-xs text-green-700 pr-6">{rec.suggested}</p>
                            <button onClick={() => handleCopyText(rec.suggested)} className="absolute top-2 right-2 p-1 text-green-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MdContentCopy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!rec.applied && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleApplyRecommendation(rec)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" aria-label="Apply" title="Apply this recommendation">
                      <MdCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => dismissRecommendation(rec.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Dismiss">
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
          <p className="text-sm text-gray-500 mb-3">No recommendations yet</p>
          <p className="text-xs text-gray-400">Upload a resume or use quick actions above</p>
        </div>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ height: 0 }} animate={{ height: 400 }} exit={{ height: 0 }} className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <MdAutoAwesome className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Ask me anything about your resume</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map((qa, i) => (
                      <button key={i} onClick={() => handleQuickAction(qa.action)} disabled={isProcessing} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors disabled:opacity-50">
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.content === 'Analyzing your resume...' || msg.content === 'Processing your request...' ? (
                      <div className="flex items-center gap-2">
                        <Loading type="dots" size="sm" />
                        <span className="text-xs">{msg.content}</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.role === 'assistant' && msg.content.length > 100 && !msg.content.includes('...') && (
                      <button onClick={() => handleCopyText(msg.content)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        <MdContentCopy className="w-3 h-3" /> Copy
                      </button>
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
                  placeholder="Ask about your resume..."
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isProcessing}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isProcessing ? (
                    <Loading type="spinner" size="sm" />
                  ) : (
                    <MdSend className="w-4 h-4" />
                  )}
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
