import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { defineStore } from 'pinia';

import { checkIsAdmin } from '@/firebase/admins';
import { signInAdmin, signInStudent, signOutUser } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import { getStudentProfile } from '@/firebase/students';
import type { StudentProfile } from '@/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    studentProfile: null as StudentProfile | null,
    isAdmin: false,
    ready: false,
    /** Transient: confirming identity doesn't persist across a refresh — that's fine, since status is still 'not_started' at that point and nothing has been saved yet. */
    identityConfirmed: false,
  }),
  getters: {
    isSignedIn: (state): boolean => state.user !== null,
  },
  actions: {
    async init(): Promise<void> {
      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user;
          if (user) {
            await this.loadProfile(user.uid);
          } else {
            this.studentProfile = null;
            this.isAdmin = false;
          }
          this.ready = true;
          resolve();
        });
      });
    },

    async loadProfile(uid: string): Promise<void> {
      const [profile, admin] = await Promise.all([getStudentProfile(uid), checkIsAdmin(uid)]);
      this.studentProfile = profile;
      this.isAdmin = admin;
    },

    async loginStudent(username: string, password: string): Promise<void> {
      const cred = await signInStudent(username, password);
      this.user = cred.user;
      await this.loadProfile(cred.user.uid);
    },

    async loginAdmin(email: string, password: string): Promise<void> {
      const cred = await signInAdmin(email, password);
      this.user = cred.user;
      await this.loadProfile(cred.user.uid);
      if (!this.isAdmin) {
        await signOutUser();
        this.user = null;
        this.studentProfile = null;
        throw new Error('This account does not have admin access.');
      }
    },

    confirmIdentity(): void {
      this.identityConfirmed = true;
    },

    async logout(): Promise<void> {
      await signOutUser();
      this.user = null;
      this.studentProfile = null;
      this.isAdmin = false;
      this.identityConfirmed = false;
    },
  },
});
