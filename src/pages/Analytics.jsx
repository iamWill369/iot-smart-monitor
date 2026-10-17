import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";
import { useHistory } from "../hooks/useHistory";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const time = (v) =>
  new Date(v).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const avg = (a) =>
  a.length ? a.reduce((x, y) => x + Number(y), 0) / a.length : 0;

const tooltipStyle = {
  backgroundColor: "#0d1d30",
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: "12px",
  color: "#f8fafc",
  padding: "10px 14px",
};

const axisTick = { fill: "#8ba0ba", fontSize: 11 };

export default function Analytics() {
  const [hours, setHours] = useState(24);
  const { data, loading, error, reload } = useHistory(hours);

  if (loading) {
    return (
      <section className="content">
        <PageHeader
          title="Analytics"
          subtitle="Trends, statistics and data quality"
        />
        <Loading />
      </section>
    );
  }

  if (error) {
    return (
      <section className="content">
        <PageHeader
          title="Analytics"
          subtitle="Trends, statistics and data quality"
        />
        <ErrorState message={error} retry={reload} />
      </section>
    );
  }

  if (
    !data ||
    !Array.isArray(data.time) ||
    !Array.isArray(data.temperature) ||
    !Array.isArray(data.humidity) ||
    !Array.isArray(data.pm25) ||
    !Array.isArray(data.pm10)
  ) {
    return (
      <section className="content">
        <PageHeader title="Analytics" subtitle="Trends, statistics and data quality" />
        <p>No historical data is available for this period.</p>
      </section>
    );
  }

  const rows = data.time.map((t, i) => ({
    time: t,
    temperature: Number(data.temperature[i]),
    humidity: Number(data.humidity[i]),
    pm25: Number(data.pm25[i]),
    pm10: Number(data.pm10[i]),
  }));

  const temps = rows
    .map((row) => row.temperature)
    .filter(Number.isFinite);

  return (
    <section className="content">
      <PageHeader
        title="Analytics"
        subtitle="Explore environmental behavior over time"
        action={
          <select
            className="select"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={36}>36 hours</option>
            <option value={48}>48 hours</option>
          </select>
        }
      />

      <div className="two-col">
        <ChartCard
          title="Temperature & Humidity"
          subtitle="Environmental trend"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid stroke="rgba(148,163,184,.08)" />
              <XAxis
                dataKey="time"
                tickFormatter={time}
                tick={axisTick}
              />
              <YAxis tick={axisTick} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f8fafc", marginBottom: 6 }}
                itemStyle={{ color: "#38bdf8" }}
                labelFormatter={time}
                formatter={(value, name) => [
                  Number.isFinite(Number(value))
                    ? Number(value).toFixed(1)
                    : "--",
                  name === "temperature" ? "Temperature (°C)" : "Humidity (%)",
                ]}
              />
              <Line
                dataKey="temperature"
                name="temperature"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                dataKey="humidity"
                name="humidity"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Air Quality" subtitle="PM2.5 and PM10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid stroke="rgba(148,163,184,.08)" />
              <XAxis
                dataKey="time"
                tickFormatter={time}
                tick={axisTick}
              />
              <YAxis tick={axisTick} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f8fafc", marginBottom: 6 }}
                labelFormatter={time}
                formatter={(value, name) => [
                  Number.isFinite(Number(value))
                    ? Number(value).toFixed(1)
                    : "--",
                  name === "pm25" ? "PM2.5 (µg/m³)" : "PM10 (µg/m³)",
                ]}
              />
              <Line
                dataKey="pm25"
                name="pm25"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                dataKey="pm10"
                name="pm10"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="three-col stats">
        <div className="stat-card">
          <span>MIN TEMPERATURE</span>
          <strong>
            {temps.length ? `${Math.min(...temps).toFixed(1)}°C` : "--"}
          </strong>
        </div>

        <div className="stat-card">
          <span>AVERAGE</span>
          <strong>
            {temps.length ? `${avg(temps).toFixed(1)}°C` : "--"}
          </strong>
        </div>

        <div className="stat-card">
          <span>MAX TEMPERATURE</span>
          <strong>
            {temps.length ? `${Math.max(...temps).toFixed(1)}°C` : "--"}
          </strong>
        </div>
      </div>
    </section>
  );
}
