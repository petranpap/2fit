const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateLoginForm({ email, password }, t) {
  const errors = {};

  if (!email.trim()) {
    errors.email = t('validation.emailRequired');
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.emailInvalid');
  }

  if (!password) {
    errors.password = t('validation.passwordRequired');
  }

  return errors;
}

export function validateRegisterForm({ name, email, phone, password, passwordConfirmation }, t) {
  const errors = {};

  if (!name.trim() || name.trim().length < 2) {
    errors.name = t('validation.nameRequired');
  }

  if (!email.trim()) {
    errors.email = t('validation.emailRequired');
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.emailInvalid');
  }

  if (phone.trim() && phone.trim().replace(/[\s-]/g, '').length < 8) {
    errors.phone = t('validation.phoneInvalid');
  }

  if (!password) {
    errors.password = t('validation.passwordRequired');
  } else if (password.length < 8) {
    errors.password = t('validation.passwordMin');
  }

  if (passwordConfirmation !== password) {
    errors.passwordConfirmation = t('validation.passwordMismatch');
  }

  return errors;
}
