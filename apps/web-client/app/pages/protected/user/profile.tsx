import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeAlertIcon,
  BadgeCheckIcon,
  CalendarIcon,
  CreditCardIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  RefreshCwIcon,
  ShieldIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { apiClient } from "~/utils/axios";
import { formatDate, formatPrice } from "~/utils/format";
import type { Route } from "./+types/profile";

export default function UserProfile({ loaderData }: Route.ComponentProps) {
  const profile = useQuery<UserProfileResponse>({
    queryKey: ["userProfile"],
    queryFn: async () =>
      apiClient
        .get("/user/profile")
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profil Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>
      </div>

      {profile.isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Memuat profil...</p>
        </div>
      )}

      {profile.isError && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <XIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                Gagal Memuat Profil
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm text-center mb-4">
                {profile.error?.message ||
                  "Terjadi kesalahan saat memuat profil"}
              </p>
              <Button
                variant="outline"
                onClick={() => profile.refetch()}
                className="gap-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.isSuccess && (
        <div className="space-y-6">
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Informasi Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {profile.data.data.image_url ? (
                    <img
                      src={profile.data.data.image_url}
                      alt={profile.data.data.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-lg">
                    {profile.data.data.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {profile.data.data.id}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Badge
                      variant={
                        profile.data.data.role === "admin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {profile.data.data.role}
                    </Badge>
                    <Badge
                      variant={
                        profile.data.data.registered_type === "local"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {profile.data.data.registered_type}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit
                </Button>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MailIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium flex gap-2">
                      Email{" "}
                      <span className="flex items-center gap-2">
                        {profile.data.data.is_email_verified ? (
                          <BadgeCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <BadgeAlertIcon className="w-4 h-4 text-red-600 dark:text-red-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Belum diverifikasi</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.data.data.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <PhoneIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nomor Telepon</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.data.data.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="border-border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShieldIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Detail Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Balance */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CreditCardIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Saldo Akun
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(profile.data.data.balance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Status Akun</p>
                    <p className="text-xs text-muted-foreground">
                      Kondisi akun saat ini
                    </p>
                  </div>
                  <Badge
                    variant={
                      profile.data.data.is_banned ? "destructive" : "default"
                    }
                  >
                    {profile.data.data.is_banned ? "Diblokir" : "Aktif"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Verifikasi Email</p>
                    <p className="text-xs text-muted-foreground">
                      Status verifikasi email
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.data.data.is_email_verified ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Terverifikasi
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="destructive">Belum Terverifikasi</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          Verifikasi
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bergabung Sejak</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(profile.data.data.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  balance: number;
  registered_type: string;
  is_banned: boolean;
  image_url: string | null;
  is_email_verified: boolean;
  created_at: string;
}
