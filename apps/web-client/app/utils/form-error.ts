import type { UseFormSetError } from "react-hook-form";

/**
 * Fungsi rekursif untuk memetakan error dari server ke field React Hook Form.
 * @param errors - Objek error dari server.
 * @param setError - Fungsi setError dari `useForm`.
 * @param parentPath - Path awal untuk field nested (digunakan dalam rekursi).
 */
export function setServerErrors(
  errors: any,
  setError: UseFormSetError<any>,
  parentPath = "",
) {
  // Pastikan errors adalah objek dan bukan null
  if (typeof errors !== "object" || errors === null) {
    return;
  }

  for (const key in errors) {
    // Pastikan kita tidak memproses properti dari prototype
    if (Object.prototype.hasOwnProperty.call(errors, key)) {
      const value = errors[key];
      // Bangun nama field yang dikenali React Hook Form, contoh: "users.0.name"
      const fieldName = parentPath ? `${parentPath}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        // Jika value adalah objek/array, panggil fungsi ini lagi (rekursi)
        setServerErrors(value, setError, fieldName);
      } else if (typeof value === "string") {
        // Jika value adalah string, kita telah menemukan pesan error. Set error-nya.
        setError(fieldName, { type: "server", message: value });
      }
    }
  }
}
