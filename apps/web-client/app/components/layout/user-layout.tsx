import { useAtom, useAtomValue } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { deviceIdAtom } from "~/store/device-id";
import { queryClient } from "~/store/store";
import { themeAtom } from "~/store/theme";
import { generateDeviceIdSync } from "~/utils/device-id";
import FooterSection from "../footer";
import Header from "../header";
import Sidebar from "../sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useHydrateAtoms([[queryClientAtom, queryClient]]);

  const theme = useAtomValue(themeAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);

  useEffect(() => {
    if (!deviceId) {
      setDeviceId(generateDeviceIdSync());
    }
  }, [deviceId, setDeviceId]);

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "dark" : "";
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">{children}</main>
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />
      <FooterSection />
    </div>
  );
}
