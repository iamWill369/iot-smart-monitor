import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";
import { useHistory } from "../hooks/useHistory";
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

const time = (v) =>
  new Date(v).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const avg = (values) =>
  values.length
    ? values.reduce((total, value) => total + Number(value), 0) / values.length
    : 0;

const chartColors = ["#78966b", "#b4c9a5", "#dce8d5", "#e8c98b"];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfe8da",
  borderRadius: "10px",
  color: "#344735",
  padding: "10px 12px",
  boxShadow: "0 6px 20px rgba(42, 66, 43, 0.08)",
};

const axisTick = { fill: "#71816f", fontSize: 11 };

const formatValue = (value) =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "--";

function ChartTypeSelect({ value, onChange, label }) {
  return (
    <label className="analytics-chart-control">
      <span>{label}</span>
      <select
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} chart type`}
      >
        <option value="line">Line chart</option>
        <option value="bar">Bar chart</option>
        <option value="area">Area chart</option>
        <option value="donut">Donut chart</option>
      </select>
    </label>
  );
}

function TrendChart({ rows, type, firstKey, firstName, secondKey, secondName, firstColor, secondColor, donutKey, donutName }) {
  const numericValues = rows
    .map((row) => Number(row[donutKey]))
    .filter(Number.isFinite);

  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 0;
  const range = max - min;

  const donutData = useMemo(() => {
    if (!numericValues.length) return [];

    // Use the observed data range to group real readings; no sample data is added.
    if (range === 0) {
      return [{ name: "Recorded readings", value: numericValues.length }];
    }

    const lowLimit = min + range / 3;
    const highLimit = min + (range * 2) / 3;
    const buckets = [
      { name: "Lower range", value: 0 },
      { name: "Middle range", value: 0 },
      { name: "Upper range", value: 0 },
    ];

    numericValues.forEach((value) => {
      if (value < lowLimit) buckets[0].value += 1;
      else if (value < highLimit) buckets[1].value += 1;
      else buckets[2].value += 1;
    });

    return buckets.filter((bucket) => bucket.value > 0);
  }, [rows, donutKey, min, max, range]);

  const commonAxes = (
    <>
      <CartesianGrid stroke="#edf2e9" vertical={false} />
      <XAxis dataKey="time" tickFormatter={time} tick={axisTick} minTickGap={24} />
      <YAxis tick={axisTick} width={42} />
      <Tooltip
        contentStyle={tooltipStyle}
        labelStyle={{ color: "#344735", marginBottom: 6 }}
        labelFormatter={time}
        formatter={(value, name) => [
          formatValue(value),
          name === firstKey ? firstName : name === secondKey ? secondName : name,
        ]}
      />
      <Legend wrapperStyle={{ fontSize: 12, color: "#61735e" }} />
    </>
  );

  if (type === "donut") {
    return (
      <div className="analytics-donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              innerRadius="55%"
              outerRadius="78%"
              paddingAngle={3}
              stroke="#ffffff"
              strokeWidth={3}
            >
              {donutData.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} readings`, name]} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#61735e" }} />
          </PieChart>
        </ResponsiveContainer>
        <p className="analytics-donut-caption">
          Distribution of recorded {donutName} readings across the observed value range.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === "bar" ? (
        <BarChart data={rows} barGap={4}>
          {commonAxes}
          <Bar dataKey={firstKey} name={firstName} fill={firstColor} radius={[5, 5, 0, 0]} maxBarSize={24} />
          <Bar dataKey={secondKey} name={secondName} fill={secondColor} radius={[5, 5, 0, 0]} maxBarSize={24} />
        </BarChart>
      ) : type === "area" ? (
        <AreaChart data={rows}>
          {commonAxes}
          <Area dataKey={firstKey} name={firstName} stroke={firstColor} fill={firstColor} fillOpacity={0.18} strokeWidth={2} connectNulls={false} />
          <Area dataKey={secondKey} name={secondName} stroke={secondColor} fill={secondColor} fillOpacity={0.14} strokeWidth={2} connectNulls={false} />
        </AreaChart>
      ) : (
        <LineChart data={rows}>
          {commonAxes}
          <Line dataKey={firstKey} name={firstName} stroke={firstColor} strokeWidth={2.5} dot={false} connectNulls={false} />
          <Line dataKey={secondKey} name={secondName} stroke={secondColor} strokeWidth={2.5} dot={false} connectNulls={false} />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

export default function Analytics() {
  const [hours, setHours] = useState(24);
  const [environmentChartType, setEnvironmentChartType] = useState("line");
  const [airChartType, setAirChartType] = useState("line");
  const { data, loading, error, reload } = useHistory(hours);

  if (loading) {
    return (
      <section className="content">
        <PageHeader title="Analytics" subtitle="Trends, statistics and data quality" />
        <Loading />
      </section>
    );
  }

  if (error) {
    return (
      <section className="content">
        <PageHeader title="Analytics" subtitle="Trends, statistics and data quality" />
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

  const temps = rows.map((row) => row.temperature).filter(Number.isFinite);
  const hasRows = rows.length > 0;

  return (
    <section className="content analytics-page">
      <PageHeader
        title="Analytics"
        subtitle="Explore environmental behavior over time"
        action={
          <select
            className="select"
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
            aria-label="Historical time range"
          >
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={36}>36 hours</option>
            <option value={48}>48 hours</option>
          </select>
        }
      />

      {!hasRows ? (
        <div className="analytics-empty">
          No historical readings are available for this period.
        </div>
      ) : (
        <>
          <div className="two-col analytics-charts-grid">
            <ChartCard title="Temperature & Humidity" subtitle="Environmental trend">
              <div className="analytics-chart-heading">
                <span className="analytics-chart-hint">Temperature (°C) · Humidity (%)</span>
                <ChartTypeSelect value={environmentChartType} onChange={setEnvironmentChartType} label="View" />
              </div>
              <div className="analytics-chart">
                <TrendChart
                  rows={rows}
                  type={environmentChartType}
                  firstKey="temperature"
                  firstName="Temperature (°C)"
                  secondKey="humidity"
                  secondName="Humidity (%)"
                  firstColor="#78966b"
                  secondColor="#d2ad68"
                  donutKey="temperature"
                  donutName="temperature"
                />
              </div>
            </ChartCard>

            <ChartCard title="Air Quality" subtitle="PM2.5 and PM10">
              <div className="analytics-chart-heading">
                <span className="analytics-chart-hint">Particulate matter (µg/m³)</span>
                <ChartTypeSelect value={airChartType} onChange={setAirChartType} label="View" />
              </div>
              <div className="analytics-chart">
                <TrendChart
                  rows={rows}
                  type={airChartType}
                  firstKey="pm25"
                  firstName="PM2.5 (µg/m³)"
                  secondKey="pm10"
                  secondName="PM10 (µg/m³)"
                  firstColor="#78966b"
                  secondColor="#a9c4a0"
                  donutKey="pm25"
                  donutName="PM2.5"
                />
              </div>
            </ChartCard>
          </div>

          <div className="three-col stats analytics-stats">
            <div className="stat-card">
              <span>MIN TEMPERATURE</span>
              <strong>{temps.length ? `${Math.min(...temps).toFixed(1)}°C` : "--"}</strong>
            </div>
            <div className="stat-card">
              <span>AVERAGE</span>
              <strong>{temps.length ? `${avg(temps).toFixed(1)}°C` : "--"}</strong>
            </div>
            <div className="stat-card">
              <span>MAX TEMPERATURE</span>
              <strong>{temps.length ? `${Math.max(...temps).toFixed(1)}°C` : "--"}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
