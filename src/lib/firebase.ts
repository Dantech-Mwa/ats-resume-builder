// ============================================
// FIREBASE SERVICES - REALTIME DATABASE VERSION
// ============================================

import { auth, realtimeDb, storage, googleProvider } from '../config/firebase';
import { getFirebaseErrorMessage as getFbError } from '../config/firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

import {
  ref,
  set,
  get,
  update,
  remove,
  child,
  push,
  query,
  orderByChild,
  equalTo,
  DataSnapshot,
} from 'firebase/database';

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { User, Subscription, ResumeData, PaymentDetails } from './types';
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

  async registerWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: name,
        avatar: '',
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

      // Save to Realtime Database
      await set(ref(realtimeDb, 'users/' + firebaseUser.uid), userData);
      return userData;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(getFbError(error));
    }
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await this.getOrCreateUser(userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getFbError(error));
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await this.getOrCreateUser(result.user);
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(getFbError(error));
    }
  }

  private async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = ref(realtimeDb, 'users/' + firebaseUser.uid);

    try {
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        // Update last login
        await update(userRef, { lastLoginAt: new Date().toISOString() });
        return snapshot.val() as User;
      }

      // Create new user
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

      await set(userRef, userData);
      return userData;
    } catch (error: any) {
      console.error('getOrCreateUser error:', error);
      throw new Error(getFbError(error));
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          try {
            const snapshot = await get(ref(realtimeDb, 'users/' + firebaseUser.uid));
            resolve(snapshot.exists() ? (snapshot.val() as User) : null);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    await update(ref(realtimeDb, 'users/' + userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateSubscription(userId: string, subscription: Subscription): Promise<void> {
    await update(ref(realtimeDb, 'users/' + userId), {
      subscription,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ============================================
// REALTIME DATABASE SERVICES
// ============================================

class FirebaseDatabaseService {
  private static instance: FirebaseDatabaseService;

  static getInstance(): FirebaseDatabaseService {
    if (!FirebaseDatabaseService.instance) {
      FirebaseDatabaseService.instance = new FirebaseDatabaseService();
    }
    return FirebaseDatabaseService.instance;
  }

  // Save resume
  async saveResume(userId: string, resumeData: ResumeData): Promise<string> {
    const resumeId = resumeData.metadata.id || uuidv4();
    const resumeWithId = {
      ...resumeData,
      metadata: {
        ...resumeData.metadata,
        id: resumeId,
        userId,
        updatedAt: new Date().toISOString(),
        version: (resumeData.metadata.version || 0) + 1,
      },
    };

    // Save resume
    await set(ref(realtimeDb, 'resumes/' + resumeId), resumeWithId);

    // Add to user's saved resumes list
    const userSnapshot = await get(ref(realtimeDb, 'users/' + userId + '/savedResumes'));
    const savedResumes: string[] = userSnapshot.val() || [];
    
    if (!savedResumes.includes(resumeId)) {
      savedResumes.push(resumeId);
      await update(ref(realtimeDb, 'users/' + userId), { savedResumes });
    }

    return resumeId;
  }

  // Get resume
  async getResume(resumeId: string): Promise<ResumeData | null> {
    const snapshot = await get(ref(realtimeDb, 'resumes/' + resumeId));
    return snapshot.exists() ? (snapshot.val() as ResumeData) : null;
  }

  // Get all resumes for user
  async getUserResumes(userId: string): Promise<ResumeData[]> {
    // Get user's saved resume IDs
    const userSnapshot = await get(ref(realtimeDb, 'users/' + userId + '/savedResumes'));
    const savedResumeIds: string[] = userSnapshot.val() || [];

    if (savedResumeIds.length === 0) return [];

    // Fetch each resume
    const resumes: ResumeData[] = [];
    for (const resumeId of savedResumeIds) {
      const snapshot = await get(ref(realtimeDb, 'resumes/' + resumeId));
      if (snapshot.exists()) {
        resumes.push(snapshot.val() as ResumeData);
      }
    }

    // Sort by updated date
    resumes.sort((a, b) => 
      new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
    );

    return resumes;
  }

  // Delete resume
  async deleteResume(userId: string, resumeId: string): Promise<void> {
    // Delete resume
    await remove(ref(realtimeDb, 'resumes/' + resumeId));

    // Remove from user's list
    const userSnapshot = await get(ref(realtimeDb, 'users/' + userId + '/savedResumes'));
    const savedResumes: string[] = userSnapshot.val() || [];
    const updatedResumes = savedResumes.filter(id => id !== resumeId);
    await update(ref(realtimeDb, 'users/' + userId), { savedResumes: updatedResumes });
  }

  // Duplicate resume
  async duplicateResume(userId: string, resumeId: string): Promise<string> {
    const original = await this.getResume(resumeId);
    if (!original) throw new Error('Original resume not found');

    const newResume: ResumeData = {
      ...original,
      metadata: {
        ...original.metadata,
        id: uuidv4(),
        title: `${original.metadata.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    };

    return await this.saveResume(userId, newResume);
  }

  // Save payment
  async savePayment(userId: string, paymentDetails: PaymentDetails): Promise<void> {
    const paymentId = paymentDetails.transactionId;
    await set(ref(realtimeDb, 'payments/' + paymentId), {
      userId,
      ...paymentDetails,
      createdAt: new Date().toISOString(),
    });

    // Update user subscription if payment completed
    if (paymentDetails.status === 'completed') {
      const subscription = this.calculateSubscription(paymentDetails.planId);
      await update(ref(realtimeDb, 'users/' + userId), { subscription });
    }
  }

  // Get user payments
  async getUserPayments(userId: string): Promise<PaymentDetails[]> {
    const snapshot = await get(ref(realtimeDb, 'payments'));
    if (!snapshot.exists()) return [];

    const allPayments: Record<string, any> = snapshot.val();
    const userPayments: PaymentDetails[] = [];

    for (const [id, payment] of Object.entries(allPayments)) {
      if (payment.userId === userId) {
        userPayments.push({ ...payment, id } as PaymentDetails);
      }
    }

    return userPayments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private calculateSubscription(planId: string): Subscription {
    const now = new Date();
    let endDate: Date;

    switch (planId) {
      case 'trial':
        endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return {
          plan: 'trial',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          paymentMethod: 'paypal',
          status: 'active',
          amount: 1,
          currency: 'USD',
          autoRenew: false,
        };
      case 'monthly':
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        return {
          plan: 'monthly',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          paymentMethod: 'paypal',
          status: 'active',
          amount: 5,
          currency: 'USD',
          autoRenew: true,
        };
      case 'yearly':
        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        return {
          plan: 'yearly',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          paymentMethod: 'paypal',
          status: 'active',
          amount: 50,
          currency: 'USD',
          autoRenew: true,
        };
      default:
        throw new Error('Invalid plan ID');
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

  async uploadFile(userId: string, file: File): Promise<string> {
    const fileId = uuidv4();
    const extension = file.name.split('.').pop();
    const path = `resumes/${userId}/${fileId}.${extension}`;
    const fileRef = storageRef(storage, path);

    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }

  async deleteFile(path: string): Promise<void> {
    const fileRef = storageRef(storage, path);
    await deleteObject(fileRef);
  }
}

// Export singletons
export const authService = FirebaseAuthService.getInstance();
export const databaseService = FirebaseDatabaseService.getInstance();
export const storageService = FirebaseStorageService.getInstance();
