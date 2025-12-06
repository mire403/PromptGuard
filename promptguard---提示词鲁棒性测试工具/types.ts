export interface PromptVariation {
  id: string;
  text: string;
}

export interface EvaluationResult {
  score: number; // 0 to 100
  reasoning: string;
}

export interface TestRun {
  id: string;
  variation: PromptVariation;
  output: string;
  evaluation?: EvaluationResult;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface RobustnessReport {
  originalPrompt: string;
  originalOutput: string;
  runs: TestRun[];
  averageScore: number;
  isComplete: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_VARIATIONS = 'GENERATING_VARIATIONS',
  RUNNING_BASELINE = 'RUNNING_BASELINE',
  RUNNING_TESTS = 'RUNNING_TESTS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProgressState {
  current: number;
  total: number;
  message: string;
}