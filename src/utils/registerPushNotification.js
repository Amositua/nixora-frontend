import { getToken } from "firebase/messaging";
import { messaging } from "../config/firebase-config";

export const registerForPushNotifications = async () => {
  console.log("1. Requesting permission...");
  const permission = await Notification.requestPermission();
  console.log("Permission:", permission);

  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  console.log("2. Waiting for service worker...");
  const registration = await navigator.serviceWorker.ready;
  console.log("Service worker ready:", registration);

  console.log("3. Getting FCM token...");
  const token = await getToken(messaging, {
    vapidKey:
      "BPgtK9wRvsgppA7He02Ne3uu4ZTLJuv8G_zViKYtMvthY8PDwn5dOCwngKazYUJ5HAWaiu96E_9tpb6AW0mc3tU",
    serviceWorkerRegistration: registration,
  });

  console.log("4. FCM token:", token);

  if (!token) {
    throw new Error("Failed to get FCM token");
  }

  return token;
};
