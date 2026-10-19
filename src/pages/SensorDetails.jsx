
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  Droplets,
  Gauge,
  Wind,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { getDevices } from "../services/api";
import { useSensorData } from "../hooks/useSensorData";
import { useHistory } from "../hooks/useHistory";
import PageHeader from "../components/common/PageHeader";
import MetricCard from "../components/common/MetricCard";
import StatusBadge from "../components/common/StatusBadge";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const metricLabels = {
  temperature: "Temperature (°C)",
  humidity: "Humidity (%)",
  pressure: "Pressure (hPa)",
  pm25: "PM2.5 (µg/m³)",
  pm10: "PM10 (µg/m³)",
};

const sensorTooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfe8da",
  borderRadius: "10px",
  color: "#344735",
  padding: "10px 12px",
};

const formatSensorTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function SensorDonutChart({ rows, metric }) {
  const values = rows
    .map((row) => row[metric])
    .filter(Number.isFinite);

  if (!values.length) {
    return <p className="sensor-chart-empty">No readings available for this metric.</p>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  let donutData;

  if (min === max) {
    donutData = [{ name: "Available readings", value: values.length }];
  } else {
    const range = max - min;
    const lowLimit = min + range / 3;
    const midLimit = min + (range * 2) / 3;
    const counts = { Low: 0, Medium: 0, High: 0 };

    values.forEach((value) => {
      if (value <= lowLimit) counts.Low += 1;
      else if (value <= midLimit) counts.Medium += 1;
      else counts.High += 1;
    });

    donutData = [
      { name: "Low range", value: counts.Low },
      { name: "Medium range", value: counts.Medium },
      { name: "High range", value: counts.High },
    ].filter((item) => item.value > 0);
  }

  const colors = ["#a8c49a", "#789b6b", "#456b42"];

  return (
    <div className="sensor-donut-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            innerRadius="52%"
            outerRadius="76%"
            paddingAngle={3}
            isAnimationActive={false}
          >
            {donutData.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={sensorTooltipStyle}
            formatter={(value, name) => [`${value} readings`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="sensor-donut-caption">
        Distribution of {values.length} actual {metricLabels[metric]} readings
      </p>
    </div>
  );
}

export default function SensorDetails() {
  const { deviceId } = useParams();

  const [device, setDevice] = useState(null);
  const [devError, setDevError] = useState("");
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [chartMetric, setChartMetric] = useState("temperature");

  const refreshLock = useRef(false);

  const sensor = useSensorData(false, deviceId);
  const history = useHistory(24, deviceId);

  const refreshing =
    manualRefreshing || sensor.refreshing || history.refreshing;

  // Refresh both the latest readings and historical chart data.
  const refreshAll = useCallback(async () => {
    if (refreshLock.current) return;

    refreshLock.current = true;
    setManualRefreshing(true);

    try {
      // Allow React to display the refreshing indicator first.
      await new Promise((resolve) =>
        requestAnimationFrame(resolve)
      );

      await Promise.all([
        sensor.refresh(),
        history.reload(),
      ]);
    } finally {
      refreshLock.current = false;
      setManualRefreshing(false);
    }
  }, [sensor.refresh, history.reload]);

  // Load the selected device.
  useEffect(() => {
    let active = true;

    setDevice(null);
    setDevError("");

    getDevices()
      .then((devices) => {
        if (!active) return;

        const selectedDevice = devices.find(
          (item) => item.id === deviceId
        );

        if (selectedDevice) {
          setDevice(selectedDevice);
        } else {
          setDevError("Sensor not found.");
        }
      })
      .catch((error) => {
        if (active) {
          setDevError(
            error.message || "Unable to load device."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [deviceId]);

  // Initial loading state.
  if (
    sensor.loading ||
    history.loading ||
    (!device && !devError)
  ) {
    return (
      <section className="content">
        <PageHeader
          title="Sensor Details"
          subtitle="Device-level readings and history"
        />
        <Loading />
      </section>
    );
  }

  // Unknown device.
  if (devError) {
    return (
      <section className="content">
        <PageHeader
          title="Sensor Not Found"
          subtitle="The requested device does not exist."
        />

        <ErrorState
          title="Sensor Not Found"
          message={devError}
        />

        <Link className="btn" to="/devices">
          <ArrowLeft size={15} />
          Back to Device Fleet
        </Link>
      </section>
    );
  }

  // Offline device.
  if (device?.status === "offline") {
    return (
      <section className="content">
        <PageHeader
          title={device.name}
          subtitle={`${device.id} • ${device.location}`}
        />

        <ErrorState
          title="Device Offline"
          message="This device is currently offline. Sensor readings are unavailable until it reconnects."
        />

        <Link className="btn" to="/devices">
          <ArrowLeft size={15} />
          Back to Device Fleet
        </Link>
      </section>
    );
  }

  // Show errors with a working retry action.
  if (sensor.error || history.error) {
    return (
      <section className="content">
        <PageHeader
          title={device.name}
          subtitle={`${device.id} • ${device.location}`}
          action={
            <button
              type="button"
              className="btn"
              onClick={refreshAll}
              disabled={refreshing}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Retry"}
            </button>
          }
        />

        <ErrorState
          title="Unable to Load Sensor Data"
          message={sensor.error || history.error}
          retry={refreshAll}
        />

        <Link className="btn" to="/devices">
          <ArrowLeft size={15} />
          Back to Device Fleet
        </Link>
      </section>
    );
  }

  if (!sensor.data || !history.data) {
    return (
      <section className="content">
        <PageHeader
          title={device.name}
          subtitle={`${device.id} • ${device.location}`}
          action={
            <button
              type="button"
              className="btn"
              onClick={refreshAll}
              disabled={refreshing}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          }
        />

        <p>No sensor data is available.</p>
      </section>
    );
  }

  const reading = sensor.data;

  const historicalTimes = Array.isArray(history.data.time)
    ? history.data.time
    : [];

  // Keep all chart values sourced from the existing history API.
  const rows = historicalTimes.map((time, index) => {
    const valueAt = (key) => {
      const values = history.data[key];
      if (!Array.isArray(values) || values[index] == null || values[index] === "") {
        return null;
      }
      const value = Number(values[index]);
      return Number.isFinite(value) ? value : null;
    };

    return {
      time,
      temperature: valueAt("temperature"),
      humidity: valueAt("humidity"),
      pressure: valueAt("pressure"),
      pm25: valueAt("pm25"),
      pm10: valueAt("pm10"),
    };
  });

  const validTemperatures = rows
    .map((row) => row.temperature)
    .filter(Number.isFinite);

  const temperatureStats = validTemperatures.length
    ? {
        min: Math.min(...validTemperatures),
        max: Math.max(...validTemperatures),
        avg:
          validTemperatures.reduce(
            (sum, value) => sum + value,
            0
          ) / validTemperatures.length,
      }
    : null;

  return (
    <section className="content">
      <PageHeader
        title={device.name}
        subtitle={`${device.id} • ${device.location}`}
        action={
          <div className="header-actions">
            <button
              type="button"
              className="btn"
              onClick={refreshAll}
              disabled={refreshing}
              aria-busy={refreshing}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link className="btn" to="/devices">
              <ArrowLeft size={15} />
              Device Fleet
            </Link>
          </div>
        }
      />

      {refreshing && (
        <p role="status" aria-live="polite">
          Updating sensor readings and historical data...
        </p>
      )}

      <div className="detail-top">
       <div className="metrics">
          <MetricCard
            icon={Activity}
            title="Temperature"
            value={
              Number.isFinite(Number(reading.temperature))
                ? Number(reading.temperature).toFixed(1)
                : "—"
            }
            unit="°C"
          />

          <MetricCard
            icon={Droplets}
            title="Humidity"
            value={
              Number.isFinite(Number(reading.humidity))
                ? Number(reading.humidity).toFixed(1)
                : "—"
            }
            unit="%"
          />

          <MetricCard
            icon={Gauge}
            title="Pressure"
            value={
              Number.isFinite(Number(reading.pressure))
                ? Number(reading.pressure).toFixed(1)
                : "—"
            }
            unit="hPa"
          />

          <MetricCard
            icon={Wind}
            title="PM2.5"
            value={
              Number.isFinite(Number(reading.pm25))
                ? Number(reading.pm25).toFixed(1)
                : "—"
            }
            unit="µg/m³"
          />
        </div>

        <article className="card">
          <div className="card-head">
            <div>
              <h2>Device Information</h2>
              <p>Identity and connectivity</p>
            </div>

            <StatusBadge
              status={
                device.status === "offline"
                  ? "error"
                  : device.status
              }
            >
              {device.status}
            </StatusBadge>
          </div>

          <div className="info-list">
            <div>
              <span>Device type</span>
              <b>{device.type}</b>
            </div>

            <div>
              <span>Battery</span>
              <b>{device.battery}%</b>
            </div>

            <div>
              <span>Signal</span>
              <b>{device.signal}%</b>
            </div>

            <div>
              <span>Last seen</span>
              <b>
                {device.lastSeen
                  ? new Date(
                      device.lastSeen
                    ).toLocaleString()
                  : "—"}
              </b>
            </div>
          </div>
        </article>
      </div>

      <h2>Temperature Summary</h2>
      <p>Statistics calculated from historical readings</p>

      <div className="metrics temperature-summary-grid">
        {temperatureStats ? (
          <>
            <MetricCard
              icon={Activity}
              title="Minimum Temperature"
              value={temperatureStats.min.toFixed(1)}
              unit="°C"
              caption="Historical minimum"
            />

            <MetricCard
              icon={Activity}
              title="Maximum Temperature"
              value={temperatureStats.max.toFixed(1)}
              unit="°C"
              caption="Historical maximum"
            />

            <MetricCard
              icon={Activity}
              title="Average Temperature"
              value={temperatureStats.avg.toFixed(1)}
              unit="°C"
              caption="Historical average"
            />
          </>
        ) : (
          <p>
            No valid historical temperature readings available.
          </p>
        )}
      </div>

      {rows.some((row) => Number.isFinite(row[chartMetric])) ? (
        <ChartCard
          title="Historical Sensor Readings"
          subtitle={`${rows.filter((row) => Number.isFinite(row[chartMetric])).length} available ${chartMetric} readings`}
        >
          <div className="sensor-chart-toolbar">
            <label className="sensor-chart-control">
              <span>Metric</span>
              <select
                className="select"
                value={chartMetric}
                onChange={(event) => setChartMetric(event.target.value)}
                aria-label="Select sensor metric"
              >
                <option value="temperature">Temperature (°C)</option>
                <option value="humidity">Humidity (%)</option>
                <option value="pressure">Pressure (hPa)</option>
                <option value="pm25">PM2.5 (µg/m³)</option>
                <option value="pm10">PM10 (µg/m³)</option>
              </select>
            </label>

            <label className="sensor-chart-control">
              <span>Chart</span>
              <select
                className="select"
                value={chartType}
                onChange={(event) => setChartType(event.target.value)}
                aria-label="Select chart type"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="donut">Donut Chart</option>
              </select>
            </label>
          </div>

          {chartType === "donut" ? (
            <SensorDonutChart rows={rows} metric={chartMetric} />
          ) : (
            <div className="sensor-chart-plot">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                <BarChart data={rows}>
                  <CartesianGrid stroke="#e6ede2" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatSensorTime}
                    tick={{ fill: "#71816f", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#71816f", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={sensorTooltipStyle}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [
                      Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "—",
                      metricLabels[chartMetric],
                    ]}
                  />
                  <Bar
                    dataKey={chartMetric}
                    name={metricLabels[chartMetric]}
                    fill="#8eaa7b"
                    radius={[5, 5, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : chartType === "area" ? (
                <AreaChart data={rows}>
                  <CartesianGrid stroke="#e6ede2" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatSensorTime}
                    tick={{ fill: "#71816f", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#71816f", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={sensorTooltipStyle}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [
                      Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "—",
                      metricLabels[chartMetric],
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    name={metricLabels[chartMetric]}
                    stroke="#688b5b"
                    fill="#cbdcc1"
                    fillOpacity={0.8}
                    strokeWidth={2.5}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <LineChart data={rows}>
                  <CartesianGrid stroke="#e6ede2" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatSensorTime}
                    tick={{ fill: "#71816f", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#71816f", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={sensorTooltipStyle}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [
                      Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "—",
                      metricLabels[chartMetric],
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartMetric}
                    name={metricLabels[chartMetric]}
                    stroke="#688b5b"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      ) : (
        <p className="sensor-chart-empty">
          No historical {metricLabels[chartMetric].toLowerCase()} readings are available for this sensor.
        </p>
      )}
    </section>
  );
}
