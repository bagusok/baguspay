import { useAtom } from "jotai";
import { useEffect } from "react";
import { deviceIdAtom } from "~/store/device-id";
import { generateDeviceIdSync } from "~/utils/device-id"; // Sesuaikan path

export function useInitializeDeviceId() {
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);

  useEffect(() => {
    // useEffect hanya berjalan di sisi client.
    // Jika deviceId masih null (artinya tidak ada di localStorage),
    // maka kita buat yang baru dan simpan.
    console.log(
      "Initializing Device ID:",
      deviceId,
      localStorage.getItem("deviceId"),
    );

    if (!deviceId) {
      const newId = generateDeviceIdSync();
      setDeviceId(newId);
    }
    // Dependensi array ini memastikan efek hanya berjalan sekali jika deviceId berubah dari null ke string
  }, [deviceId, setDeviceId]);

  // Kembalikan deviceId yang sudah ada atau yang baru dibuat
  return deviceId;
}
