import { defineStore } from 'pinia';

import { checkAdminExists } from '@/firebase/admins';
import { signInAdmin, signInStudent } from '@/firebase/auth';
import { getStudentProfile } from '@/firebase/students';
import { clearSession, loadSession, saveSession } from '@/lib/session';
import type { StudentProfile } from '@/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    id: null as string | null,
    role: null as 'student' | 'admin' | null,
    studentProfile: null as StudentProfile | null,
    ready: false,
    /** Transient: confirming identity doesn't persist across a refresh — that's fine, since status is still 'not_started' at that point and nothing has been saved yet. */
    identityConfirmed: false,
  }),
  getters: {
    isSignedIn: (state): boolean => state.id !== null,
    isAdmin: (state): boolean => state.role === 'admin',
  },
  actions: {
    /** Restores a locally-persisted session (see src/lib/session.ts) and
     * re-validates it still exists in Firestore before trusting it. */
    async init(): Promise<void> {
      const stored = loadSession();
      if (stored) {
        if (stored.role === 'student') {
          const profile = await getStudentProfile(stored.id);
          if (profile) {
            this.id = stored.id;
            this.role = 'student';
            this.studentProfile = profile;
          } else {
            clearSession();
          }
        } else {
          const exists = await checkAdminExists(stored.id);
          if (exists) {
            this.id = stored.id;
            this.role = 'admin';
          } else {
            clearSession();
          }
        }
      }
      this.ready = true;
    },

    async loginStudent(username: string, password: string): Promise<void> {
      const { id } = await signInStudent(username, password);
      const profile = await getStudentProfile(id);
      this.id = id;
      this.role = 'student';
      this.studentProfile = profile;
      saveSession({ id, role: 'student' });
    },

    async loginAdmin(username: string, password: string): Promise<void> {
      const { id } = await signInAdmin(username, password);
      this.id = id;
      this.role = 'admin';
      saveSession({ id, role: 'admin' });
    },

    confirmIdentity(): void {
      this.identityConfirmed = true;
    },

    logout(): void {
      clearSession();
      this.id = null;
      this.role = null;
      this.studentProfile = null;
      this.identityConfirmed = false;
    },
  },
});
