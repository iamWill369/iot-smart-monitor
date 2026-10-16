
import { config } from "../config";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function getWeather() {
  const params = new URLSearchParams({
    latitude: config.location.latitude,
    longitude: config.location.longitude,
    current:
      "temperature_2m,relative_humidity_2m,surface_pressure",
    hourly:
      "temperature_2m,relative_humidity_2m,surface_pressure",
    timezone: config.location.timezone,
    forecast_days: "2",
  });

  return request(`${config.demo.weather}?${params}`);
}

async function getAirQuality() {
  const params = new URLSearchParams({
    latitude: config.location.latitude,
    longitude: config.location.longitude,
    current: "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide",
    hourly: "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide",
    timezone: config.location.timezone,
    forecast_days: "2",
  });

  return request(`${config.demo.airQuality}?${params}`);
}

const demoDevices = [
  {
    id: "ENV-001",
    name: "Main Environment Node",
    location: "Chennai Lab",
    status: "online",
    battery: 92,
    signal: 94,
    type: "Environmental",
  },
  {
    id: "ENV-002",
    name: "Outdoor Air Node",
    location: "Rooftop",
    status: "online",
    battery: 76,
    signal: 81,
    type: "Air Quality",
  },
  {
    id: "ENV-003",
    name: "Backup Sensor Node",
    location: "Storage Room",
    status: "warning",
    battery: 31,
    signal: 48,
    type: "Environmental",
  },
  {
    id: "ENV-004",
    name: "Prototype Node",
    location: "Engineering Lab",
    status: "offline",
    battery: 12,
    signal: 18,
    type: "Prototype",
  },
].map((device, index) => ({
  ...device,
  lastSeen: new Date(
    Date.now() - index * 90_000
  ).toISOString(),
}));

export async function getLatestSensorData(deviceId = "ENV-001") {
  if (config.mode === "real") {
    const params = new URLSearchParams({ deviceId });

    return request(
      `${config.backendUrl}/sensors/latest?${params}`
    );
  }

  const [weather, air] = await Promise.all([
    getWeather(),
    getAirQuality(),
  ]);

  return {
    timestamp: weather.current.time,
    temperature: weather.current.temperature_2m,
    humidity: weather.current.relative_humidity_2m,
    pressure: weather.current.surface_pressure,
    pm25: air.current.pm2_5,
    pm10: air.current.pm10,
    co: air.current.carbon_monoxide,
    no2: air.current.nitrogen_dioxide,
  };
}

export async function getHistoricalSensorData(
  hours = 24,
  deviceId = "ENV-001"
) {
  if (config.mode === "real") {
    const params = new URLSearchParams({
      deviceId,
      hours: String(hours),
    });

    return request(
      `${config.backendUrl}/sensors/history?${params}`
    );
  }

  const [weather, air] = await Promise.all([
    getWeather(),
    getAirQuality(),
  ]);

  return {
    time: weather.hourly.time.slice(0, hours),
    temperature: weather.hourly.temperature_2m.slice(0, hours),
    humidity: weather.hourly.relative_humidity_2m.slice(0, hours),
    pressure: weather.hourly.surface_pressure.slice(0, hours),
    pm25: air.hourly.pm2_5.slice(0, hours),
    pm10: air.hourly.pm10.slice(0, hours),
  };
}

export async function getDevices() {
  if (config.mode === "real") {
    return request(`${config.backendUrl}/devices`);
  }

  return demoDevices;
}
