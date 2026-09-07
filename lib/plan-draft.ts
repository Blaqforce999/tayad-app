// In-memory handoff from the book screen to the plan-setup screen. Not persisted.

export type PlanDraft = {
  bookId: string;
  title: string;
  totalPages: number;
  recommendationId: string | null;
  chosenRank: number;
};

let draft: PlanDraft | null = null;

export function setPlanDraft(next: PlanDraft): void {
  draft = next;
}

export function getPlanDraft(): PlanDraft | null {
  return draft;
}

export function clearPlanDraft(): void {
  draft = null;
}
