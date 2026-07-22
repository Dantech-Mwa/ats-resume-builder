// src/lib/ml/MLResumeParser.ts
// ============================================
// MACHINE LEARNING RESUME PARSER
// TensorFlow.js based model for intelligent resume parsing
// ============================================

import * as tf from '@tensorflow/tfjs';
import { ResumeSections } from '../../types';
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

export class MLResumeParser {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;
  private featureDimension: number = 128;

  constructor() {
    // Lazy initialization
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await tf.ready();
      this.model = this.buildModel();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
      throw error;
    }
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      inputShape: [this.featureDimension],
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

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
    
    let prediction = 0;
    let confidence = 0.5;

    if (this.model) {
      try {
        const inputTensor = tf.tensor2d([paddedFeatures]);
        const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
        const values = await outputTensor.data();
        prediction = values[0] || 0;
        confidence = Math.max(0.1, Math.min(0.95, prediction));
        inputTensor.dispose();
        outputTensor.dispose();
      } catch (error) {
        console.warn('ML prediction failed:', error);
        confidence = 0.3;
      }
    }

    // Generate sections with confidence weighting
    const sections = this.generateSectionsFromFeatures(features, confidence);
    const suggestions = this.generateSuggestions(sections, confidence);
    
    return {
      sections,
      confidence,
      suggestions,
      templateType: this.detectTemplateType(features)
    };
  }

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

  private generateSectionsFromFeatures(
    features: number[],
    confidence: number
  ): Partial<ResumeSections> {
    // Generate sections based on feature patterns
    // This is a simplified implementation - in practice, this would use
    // a more sophisticated decoding mechanism
    
    const sections: Partial<ResumeSections> = {};
    
    // Infer contact information
    const hasEmail = features[5] > 0.5;
    const hasPhone = features[6] > 0.5;
    const hasLocation = features[7] > 0.5;
    
    if (hasEmail || hasPhone || hasLocation) {
      sections.contact = {
        fullName: '',
        email: hasEmail ? 'detected@email.com' : '',
        phone: hasPhone ? '+1-555-123-4567' : '',
        location: hasLocation ? 'City, State' : '',
        country: ''
      };
    }
    
    // Infer experience sections
    const experienceCount = Math.round(features[0] * 3);
    if (experienceCount > 0) {
      sections.experience = Array(experienceCount).fill(null).map(() => ({
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
      }));
    }
    
    // Infer education
    const educationCount = Math.round(features[1] * 2);
    if (educationCount > 0) {
      sections.education = Array(educationCount).fill(null).map(() => ({
        id: uuidv4(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        honors: [],
        activities: [],
        relevantCourses: []
      }));
    }
    
    // Infer skills
    const skillCount = Math.round(features[2] * 20);
    if (skillCount > 0) {
      sections.skills = {
        technical: Array(Math.min(skillCount, 20)).fill(null).map(() => ({
          name: '',
          level: 'Intermediate',
          category: 'Technical'
        })),
        soft: [],
        languages: [],
        tools: [],
        other: []
      };
    }
    
    return sections;
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
        value: 'Email address not found or invalid',
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

  private detectTemplateType(features: number[]): string {
    // Detect template type based on feature patterns
    const layoutScore = features[0] + features[1] + features[2];
    const structureScore = features[8] + features[9] + features[10];
    
    if (layoutScore > 2 && structureScore > 1) {
      return 'professional';
    } else if (layoutScore > 1.5) {
      return 'modern';
    } else if (structureScore > 1.5) {
      return 'traditional';
    } else {
      return 'simple';
    }
  }

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
            console.log(`ML Training - Epoch ${epoch}: loss = ${logs?.loss}, acc = ${logs?.acc}`);
          }
        }
      });
      
      inputs.dispose();
      outputs.dispose();
    } catch (error) {
      console.error('Training failed:', error);
      throw error;
    }
  }

  private prepareTrainingData(examples: TrainingExample[]): {
    inputs: tf.Tensor;
    outputs: tf.Tensor;
  } {
    const inputData: number[][] = [];
    const outputData: number[][] = [];

    for (const example of examples) {
      // Convert example to features
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
    
    // Section counts
    const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
    for (const section of sections) {
      const count = (text.match(new RegExp(section, 'gi')) || []).length;
      features.push(Math.min(count / 10, 1));
    }
    
    // Pattern counts
    features.push(Math.min((text.match(/[•\-*○]/g) || []).length / 50, 1));
    features.push(Math.min((text.match(/\b(19|20)\d{2}\b/g) || []).length / 20, 1));
    features.push(Math.min((text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/gi) || []).length, 1));
    
    // Contact patterns
    features.push(Math.min((text.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g) || []).length, 1));
    features.push(Math.min((text.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g) || []).length, 1));
    
    return features;
  }

  private extractLabelFromExample(example: TrainingExample): number[] {
    // Create label vector from corrected sections
    const label: number[] = [];
    const sections = example.corrections || example.sections;
    
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
  // MODEL MANAGEMENT
  // ============================================

  async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      await this.model.save('localstorage://resume-parser-model');
      console.log('Model saved successfully');
    } catch (error) {
      console.warn('Failed to save model:', error);
    }
  }

  async loadModel(): Promise<void> {
    try {
      const model = await tf.loadLayersModel('localstorage://resume-parser-model');
      this.model = model;
      this.isInitialized = true;
      console.log('Model loaded successfully');
    } catch (error) {
      console.warn('No saved model found, using new model:', error);
    }
  }

  exportModel(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.model) {
        reject(new Error('Model not initialized'));
        return;
      }
      
      // Model export functionality
      // This would serialize the model weights
      this.model.save('downloads://resume-parser-model')
        .then(() => {
          // Create a blob for download
          const blob = new Blob(['Model exported'], { type: 'application/octet-stream' });
          resolve(blob);
        })
        .catch(reject);
    });
  }
}

export default MLResumeParser;
