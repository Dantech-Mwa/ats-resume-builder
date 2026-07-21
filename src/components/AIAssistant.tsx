// ============================================
// AI ASSISTANT - Chat Component
// Rendered inside the "AI Resume Assistant" Modal in ResumeEditor.tsx
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSend, MdAutoAwesome, MdPerson } from 'react-icons/md';
import { useResume } from '../store';
import AIService from '../lib/ai';
import { AIChatMessage } from '../lib/types';

const STARTER_PROMPTS = [
  'How can I improve my summary?',
  'Make my experience section more impactful',
  'What keywords am I missing?',
  'Review my skills section',
];

const AIAssistant: React.FC = () => {
  const { currentResume } = useResume();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Build a compact text summary of the resume so the assistant has context,
  // mirroring the approach used in ResumeEditor's handleAnalyze.
  const buildResumeContext = (): string => {
    if (!currentResume) return '';
    const sections = currentResume.sections;
    let text = '';

    if (sections.contact?.fullName) {
      text += `${sections.contact.fullName}\n`;
    }
    if (sections.summary?.content) {
      text += `SUMMARY: ${sections.summary.content}\n\n`;
    }
    if (sections.experience?.length) {
      text += 'EXPERIENCE:\n';
      sections.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
        exp.achievements?.forEach(a => (text += `- ${a}\n`));
      });
      text += '\n';
    }
    if (sections.education?.length) {
      text += 'EDUCATION:\n';
      sections.education.forEach(edu => {
        text += `${edu.degree} - ${edu.institution}\n`;
      });
      text += '\n';
    }
    if (sections.skills) {
      const skills = [
        ...(sections.skills.technical || []).map((s: any) => s.name),
        ...(sections.skills.soft || []).map((s: any) => s.name),
        ...(sections.skills.tools || []).map((s: any) => s.name),
      ];
      if (skills.length) text += `SKILLS: ${skills.join(', ')}\n`;
    }

    return text;
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: AIChatMessage = {
      role: 'user',
      content: trimmed,
    } as AIChatMessage;

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiService = AIService.getInstance();
      const reply = await aiService.chat(nextMessages, buildResumeContext());

      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: reply,
      } as AIChatMessage;

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIChatMessage = {
        role: 'assistant',
        content: 'Sorry, I ran into an error while responding. Please try again.',
      } as AIChatMessage;
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <MdAutoAwesome className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Ask me anything about your resume</p>
              <p className="text-sm text-gray-500 mt-1">
                I can help you improve wording, add keywords, or tighten up your bullet points.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                }`}
              >
                {message.role === 'user' ? (
                  <MdPerson className="w-4 h-4 text-blue-600" />
                ) : (
                  <MdAutoAwesome className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <MdAutoAwesome className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          aria-label="Send"
        >
          <MdSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
