// Shared TypeScript types for Tayad AI
// These are the domain shapes used across screens, components, contexts, and lib utilities.

// ---------------------------------------------------------------------------
// Book catalogue
// ---------------------------------------------------------------------------

export type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  pageCount: number;
  tags: string[];
  coverUrl?: string;
  hasFreeSource: boolean;
  freeSourceUrl?: string;
  gutenbergId?: number;
  openLibraryId?: string;
  standardEbooksUrl?: string;
  amazonUrl?: string;
  googlePlayUrl?: string;
  koboUrl?: string;
};

// ---------------------------------------------------------------------------
// Book source resolution
// ---------------------------------------------------------------------------

export type BookSources = {
  isFree: boolean;
  freeSourceUrl?: string;
  amazonUrl?: string;
  googlePlayUrl?: string;
  koboUrl?: string;
};

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export type RecommendationRank = 1 | 2 | 3;

export type Recommendation = {
  rank: RecommendationRank;
  book: Book;
  explanation: string;
  sources: BookSources;
};

export type RecommendationSession = {
  id: string;
  problemText: string;
  picks: Recommendation[];
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Reading plan
// ---------------------------------------------------------------------------

export type PlanStatus = 'active' | 'completed' | 'abandoned';

export type ReadingPlan = {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  recommendationId?: string;
  problemText: string;
  dailyPages: number;
  totalDays: number;
  currentDay: number;
  notificationTime: string; // "HH:MM"
  status: PlanStatus;
  startedAt: string;
  completedAt?: string;
};

export type TodayPageRange = {
  startPage: number;
  endPage: number;
  dayNumber: number;
  totalDays: number;
};

// ---------------------------------------------------------------------------
// Daily logs
// ---------------------------------------------------------------------------

export type DailyLog = {
  id: string;
  planId: string;
  userId: string;
  dayNumber: number;
  pagesRead: number;
  reflectionText?: string;
  loggedAt: string;
};

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

export type StreakState = {
  count: number;
  longest: number;
  forgivenessUsed: boolean;
  lastLogDate: string | null; // ISO date string "YYYY-MM-DD"
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationCopy = {
  day: number;
  copy: string;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type AuthUser = {
  id: string;
  email: string;
};

// ---------------------------------------------------------------------------
// Offline queue
// ---------------------------------------------------------------------------

export type OfflineWriteType = 'daily_log' | 'reflection';

export type OfflineWrite = {
  id: string;
  type: OfflineWriteType;
  payload: Record<string, unknown>;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Crisis detection
// ---------------------------------------------------------------------------

export type CrisisResult = {
  isCrisis: boolean;
  tier: 1 | 2 | null;
};
