import { QUESTIONS } from '@/data/questions';
import type { AnswerLetter } from '@/types';

/** Each correct answer is worth 2.5 points (40 questions × 2.5 = 100), so
 * the stored score is already on a 0-100 scale everywhere it's read. */
const POINTS_PER_QUESTION = 2.5;

export function computeScore(answers: Record<number, AnswerLetter>): number {
  let correct = 0;
  for (const question of QUESTIONS) {
    if (answers[question.number] === question.correctAnswer) {
      correct += 1;
    }
  }
  return Math.round(correct * POINTS_PER_QUESTION);
}
