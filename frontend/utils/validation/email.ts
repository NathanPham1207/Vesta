/**
 * Email validation for auth screens (Firebase-ready: keep rules here, not in UI).
 */

const FULL_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const MESSAGES = {
  emailRequired: 'Email is required.',
  emailMissingAt:
    'Include an "@" symbol with a domain (e.g. you@gmail.com).',
  emailMissingLocal: 'Add the part before "@" (e.g. name@domain.com).',
  emailMissingDomain: 'Add a domain after "@" (e.g. name@gmail.com).',
  emailIncompleteDomain:
    'Finish the domain with an extension (e.g. .com, .edu, .org).',
  emailInvalid: 'Enter a valid email address.',
} as const;

export function getEmailValidationError(email: string): string | undefined {
  const trimmed = email.trim();

  if (trimmed === '') return MESSAGES.emailRequired;
  if (!trimmed.includes('@')) return MESSAGES.emailMissingAt;

  const atIndex = trimmed.indexOf('@');
  const afterFirstAt = trimmed.slice(atIndex + 1);
  if (afterFirstAt.includes('@')) return MESSAGES.emailInvalid;

  const local = trimmed.slice(0, atIndex);
  const domain = afterFirstAt;

  if (local === '') return MESSAGES.emailMissingLocal;
  if (domain === '') return MESSAGES.emailMissingDomain;
  if (!domain.includes('.')) return MESSAGES.emailIncompleteDomain;

  const domainLabels = domain.split('.');
  if (domainLabels.some((label) => label.length === 0))
    return MESSAGES.emailInvalid;

  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) return MESSAGES.emailIncompleteDomain;

  if (!FULL_EMAIL_REGEX.test(trimmed)) return MESSAGES.emailInvalid;

  return undefined;
}

export function isValidEmailFormat(email: string): boolean {
  return getEmailValidationError(email) === undefined;
}
