// In-memory handoff to the celebration screen (the plan row is already marked
// completed, so its data has to be carried over). Not persisted.

type Completion = {
  bookTitle: string;
  pagesRead: number;
  streakCount: number;
  isBestStreak: boolean;
};

let completion: Completion | null = null;

export function setCompletion(next: Completion): void {
  completion = next;
}

export function getCompletion(): Completion | null {
  return completion;
}

export function clearCompletion(): void {
  completion = null;
}
