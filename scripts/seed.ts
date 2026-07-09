import 'dotenv/config';

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { DEFAULT_DURATION_MINUTES } from '../src/constants';
import { SEED_ACCOUNTS } from './data/students.seed';

const serviceAccountPath = resolve(process.cwd(), process.env.SEED_SERVICE_ACCOUNT_PATH ?? './service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account file not found at ${serviceAccountPath}.`);
  console.error('Set SEED_SERVICE_ACCOUNT_PATH in .env, or download a key from');
  console.error('Firebase Console → Project Settings → Service Accounts → Generate new private key.');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const app: App = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const PW_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomPassword(len = 12): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += PW_CHARS[bytes[i]! % PW_CHARS.length];
  return out;
}

async function seedStudents(): Promise<void> {
  console.log(`Seeding ${SEED_ACCOUNTS.length} student accounts (Firestore-only auth, keyed by username)…`);

  for (const account of SEED_ACCOUNTS) {
    const docId = account.username;

    await db.doc(`students/${docId}`).set(
      {
        studentId: account.studentId,
        name: account.name,
        class: account.class,
        session: account.session,
        username: account.username,
        password: account.password,
        personalToken: account.personalToken,
        isTestAccount: account.isTestAccount,
      },
      { merge: true },
    );

    const resultRef = db.doc(`results/${docId}`);
    const resultSnap = await resultRef.get();
    if (!resultSnap.exists) {
      await resultRef.set({
        status: 'not_started',
        currentQuestionIndex: 0,
        startedAt: null,
        completedAt: null,
        score: null,
        testStartTimestamp: null,
        durationMinutes: null,
        violationCount: 0,
        flaggedForCheating: false,
        optionOrder: null,
      });
    }

    console.log(`  ✓ ${docId}  ${account.name}`);
  }
}

async function seedTestConfig(): Promise<void> {
  const configRef = db.doc('settings/testConfig');
  const snap = await configRef.get();
  if (!snap.exists) {
    await configRef.set({
      durationMinutes: DEFAULT_DURATION_MINUTES,
      updatedAt: Date.now(),
      updatedBy: 'seed-script',
    });
    console.log(`Created settings/testConfig with durationMinutes=${DEFAULT_DURATION_MINUTES}`);
  } else {
    console.log('settings/testConfig already exists, leaving as-is.');
  }
}

async function seedAdmin(): Promise<void> {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminRef = db.doc(`admins/${adminUsername}`);
  const existing = await adminRef.get();
  if (existing.exists) {
    console.log(`Admin account already exists: ${adminUsername} — left password unchanged.`);
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD ?? randomPassword();
  await adminRef.set({ username: adminUsername, password });

  console.log('\n=== ADMIN ACCOUNT CREATED — SAVE THESE CREDENTIALS NOW ===');
  console.log(`  Username: ${adminUsername}`);
  console.log(`  Password: ${password}`);
  console.log('  Change this password (edit the Firestore doc) after first login.');
  console.log('============================================================\n');
}

async function main() {
  await seedStudents();
  await seedTestConfig();
  await seedAdmin();
  console.log('\nSeed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
