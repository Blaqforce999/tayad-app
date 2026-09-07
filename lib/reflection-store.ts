// In-memory handoff to the reflection screen after a daily check-in. Not persisted.

type ReflectionContext = {
  planId: string;
  // A short phrase drawn from the user's original problem, for the prompt copy.
  problemHint: string;
};

let context: ReflectionContext | null = null;

export function setReflectionContext(next: ReflectionContext): void {
  context = next;
}

export function getReflectionContext(): ReflectionContext | null {
  return context;
}

export function clearReflectionContext(): void {
  context = null;
}
