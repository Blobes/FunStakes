export const registerSW = () => {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW registration failed:", err));
  }
};
