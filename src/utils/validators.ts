// src/utils/validators.ts

export const required = (value: string) => !!value || 'Campo Requerido';

export const notOnlySpaces = (value: string) =>
  value.trim().length > 0 || 'No puede estar vacío ni contener sólo espacios.';

export const onlyNumbers = (value: string) =>
  /^\d+$/.test(value) || 'Sólo se permiten números';

export const decimalNumber = (value: string) =>
  /^(\d+(,\d+)?|,\d+)$/.test(value) || 'Sólo se permiten números con decimales de coma.';

export const email = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Correo electrónico no válido';

export const validUSDate = (value: string) => {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) || 'Utilice el formato mm/dd/aaaa';
};

export const validUsername = (value: string) => {
  const minLength = value.length >= 6;
  const hasUppercase = /[A-Z]/.test(value);
  const hasSpecialChar = /[@$!%*?&#^()_\-+=]/.test(value);

  return (minLength && hasUppercase && hasSpecialChar)
    || 'El usuario debe tener al menos 6 caracteres, una mayúscula y un carácter especial.';
};

export const strongPassword = (value: string) => {
  const minLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[@$!%*?&#^()_\-+=]/.test(value);

  return minLength && hasUppercase && hasNumber && hasSpecialChar
    || 'Debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.';
};

export const matchPasswords = (getPassword: () => string) => {
  return (value: string) => value === getPassword() || 'Las contraseñas no coinciden';
};

export const colombianPhone = (value: string) => {
  const isValid = /^\d{10}$/.test(value);
  return isValid || 'El número debe tener exactamente 10 dígitos (sin códigos ni símbolos)';
};