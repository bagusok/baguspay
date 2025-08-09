import axios from "axios";
import { v4 } from "uuid";
import { API_URL } from "~/common/constant";
import { store } from "~/store/store";
import { authTokenAtom } from "~/store/token";
import { deviceIdAtom } from "../store/device-id";

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const deviceId = store.get(deviceIdAtom);
  const accessToken = store.get(authTokenAtom);

  console.log("Access Token From Interceptor:", accessToken?.accessToken);
  console.log("Device ID From Interceptor:", deviceId);
  if (deviceId) {
    config.headers = config.headers || {};
    config.headers["X-Device-ID"] = deviceId;
  }

  if (accessToken?.accessToken) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${accessToken.accessToken}`;
  }

  config.headers["X-Version"] = "1.0.0";

  if (!config.headers["X-Request-ID"]) {
    config.headers["X-Request-ID"] = v4();
  }

  if (!config.headers["X-Time"]) {
    config.headers["X-Time"] = Date.now();
  }

  return config;
});
