import { useState } from "react";
import { Activity, Droplets, Gauge, Wind, RefreshCw, Server, MapPin } from "lucide-react";
import { config } from "../config";
import { useSensorData } from "../hooks/useSensorData";
import { useHistory } from "../hooks/useHistory";
import MetricCard from "../components/common/MetricCard";
import StatusBadge from "../components/common/StatusBadge";
import PageHeader from "../components/common/PageHeader";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fmt = n => Number.isFinite(Number(n)) ? Number(n).toFixed(1) : "--";
const time = v => new Date(v).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

export default function Dashboard() {
  const { data, loading, error, refresh } = useSensorData();
  const history = useHistory(24);
  const [metric, setMetric] = useState("temperature");

  if (loading || history.loading) return <section className="content"><PageHeader title="Overview" subtitle="Live environmental monitoring dashboard"/><Loading text="Connecting to sensor APIs..."/></section>;
  if (error || history.error) return <section className="content"><PageHeader title="Overview" subtitle="Live environmental monitoring dashboard"/><ErrorState message={error} retry={refresh}/></section>;

  const series = history.data || {};
  const values = data ? [
    {icon:Activity,title:"Temperature",value:fmt(data.temperature),unit:"°C",caption:"Ambient sensor"},
    {icon:Droplets,title:"Humidity",value:fmt(data.humidity),unit:"%",caption:"Relative humidity"},
    {icon:Gauge,title:"Pressure",value:fmt(data.pressure),unit:"hPa",caption:"Atmospheric pressure"},
    {icon:Wind,title:"PM2.5",value:fmt(data.pm25),unit:"µg/m³",caption:"Air quality"}
  ] : [];

  const chartData = history.data ? history.data.time.map((t,i)=>({time:t,temperature:history.data.temperature[i],humidity:history.data.humidity[i],pressure:history.data.pressure[i],pm25:history.data.pm25[i]})) : [];
  const field = metric;
  return <section className="content">
    <PageHeader title="Overview" subtitle="Real-time environmental sensor monitoring" action={<button className="btn" onClick={refresh}><RefreshCw size={15}/> Refresh</button>}/>
    <div className="metrics">{values.map(v=><MetricCard key={v.title} {...v}/>)}</div>
    <div className="two-col">
      <ChartCard title="Environmental Trend" subtitle="Hourly sensor readings" controls={<select className="select" value={metric} onChange={e=>setMetric(e.target.value)}><option value="temperature">Temperature</option><option value="humidity">Humidity</option><option value="pressure">Pressure</option><option value="pm25">PM2.5</option></select>}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid stroke="rgba(148,163,184,.08)"/><XAxis dataKey="time" tickFormatter={time} tick={{fill:"#71849d",fontSize:11}}/><YAxis tick={{fill:"#71849d",fontSize:11}}/><Tooltip contentStyle={{background:"#0d1d30",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,color:"#fff"}} labelFormatter={time}/><Line type="monotone" dataKey={field} stroke="#38bdf8" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></ChartCard>
      <article className="card"><div className="card-head"><div><h2>System Status</h2><p>Current platform state</p></div><StatusBadge>Online</StatusBadge></div><div className="info-list"><div><span>Sensor System</span><b>Operational</b></div><div><span><MapPin size={13}/> Location</span><b>{config.location.name}</b></div><div><span><Server size={13}/> Data Source</span><b>{config.mode==="demo"?"Open-Meteo":"Production API"}</b></div><div><span>Last Reading</span><b>{time(data.timestamp)}</b></div></div><div className="system-health"><div><span>API Health</span><b>100%</b></div><div className="progress"><i style={{width:"100%"}}/></div></div></article>
    </div>
    <div className="two-col lower">
      <article className="card"><div className="card-head"><div><h2>Air Quality Snapshot</h2><p>Current pollutant readings</p></div></div><div className="mini-kpis">{[["PM10",fmt(data.pm10),"µg/m³"],["CO",fmt(data.co,0),"µg/m³"],["NO₂",fmt(data.no2),"µg/m³"]].map(x=><div key={x[0]}><span>{x[0]}</span><strong>{x[1]}<small>{x[2]}</small></strong></div>)}</div></article>
      <article className="card"><div className="card-head"><div><h2>Recent Events</h2><p>Latest platform activity</p></div></div><div className="events"><div>✓ <span>Environment node reported healthy</span><small>Just now</small></div><div>↻ <span>Sensor feed synchronized</span><small>{time(data.timestamp)}</small></div><div>● <span>Dashboard service ready</span><small>Live</small></div></div></article>
    </div>
  </section>;
}