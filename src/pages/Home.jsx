import { Link } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, Cpu, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return <div className="home">
    <nav className="home-nav"><div className="brand"><span className="brand-mark"><Activity size={20}/></span>IoT<span className="accent">Monitor</span></div><Link className="btn primary" to="/dashboard">Open Dashboard <ArrowRight size={16}/></Link></nav>
    <section className="hero">
      <div><span className="eyebrow">REACT • IOT • REAL-TIME MONITORING</span><h1>Monitor your connected world with <span className="gradient-text">clarity.</span></h1><p>A production-style React dashboard for environmental IoT data. Start with public demo APIs, then switch the same frontend to your own sensor backend.</p><div className="hero-actions"><Link className="btn primary large" to="/dashboard">Launch Dashboard <ArrowRight size={17}/></Link><Link className="btn large" to="/analytics">Explore Analytics</Link></div><div className="trust"><span>✓ React + Vite</span><span>✓ API adapter architecture</span><span>✓ Responsive UI</span></div></div>
      <div className="hero-console"><div className="console-top"><span>LIVE SENSOR NODE</span><span className="live"><i/> LIVE</span></div><div className="console-temp">28.4<span>°C</span></div><p>Ambient Temperature</p><div className="spark"><span style={{height:"40%"}}/><span style={{height:"58%"}}/><span style={{height:"48%"}}/><span style={{height:"72%"}}/><span style={{height:"62%"}}/><span style={{height:"86%"}}/><span style={{height:"76%"}}/><span style={{height:"94%"}}/></div><div className="console-foot">System healthy • Chennai • API synchronized</div></div>
    </section>
    <section className="home-features">{[[Zap,"Live Monitoring","Real-time environmental readings and automatic refresh."],[BarChart3,"Analytics","Interactive time-series charts and statistics."],[Cpu,"Device Fleet","Search, filter and inspect connected sensor nodes."],[ShieldCheck,"Production Ready","Swap demo services for your real IoT backend."]].map(([I,t,d])=><div className="feature" key={t}><I/><h3>{t}</h3><p>{d}</p></div>)}</section>
  </div>;
}