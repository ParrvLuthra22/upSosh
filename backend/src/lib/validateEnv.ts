/**
 * Checks the environment the API cannot run safely without. Only enforced in
 * production (see assertProductionEnv); development and tests keep working
 * with whatever is in backend/.env.
 *
 * Messages name the variable and what is wrong with it. They never include the
 * value, so a log line cannot leak a secret.
 */

const MIN_JWT_SECRET_LENGTH = 32;

/** The values shipped in backend/.env.example, and the shapes people leave behind. */
const PLACEHOLDER = /(^|[-_])your[-_]|change[-_]?(this|me|in)|^replace[-_]?me$|^placeholder$/i;

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === '';
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function envProblems(env: NodeJS.ProcessEnv): string[] {
  const problems: string[] = [];
  const need = (name: string, check?: (value: string) => string | null): void => {
    const value = env[name];
    if (isBlank(value)) {
      problems.push(`${name} is missing`);
      return;
    }
    const trimmed = value!.trim();
    if (PLACEHOLDER.test(trimmed)) {
      problems.push(`${name} is still a placeholder value`);
      return;
    }
    const issue = check?.(trimmed);
    if (issue) problems.push(`${name} ${issue}`);
  };

  need('DATABASE_URL', (v) => (/^postgres(ql)?:\/\//.test(v) ? null : 'must be a postgres:// or postgresql:// URL'));
  need('JWT_SECRET', (v) => (v.length >= MIN_JWT_SECRET_LENGTH ? null : `is too short (at least ${MIN_JWT_SECRET_LENGTH} characters)`));
  need('FRONTEND_URL', (v) => (isHttpUrl(v) ? null : 'must be an http(s) URL'));
  need('RAZORPAY_KEY_ID', (v) => (/^rzp_(test|live)_/.test(v) ? null : 'must start with rzp_test_ or rzp_live_'));
  need('RAZORPAY_KEY_SECRET');
  need('RAZORPAY_WEBHOOK_SECRET');
  return problems;
}

/** Throws one error listing every problem. A no-op outside production. */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return;
  const problems = envProblems(env);
  if (problems.length > 0) {
    throw new Error(`Invalid production environment:\n  - ${problems.join('\n  - ')}`);
  }
}
