export type AnswerLetter = 'A' | 'B' | 'C' | 'D';

export interface Question {
  number: number;
  part: 1 | 2 | 3;
  section: 'A' | 'B';
  text: string;
  options: Record<AnswerLetter, string>;
  correctAnswer: AnswerLetter;
  /** Reading passage shown above the question, for reading-comprehension items. */
  passage?: string;
}

export type SessionLabel = 'Session 1' | 'Session 2';

export interface StudentProfile {
  studentId: string;
  name: string;
  class: string;
  session: SessionLabel;
  username: string;
  isTestAccount: boolean;
}

export type TestStatus = 'not_started' | 'in_progress' | 'completed';

export interface ResultDoc {
  status: TestStatus;
  currentQuestionIndex: number;
  startedAt: number | null;
  completedAt: number | null;
  score: number | null;
  testStartTimestamp: number | null;
  durationMinutes: number | null;
  violationCount: number;
  flaggedForCheating: boolean;
  /** Per-student, locked-in-at-start display order of each question's
   * options (see src/lib/optionShuffle.ts). Null until the student starts. */
  optionOrder: Record<number, AnswerLetter[]> | null;
}

export interface AnswerDoc {
  selectedAnswer: AnswerLetter;
  savedAt: number;
}

export type ViolationType = 'tab_switch' | 'window_blur';

export interface ViolationDoc {
  type: ViolationType;
  timestamp: number;
}

export interface TestConfig {
  durationMinutes: number;
  updatedAt: number;
  updatedBy: string;
}
