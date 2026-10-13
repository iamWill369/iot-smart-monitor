import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Activity, Droplets, Gauge, Wind, ArrowLeft } from "lucide-react";
import { getDevices } from "../services/api";
import { useSensorData } from "../hooks/useSensorData";
import PageHeader from "../components/common/PageHeader";
import MetricCard from "../components/common/MetricCard";
import StatusBadge from "../components/common/StatusBadge";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";
import { useHistory } from "../hooks/useHistory";
import { ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid } from "recharts";

export default function SensorDetails(){
 const {deviceId}=useParams();const [device,setDevice]=useState(null);const [devError,setDevError]=useState("");
 const sensor=useSensorData(false);const history=useHistory(24);
 useEffect(()=>{getDevices().then(ds=>setDevice(ds.find(d=>d.id===deviceId)||ds[0])).catch(e=>setDevError(e.message))},[deviceId]);
 if(sensor.loading||history.loading||!device)return <section className="content"><PageHeader title="Sensor Details" subtitle="Device-level readings and history"/><Loading/></section>;
 if(sensor.error||history.error||devError)return <section className="content"><PageHeader title="Sensor Details" subtitle="Device-level readings and history"/><ErrorState message={sensor.error||history.error||devError}/></section>;
 const d=sensor.data;const rows=history.data.time.map((t,i)=>({time:t,temperature:history.data.temperature[i]}));
 return <section className="content"><PageHeader title={device.name} subtitle={`${device.id} • ${device.location}`} action={<Link className="btn" to="/devices"><ArrowLeft size={15}/> Device Fleet</Link>}/>
 <div className="detail-top"><div className="metrics"><MetricCard icon={Activity} title="Temperature" value={Number(d.temperature).toFixed(1)} unit="°C"/><MetricCard icon={Droplets} title="Humidity" value={Number(d.humidity).toFixed(1)} unit="%"/><MetricCard icon={Gauge} title="Pressure" value={Number(d.pressure).toFixed(1)} unit="hPa"/><MetricCard icon={Wind} title="PM2.5" value={Number(d.pm25).toFixed(1)} unit="µg/m³"/></div><article className="card"><div className="card-head"><div><h2>Device Information</h2><p>Identity and connectivity</p></div><StatusBadge status={device.status==="offline"?"error":device.status}>{device.status}</StatusBadge></div><div className="info-list"><div><span>Device type</span><b>{device.type}</b></div><div><span>Battery</span><b>{device.battery}%</b></div><div><span>Signal</span><b>{device.signal}%</b></div><div><span>Last seen</span><b>{new Date(device.lastSeen).toLocaleString()}</b></div></div></article></div>
 <ChartCard title="Historical Temperature" subtitle="24-hour sensor history"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.08)"/><XAxis dataKey="time"/><YAxis/><Tooltip/><Line dataKey="temperature" stroke="#38bdf8" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></ChartCard>
 </section>;
}