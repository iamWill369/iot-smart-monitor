# IoT Smart Monitor — React

A complete React + Vite IoT monitoring dashboard.

## Features
- React + Vite
- React Router
- Reusable dashboard components
- Recharts interactive graphs
- Open-Meteo weather API
- Open-Meteo air-quality API
- Device fleet simulation
- Search/filter devices
- Sensor details
- Analytics and statistics
- Auto-refresh
- Loading/error states
- Demo/production API adapter
- Responsive dark IoT UI

## Run
```bash
npm install
npm run dev
```

Open the URL Vite prints, normally:
`http://localhost:5173`

## Production API
All data access is isolated under `src/services/api.js`.

Set:
```env
VITE_API_MODE=real
VITE_BACKEND_URL=http://localhost:8080/api
```

Expected backend contract:
- GET `/devices`
- GET `/sensors/latest?deviceId=ENV-001`
- GET `/sensors/history?deviceId=ENV-001&hours=24`

The backend should return normalized sensor objects matching the examples in `src/services/api.js`.

For real IoT hardware, use ESP32/Raspberry Pi/QNX → backend/gateway → REST/WebSocket → React. Do not expose device secrets in frontend code.
