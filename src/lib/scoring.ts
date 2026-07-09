import { QUESTIONS } from '@/data/questions';
import type { AnswerLetter } from '@/types';

export function computeScore(answers: Record<number, AnswerLetter>): number {
  let correct = 0;
  for (const question of QUESTIONS) {
    if (answers[question.number] === question.correctAnswer) {
      correct += 1;
    }
  }
  return correct;
}
