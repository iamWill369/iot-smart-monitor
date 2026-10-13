import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Activity, BarChart3, Cpu, Settings, LayoutDashboard, Menu, X, Wifi } from "lucide-react";
import { useState } from "react";
import { config } from "../../config";

const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/analytics", "Analytics", BarChart3],
  ["/devices", "Devices", Cpu]
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Activity size={20}/></span><span>IoT<span className="accent">Monitor</span></span></div>
        <div className="nav-label">MONITORING</div>
        <nav className="nav">
          {links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({isActive}) => `nav-item ${isActive ? "active":""}`} onClick={()=>setOpen(false)}><Icon size={18}/>{label}</NavLink>)}
          <NavLink to="/devices/ENV-001" className={({isActive}) => `nav-item ${isActive ? "active":""}`} onClick={()=>setOpen(false)}><Wifi size={18}/>Sensor Details</NavLink>
        </nav>
        <div className="nav-label">SYSTEM</div>
        <nav className="nav">
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? "active":""}`} onClick={()=>setOpen(false)}><Settings size={18}/>Settings</NavLink>
        </nav>
        <div className="sidebar-bottom"><div className="status online"><i/> Demo API Ready</div><small>{config.location.name} • {config.mode}</small></div>
      </aside>

      {open && <div className="overlay" onClick={()=>setOpen(false)}/>}
      <main className="main">
        <header className="topbar">
          <button className="mobile-toggle" onClick={()=>setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
          <div className="location-chip"><span className="pulse"/> {config.location.name} • Live Monitoring</div>
          <div className="top-spacer"/>
          <div className="mode-chip">{config.mode === "demo" ? "DEMO DATA" : "PRODUCTION"}</div>
        </header>
        <Outlet/>
      </main>
    </div>
  );
}