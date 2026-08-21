// Client-side grading for TYPED cards — mirrors plan.md §3.1's rule table
// and the prototype logic in Flashcard.html. Runs before the server call so
// the student sees instant feedback; the server never re-derives the grade,
// it just persists whatever grade this (or the SELF_GRADE/MC path) produced.

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function levenshtein(a: string, b: string): number {
  const rows: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i, ...Array(a.length).fill(0)])
  for (let j = 0; j <= a.length; j++) rows[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1))
    }
  }
  return rows[b.length][a.length]
}

export type TypedCheckResult = { grade: 0 | 3 | 4; kind: "ok" | "near" | "no" }

export function checkTypedAnswer(input: string, acceptedAnswers: string[], numericTolerance: number | null): TypedCheckResult {
  const value = normalize(input)
  if (!value) return { grade: 0, kind: "no" }

  // Exact match (case/whitespace-insensitive)
  for (const accepted of acceptedAnswers) {
    if (value === normalize(accepted)) return { grade: 4, kind: "ok" }
  }

  // Numeric within tolerance — only when both sides parse as numbers.
  if (numericTolerance != null) {
    const typedNum = Number(value)
    if (!Number.isNaN(typedNum)) {
      for (const accepted of acceptedAnswers) {
        const acceptedNum = Number(normalize(accepted))
        if (!Number.isNaN(acceptedNum) && Math.abs(typedNum - acceptedNum) <= numericTolerance) {
          return { grade: 4, kind: "ok" }
        }
      }
    }
  }

  // Near match — minor spelling mistake (Levenshtein <= 2)
  for (const accepted of acceptedAnswers) {
    if (levenshtein(value, normalize(accepted)) <= 2) return { grade: 3, kind: "near" }
  }

  return { grade: 0, kind: "no" }
}
