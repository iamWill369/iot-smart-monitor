
import { config } from "../config";

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
  lastSeen: new Date(Date.now() - index * 90000).toISOString(),
}));

const baseReading = {
  temperature: 29.5,
  humidity: 68,
  pressure: 1012.4,
  pm25: 18,
  pm10: 32,
  co: 210,
  no2: 14,
};

const offsets = {
  "ENV-001": { temperature: 0, humidity: 0, air: 0 },
  "ENV-002": { temperature: 2.4, humidity: -8, air: 12 },
  "ENV-003": { temperature: -1.6, humidity: 6, air: 25 },
};

function makeReading(deviceId) {
  const offset = offsets[deviceId] || offsets["ENV-001"];

  return {
    timestamp: new Date().toISOString(),
    temperature: baseReading.temperature + offset.temperature,
    humidity: Math.max(0, baseReading.humidity + offset.humidity),
    pressure: baseReading.pressure,
    pm25: baseReading.pm25 + offset.air,
    pm10: baseReading.pm10 + offset.air * 1.4,
    co: baseReading.co,
    no2: baseReading.no2,
  };
}

function makeHistory(hours, deviceId) {
  const current = makeReading(deviceId);
  const count = Math.max(1, Math.min(Number(hours) || 24, 48));

  const time = [];
  const temperature = [];
  const humidity = [];
  const pressure = [];
  const pm25 = [];
  const pm10 = [];

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 60 * 60 * 1000);
    const wave = Math.sin(i / 3) * 1.2;

    time.push(date.toISOString());
    temperature.push(Number((current.temperature + wave).toFixed(1)));
    humidity.push(Number((current.humidity + Math.cos(i / 4) * 3).toFixed(1)));
    pressure.push(Number((current.pressure + Math.sin(i / 5) * 1.5).toFixed(1)));
    pm25.push(Number((current.pm25 + Math.sin(i / 2) * 2).toFixed(1)));
    pm10.push(Number((current.pm10 + Math.cos(i / 3) * 3).toFixed(1)));
  }

  return { time, temperature, humidity, pressure, pm25, pm10 };
}

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

export async function getLatestSensorData(deviceId = "ENV-001") {
  if (config.mode === "real") {
    const params = new URLSearchParams({ deviceId });
    return request(`${config.backendUrl}/sensors/latest?${params}`);
  }

  const device = demoDevices.find((item) => item.id === deviceId);

  if (!device || device.status === "offline") {
    throw new Error("This sensor is offline or does not exist.");
  }

  return makeReading(deviceId);
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

    return request(`${config.backendUrl}/sensors/history?${params}`);
  }

  const device = demoDevices.find((item) => item.id === deviceId);

  if (!device || device.status === "offline") {
    throw new Error("Historical data is unavailable for this sensor.");
  }

  return makeHistory(hours, deviceId);
}

export async function getDevices() {
  if (config.mode === "real") {
    return request(`${config.backendUrl}/devices`);
  }

  return demoDevices;
}
