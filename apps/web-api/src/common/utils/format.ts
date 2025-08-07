import { ValidationError } from 'class-validator';

type FormattedErrors = Record<string, any>;

export function formatValidationErrors(
  errors: ValidationError[],
): FormattedErrors | FormattedErrors[] {
  // Cek apakah semua error dalam level ini adalah untuk indeks array
  // (misal, propertinya adalah "0", "1", "2", dst.)
  const isArray = errors.every((err) => !isNaN(parseInt(err.property, 10)));

  // JIKA INI ARRAY:
  if (isArray && errors.length > 0) {
    const formattedArray: FormattedErrors[] = [];
    for (const err of errors) {
      const index = parseInt(err.property, 10);
      // Panggil rekursif untuk mendapatkan objek error dari item array
      if (err.children) {
        formattedArray[index] = formatValidationErrors(err.children);
      }
    }
    return formattedArray;
  }

  // JIKA INI OBJEK (logika lama yang sedikit disesuaikan):
  return errors.reduce((acc, err) => {
    if (err.children && err.children.length > 0) {
      // Panggil rekursif untuk properti nested (baik objek maupun array)
      acc[err.property] = formatValidationErrors(err.children);
    } else {
      if (err.constraints) {
        acc[err.property] = Object.values(err.constraints)[0];
      }
    }
    return acc;
  }, {} as FormattedErrors);
}
