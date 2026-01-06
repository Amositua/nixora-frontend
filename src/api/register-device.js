// src/api/registerDevice.js
export const registerDevice = async (fcmToken) => {
  const token = localStorage.getItem("accessToken");
    console.log("fcmtoken:", fcmToken)
    console.log("token:", token)
  const res = await fetch(
    "https://nixora-image-latest.onrender.com/api/notifications/register-device",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fcmToken }),
    }
  );
 console.log(res);
  if (!res.ok) {
    throw new Error("Failed to register device");
  }
 
  return res.json();
};
