
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
  Legend,
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
  const [chartType, setChartType] = useState("line");

  const refreshing = sensor.refreshing || history.refreshing;

const refreshAll = useCallback(async () => {
  console.log("REFRESH STARTED");

  try {
    await Promise.all([
      sensor.refresh(),
      history.reload(),
    ]);
    console.log("REFRESH COMPLETED");
  } catch (err) {
    console.error("REFRESH FAILED:", err);
  }
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

  // Values used by the selected metric's donut chart.
  const numericReadings = chartData
    .map((row) => Number(row[metric]))
    .filter((value) => Number.isFinite(value));

  const minReading = numericReadings.length
    ? Math.min(...numericReadings)
    : 0;
  const maxReading = numericReadings.length
    ? Math.max(...numericReadings)
    : 0;
  const range = maxReading - minReading;

  const donutData = range === 0
    ? [{ name: "Available readings", value: numericReadings.length }]
    : [
        {
          name: "Low range",
          value: numericReadings.filter(
            (value) => value < minReading + range / 3
          ).length,
        },
        {
          name: "Medium range",
          value: numericReadings.filter(
            (value) =>
              value >= minReading + range / 3 &&
              value < minReading + (2 * range) / 3
          ).length,
        },
        {
          name: "High range",
          value: numericReadings.filter(
            (value) => value >= minReading + (2 * range) / 3
          ).length,
        },
      ].filter((item) => item.value > 0);

  const chartColors = ["#66895A", "#A5BC8D", "#D7B66D"];

  const chartTooltipStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #DFE9D9",
    borderRadius: "12px",
    color: "#304334",
    boxShadow: "0 8px 24px rgba(47, 72, 46, 0.10)",
  };

  const metricUnit = {
    temperature: "°C",
    humidity: "%",
    pressure: "hPa",
    pm25: "µg/m³",
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
          title={
            chartType === "line"
              ? "Environmental Trend"
              : chartType === "bar"
                ? "Reading Comparison"
                : chartType === "area"
                  ? "Environmental Area Trend"
                  : "Reading Distribution"
          }
          subtitle={`${metricLabels[metric]} · Historical sensor readings`}
          controls={
            <div className="chart-controls">
              <select
                className="select"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                aria-label="Select sensor metric"
              >
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="pressure">Pressure</option>
                <option value="pm25">PM2.5</option>
              </select>

              <select
                className="select"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                aria-label="Select chart type"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="donut">Donut Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
          }
        >
          {chartData.length === 0 || numericReadings.length === 0 ? (
            <EmptyState text="No historical readings available for this metric." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "donut" ? (
                <PieChart>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value, name) => [`${value} readings`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{
                      fontSize: 11,
                      color: "#667866",
                      paddingTop: 10,
                    }}
                  />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius="55%"
                    outerRadius="76%"
                    paddingAngle={4}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    isAnimationActive={false}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : chartType === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="#EAF0E6"
                    strokeDasharray="4 5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={time}
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={{ stroke: "#DCE5D8" }}
                    axisLine={{ stroke: "#DCE5D8" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={time}
                    formatter={(value) => [
                      `${fmt(value)} ${metricUnit[metric]}`,
                      metricLabels[metric],
                    ]}
                  />
                  <Bar
                    dataKey={metric}
                    name={metricLabels[metric]}
                    fill="#789A68"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={30}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : chartType === "area" ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="sensorAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#789A68"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#789A68"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EAF0E6" strokeDasharray="4 5" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={time}
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={{ stroke: "#DCE5D8" }}
                    axisLine={{ stroke: "#DCE5D8" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={time}
                    formatter={(value) => [
                      `${fmt(value)} ${metricUnit[metric]}`,
                      metricLabels[metric],
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    name={metricLabels[metric]}
                    stroke="#66895A"
                    strokeWidth={2.5}
                    fill="url(#sensorAreaGradient)"
                    activeDot={{ r: 4, fill: "#66895A" }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid stroke="#EAF0E6" strokeDasharray="4 5" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={time}
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={{ stroke: "#DCE5D8" }}
                    axisLine={{ stroke: "#DCE5D8" }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "#879486", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={time}
                    formatter={(value) => [
                      `${fmt(value)} ${metricUnit[metric]}`,
                      metricLabels[metric],
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    name={metricLabels[metric]}
                    stroke="#66895A"
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#66895A",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
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
