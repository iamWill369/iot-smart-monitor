
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  Droplets,
  Gauge,
  Wind,
  ArrowLeft,
} from "lucide-react";
import { getDevices } from "../services/api";
import { useSensorData } from "../hooks/useSensorData";
import PageHeader from "../components/common/PageHeader";
import MetricCard from "../components/common/MetricCard";
import StatusBadge from "../components/common/StatusBadge";
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

export default function SensorDetails() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [devError, setDevError] = useState("");

 const sensor = useSensorData(false, deviceId);
const history = useHistory(24, deviceId);

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
          setDevError(error.message || "Unable to load device");
        }
      });

    return () => {
      active = false;
    };
  }, [deviceId]);

  if (sensor.loading || history.loading || (!device && !devError)) {
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
          <ArrowLeft size={15} /> Back to Device Fleet
        </Link>
      </section>
    );
  }

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
          <ArrowLeft size={15} /> Back to Device Fleet
        </Link>
      </section>
    );
  }

  if (sensor.error || history.error) {
    return (
      <section className="content">
        <PageHeader
          title={device?.name || "Sensor Details"}
          subtitle="Device-level readings and history"
        />
        <ErrorState
          title="Unable to Load Sensor Data"
          message={sensor.error || history.error}
          retry={() => {
            sensor.refresh();
            history.reload();
          }}
        />
        <Link className="btn" to="/devices">
          <ArrowLeft size={15} /> Back to Device Fleet
        </Link>
      </section>
    );
  }


  if (!sensor.data || !history.data) {
    return (
      <section className="content">
        <PageHeader title="Sensor Details" />
        <p>No sensor data is available.</p>
      </section>
    );
  }

  const d = sensor.data;

  const historicalTimes = history.data.time ?? [];
  const historicalTemperatures = history.data.temperature ?? [];

  const rows = historicalTimes
    .map((time, index) => ({
      time,
      temperature: Number(historicalTemperatures[index]),
    }))
    .filter((row) => Number.isFinite(row.temperature));

  const validTemperatures = rows.map((row) => row.temperature);

  const temperatureStats = validTemperatures.length
    ? {
        min: Math.min(...validTemperatures),
        max: Math.max(...validTemperatures),
        avg:
          validTemperatures.reduce((sum, value) => sum + value, 0) /
          validTemperatures.length,
      }
    : null;

  return (
    <section className="content">
      <PageHeader
        title={device.name}
        subtitle={`${device.id} • ${device.location}`}
        action={
          <Link className="btn" to="/devices">
            <ArrowLeft size={15} /> Device Fleet
          </Link>
        }
      />

      <div className="detail-top">
        <div className="metrics">
          <MetricCard
            icon={Activity}
            title="Temperature"
            value={Number.isFinite(Number(d.temperature))
              ? Number(d.temperature).toFixed(1)
              : "—"}
            unit="°C"
          />
          <MetricCard
            icon={Droplets}
            title="Humidity"
            value={Number.isFinite(Number(d.humidity))
              ? Number(d.humidity).toFixed(1)
              : "—"}
            unit="%"
          />
          <MetricCard
            icon={Gauge}
            title="Pressure"
            value={Number.isFinite(Number(d.pressure))
              ? Number(d.pressure).toFixed(1)
              : "—"}
            unit="hPa"
          />
          <MetricCard
            icon={Wind}
            title="PM2.5"
            value={Number.isFinite(Number(d.pm25))
              ? Number(d.pm25).toFixed(1)
              : "—"}
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
              status={device.status === "offline" ? "error" : device.status}
            >
              {device.status}
            </StatusBadge>
          </div>

          <div className="info-list">
            <div><span>Device type</span><b>{device.type}</b></div>
            <div><span>Battery</span><b>{device.battery}%</b></div>
            <div><span>Signal</span><b>{device.signal}%</b></div>
            <div>
              <span>Last seen</span>
              <b>{new Date(device.lastSeen).toLocaleString()}</b>
            </div>
          </div>
        </article>
      </div>

      <div className="metrics">
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
          <p>No valid historical temperature readings available.</p>
        )}
      </div>

      {rows.length > 0 ? (
        <ChartCard
          title="Historical Temperature"
          subtitle={`${rows.length} available readings`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid stroke="rgba(148,163,184,.08)" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="temperature"
                name="Temperature"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : (
        <p>No historical temperature data available for this sensor.</p>
      )}
    </section>
  );
}
