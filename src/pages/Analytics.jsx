import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import ChartCard from "../components/common/ChartCard";
import { Loading, ErrorState } from "../components/common/State";
import { useHistory } from "../hooks/useHistory";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const time = v => new Date(v).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const avg=a=>a.reduce((x,y)=>x+Number(y),0)/a.length;

export default function Analytics(){
 const [hours,setHours]=useState(24);
 const {data,loading,error,reload}=useHistory(hours);
 if(loading)return <section className="content"><PageHeader title="Analytics" subtitle="Trends, statistics and data quality"/><Loading/></section>;
 if(error)return <section className="content"><PageHeader title="Analytics" subtitle="Trends, statistics and data quality"/><ErrorState message={error} retry={reload}/></section>;
 const rows=data.time.map((t,i)=>({time:t,temperature:data.temperature[i],humidity:data.humidity[i],pm25:data.pm25[i],pm10:data.pm10[i]}));
 const temps=data.temperature.map(Number).filter(Number.isFinite);
 return <section className="content"><PageHeader title="Analytics" subtitle="Explore environmental behavior over time" action={<select className="select" value={hours} onChange={e=>setHours(Number(e.target.value))}><option value={12}>12 hours</option><option value={24}>24 hours</option><option value={36}>36 hours</option><option value={48}>48 hours</option></select>}/>
 <div className="two-col"><ChartCard title="Temperature & Humidity" subtitle="Environmental trend"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.08)"/><XAxis dataKey="time" tickFormatter={time}/><YAxis/><Tooltip labelFormatter={time}/><Line dataKey="temperature" stroke="#38bdf8" dot={false}/><Line dataKey="humidity" stroke="#818cf8" dot={false}/></LineChart></ResponsiveContainer></ChartCard>
 <ChartCard title="Air Quality" subtitle="PM2.5 and PM10"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.08)"/><XAxis dataKey="time" tickFormatter={time}/><YAxis/><Tooltip labelFormatter={time}/><Line dataKey="pm25" stroke="#34d399" dot={false}/><Line dataKey="pm10" stroke="#fbbf24" dot={false}/></LineChart></ResponsiveContainer></ChartCard></div>
 <div className="three-col stats"><div className="stat-card"><span>MIN TEMPERATURE</span><strong>{Math.min(...temps).toFixed(1)}°C</strong></div><div className="stat-card"><span>AVERAGE</span><strong>{avg(temps).toFixed(1)}°C</strong></div><div className="stat-card"><span>MAX TEMPERATURE</span><strong>{Math.max(...temps).toFixed(1)}°C</strong></div></div>
 </section>;
}