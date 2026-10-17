
import { useState, useCallback } from "react";
import {
  Activity,
  Droplets,
  Gauge,
  Wind,
  RefreshCw,
  Server,
  MapPin,
} from "lucide-react";

import { config } from "../config";
import { useSensorData } from "../hooks/useSensorData";
import { useHistory } from "../hooks/useHistory";
import MetricCard from "../components/common/MetricCard";
import StatusBadge from "../components/common/StatusBadge";
import PageHeader from "../components/common/PageHeader";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState, EmptyState } from "../components/common/State";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const fmt = (n, digits = 1) =>
  n !== null &&
  n !== undefined &&
  n !== "" &&
  Number.isFinite(Number(n))
    ? Number(n).toFixed(digits)
    : "--";

const time = (v) => {
  if (!v || Number.isNaN(new Date(v).getTime())) return "--";

  return new Date(v).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Dashboard() {
  const sensor = useSensorData();
  const history = useHistory(24);
  const [metric, setMetric] = useState("temperature");

  const refreshing = sensor.refreshing || history.refreshing;

  const refreshAll = useCallback(() => {
    sensor.refresh();
    history.reload();
  }, [sensor.refresh, history.reload]);

  // Show the initial loading screen only while required data
  // has not loaded for the first time.
  if (
    (sensor.loading && !sensor.data) ||
    (history.loading && !history.data)
  ) {
    return (
      <section className="content">
        <PageHeader
          title="Overview"
          subtitle="Live environmental monitoring dashboard"
        />
        <Loading text="Connecting to sensor APIs..." />
      </section>
    );
  }

  // Show a full error screen only when data is unavailable.
  // If previous data exists, keep the dashboard visible.
  if (
    (sensor.error && !sensor.data) ||
    (history.error && !history.data)
  ) {
    return (
      <section className="content">
        <PageHeader
          title="Overview"
          subtitle="Live environmental monitoring dashboard"
          action={
            <button
              type="button"
              className="btn"
              onClick={refreshAll}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              {refreshing ? "Refreshing..." : "Retry"}
            </button>
          }
        />

        <ErrorState
          message={sensor.error || history.error}
          retry={refreshAll}
        />
      </section>
    );
  }

  const data = sensor.data;
  const series = history.data;

  if (!data || !series) {
    return (
      <section className="content">
        <PageHeader
          title="Overview"
          subtitle="Live environmental sensor monitoring"
        />
        <EmptyState text="Sensor readings are not available yet." />
      </section>
    );
  }

  const values = [
    {
      icon: Activity,
      title: "Temperature",
      value: fmt(data.temperature),
      unit: "°C",
      caption: "Ambient sensor",
    },
    {
      icon: Droplets,
      title: "Humidity",
      value: fmt(data.humidity),
      unit: "%",
      caption: "Relative humidity",
    },
    {
      icon: Gauge,
      title: "Pressure",
      value: fmt(data.pressure),
      unit: "hPa",
      caption: "Atmospheric pressure",
    },
    {
      icon: Wind,
      title: "PM2.5",
      value: fmt(data.pm25),
      unit: "µg/m³",
      caption: "Air quality",
    },
  ];

  const chartData = Array.isArray(series.time)
    ? series.time.map((t, i) => ({
        time: t,
        temperature: series.temperature?.[i],
        humidity: series.humidity?.[i],
        pressure: series.pressure?.[i],
        pm25: series.pm25?.[i],
      }))
    : [];

  const metricLabels = {
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    pressure: "Pressure (hPa)",
    pm25: "PM2.5 (µg/m³)",
  };

  const apiLabel =
    config.mode === "demo" ? "Demo API" : "Production API";

  return (
    <section className="content">
      <PageHeader
        title="Overview"
        subtitle="Environmental sensor monitoring"
        action={
          <button
            type="button"
            className="btn"
            onClick={refreshAll}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <RefreshCw size={15} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      {(sensor.error || history.error) && (
        <div className="alert" role="alert">
          Could not refresh all dashboard data:{" "}
          {sensor.error || history.error}
          <button
            type="button"
            className="btn"
            onClick={refreshAll}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Retry"}
          </button>
        </div>
      )}

      <div className="metrics">
        {values.map((v) => (
          <MetricCard key={v.title} {...v} />
        ))}
      </div>

      <div className="two-col">
        <ChartCard
          title="Environmental Trend"
          subtitle="Historical sensor readings"
          controls={
            <select
              className="select"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="pressure">Pressure</option>
              <option value="pm25">PM2.5</option>
            </select>
          }
        >
          {chartData.length === 0 ? (
            <EmptyState text="No historical readings available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(148,163,184,.08)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={time}
                  tick={{ fill: "#71849d", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "#71849d", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1d30",
                    border: "1px solid rgba(148,163,184,.18)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  labelFormatter={time}
                  formatter={(value, name) => [
                    fmt(value),
                    metricLabels[name] || name,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <article className="card">
          <div className="card-head">
            <div>
              <h2>System Status</h2>
              <p>Dashboard data availability</p>
            </div>
            <StatusBadge>Data available</StatusBadge>
          </div>

          <div className="info-list">
            <div>
              <span>Sensor System</span>
              <b>Readings loaded</b>
            </div>
            <div>
              <span><MapPin size={13} /> Location</span>
              <b>{config.location.name}</b>
            </div>
            <div>
              <span><Server size={13} /> Data Source</span>
              <b>{apiLabel}</b>
            </div>
            <div>
              <span>Last Reading</span>
              <b>{time(data.timestamp)}</b>
            </div>
          </div>

          <div className="system-health">
            <div>
              <span>API Status</span>
              <b>{sensor.error || history.error
                ? "Refresh failed"
                : "Request successful"}
              </b>
            </div>
            <div className="progress">
              <i
                style={{
                  width: sensor.error || history.error ? "60%" : "100%",
                }}
              />
            </div>
          </div>
        </article>
      </div>

      <div className="two-col lower">
        <article className="card">
          <div className="card-head">
            <div>
              <h2>Air Quality Snapshot</h2>
              <p>Current pollutant readings</p>
            </div>
          </div>

          <div className="mini-kpis">
            {[
              ["PM10", fmt(data.pm10), "µg/m³"],
              ["CO", fmt(data.co, 0), "µg/m³"],
              ["NO₂", fmt(data.no2), "µg/m³"],
            ].map(([name, value, unit]) => (
              <div key={name}>
                <span>{name}</span>
                <strong>
                  {value}<small>{unit}</small>
                </strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <h2>Recent Events</h2>
              <p>Latest dashboard activity</p>
            </div>
          </div>

          <div className="events">
            <div>
              ✓ <span>Sensor readings loaded</span>
              <small>{time(data.timestamp)}</small>
            </div>
            <div>
              ↻ <span>Historical data loaded</span>
              <small>{chartData.length} readings</small>
            </div>
            <div>
              ● <span>{apiLabel} selected</span>
              <small>Current mode</small>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
