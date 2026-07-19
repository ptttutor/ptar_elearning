// Single source of truth for resolving how long a student's access to a
// course lasts. Per-student override on the Enrollment wins; falls back to
// the course's own default, then a hardcoded 60 days if neither is set.
export function resolveEnrollmentAccess(enrollment, course) {
  const accessDuration = enrollment.accessDuration ?? course.accessDuration ?? 60;
  const enrolledAt = new Date(enrollment.enrolledAt);
  const expiresAt = new Date(enrolledAt.getTime() + accessDuration * 24 * 60 * 60 * 1000);
  const isExpire = new Date() > expiresAt;
  return { accessDuration, expiresAt, isExpire };
}
