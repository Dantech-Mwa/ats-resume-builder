// ============================================
// FIREBASE SERVICES
// ============================================

import {
  auth,
  db,
  storage,
  googleProvider,
  facebookProvider,
  githubProvider,
  getFirebaseErrorMessage,
} from '../config/firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult,
} from 'firebase/storage';

import { User, Subscription, ResumeData, PaymentDetails, Invoice } from './types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// AUTHENTICATION SERVICES
// ============================================

class FirebaseAuthService {
  private static instance: FirebaseAuthService;

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  // Register with email and password
  async registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: name,
        avatar: firebaseUser.photoURL || '',
        subscription: {
          plan: 'trial',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'none',
          status: 'active',
          amount: 1,
          currency: 'USD',
          autoRenew: false,
        },
        savedResumes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'en',
          defaultTemplate: 'modern',
          emailNotifications: true,
          showAIAssistant: true,
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Login with email and password
  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;

      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString(),
      });

      return userData;
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await this.handleSocialLogin(result);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Login with Facebook
  async loginWithFacebook(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return await this.handleSocialLogin(result);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Login with GitHub
  async loginWithGithub(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return await this.handleSocialLogin(result);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Handle social login
  private async handleSocialLogin(userCredential: UserCredential): Promise<User> {
    const firebaseUser = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: new Date().toISOString(),
      });
      return userData;
    }

    // Create new user for first-time social login
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      avatar: firebaseUser.photoURL || '',
      subscription: {
        plan: 'trial',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'none',
        status: 'active',
        amount: 1,
        currency: 'USD',
        autoRenew: false,
      },
      savedResumes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        language: 'en',
        defaultTemplate: 'modern',
        emailNotifications: true,
        showAIAssistant: true,
      },
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  }

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          resolve(userDoc.exists() ? (userDoc.data() as User) : null);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Update user profile
  async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  // Update user preferences
  async updatePreferences(userId: string, preferences: Partial<User['preferences']>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      preferences: preferences,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ============================================
// FIRESTORE SERVICES
// ============================================

class FirebaseFirestoreService {
  private static instance: FirebaseFirestoreService;

  static getInstance(): FirebaseFirestoreService {
    if (!FirebaseFirestoreService.instance) {
      FirebaseFirestoreService.instance = new FirebaseFirestoreService();
    }
    return FirebaseFirestoreService.instance;
  }

  // Save resume
  async saveResume(userId: string, resumeData: ResumeData): Promise<string> {
    try {
      const resumeId = resumeData.metadata.id || uuidv4();
      const resumeRef = doc(db, 'resumes', resumeId);
      
      await setDoc(resumeRef, {
        ...resumeData,
        metadata: {
          ...resumeData.metadata,
          id: resumeId,
          userId,
          updatedAt: new Date().toISOString(),
          version: (resumeData.metadata.version || 0) + 1,
        },
      });

      // Add to user's saved resumes
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const savedResumes = userData.savedResumes || [];
        
        if (!savedResumes.includes(resumeId)) {
          savedResumes.push(resumeId);
          await updateDoc(userRef, { savedResumes });
        }
      }

      return resumeId;
    } catch (error: any) {
      throw new Error(`Failed to save resume: ${error.message}`);
    }
  }

  // Get resume
  async getResume(resumeId: string): Promise<ResumeData | null> {
    try {
      const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
      return resumeDoc.exists() ? (resumeDoc.data() as ResumeData) : null;
    } catch (error: any) {
      throw new Error(`Failed to get resume: ${error.message}`);
    }
  }

  // Get all resumes for user
  async getUserResumes(userId: string): Promise<ResumeData[]> {
    try {
      const q = query(
        collection(db, 'resumes'),
        where('metadata.userId', '==', userId),
        orderBy('metadata.updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as ResumeData);
    } catch (error: any) {
      throw new Error(`Failed to get resumes: ${error.message}`);
    }
  }

  // Delete resume
  async deleteResume(userId: string, resumeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
      
      // Remove from user's list
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const savedResumes = userData.savedResumes.filter(id => id !== resumeId);
        await updateDoc(userRef, { savedResumes });
      }
    } catch (error: any) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }

  // Duplicate resume
  async duplicateResume(userId: string, resumeId: string): Promise<string> {
    try {
      const originalResume = await this.getResume(resumeId);
      if (!originalResume) throw new Error('Original resume not found');

      const newResume: ResumeData = {
        ...originalResume,
        metadata: {
          ...originalResume.metadata,
          id: uuidv4(),
          title: `${originalResume.metadata.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      };

      return await this.saveResume(userId, newResume);
    } catch (error: any) {
      throw new Error(`Failed to duplicate resume: ${error.message}`);
    }
  }

  // Save payment
  async savePayment(userId: string, paymentDetails: PaymentDetails): Promise<void> {
    try {
      const paymentRef = doc(db, 'payments', paymentDetails.transactionId);
      await setDoc(paymentRef, {
        userId,
        ...paymentDetails,
        createdAt: new Date().toISOString(),
      });

      // Update user subscription
      if (paymentDetails.status === 'completed') {
        const subscription = this.calculateSubscription(paymentDetails.planId);
        await updateDoc(doc(db, 'users', userId), {
          subscription,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to save payment: ${error.message}`);
    }
  }

  // Calculate subscription dates
  private calculateSubscription(planId: string): Subscription {
    const now = new Date();
    let endDate: Date;
    let plan: Subscription['plan'];

    switch (planId) {
      case 'trial':
        endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        plan = 'trial';
        break;
      case 'monthly':
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        plan = 'monthly';
        break;
      case 'yearly':
        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        plan = 'yearly';
        break;
      default:
        throw new Error('Invalid plan ID');
    }

    return {
      plan,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      paymentMethod: 'paypal',
      status: 'active',
      amount: plan === 'trial' ? 1 : plan === 'monthly' ? 5 : 50,
      currency: 'USD',
      autoRenew: plan !== 'trial',
    };
  }

  // Get user invoices
  async getUserInvoices(userId: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Invoice));
    } catch (error: any) {
      throw new Error(`Failed to get invoices: ${error.message}`);
    }
  }
}

// ============================================
// STORAGE SERVICES
// ============================================

class FirebaseStorageService {
  private static instance: FirebaseStorageService;

  static getInstance(): FirebaseStorageService {
    if (!FirebaseStorageService.instance) {
      FirebaseStorageService.instance = new FirebaseStorageService();
    }
    return FirebaseStorageService.instance;
  }

  // Upload file
  async uploadFile(
    userId: string,
    file: File,
    folder: string = 'resumes'
  ): Promise<string> {
    try {
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${folder}/${userId}/${fileId}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      return downloadUrl;
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Get download URL
  async getFileUrl(filePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, filePath);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }

  // List user files
  async listUserFiles(userId: string, folder: string = 'resumes'): Promise<string[]> {
    try {
      const folderRef = ref(storage, `${folder}/${userId}`);
      const result = await listAll(folderRef);
      return result.items.map(item => item.fullPath);
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}

// Export singleton instances
export const authService = FirebaseAuthService.getInstance();
export const firestoreService = FirebaseFirestoreService.getInstance();
export const storageService = FirebaseStorageService.getInstance();

// Export everything
export {
  FirebaseAuthService,
  FirebaseFirestoreService,
  FirebaseStorageService,
};