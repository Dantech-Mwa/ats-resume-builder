// ============================================
// ZUSTAND STORE - Complete State Management (FIXED)
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  User,
  ResumeData,
  ResumeSections,
  ATSScore,
  AIRecommendation,
  TemplateConfig,
  UIState,
  Notification,
  Toast,
  Subscription,
  PaymentDetails,
  ExportConfig,
  AIChatMessage,
  ResumeMetadata,
} from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// STORE INTERFACES
// ============================================

interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  currentResume: ResumeData | null;
  savedResumes: ResumeMetadata[];
  resumeLoading: boolean;
  resumeError: string | null;
  isDirty: boolean;
  selectedTemplate: string;
  availableTemplates: TemplateConfig[];
  atsScore: ATSScore | null;
  aiRecommendations: AIRecommendation[];
  aiLoading: boolean;
  aiError: string | null;
  chatMessages: AIChatMessage[];
  jobDescription: string;
  ui: UIState;
  paymentLoading: boolean;
  paymentError: string | null;
  paymentHistory: PaymentDetails[];
  exportLoading: boolean;
  exportError: string | null;
  lastExportConfig: ExportConfig | null;
  undoStack: ResumeData[];
  redoStack: ResumeData[];
  maxUndoSteps: number;

  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updateSubscription: (subscription: Subscription) => void;

  setCurrentResume: (resume: ResumeData) => void;
  createNewResume: (title?: string) => void;
  updateSection: (section: keyof ResumeSections, data: any) => void;
  addItem: (section: keyof ResumeSections, item: any) => void;
  updateItem: (section: keyof ResumeSections, id: string, updates: any) => void;
  removeItem: (section: keyof ResumeSections, id: string) => void;
  reorderItems: (section: keyof ResumeSections, fromIndex: number, toIndex: number) => void;
  saveResume: () => void;
  loadResume: (resumeId: string) => void;
  deleteResume: (resumeId: string) => void;
  setResumeLoading: (loading: boolean) => void;
  setResumeError: (error: string | null) => void;
  setDirty: (dirty: boolean) => void;

  setSelectedTemplate: (templateId: string) => void;
  setAvailableTemplates: (templates: TemplateConfig[]) => void;

  setATSScore: (score: ATSScore | null) => void;
  setAIRecommendations: (recommendations: AIRecommendation[]) => void;
  applyRecommendation: (recommendationId: string) => void;
  dismissRecommendation: (recommendationId: string) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  addChatMessage: (message: AIChatMessage) => void;
  clearChat: () => void;
  setJobDescription: (description: string) => void;

  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;

  setPaymentLoading: (loading: boolean) => void;
  setPaymentError: (error: string | null) => void;
  addPaymentToHistory: (payment: PaymentDetails) => void;
  setPaymentHistory: (history: PaymentDetails[]) => void;

  setExportLoading: (loading: boolean) => void;
  setExportError: (error: string | null) => void;
  setLastExportConfig: (config: ExportConfig) => void;

  undo: () => void;
  redo: () => void;
  pushUndoState: () => void;
  clearHistory: () => void;

  resetStore: () => void;
  getResumeText: () => string;
}

// ============================================
// INITIAL STATE
// ============================================

const initialResumeData = (title?: string): ResumeData => ({
  metadata: {
    id: uuidv4(),
    userId: '',
    title: title || 'Untitled Resume',
    templateId: 'modern',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    isPublic: false,
    tags: [],
    completeness: 10,
  },
  sections: {
    contact: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      country: '',
    },
    summary: {
      content: '',
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
      other: [],
    },
    certifications: [],
    projects: [],
    languages: [],
    volunteer: [],
    publications: [],
    awards: [],
    customSections: [],
  },
  atsScore: null,
  aiRecommendations: [],
});

const initialUIState: UIState = {
  sidebarOpen: true,
  modalOpen: null,
  theme: 'light',
  language: 'en',
  notifications: [],
  toasts: [],
  loading: {
    global: false,
    ai: false,
    upload: false,
    export: false,
  },
};

// ============================================
// STORE CREATION
// ============================================

const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,

      currentResume: null,
      savedResumes: [],
      resumeLoading: false,
      resumeError: null,
      isDirty: false,

      selectedTemplate: 'modern',
      availableTemplates: [],

      atsScore: null,
      aiRecommendations: [],
      aiLoading: false,
      aiError: null,
      chatMessages: [],
      jobDescription: '',

      ui: initialUIState,

      paymentLoading: false,
      paymentError: null,
      paymentHistory: [],

      exportLoading: false,
      exportError: null,
      lastExportConfig: null,

      undoStack: [],
      redoStack: [],
      maxUndoSteps: 50,

      // ============================================
      // AUTH ACTIONS
      // ============================================

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthLoading: (loading) => set({ authLoading: loading }),
      setAuthError: (error) => set({ authError: error }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          authError: null,
          authLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentResume: null,
          savedResumes: [],
          atsScore: null,
          aiRecommendations: [],
          chatMessages: [],
          paymentHistory: [],
          undoStack: [],
          redoStack: [],
          isDirty: false,
        }),

      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateSubscription: (subscription) =>
        set((state) => ({
          user: state.user ? { ...state.user, subscription } : null,
        })),

      // ============================================
      // RESUME ACTIONS
      // ============================================

      setCurrentResume: (resume) =>
        set({
          currentResume: resume,
          selectedTemplate: resume.metadata.templateId,
          isDirty: false,
        }),

      createNewResume: (title) => {
        const newResume = initialResumeData(title);
        set({
          currentResume: newResume,
          selectedTemplate: 'modern',
          isDirty: false,
          undoStack: [],
          redoStack: [],
        });
      },

      updateSection: (section, data) =>
        set((state) => {
          if (!state.currentResume) return state;

          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) {
            newUndoStack.shift();
          }

          return {
            currentResume: {
              ...state.currentResume,
              sections: {
                ...state.currentResume.sections,
                [section]: {
                  ...(state.currentResume.sections[section] as any),
                  ...data,
                },
              },
              metadata: {
                ...state.currentResume.metadata,
                updatedAt: new Date().toISOString(),
                version: state.currentResume.metadata.version + 1,
              },
            },
            isDirty: true,
            undoStack: newUndoStack,
            redoStack: [],
          };
        }),

      addItem: (section, item) =>
        set((state) => {
          if (!state.currentResume) return state;

          const sectionData = state.currentResume.sections[section];
          if (!Array.isArray(sectionData)) return state;

          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) {
            newUndoStack.shift();
          }

          const newData = [...(sectionData as any[]), { ...item, id: item.id || uuidv4() }];

          return {
            currentResume: {
              ...state.currentResume,
              sections: {
                ...state.currentResume.sections,
                [section]: newData as any,
              },
              metadata: {
                ...state.currentResume.metadata,
                updatedAt: new Date().toISOString(),
                version: state.currentResume.metadata.version + 1,
              },
            },
            isDirty: true,
            undoStack: newUndoStack,
            redoStack: [],
          };
        }),

      updateItem: (section, id, updates) =>
        set((state) => {
          if (!state.currentResume) return state;

          const sectionData = state.currentResume.sections[section];
          if (!Array.isArray(sectionData)) return state;

          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) {
            newUndoStack.shift();
          }

          const updatedData = (sectionData as any[]).map((item: any) =>
            item.id === id ? { ...item, ...updates } : item
          );

          return {
            currentResume: {
              ...state.currentResume,
              sections: {
                ...state.currentResume.sections,
                [section]: updatedData as any,
              },
              metadata: {
                ...state.currentResume.metadata,
                updatedAt: new Date().toISOString(),
                version: state.currentResume.metadata.version + 1,
              },
            },
            isDirty: true,
            undoStack: newUndoStack,
            redoStack: [],
          };
        }),

      removeItem: (section, id) =>
        set((state) => {
          if (!state.currentResume) return state;

          const sectionData = state.currentResume.sections[section];
          if (!Array.isArray(sectionData)) return state;

          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) {
            newUndoStack.shift();
          }

          const filteredData = (sectionData as any[]).filter((item: any) => item.id !== id);

          return {
            currentResume: {
              ...state.currentResume,
              sections: {
                ...state.currentResume.sections,
                [section]: filteredData as any,
              },
              metadata: {
                ...state.currentResume.metadata,
                updatedAt: new Date().toISOString(),
                version: state.currentResume.metadata.version + 1,
              },
            },
            isDirty: true,
            undoStack: newUndoStack,
            redoStack: [],
          };
        }),

      reorderItems: (section, fromIndex, toIndex) =>
        set((state) => {
          if (!state.currentResume) return state;

          const sectionData = state.currentResume.sections[section];
          if (!Array.isArray(sectionData)) return state;

          const newArray = [...(sectionData as any[])];
          const [movedItem] = newArray.splice(fromIndex, 1);
          newArray.splice(toIndex, 0, movedItem);

          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) {
            newUndoStack.shift();
          }

          return {
            currentResume: {
              ...state.currentResume,
              sections: {
                ...state.currentResume.sections,
                [section]: newArray as any,
              },
              metadata: {
                ...state.currentResume.metadata,
                updatedAt: new Date().toISOString(),
                version: state.currentResume.metadata.version + 1,
              },
            },
            isDirty: true,
            undoStack: newUndoStack,
            redoStack: [],
          };
        }),

      saveResume: () =>
        set((state) => {
          if (!state.currentResume) return state;

          const updatedResume = {
            ...state.currentResume,
            metadata: {
              ...state.currentResume.metadata,
              updatedAt: new Date().toISOString(),
            },
          };

          const savedResumes = state.savedResumes.some(
            (r) => r.id === updatedResume.metadata.id
          )
            ? state.savedResumes.map((r) =>
                r.id === updatedResume.metadata.id ? updatedResume.metadata : r
              )
            : [...state.savedResumes, updatedResume.metadata];

          return {
            currentResume: updatedResume,
            savedResumes,
            isDirty: false,
          };
        }),

      loadResume: () =>
        set({
          resumeLoading: false,
          isDirty: false,
        }),

      deleteResume: (resumeId) =>
        set((state) => ({
          savedResumes: state.savedResumes.filter((r) => r.id !== resumeId),
          currentResume:
            state.currentResume?.metadata.id === resumeId ? null : state.currentResume,
        })),

      setResumeLoading: (loading) => set({ resumeLoading: loading }),
      setResumeError: (error) => set({ resumeError: error }),
      setDirty: (dirty) => set({ isDirty: dirty }),

      // ============================================
      // TEMPLATE ACTIONS
      // ============================================

      setSelectedTemplate: (templateId) =>
        set((state) => ({
          selectedTemplate: templateId,
          currentResume: state.currentResume
            ? {
                ...state.currentResume,
                metadata: {
                  ...state.currentResume.metadata,
                  templateId,
                  updatedAt: new Date().toISOString(),
                },
              }
            : null,
          isDirty: true,
        })),

      setAvailableTemplates: (templates) => set({ availableTemplates: templates }),

      // ============================================
      // AI ACTIONS
      // ============================================

      setATSScore: (score) =>
        set((state) => ({
          atsScore: score,
          currentResume: state.currentResume
            ? { ...state.currentResume, atsScore: score }
            : null,
        })),

      setAIRecommendations: (recommendations) =>
        set((state) => ({
          aiRecommendations: recommendations,
          currentResume: state.currentResume
            ? { ...state.currentResume, aiRecommendations: recommendations }
            : null,
        })),

      applyRecommendation: (recommendationId) =>
        set((state) => ({
          aiRecommendations: state.aiRecommendations.map((rec) =>
            rec.id === recommendationId ? { ...rec, applied: true } : rec
          ),
        })),

      dismissRecommendation: (recommendationId) =>
        set((state) => ({
          aiRecommendations: state.aiRecommendations.filter((rec) => rec.id !== recommendationId),
        })),

      setAILoading: (loading) =>
        set((state) => ({
          aiLoading: loading,
          ui: { ...state.ui, loading: { ...state.ui.loading, ai: loading } },
        })),

      setAIError: (error) => set({ aiError: error }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      clearChat: () => set({ chatMessages: [] }),

      setJobDescription: (description) => set({ jobDescription: description }),

      // ============================================
      // UI ACTIONS
      // ============================================

      toggleSidebar: () =>
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
        })),

      openModal: (modalId) =>
        set((state) => ({
          ui: { ...state.ui, modalOpen: modalId },
        })),

      closeModal: () =>
        set((state) => ({
          ui: { ...state.ui, modalOpen: null },
        })),

      setTheme: (theme) =>
        set((state) => ({
          ui: { ...state.ui, theme },
        })),

      addNotification: (notification) =>
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [
              { ...notification, id: uuidv4(), read: false, createdAt: new Date().toISOString() },
              ...state.ui.notifications,
            ].slice(0, 50),
          },
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          },
        })),

      clearNotifications: () =>
        set((state) => ({
          ui: { ...state.ui, notifications: [] },
        })),

      addToast: (toast) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toasts: [...state.ui.toasts, { ...toast, id: uuidv4() }],
          },
        })),

      removeToast: (id) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toasts: state.ui.toasts.filter((t) => t.id !== id),
          },
        })),

      setGlobalLoading: (loading) =>
        set((state) => ({
          ui: { ...state.ui, loading: { ...state.ui.loading, global: loading } },
        })),

      // ============================================
      // PAYMENT ACTIONS
      // ============================================

      setPaymentLoading: (loading) => set({ paymentLoading: loading }),
      setPaymentError: (error) => set({ paymentError: error }),

      addPaymentToHistory: (payment) =>
        set((state) => ({
          paymentHistory: [payment, ...state.paymentHistory],
        })),

      setPaymentHistory: (history) => set({ paymentHistory: history }),

      // ============================================
      // EXPORT ACTIONS
      // ============================================

      setExportLoading: (loading) =>
        set((state) => ({
          exportLoading: loading,
          ui: { ...state.ui, loading: { ...state.ui.loading, export: loading } },
        })),

      setExportError: (error) => set({ exportError: error }),
      setLastExportConfig: (config) => set({ lastExportConfig: config }),

      // ============================================
      // UNDO/REDO ACTIONS
      // ============================================

      undo: () =>
        set((state) => {
          if (state.undoStack.length === 0 || !state.currentResume) return state;
          const previousState = state.undoStack[state.undoStack.length - 1];
          const newUndoStack = state.undoStack.slice(0, -1);
          return {
            currentResume: previousState,
            undoStack: newUndoStack,
            redoStack: [...state.redoStack, state.currentResume],
            isDirty: true,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.redoStack.length === 0 || !state.currentResume) return state;
          const nextState = state.redoStack[state.redoStack.length - 1];
          const newRedoStack = state.redoStack.slice(0, -1);
          return {
            currentResume: nextState,
            undoStack: [...state.undoStack, state.currentResume],
            redoStack: newRedoStack,
            isDirty: true,
          };
        }),

      pushUndoState: () =>
        set((state) => {
          if (!state.currentResume) return state;
          const newUndoStack = [...state.undoStack, { ...state.currentResume }];
          if (newUndoStack.length > state.maxUndoSteps) newUndoStack.shift();
          return { undoStack: newUndoStack, redoStack: [] };
        }),

      clearHistory: () => set({ undoStack: [], redoStack: [] }),

      // ============================================
      // UTILITY ACTIONS
      // ============================================

      resetStore: () =>
        set({
          user: null,
          isAuthenticated: false,
          authLoading: false,
          authError: null,
          currentResume: null,
          savedResumes: [],
          resumeLoading: false,
          resumeError: null,
          isDirty: false,
          selectedTemplate: 'modern',
          atsScore: null,
          aiRecommendations: [],
          aiLoading: false,
          aiError: null,
          chatMessages: [],
          jobDescription: '',
          ui: initialUIState,
          paymentLoading: false,
          paymentError: null,
          paymentHistory: [],
          exportLoading: false,
          exportError: null,
          lastExportConfig: null,
          undoStack: [],
          redoStack: [],
        }),

      getResumeText: () => {
        const state = get();
        if (!state.currentResume) return '';
        const sections = state.currentResume.sections;
        let text = '';

        if (sections.contact.fullName) {
          text += `${sections.contact.fullName}\n`;
          text += `${sections.contact.email} | ${sections.contact.phone} | ${sections.contact.location}\n\n`;
        }

        if (sections.summary?.content) {
          text += `PROFESSIONAL SUMMARY\n${sections.summary.content}\n\n`;
        }

        if (sections.experience?.length) {
          text += 'EXPERIENCE\n';
          sections.experience.forEach((exp) => {
            text += `${exp.position} at ${exp.company}\n`;
            text += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
            text += `${exp.description}\n`;
            exp.achievements?.forEach((ach) => { text += `• ${ach}\n`; });
            text += '\n';
          });
        }

        if (sections.education?.length) {
          text += 'EDUCATION\n';
          sections.education.forEach((edu) => {
            text += `${edu.degree} in ${edu.field}\n${edu.institution}\n${edu.startDate} - ${edu.endDate}\n\n`;
          });
        }

        const allSkills = [
          ...(sections.skills?.technical || []).map((s) => s.name),
          ...(sections.skills?.soft || []).map((s) => s.name),
          ...(sections.skills?.tools || []).map((s) => s.name),
        ];
        if (allSkills.length) text += `SKILLS\n${allSkills.join(', ')}\n\n`;

        if (sections.certifications?.length) {
          text += 'CERTIFICATIONS\n';
          sections.certifications.forEach((cert) => { text += `• ${cert.name} - ${cert.issuer}\n`; });
          text += '\n';
        }

        if (sections.projects?.length) {
          text += 'PROJECTS\n';
          sections.projects.forEach((proj) => {
            text += `${proj.name}\n${proj.description}\n`;
            if (proj.technologies?.length) text += `Technologies: ${proj.technologies.join(', ')}\n`;
            text += '\n';
          });
        }

        return text;
      },
    }),
    {
      name: 'ats-resume-builder-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedTemplate: state.selectedTemplate,
        savedResumes: state.savedResumes,
        paymentHistory: state.paymentHistory,
        lastExportConfig: state.lastExportConfig,
        jobDescription: state.jobDescription,
      }),
    }
  )
);

export default useStore;

// ============================================
// SELECTOR HOOKS
// ============================================

export const useAuth = () => {
  const user = useStore((s) => s.user);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const loading = useStore((s) => s.authLoading);
  const error = useStore((s) => s.authError);
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const updateProfile = useStore((s) => s.updateUserProfile);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const setAuthError = useStore((s) => s.setAuthError);
  return { user, isAuthenticated, loading, error, login, logout, updateProfile, setAuthLoading, setAuthError };
};

export const useResume = () => {
  const currentResume = useStore((s) => s.currentResume);
  const savedResumes = useStore((s) => s.savedResumes);
  const loading = useStore((s) => s.resumeLoading);
  const isDirty = useStore((s) => s.isDirty);
  const createNewResume = useStore((s) => s.createNewResume);
  const updateSection = useStore((s) => s.updateSection);
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);
  const removeItem = useStore((s) => s.removeItem);
  const saveResume = useStore((s) => s.saveResume);
  const deleteResume = useStore((s) => s.deleteResume);
  return { currentResume, savedResumes, loading, isDirty, createNewResume, updateSection, addItem, updateItem, removeItem, saveResume, deleteResume };
};

export const useAI = () => {
  const atsScore = useStore((s) => s.atsScore);
  const recommendations = useStore((s) => s.aiRecommendations);
  const loading = useStore((s) => s.aiLoading);
  const error = useStore((s) => s.aiError);
  const chatMessages = useStore((s) => s.chatMessages);
  const jobDescription = useStore((s) => s.jobDescription);
  const setATSScore = useStore((s) => s.setATSScore);
  const setRecommendations = useStore((s) => s.setAIRecommendations);
  const setAIRecommendations = useStore((s) => s.setAIRecommendations);
  const setAILoading = useStore((s) => s.setAILoading);
  const applyRecommendation = useStore((s) => s.applyRecommendation);
  const dismissRecommendation = useStore((s) => s.dismissRecommendation);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const clearChat = useStore((s) => s.clearChat);
  const setJobDescription = useStore((s) => s.setJobDescription);
  return { atsScore, recommendations, loading, error, chatMessages, jobDescription, setATSScore, setRecommendations, setAIRecommendations, setAILoading, applyRecommendation, dismissRecommendation, addChatMessage, clearChat, setJobDescription };
};

export const useUI = () => {
  const ui = useStore((s) => s.ui);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const openModal = useStore((s) => s.openModal);
  const closeModal = useStore((s) => s.closeModal);
  const setTheme = useStore((s) => s.setTheme);
  const addNotification = useStore((s) => s.addNotification);
  const addToast = useStore((s) => s.addToast);
  const removeToast = useStore((s) => s.removeToast);
  const setGlobalLoading = useStore((s) => s.setGlobalLoading);
  return { ui, toggleSidebar, openModal, closeModal, setTheme, addNotification, addToast, removeToast, setGlobalLoading };
};

export const useTemplates = () => {
  const selectedTemplate = useStore((s) => s.selectedTemplate);
  const availableTemplates = useStore((s) => s.availableTemplates);
  const setSelectedTemplate = useStore((s) => s.setSelectedTemplate);
  const setAvailableTemplates = useStore((s) => s.setAvailableTemplates);
  return { selectedTemplate, availableTemplates, setSelectedTemplate, setAvailableTemplates };
};

export const usePayment = () => {
  const loading = useStore((s) => s.paymentLoading);
  const error = useStore((s) => s.paymentError);
  const history = useStore((s) => s.paymentHistory);
  const addPayment = useStore((s) => s.addPaymentToHistory);
  const updateSubscription = useStore((s) => s.updateSubscription);
  return { loading, error, history, addPayment, updateSubscription };
};

export const useExport = () => {
  const loading = useStore((s) => s.exportLoading);
  const error = useStore((s) => s.exportError);
  const lastConfig = useStore((s) => s.lastExportConfig);
  const setLoading = useStore((s) => s.setExportLoading);
  const setExportLoading = useStore((s) => s.setExportLoading);
  const setError = useStore((s) => s.setExportError);
  const setConfig = useStore((s) => s.setLastExportConfig);
  return { loading, error, lastConfig, setLoading, setExportLoading, setError, setConfig };
};

export const useUndoRedo = () => {
  const canUndo = useStore((s) => s.undoStack.length > 0);
  const canRedo = useStore((s) => s.redoStack.length > 0);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const clearHistory = useStore((s) => s.clearHistory);
  return { canUndo, canRedo, undo, redo, clearHistory };
};