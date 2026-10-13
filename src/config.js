const env = import.meta.env;

export const config = {
  mode: env.VITE_API_MODE || "demo",
  backendUrl: env.VITE_BACKEND_URL || "http://localhost:8080/api",
  location: {
    name: env.VITE_LOCATION_NAME || "Chennai",
    latitude: Number(env.VITE_LATITUDE || 13.0827),
    longitude: Number(env.VITE_LONGITUDE || 80.2707),
    timezone: env.VITE_TIMEZONE || "Asia/Kolkata"
  },
  refreshMs: 5 * 60 * 1000,
  demo: {
    weather: "https://api.open-meteo.com/v1/forecast",
    airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality"
  }
};