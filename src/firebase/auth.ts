import {
  type UserCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { usernameToEmail } from '@/constants';

import { auth } from './config';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid username or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export async function signInStudent(username: string, password: string): Promise<UserCredential> {
  const email = usernameToEmail(username.trim());
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch {
    throw new InvalidCredentialsError();
  }
}

export async function signInAdmin(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch {
    throw new InvalidCredentialsError();
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
