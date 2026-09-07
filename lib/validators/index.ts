import { z } from 'zod';

// ---------------------------------------------------------------------------
// Problem input — the "What are you tired of?" field
// ---------------------------------------------------------------------------

export const problemInputSchema = z
  .string()
  .trim()
  .min(10, 'Tell us a bit more — at least a sentence.')
  .max(2000, 'That\'s a lot. Try to summarise in a couple of sentences.');

export type ProblemInput = z.infer<typeof problemInputSchema>;

// ---------------------------------------------------------------------------
// Notification time — stored as "HH:MM" (24-hour)
// ---------------------------------------------------------------------------

export const notificationTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time in HH:MM format.');

export type NotificationTime = z.infer<typeof notificationTimeSchema>;

// ---------------------------------------------------------------------------
// Daily page goal
// ---------------------------------------------------------------------------

export const dailyPagesSchema = z
  .number()
  .int()
  .min(1, 'At least one page a day.')
  .max(200, 'That\'s a lot of pages. Try something more sustainable.');

// ---------------------------------------------------------------------------
// AI response from the match Edge Function
// A single ranked pick within the picks array.
// ---------------------------------------------------------------------------

export const aiPickSchema = z.object({
  book_id: z.string().uuid('book_id must be a valid UUID.'),
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z
    .string()
    .min(20, 'Explanation too short.')
    .max(500, 'Explanation too long.'),
});

export const aiResponseSchema = z.object({
  picks: z
    .array(aiPickSchema)
    .length(3, 'The AI must return exactly 3 picks.'),
});

export type AiPick = z.infer<typeof aiPickSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;

// ---------------------------------------------------------------------------
// Waitlist email (used by the landing page)
// ---------------------------------------------------------------------------

export const waitlistEmailSchema = z
  .string()
  .email('Please enter a valid email address.')
  .max(255);
