import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { Loading, ErrorState } from "../components/common/State";
import { getDevices } from "../services/api";

export default function Devices(){
 const [devices,setDevices]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[q,setQ]=useState(""),[filter,setFilter]=useState("all");
 async function load(){try{setLoading(true);setError("");setDevices(await getDevices())}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const rows=useMemo(()=>devices.filter(d=>(filter==="all"||d.status===filter)&&`${d.name} ${d.id} ${d.location}`.toLowerCase().includes(q.toLowerCase())),[devices,q,filter]);
 if(loading)return <section className="content"><PageHeader title="Devices" subtitle="Connected sensor fleet and connectivity"/><Loading/></section>;
 if(error)return <section className="content"><PageHeader title="Devices" subtitle="Connected sensor fleet and connectivity"/><ErrorState message={error} retry={load}/></section>;
return <section className="content"><PageHeader title="Devices" subtitle="Connected sensor fleet and connectivity" action={<button className="btn" onClick={load} disabled={loading}>↻ {loading ? "Refreshing..." : "Refresh"}</button>}/>
 <div className="toolbar"><div className="search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search devices..."/></div><select className="select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All states</option><option value="online">Online</option><option value="warning">Warning</option><option value="offline">Offline</option></select></div>
 <article className="card table-card"><div className="table-wrap"><table><thead><tr><th>Device</th><th>Location</th><th>Status</th><th>Battery</th><th>Signal</th><th>Last Seen</th><th/></tr></thead><tbody>{rows.map(d=><tr key={d.id}><td><strong>{d.name}</strong><small>{d.id}</small></td><td>{d.location}</td><td><StatusBadge status={d.status==="offline"?"error":d.status}>{d.status}</StatusBadge></td><td><div className="meter-label">{d.battery}%</div><div className="progress"><i style={{width:`${d.battery}%`}}/></div></td><td>{d.signal}%</td><td>{new Date(d.lastSeen).toLocaleString()}</td><td><Link className="icon-btn" to={`/devices/${d.id}`}><ExternalLink size={15}/></Link></td></tr>)}</tbody></table></div></article>
 <div className="three-col fleet-cards"><div className="stat-card"><span>TOTAL NODES</span><strong>{devices.length}</strong></div><div className="stat-card"><span>ONLINE</span><strong>{devices.filter(d=>d.status==="online").length}</strong></div><div className="stat-card"><span>ATTENTION</span><strong>{devices.filter(d=>d.status!=="online").length}</strong></div></div>
 </section>;
}