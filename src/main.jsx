import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./api/interceptor.js";
import { AuthProvider } from "./context/AuthProvider.jsx";

// import { getMessaging, onMessage } from "firebase/messaging";
// import { toast } from 'react-toastify'; // Or any alert system

// const messaging = getMessaging();

// // This is the missing link!
// onMessage(messaging, (payload) => {
//   console.log('Message received in Foreground: ', payload);

//   // Option 1: Show a Browser Notification manually (even if tab is open)
//   // Note: Some browsers still block this if the tab is focused
//   if (Notification.permission === 'granted') {
//     new Notification(payload.notification.title, {
//       body: payload.notification.body,
//       icon: '/logo192.png'
//     });
//   }

//   // Option 2: Show a Toast (Better UX for open apps)
//   // If you use react-toastify:
//   toast.success(`${payload.notification.title}: ${payload.notification.body}`);
// });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}

navigator.serviceWorker.ready.then((r) =>
  console.log("pushManager:", r.pushManager)
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
