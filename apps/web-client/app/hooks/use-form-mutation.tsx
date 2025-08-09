import {
  useMutation,
  type DefaultError,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
// --- PERUBAHAN 1: Impor tipe yang kita butuhkan dari react-hook-form ---
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "react-hot-toast";

// --- Ini adalah utilitas Anda, kita asumsikan tipenya sudah benar ---
// (Biasanya seperti ini: export function setServerErrors(errors, setError: UseFormSetError<any>) { ... })
import { setServerErrors } from "~/utils/form-error";

interface ServerErrorResponse {
  message: string;
  errors?: Record<string, any>;
}

// --- PERUBAHAN 2: Modifikasi tipe opsi untuk menyertakan 'form' dan generic TFieldValues ---
interface CustomMutationOptions<
  TData,
  TError,
  TVariables,
  TFieldValues extends FieldValues, // Tambahkan generic untuk nilai form
> extends UseMutationOptions<TData, TError, TVariables> {
  // Jadikan 'form' sebagai properti yang wajib ada
  form: UseFormReturn<TFieldValues>;
  displayErrorAs?: "toast" | "root";
}

// --- PERUBAHAN 3: Tambahkan generic TFieldValues ke signature hook ---
export function useFormMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TFieldValues extends FieldValues = FieldValues, // Tambahkan generic di sini
>(options: CustomMutationOptions<TData, TError, TVariables, TFieldValues>) {
  // --- PERUBAHAN 4: Destructure 'form' dari opsi, dan hapus useFormContext ---
  const { form, displayErrorAs = "toast", ...restOptions } = options;
  // const { setError } = useFormContext<FieldValues>(); // HAPUS BARIS INI

  return useMutation<TData, TError, TVariables>({
    ...restOptions,
    onError: (error, variables, context) => {
      // Sekarang 'error' memiliki tipe yang benar (TError)
      if (isAxiosError<ServerErrorResponse>(error)) {
        const res = error.response;
        const resData = res?.data;

        if (res?.status === 422 && resData?.errors) {
          // --- PERUBAHAN 5: Gunakan form.setError ---
          setServerErrors(resData.errors, form.setError);
        } else {
          const errorMessage =
            resData?.message || "Terjadi kesalahan pada request.";
          if (displayErrorAs === "root") {
            // --- PERUBAHAN 5: Gunakan form.setError ---
            // Kita harus melakukan cast 'as Path<TFieldValues>' agar type-safe
            form.setError("root.serverError" as Path<TFieldValues>, {
              type: "server",
              message: errorMessage,
            });
          } else {
            toast.error(errorMessage);
          }
        }
      } else {
        // Fallback untuk error lain
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak terduga.";

        if (displayErrorAs === "root") {
          // --- PERUBAHAN 5: Gunakan form.setError ---
          form.setError("root.serverError" as Path<TFieldValues>, {
            type: "server",
            message: errorMessage,
          });
        } else {
          toast.error(errorMessage);
        }
      }

      // Jalankan callback onError original jika ada
      restOptions?.onError?.(error, variables, context);
    },
  });
}
