// In-memory handoff to the clarifying-question screen. Holds the user's original
// problem text so it does not have to travel as a navigation param — that text
// is the user's private admission and must not land in route state or logs.
// Not persisted; never leaves the device.

let problemText: string | null = null;

export function setClarifyProblem(text: string): void {
  problemText = text;
}

export function getClarifyProblem(): string | null {
  return problemText;
}

export function clearClarifyProblem(): void {
  problemText = null;
}
