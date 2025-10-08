/**
 * Message protocol types for secure communication between web app and extension
 */

export type DomainKey = 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin' | 'generic';

export type ApplyStartMsg = {
  type: 'APPLY_START';
  payload: {
    jobUrl: string;
    platform: DomainKey;
    files: Array<{ name: string; url: string; type: 'cv' | 'coverLetter' }>;
    answers?: Record<string, string | boolean | string[]>;
    dryRun?: boolean;
    locale?: 'en' | 'tr';
  };
  meta: { requestId: string; ts: number; origin: string; sign?: string };
};

export type ApplyResultMsg = {
  type: 'APPLY_RESULT';
  payload: {
    ok: boolean;
    message?: string;
    url?: string;
    submitted?: boolean;
    reviewNeeded?: boolean;
    hints?: string[];
  };
  meta: { requestId: string; ts: number };
};

export type ImportJobMsg = {
  type: 'IMPORT_JOB';
  payload: {
    url: string;
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    salary?: string;
    remote?: boolean;
    platform?: string;
  };
  meta: { ts: number };
};

export type GenerateTextMsg = {
  type: 'GENERATE_TEXT';
  payload: { question: string; context?: string };
  meta: { requestId: string; ts: number; origin: string; sign?: string };
};

export type GenerateTextResultMsg = {
  type: 'GENERATE_TEXT_RESULT';
  payload: { text: string };
  meta: { requestId: string; ts: number };
};

export type PingMsg = {
  type: 'PING';
  meta: { ts: number; origin: string; sign?: string };
};

export type PongMsg = {
  type: 'PONG';
  meta: { ts: number };
};

export type ExtensionMessage =
  | ApplyStartMsg
  | ApplyResultMsg
  | ImportJobMsg
  | GenerateTextMsg
  | GenerateTextResultMsg
  | PingMsg
  | PongMsg;

export type ContentCommand = {
  type: 'RUN_APPLY' | 'PARSE_PAGE' | 'FILL_TEXT';
  payload: any;
  meta: { requestId: string };
};

export type ContentResponse = {
  type: 'APPLY_COMPLETE' | 'PARSE_COMPLETE' | 'LOG' | 'ERROR';
  payload: any;
  meta: { requestId: string };
};
