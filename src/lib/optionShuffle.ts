import type { AnswerLetter } from '@/types';

const LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D'];

function shuffleFour(): AnswerLetter[] {
  const arr = [...LETTERS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Generates a per-student, per-question display order: for question N,
 * optionOrder[N][0..3] is which ORIGINAL letter (from questions.ts) shows at
 * display position A/B/C/D. Two students can see "sour" under different
 * letters, but each student's own choice is still saved and scored against
 * its real original letter — the shuffle only ever touches rendering. */
export function generateOptionOrder(questionNumbers: number[]): Record<number, AnswerLetter[]> {
  const order: Record<number, AnswerLetter[]> = {};
  for (const n of questionNumbers) {
    order[n] = shuffleFour();
  }
  return order;
}
