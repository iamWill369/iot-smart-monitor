import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { config } from "../config";

export default function Settings(){
 const [mode,setMode]=useState(config.mode);const [url,setUrl]=useState(config.backendUrl);const [saved,setSaved]=useState(false);
 function save(){localStorage.setItem("iot-mode",mode);localStorage.setItem("iot-backend",url);setSaved(true);setTimeout(()=>setSaved(false),2500)}
 return <section className="content"><PageHeader title="Settings" subtitle="API configuration and production integration"/>
 <div className="two-col"><article className="card"><div className="card-head"><div><h2>API Configuration</h2><p>Choose your data source</p></div></div><div className="form"><label>Data mode<select className="select" value={mode} onChange={e=>setMode(e.target.value)}><option value="demo">Demo / Public APIs</option><option value="real">Production / Real Backend</option></select></label><label>Backend URL<input className="input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="http://localhost:8080/api"/></label><button className="btn primary" onClick={save}>Save configuration</button>{saved&&<div className="success-box">✓ Configuration saved locally.</div>}</div></article>
 <article className="card"><div className="card-head"><div><h2>Production Architecture</h2><p>Recommended real IoT flow</p></div></div><div className="architecture"><span>Sensor / QNX</span><b>→</b><span>Gateway</span><b>→</b><span>Backend API</span><b>→</b><span>React</span></div><div className="alert">Keep device credentials and MQTT secrets on the backend/gateway. The React app should consume authenticated API endpoints.</div></article></div>
 <article className="card code-card"><h2>Expected API contract</h2><pre>{`GET /api/devices
GET /api/sensors/latest?deviceId=ENV-001
GET /api/sensors/history?deviceId=ENV-001&hours=24

{
  "timestamp": "2026-10-06T18:00:00Z",
  "temperature": 28.4,
  "humidity": 67.2,
  "pressure": 1008.5,
  "pm25": 22.1,
  "pm10": 38.4,
  "co": 190,
  "no2": 12.7
}`}</pre></article>
 </section>
}