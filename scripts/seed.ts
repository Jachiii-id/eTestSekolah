import 'dotenv/config';

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { AUTH_EMAIL_DOMAIN, DEFAULT_DURATION_MINUTES, usernameToEmail } from '../src/constants';
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
const auth = getAuth(app);
const db = getFirestore(app);

const PW_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomPassword(len = 12): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += PW_CHARS[bytes[i]! % PW_CHARS.length];
  return out;
}

async function upsertAuthUser(uid: string, email: string, password: string): Promise<void> {
  try {
    await auth.updateUser(uid, { email, password, disabled: false });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'auth/user-not-found') {
      await auth.createUser({ uid, email, password, emailVerified: true, disabled: false });
    } else {
      throw err;
    }
  }
}

async function seedStudents(): Promise<void> {
  console.log(`Seeding ${SEED_ACCOUNTS.length} student accounts (domain: ${AUTH_EMAIL_DOMAIN})…`);

  for (const account of SEED_ACCOUNTS) {
    const email = usernameToEmail(account.username);
    await upsertAuthUser(account.studentId, email, account.password);

    await db.doc(`students/${account.studentId}`).set(
      {
        name: account.name,
        class: account.class,
        session: account.session,
        username: account.username,
        personalToken: account.personalToken,
        isTestAccount: account.isTestAccount,
      },
      { merge: true },
    );

    const resultRef = db.doc(`results/${account.studentId}`);
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
      });
    }

    console.log(`  ✓ ${account.studentId}  ${account.name}  (${email})`);
  }
}

async function seedTestConfig(): Promise<void> {
  const configRef = db.doc('settings/testConfig');
  const snap = await configRef.get();
  if (!snap.exists) {
    await configRef.set({
      durationMinutes: DEFAULT_DURATION_MINUTES,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'seed-script',
    });
    console.log(`Created settings/testConfig with durationMinutes=${DEFAULT_DURATION_MINUTES}`);
  } else {
    console.log('settings/testConfig already exists, leaving as-is.');
  }
}

async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@etest-labschool.local';
  const existing = await auth.getUserByEmail(adminEmail).catch(() => null);
  if (existing) {
    await db.doc(`admins/${existing.uid}`).set({ email: adminEmail }, { merge: true });
    console.log(`Admin account already exists: ${adminEmail} (uid: ${existing.uid}) — left password unchanged.`);
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD ?? randomPassword();
  const user = await auth.createUser({ email: adminEmail, password, emailVerified: true });
  await db.doc(`admins/${user.uid}`).set({ email: adminEmail });

  console.log('\n=== ADMIN ACCOUNT CREATED — SAVE THESE CREDENTIALS NOW ===');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${password}`);
  console.log('  Change this password after first login.');
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
