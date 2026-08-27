const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Το email είναι υποχρεωτικό.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Δώσε ένα έγκυρο email.';
  }

  if (!password) {
    errors.password = 'Ο κωδικός είναι υποχρεωτικός.';
  }

  return errors;
}

export function validateRegisterForm({ name, email, phone, password, passwordConfirmation }) {
  const errors = {};

  if (!name.trim() || name.trim().length < 2) {
    errors.name = 'Δώσε το όνομά σου.';
  }

  if (!email.trim()) {
    errors.email = 'Το email είναι υποχρεωτικό.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Δώσε ένα έγκυρο email.';
  }

  if (phone.trim() && phone.trim().replace(/[\s-]/g, '').length < 8) {
    errors.phone = 'Το τηλέφωνο φαίνεται ελλιπές.';
  }

  if (!password) {
    errors.password = 'Ο κωδικός είναι υποχρεωτικός.';
  } else if (password.length < 8) {
    errors.password = 'Τουλάχιστον 8 χαρακτήρες.';
  }

  if (passwordConfirmation !== password) {
    errors.passwordConfirmation = 'Οι κωδικοί δεν ταιριάζουν.';
  }

  return errors;
}
