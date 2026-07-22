// src/lib/ml/MLResumeParser.ts
// ============================================
// MACHINE LEARNING RESUME PARSER
// Uses TensorFlow.js for intelligent parsing
// ============================================

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { ResumeSections } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface TrainingExample {
  id: string;
  rawText: string;
  sections: Partial<ResumeSections>;
  templateType: string;
  confidence: number;
  corrections: Partial<ResumeSections>;
  timestamp: string;
}

export interface LayoutPattern {
  id: string;
  patterns: string[];
  fieldMappings: Record<string, string>;
  confidence: number;
  usageCount: number;
}

export interface ParsingSuggestion {
  field: string;
  value: any;
  confidence: number;
  alternativeValues?: any[];
}

// ============================================
// ML RESUME PARSER WITH TENSORFLOW.JS
// ============================================

export class MLResumeParser {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;
  private featureDimension: number = 128;
  private trainingData: TrainingExample[] = [];
  private layoutPatterns: LayoutPattern[] = [];

  constructor() {
    this.loadTrainingData();
    this.loadLayoutPatterns();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Set backend - use WebGL if available, fallback to CPU
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
      await tf.ready();
      
      // Try to load existing model, or create new one
      await this.loadModel();
      
      this.isInitialized = true;
      console.log('🧠 ML Resume Parser initialized with TensorFlow.js');
      console.log('  Backend:', tf.getBackend());
    } catch (error) {
      console.warn('Failed to initialize ML parser:', error);
      // Create new model as fallback
      this.model = this.buildModel();
      this.isInitialized = true;
    }
  }

  // ============================================
  // MODEL BUILDING
  // ============================================

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [this.featureDimension],
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    // Hidden layer 1
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    // Hidden layer 2
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: 10, // Number of output features
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // ============================================
  // PREDICTION
  // ============================================

  async predict(
    text: string,
    features: number[]
  ): Promise<{
    sections: Partial<ResumeSections>;
    confidence: number;
    suggestions: ParsingSuggestion[];
    templateType?: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Ensure features match expected dimension
    const paddedFeatures = this.padFeatures(features);
    
    let prediction: number[] = [];
    let confidence = 0.5;

    if (this.model) {
      try {
        const inputTensor = tf.tensor2d([paddedFeatures]);
        const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
        const data = await outputTensor.data();
        prediction = Array.from(data);
        confidence = Math.max(0.1, Math.min(0.95, prediction.reduce((a, b) => a + b, 0) / prediction.length));
        inputTensor.dispose();
        outputTensor.dispose();
      } catch (error) {
        console.warn('ML prediction failed:', error);
        confidence = 0.3;
      }
    }

    // Detect template type
    const templateType = this.detectTemplateType(features);
    
    // Generate sections
    const sections = this.generateSectionsFromFeatures(text, features, prediction);
    const suggestions = this.generateSuggestions(sections, confidence);
    
    return {
      sections,
      confidence,
      suggestions,
      templateType
    };
  }

  // ============================================
  // TRAINING
  // ============================================

  async trainOnCorrections(
    examples: TrainingExample[],
    epochs: number = 10
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model || examples.length === 0) return;

    try {
      // Prepare training data
      const { inputs, outputs } = this.prepareTrainingData(examples);
      
      // Train the model
      await this.model.fit(inputs, outputs, {
        epochs,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`ML Training - Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, acc = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });
      
      inputs.dispose();
      outputs.dispose();

      // Save the trained model
      await this.saveModel();

      // Update training data
      this.trainingData.push(...examples);
      this.saveTrainingData();

      // Update layout patterns
      this.updateLayoutPatterns(examples);

    } catch (error) {
      console.error('Training failed:', error);
      throw error;
    }
  }

  // ============================================
  // DATA PREPARATION
  // ============================================

  private prepareTrainingData(examples: TrainingExample[]): {
    inputs: tf.Tensor;
    outputs: tf.Tensor;
  } {
    const inputData: number[][] = [];
    const outputData: number[][] = [];

    for (const example of examples) {
      const features = this.extractFeaturesFromExample(example);
      const label = this.extractLabelFromExample(example);
      
      inputData.push(this.padFeatures(features));
      outputData.push(label);
    }

    return {
      inputs: tf.tensor2d(inputData),
      outputs: tf.tensor2d(outputData)
    };
  }

  private extractFeaturesFromExample(example: TrainingExample): number[] {
    const text = example.rawText;
    const features: number[] = [];
    
    // Section presence features
    const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
    for (const section of sections) {
      const count = (text.match(new RegExp(section, 'gi')) || []).length;
      features.push(Math.min(count / 10, 1));
    }
    
    // Pattern features
    features.push(Math.min((text.match(/[•\-*○]/g) || []).length / 50, 1));
    features.push(Math.min((text.match(/\b(19|20)\d{2}\b/g) || []).length / 20, 1));
    features.push(Math.min((text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/gi) || []).length, 1));
    features.push(Math.min((text.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g) || []).length, 1));
    features.push(Math.min((text.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g) || []).length, 1));
    
    return features;
  }

  private extractLabelFromExample(example: TrainingExample): number[] {
    const sections = example.corrections || example.sections;
    const label: number[] = [];
    
    // Contact
    label.push(sections.contact?.email ? 1 : 0);
    label.push(sections.contact?.phone ? 1 : 0);
    label.push(sections.contact?.fullName ? 1 : 0);
    
    // Experience
    label.push(Math.min((sections.experience?.length || 0) / 5, 1));
    
    // Education
    label.push(Math.min((sections.education?.length || 0) / 3, 1));
    
    // Skills
    const totalSkills = (sections.skills?.technical?.length || 0) + 
                        (sections.skills?.soft?.length || 0) +
                        (sections.skills?.tools?.length || 0);
    label.push(Math.min(totalSkills / 20, 1));
    
    return label;
  }

  // ============================================
  // SECTION GENERATION
  // ============================================

  private generateSectionsFromFeatures(
    text: string,
    features: number[],
    prediction: number[]
  ): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};
    
    // Use prediction to guide section generation
    const hasContact = prediction[0] > 0.5 || features[4] > 0.5;
    const hasExperience = prediction[3] > 0.3 || features[0] > 0.3;
    const hasEducation = prediction[4] > 0.3 || features[1] > 0.3;
    const hasSkills = prediction[5] > 0.3 || features[2] > 0.3;
    
    // Build contact
    if (hasContact) {
      sections.contact = {
        fullName: this.extractName(text),
        email: this.extractEmail(text),
        phone: this.extractPhone(text),
        location: this.extractLocation(text),
        country: '',
        linkedIn: this.extractLinkedIn(text),
        portfolio: '',
        github: this.extractGithub(text),
      };
    }
    
    // Build experience
    if (hasExperience) {
      sections.experience = this.extractExperience(text);
    }
    
    // Build education
    if (hasEducation) {
      sections.education = this.extractEducation(text);
    }
    
    // Build skills
    if (hasSkills) {
      sections.skills = this.extractSkills(text);
    }
    
    // Build summary
    sections.summary = {
      content: this.extractSummary(text),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    };
    
    return sections;
  }

  // ============================================
  // EXTRACTION HELPERS
  // ============================================

  private extractName(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 5)) {
      if (!line.includes('@') && !/\d{3}/.test(line) && line.length > 2 && line.length < 60) {
        return line.trim();
      }
    }
    return '';
  }

  private extractEmail(text: string): string {
    const match = text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/i);
    return match ? match[0] : '';
  }

  private extractPhone(text: string): string {
    const match = text.match(/(\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
    return match ? match[0] : '';
  }

  private extractLocation(text: string): string {
    const match = text.match(/([A-Z][a-zA-Z]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))/);
    return match ? match[1] : '';
  }

  private extractLinkedIn(text: string): string {
    const match = text.match(/linkedin\.com\/in\/([\w-]+)/i);
    return match ? `https://linkedin.com/in/${match[1]}` : '';
  }

  private extractGithub(text: string): string {
    const match = text.match(/github\.com\/([\w-]+)/i);
    return match ? `https://github.com/${match[1]}` : '';
  }

  private extractExperience(text: string): any[] {
    // Simplified experience extraction
    const experiences: any[] = [];
    const lines = text.split('\n');
    let current: any = null;
    
    for (const line of lines) {
      if (/\b(19|20)\d{2}\b/.test(line)) {
        if (current) {
          experiences.push(current);
        }
        current = {
          id: uuidv4(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          location: '',
          description: '',
          achievements: [],
          technologies: [],
          aiSuggestions: []
        };
      }
      
      if (current) {
        if (/^[•\-*○]/.test(line.trim())) {
          current.achievements.push(line.trim().replace(/^[•\-*○]\s*/, ''));
        } else if (line.trim() && !current.company) {
          current.position = line.trim();
        } else if (line.trim() && !current.company) {
          current.company = line.trim();
        }
      }
    }
    
    if (current) {
      experiences.push(current);
    }
    
    return experiences;
  }

  private extractEducation(text: string): any[] {
    // Simplified education extraction
    const education: any[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (/\b(Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|Ph\.?D\.?)/i.test(line)) {
        education.push({
          id: uuidv4(),
          institution: '',
          degree: line.trim(),
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          honors: [],
          activities: [],
          relevantCourses: []
        });
      }
    }
    
    return education;
  }

  private extractSkills(text: string): any {
    const skills: any = {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
      other: []
    };
    
    const techKeywords = ['python', 'javascript', 'react', 'node', 'java', 'c++', 'sql', 'aws', 'docker'];
    for (const keyword of techKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        skills.technical.push({ name: keyword, level: 'Intermediate', category: 'Technical' });
      }
    }
    
    return skills;
  }

  private extractSummary(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      if (lines[i].length > 50 && !lines[i].includes('@') && !/\d{3}/.test(lines[i])) {
        return lines[i].trim();
      }
    }
    return '';
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  private padFeatures(features: number[]): number[] {
    if (features.length >= this.featureDimension) {
      return features.slice(0, this.featureDimension);
    }
    
    const padded = [...features];
    while (padded.length < this.featureDimension) {
      padded.push(0);
    }
    return padded;
  }

  private detectTemplateType(features: number[]): string {
    const layoutScore = (features[0] || 0) + (features[1] || 0) + (features[2] || 0);
    const structureScore = (features[3] || 0) + (features[4] || 0) + (features[5] || 0);
    
    if (layoutScore > 2 && structureScore > 1) return 'professional';
    if (layoutScore > 1.5) return 'modern';
    if (structureScore > 1.5) return 'traditional';
    return 'simple';
  }

  private generateSuggestions(
    sections: Partial<ResumeSections>,
    confidence: number
  ): ParsingSuggestion[] {
    const suggestions: ParsingSuggestion[] = [];
    
    if (confidence < 0.6) {
      suggestions.push({
        field: 'overall',
        value: 'Low confidence parsing, please review and correct',
        confidence: confidence,
        alternativeValues: ['Manual review recommended']
      });
    }
    
    if (!sections.contact?.email) {
      suggestions.push({
        field: 'contact.email',
        value: 'Email address not found',
        confidence: 0.2,
        alternativeValues: ['Check for email patterns in text']
      });
    }
    
    if (!sections.experience?.length) {
      suggestions.push({
        field: 'experience',
        value: 'No work experience detected',
        confidence: 0.1,
        alternativeValues: ['Look for job titles and company names']
      });
    }
    
    return suggestions;
  }

  // ============================================
  // PATTERN MANAGEMENT
  // ============================================

  private updateLayoutPatterns(examples: TrainingExample[]): void {
    for (const example of examples) {
      const pattern: LayoutPattern = {
        id: uuidv4(),
        patterns: ['section_headers', 'date_ranges', 'bullet_points'],
        fieldMappings: {
          contact: 'header',
          experience: 'section',
          education: 'section',
          skills: 'section'
        },
        confidence: example.confidence || 0.5,
        usageCount: 1
      };
      
      this.layoutPatterns.push(pattern);
    }
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  private async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      await this.model.save('localstorage://resume-parser-model');
      console.log('✅ Model saved to localStorage');
    } catch (error) {
      console.warn('Failed to save model:', error);
    }
  }

  private async loadModel(): Promise<void> {
    try {
      const model = await tf.loadLayersModel('localstorage://resume-parser-model');
      this.model = model;
      console.log('✅ Model loaded from localStorage');
    } catch (error) {
      console.warn('No saved model found, creating new model');
      this.model = this.buildModel();
    }
  }

  private loadTrainingData(): void {
    try {
      const raw = localStorage.getItem('resumeMLTrainingData');
      if (raw) {
        this.trainingData = JSON.parse(raw);
      }
    } catch (error) {
      console.warn('Failed to load training data:', error);
    }
  }

  private saveTrainingData(): void {
    try {
      localStorage.setItem('resumeMLTrainingData', JSON.stringify(this.trainingData));
    } catch (error) {
      console.warn('Failed to save training data:', error);
    }
  }

  private loadLayoutPatterns(): void {
    try {
      const raw = localStorage.getItem('resumeMLLayoutPatterns');
      if (raw) {
        this.layoutPatterns = JSON.parse(raw);
      }
    } catch (error) {
      console.warn('Failed to load layout patterns:', error);
    }
  }

  // ============================================
  // EXPORT/IMPORT
  // ============================================

  async exportModel(): Promise<Blob> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    // Save to localStorage first
    await this.saveModel();
    
    // Get the model data from localStorage
    const modelData = localStorage.getItem('tensorflowjs_models/resume-parser-model');
    return new Blob([modelData || ''], { type: 'application/json' });
  }

  async importModel(modelData: Blob): Promise<void> {
    const text = await modelData.text();
    localStorage.setItem('tensorflowjs_models/resume-parser-model', text);
    await this.loadModel();
  }
}

export default MLResumeParser;
